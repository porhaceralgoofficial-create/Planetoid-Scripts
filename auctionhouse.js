import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getBalance, setBalance, addMoney, getTokens, setTokens, addTokens, formatMoney, formatTokens } from "./sidebar.js";

const AUCTION_DURATION = 6 * 60 * 60 * 20; // 6 horas en ticks
const pendingForms = new Map();

// Almacenamiento de subastas
const auctions = new Map();

function getAuctionKey(itemName) {
    return itemName.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function itemStackToString(itemStack) {
    if (!itemStack) return null;
    return JSON.stringify({
        typeId: itemStack.typeId,
        amount: itemStack.amount,
        nameTag: itemStack.nameTag,
        lore: itemStack.getLore(),
        enchantments: itemStack.getEnchantments ? itemStack.getEnchantments() : []
    });
}

function stringToItemStack(itemString) {
    if (!itemString) return null;
    try {
        const data = JSON.parse(itemString);
        const item = new ItemStack(data.typeId, data.amount);
        if (data.nameTag) item.nameTag = data.nameTag;
        if (data.lore && data.lore.length > 0) item.setLore(data.lore);
        return item;
    } catch {
        return null;
    }
}

function createAuction(seller, item, startPrice, currencyType) {
    const auctionId = `${seller}_${Date.now()}`;
    const endTime = system.currentTick + AUCTION_DURATION;
    
    return {
        id: auctionId,
        seller: seller,
        itemString: itemStackToString(item),
        itemName: item.nameTag || item.typeId,
        startPrice: startPrice,
        currentPrice: startPrice,
        highestBidder: null,
        endTime: endTime,
        bids: [],
        currencyType: currencyType // "money" o "tokens"
    };
}

function formatTimeRemaining(ticks) {
    const seconds = Math.floor(ticks / 20);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function getCurrencySymbol(currencyType) {
    return currencyType === "tokens" ? "⭐" : "$";
}

function getCurrencyFormat(currencyType, amount) {
    return currencyType === "tokens" ? formatTokens(amount) : formatMoney(amount);
}

function saveAuctions() {
    try {
        const auctionsArray = Array.from(auctions.entries()).map(([id, auction]) => ({
            id,
            ...auction
        }));
        world.setDynamicProperty("auctionhouse_data", JSON.stringify(auctionsArray));
    } catch (e) {
        console.warn("Error saving auctions:", e);
    }
}

function loadAuctions() {
    try {
        const data = world.getDynamicProperty("auctionhouse_data");
        if (data) {
            const auctionsArray = JSON.parse(data);
            for (const auction of auctionsArray) {
                const id = auction.id;
                const auctionData = { ...auction };
                delete auctionData.id;
                auctions.set(id, auctionData);
            }
        }
    } catch (e) {
        console.warn("Error loading auctions:", e);
    }
}

function tryShowAuctionHouse(player) {
    if (pendingForms.has(player.id)) {
        return;
    }
    
    pendingForms.set(player.id, true);
    
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryShow = () => {
        attempts++;
        
        showAuctionHouseMenu(player).then(() => {
            pendingForms.delete(player.id);
        }).catch(() => {
            if (attempts < maxAttempts) {
                system.runTimeout(tryShow, 5);
            } else {
                pendingForms.delete(player.id);
            }
        });
    };
    
    system.runTimeout(tryShow, 5);
}

async function showAuctionHouseMenu(player) {
    const form = new ActionFormData();
    form.title("§l§6Auction House");
    form.body("§fWhat would you like to do?");
    
    form.button("§aBrowse Auctions\n§fView all active auctions", "textures/items/emerald");
    form.button("§eCreate Auction\n§fSell your items", "textures/items/gold_ingot");
    form.button("§bMy Auctions\n§fView your listings", "textures/items/item_frame");
    form.button("§cClose", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    if (response.selection === 0) {
        await showBrowseAuctions(player);
    } else if (response.selection === 1) {
        await showCreateAuction(player);
    } else if (response.selection === 2) {
        await showMyAuctions(player);
    }
}

async function showBrowseAuctions(player) {
    // Limpiar subastas expiradas
    for (const [id, auction] of auctions) {
        if (system.currentTick >= auction.endTime) {
            auctions.delete(id);
        }
    }
    
    if (auctions.size === 0) {
        player.sendMessage("§8§lAuction House §7>> §cNo auctions available.");
        return;
    }
    
    const form = new ActionFormData();
    form.title("§l§6Browse Auctions");
    form.body(`§fTotal auctions: §e${auctions.size}`);
    
    const auctionArray = Array.from(auctions.values()).filter(a => system.currentTick < a.endTime);
    
    for (const auction of auctionArray) {
        const timeLeft = formatTimeRemaining(auction.endTime - system.currentTick);
        const bidInfo = auction.highestBidder ? `§fBids: §e${auction.bids.length}` : "§cNo bids";
        const currency = getCurrencySymbol(auction.currencyType);
        form.button(
            `§f${auction.itemName}\n${getCurrencyFormat(auction.currencyType, auction.currentPrice)} ${currency} §7| ${bidInfo} §7| §8${timeLeft}`,
            "textures/items/diamond"
        );
    }
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    if (response.selection < auctionArray.length) {
        const selectedAuction = auctionArray[response.selection];
        await showAuctionDetails(player, selectedAuction);
    }
}

async function showAuctionDetails(player, auction) {
    const timeLeft = formatTimeRemaining(auction.endTime - system.currentTick);
    const bidInfo = auction.highestBidder ? `Highest Bidder: §b${auction.highestBidder}` : "§cNo bids yet";
    const currency = getCurrencySymbol(auction.currencyType);
    
    const form = new ActionFormData();
    form.title(`§l§6${auction.itemName}`);
    form.body(
        `§fSeller: §e${auction.seller}\n` +
        `§fStarting Price: §a${getCurrencyFormat(auction.currencyType, auction.startPrice)} ${currency}\n` +
        `§fCurrent Price: §a${getCurrencyFormat(auction.currencyType, auction.currentPrice)} ${currency}\n` +
        `§fTotal Bids: §e${auction.bids.length}\n` +
        `§f${bidInfo}\n` +
        `§fTime Left: §e${timeLeft}\n\n` +
        `§7Bid amount increments by 10% or enter custom amount`
    );
    
    form.button("§aBid 10%", "textures/items/gold_ingot");
    form.button("§eCustom Bid", "textures/items/gold_block");
    form.button("§cBack", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) {
        await showBrowseAuctions(player);
        return;
    }
    
    if (response.selection === 0) {
        const newBid = Math.floor(auction.currentPrice * 1.1);
        await placeBid(player, auction, newBid);
    } else if (response.selection === 1) {
        await showCustomBidForm(player, auction);
    } else if (response.selection === 2) {
        await showBrowseAuctions(player);
    }
}

async function showCustomBidForm(player, auction) {
    const form = new ModalFormData();
    form.title("§eCustom Bid");
    const currency = getCurrencySymbol(auction.currencyType);
    form.textField("§fEnter your bid amount:", `${getCurrencyFormat(auction.currencyType, auction.currentPrice)}`);
    
    const response = await form.show(player);
    
    if (response.canceled) {
        await showAuctionDetails(player, auction);
        return;
    }
    
    const bidAmountStr = response.formValues[0];
    const bidAmount = parseFloat(bidAmountStr.replace(/[^0-9.]/g, ""));
    
    if (isNaN(bidAmount) || bidAmount <= 0) {
        player.sendMessage("§c§lAuction House §7>> §cInvalid bid amount!");
        await showAuctionDetails(player, auction);
        return;
    }
    
    await placeBid(player, auction, Math.floor(bidAmount));
}

async function placeBid(player, auction, bidAmount) {
    // Verificar que la subasta aún existe y no ha expirado
    if (!auctions.has(auction.id) || system.currentTick >= auction.endTime) {
        player.sendMessage("§c§lAuction House §7>> §cThis auction has expired!");
        return;
    }
    
    const auctionData = auctions.get(auction.id);
    
    // Verificar que el jugador no sea el vendedor
    if (player.name === auctionData.seller) {
        player.sendMessage("§c§lAuction House §7>> §cYou cannot bid on your own auction!");
        return;
    }
    
    // Verificar que la oferta sea mayor que la actual
    if (bidAmount <= auctionData.currentPrice) {
        player.sendMessage(`§c§lAuction House §7>> §cYour bid must be higher than §a${getCurrencyFormat(auctionData.currencyType, auctionData.currentPrice)}§c!`);
        return;
    }
    
    // Obtener saldo según el tipo de moneda
    const getBalance_ = auctionData.currencyType === "tokens" ? getTokens : getBalance;
    const setBalance_ = auctionData.currencyType === "tokens" ? setTokens : setBalance;
    
    const playerBalance = getBalance_(player);
    if (playerBalance < bidAmount) {
        player.sendMessage(`§c§lAuction House §7>> §cYou don't have enough ${auctionData.currencyType}! You need §a${getCurrencyFormat(auctionData.currencyType, bidAmount - playerBalance)} §cmore.`);
        return;
    }
    
    // Guardar el dinero anterior si hay un postor anterior
    let previousBidderName = null;
    let previousBidAmount = 0;
    
    if (auctionData.highestBidder && auctionData.highestBidder !== player.name) {
        previousBidderName = auctionData.highestBidder;
        previousBidAmount = auctionData.currentPrice;
    }
    
    // Registrar la puja
    setBalance_(player, playerBalance - bidAmount);
    auctionData.currentPrice = bidAmount;
    auctionData.highestBidder = player.name;
    auctionData.bids.push({
        bidder: player.name,
        amount: bidAmount,
        time: system.currentTick
    });
    
    // Guardar cambios
    saveAuctions();
    
    player.sendMessage(`§a§lAuction House §7>> §rSuccessfully bid §a${getCurrencyFormat(auctionData.currencyType, bidAmount)}§r on §f${auctionData.itemName}§r!`);
    
    // Notificar al postor anterior
    if (previousBidderName) {
        const previousBidders = world.getAllPlayers().filter(p => p.name === previousBidderName);
        if (previousBidders.length > 0) {
            const addFunc = auctionData.currencyType === "tokens" ? addTokens : addMoney;
            addFunc(previousBidders[0], previousBidAmount);
            previousBidders[0].sendMessage(`§8§lAuction House §7>> §rYou were outbid on §f${auctionData.itemName}§r. Your §a${getCurrencyFormat(auctionData.currencyType, previousBidAmount)}§r has been returned.`);
        }
    }
    
    await showAuctionDetails(player, auctionData);
}

async function showCreateAuction(player) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) {
        player.sendMessage("§c§lAuction House §7>> §cError accessing inventory!");
        return;
    }
    
    const selectedItem = inventory.container.getItem(player.selectedSlotIndex);
    
    if (!selectedItem) {
        player.sendMessage("§c§lAuction House §7>> §cYou must be holding an item!");
        return;
    }
    
    // Elegir tipo de moneda
    const currencyForm = new ActionFormData();
    currencyForm.title("§eAuction Currency");
    currencyForm.body("§fWhat currency do you want to use?");
    currencyForm.button("§a$§f Money", "textures/items/gold_ingot");
    currencyForm.button("§e⭐§f Tokens", "textures/items/nether_star");
    
    const currencyResponse = await currencyForm.show(player);
    
    if (currencyResponse.canceled) {
        await showAuctionHouseMenu(player);
        return;
    }
    
    const currencyType = currencyResponse.selection === 0 ? "money" : "tokens";
    
    const form = new ModalFormData();
    form.title("§eCreate Auction");
    const currencyLabel = currencyType === "tokens" ? "tokens" : "money";
    form.textField("§fStarting Price (in " + currencyLabel + "):", "1000");
    
    const response = await form.show(player);
    
    if (response.canceled) {
        await showAuctionHouseMenu(player);
        return;
    }
    
    const startPriceStr = response.formValues[0];
    const startPrice = parseFloat(startPriceStr.replace(/[^0-9.]/g, ""));
    
    if (isNaN(startPrice) || startPrice <= 0) {
        player.sendMessage("§c§lAuction House §7>> §cInvalid starting price!");
        await showCreateAuction(player);
        return;
    }
    
    const getBalance_ = currencyType === "tokens" ? getTokens : getBalance;
    const setBalance_ = currencyType === "tokens" ? setTokens : setBalance;
    
    const playerBalance = getBalance_(player);
    if (playerBalance < startPrice) {
        player.sendMessage(`§c§lAuction House §7>> §cYou don't have enough ${currencyType} for the listing fee!`);
        return;
    }
    
    // Crear la subasta
    const auction = createAuction(player.name, selectedItem, Math.floor(startPrice), currencyType);
    auctions.set(auction.id, auction);
    
    // Restar el dinero del jugador
    setBalance_(player, playerBalance - startPrice);
    
    // Eliminar el item del inventario
    inventory.container.setItem(player.selectedSlotIndex, undefined);
    
    // Guardar
    saveAuctions();
    
    const itemName = selectedItem.nameTag || selectedItem.typeId;
    player.sendMessage(`§a§lAuction House §7>> §rAuction created successfully!\n§fItem: §e${itemName}\n§fStarting Price: §a${getCurrencyFormat(currencyType, startPrice)}\n§fDuration: §e6 hours`);
    
    await showAuctionHouseMenu(player);
}

async function showMyAuctions(player) {
    const myAuctions = Array.from(auctions.entries()).map(([id, auction]) => ({ id, ...auction })).filter(a => a.seller === player.name);
    
    const activeAuctions = myAuctions.filter(a => system.currentTick < a.endTime);
    
    if (activeAuctions.length === 0) {
        player.sendMessage("§8§lAuction House §7>> §cYou don't have any active auctions.");
        return;
    }
    
    const form = new ActionFormData();
    form.title("§l§6My Auctions");
    form.body(`§fYou have §e${activeAuctions.length}§f active auction(s)`);
    
    for (const auction of activeAuctions) {
        const timeLeft = formatTimeRemaining(auction.endTime - system.currentTick);
        const bidInfo = auction.highestBidder ? `§fBids: §e${auction.bids.length}` : "§cNo bids";
        const currency = getCurrencySymbol(auction.currencyType);
        form.button(
            `§f${auction.itemName}\n${getCurrencyFormat(auction.currencyType, auction.currentPrice)} ${currency} §7| ${bidInfo} §7| §8${timeLeft}`,
            "textures/items/diamond"
        );
    }
    
    form.button("§cBack", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) {
        await showAuctionHouseMenu(player);
        return;
    }
    
    if (response.selection === activeAuctions.length) {
        await showAuctionHouseMenu(player);
        return;
    }
    
    const selectedAuction = activeAuctions[response.selection];
    await showMyAuctionDetails(player, selectedAuction);
}

async function showMyAuctionDetails(player, auction) {
    const timeLeft = formatTimeRemaining(auction.endTime - system.currentTick);
    const bidInfo = auction.highestBidder ? `Highest Bidder: §b${auction.highestBidder}` : "§cNo bids yet";
    const currency = getCurrencySymbol(auction.currencyType);
    
    const form = new ActionFormData();
    form.title(`§l§6${auction.itemName}`);
    form.body(
        `§fStarting Price: §a${getCurrencyFormat(auction.currencyType, auction.startPrice)} ${currency}\n` +
        `§fCurrent Price: §a${getCurrencyFormat(auction.currencyType, auction.currentPrice)} ${currency}\n` +
        `§fTotal Bids: §e${auction.bids.length}\n` +
        `§f${bidInfo}\n` +
        `§fTime Left: §e${timeLeft}`
    );
    
    form.button("§aView Bids", "textures/items/nether_star");
    form.button("§cCancel Auction", "textures/ui/realms_red_x");
    form.button("§8Back", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) {
        await showMyAuctions(player);
        return;
    }
    
    if (response.selection === 0) {
        await showBidHistory(player, auction);
    } else if (response.selection === 1) {
        await showCancelConfirmation(player, auction);
    } else if (response.selection === 2) {
        await showMyAuctions(player);
    }
}

async function showCancelConfirmation(player, auction) {
    const form = new ActionFormData();
    form.title("§cCancel Auction");
    form.body(
        `§cAre you sure you want to cancel this auction?\n\n` +
        `§fItem: §e${auction.itemName}\n` +
        `§fCurrent Bid: §a${getCurrencyFormat(auction.currencyType, auction.currentPrice)}\n\n` +
        `§cYou will receive 85% of the listing fee\n` +
        `§c(${Math.floor(auction.startPrice * 0.85)} ${getCurrencySymbol(auction.currencyType)})\n\n` +
        `§aAll bidders will receive 100% refund`
    );
    
    form.button("§aYes, Cancel", "textures/ui/realms_red_x");
    form.button("§cNo, Keep it", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled || response.selection === 1) {
        await showMyAuctionDetails(player, auction);
        return;
    }
    
    if (response.selection === 0) {
        await cancelAuction(player, auction);
    }
}

async function cancelAuction(playerSender, auction) {
    if (!auctions.has(auction.id)) {
        playerSender.sendMessage("§c§lAuction House §7>> §cAuction not found!");
        return;
    }
    
    const auctionData = auctions.get(auction.id);
    
    // Verificar que el jugador sea el vendedor
    if (playerSender.name !== auctionData.seller) {
        playerSender.sendMessage("§c§lAuction House §7>> §cYou cannot cancel this auction!");
        return;
    }
    
    const inventory = playerSender.getComponent("minecraft:inventory");
    const addFunc = auctionData.currencyType === "tokens" ? addTokens : addMoney;
    
    // Devolver item al vendedor
    if (inventory && inventory.container) {
        const item = stringToItemStack(auctionData.itemString);
        if (item) {
            inventory.container.addItem(item);
        }
    }
    
    // Devolver 85% del dinero al vendedor
    const refundAmount = Math.floor(auctionData.startPrice * 0.85);
    addFunc(playerSender, refundAmount);
    
    // Devolver 100% a los que pujaron
    for (const bid of auctionData.bids) {
        const bidders = world.getAllPlayers().filter(p => p.name === bid.bidder);
        if (bidders.length > 0) {
            addFunc(bidders[0], bid.amount);
            bidders[0].sendMessage(`§8§lAuction House §7>> §rThe auction for §f${auctionData.itemName}§r was cancelled. Your §a${getCurrencyFormat(auctionData.currencyType, bid.amount)}§r has been refunded.`);
        }
    }
    
    auctions.delete(auction.id);
    saveAuctions();
    
    playerSender.sendMessage(`§a§lAuction House §7>> §rAuction cancelled!\n§fItem returned to inventory\n§fRefund: §a${getCurrencyFormat(auctionData.currencyType, refundAmount)} (85%)`);
    
    await showMyAuctions(playerSender);
}

async function showBidHistory(player, auction) {
    const form = new ActionFormData();
    form.title(`§l§6Bid History`);
    
    let bodyText = `§fTotal Bids: §e${auction.bids.length}\n\n`;
    
    for (let i = auction.bids.length - 1; i >= 0 && i >= Math.max(0, auction.bids.length - 10); i--) {
        const bid = auction.bids[i];
        bodyText += `§f${bid.bidder}: §a${getCurrencyFormat(auction.currencyType, bid.amount)}\n`;
    }
    
    form.body(bodyText);
    form.button("§cBack", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) {
        await showMyAuctionDetails(player, auction);
    }
}

function givePlayerAuctionRewards(player) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) return;
    
    // Buscar subastas ganadas
    for (const [id, auction] of auctions) {
        if (auction.highestBidder === player.name && system.currentTick >= auction.endTime) {
            const item = stringToItemStack(auction.itemString);
            if (item) {
                inventory.container.addItem(item);
                player.sendMessage(`§a§lAuction House §7>> §rYou won §f${auction.itemName}§r! Item added to inventory.`);
            }
            auctions.delete(id);
        }
    }
    
    // Buscar subastas expiradas del vendedor
    for (const [id, auction] of auctions) {
        if (auction.seller === player.name && system.currentTick >= auction.endTime) {
            const addFunc = auction.currencyType === "tokens" ? addTokens : addMoney;
            
            if (auction.highestBidder) {
                // Dinero al vendedor
                addFunc(player, auction.currentPrice);
                player.sendMessage(`§a§lAuction House §7>> §rYour auction for §f${auction.itemName}§r sold for §a${getCurrencyFormat(auction.currencyType, auction.currentPrice)}§r!`);
            } else {
                // Item devuelto
                const item = stringToItemStack(auction.itemString);
                if (item) {
                    inventory.container.addItem(item);
                    addFunc(player, auction.startPrice);
                    player.sendMessage(`§8§lAuction House §7>> §rYour auction for §f${auction.itemName}§r expired. Item and fee returned.`);
                }
            }
            auctions.delete(id);
        }
    }
    
    saveAuctions();
}

// Ejecutar al conectarse
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    system.runTimeout(() => {
        givePlayerAuctionRewards(player);
    }, 20);
});

// Limpiar subastas expiradas cada minuto
system.runInterval(() => {
    saveAuctions();
    
    for (const [id, auction] of auctions) {
        if (system.currentTick >= auction.endTime) {
            auctions.delete(id);
        }
    }
}, 20 * 60 * 20);

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const msg = event.message.toLowerCase();
    
    if (msg === "!auctionhouse" || msg === "!ah") {
        event.cancel = true;
        system.runTimeout(() => {
            tryShowAuctionHouse(player);
        }, 1);
    }
});

// Cargar subastas al iniciar
system.run(() => {
    loadAuctions();
});

export { auctions };