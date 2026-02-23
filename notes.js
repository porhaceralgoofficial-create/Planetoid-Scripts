import { world, system, ItemStack } from "@minecraft/server";
import { getBalance, getTokens, removeMoney, removeTokens, addMoney, addTokens, formatMoney, formatTokens } from "./sidebar.js";

function parseMoneyAmount(input) {
    input = input.replace(/,/g, ".");
    
    let amount = 0;
    const inputLower = input.toLowerCase();

    if (inputLower.endsWith("tg")) {
        amount = parseFloat(inputLower) * 1e99;
    } else if (inputLower.endsWith("dtg")) {
        amount = parseFloat(inputLower) * 1e96;
    } else if (inputLower.endsWith("utg")) {
        amount = parseFloat(inputLower) * 1e93;
    } else if (inputLower.endsWith("vg")) {
        amount = parseFloat(inputLower) * 1e90;
    } else if (inputLower.endsWith("uvg")) {
        amount = parseFloat(inputLower) * 1e87;
    } else if (inputLower.endsWith("dvg")) {
        amount = parseFloat(inputLower) * 1e84;
    } else if (inputLower.endsWith("tvg")) {
        amount = parseFloat(inputLower) * 1e81;
    } else if (inputLower.endsWith("qavg")) {
        amount = parseFloat(inputLower) * 1e78;
    } else if (inputLower.endsWith("qivg")) {
        amount = parseFloat(inputLower) * 1e75;
    } else if (inputLower.endsWith("sxvg")) {
        amount = parseFloat(inputLower) * 1e72;
    } else if (inputLower.endsWith("spvg")) {
        amount = parseFloat(inputLower) * 1e69;
    } else if (inputLower.endsWith("ocvg")) {
        amount = parseFloat(inputLower) * 1e66;
    } else if (inputLower.endsWith("nvg")) {
        amount = parseFloat(inputLower) * 1e63;
    } else if (inputLower.endsWith("ud")) {
        amount = parseFloat(inputLower) * 1e60;
    } else if (inputLower.endsWith("dd")) {
        amount = parseFloat(inputLower) * 1e57;
    } else if (inputLower.endsWith("td")) {
        amount = parseFloat(inputLower) * 1e54;
    } else if (inputLower.endsWith("qad")) {
        amount = parseFloat(inputLower) * 1e51;
    } else if (inputLower.endsWith("qid")) {
        amount = parseFloat(inputLower) * 1e48;
    } else if (inputLower.endsWith("sxd")) {
        amount = parseFloat(inputLower) * 1e45;
    } else if (inputLower.endsWith("spd")) {
        amount = parseFloat(inputLower) * 1e42;
    } else if (inputLower.endsWith("ocd")) {
        amount = parseFloat(inputLower) * 1e39;
    } else if (inputLower.endsWith("nd")) {
        amount = parseFloat(inputLower) * 1e36;
    } else if (inputLower.endsWith("dc")) {
        amount = parseFloat(inputLower) * 1e33;
    } else if (inputLower.endsWith("no")) {
        amount = parseFloat(inputLower) * 1e30;
    } else if (inputLower.endsWith("oc")) {
        amount = parseFloat(inputLower) * 1e27;
    } else if (inputLower.endsWith("sp")) {
        amount = parseFloat(inputLower) * 1e24;
    } else if (inputLower.endsWith("sx")) {
        amount = parseFloat(inputLower) * 1e21;
    } else if (inputLower.endsWith("qi")) {
        amount = parseFloat(inputLower) * 1e18;
    } else if (inputLower.endsWith("q")) {
        amount = parseFloat(inputLower) * 1e15;
    } else if (inputLower.endsWith("t")) {
        amount = parseFloat(inputLower) * 1e12;
    } else if (inputLower.endsWith("b")) {
        amount = parseFloat(inputLower) * 1e9;
    } else if (inputLower.endsWith("m")) {
        amount = parseFloat(inputLower) * 1e6;
    } else if (inputLower.endsWith("k")) {
        amount = parseFloat(inputLower) * 1e3;
    } else {
        amount = parseFloat(inputLower);
    }

    return amount;
}

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const msg = event.message.toLowerCase();
    const rawMessage = event.message;
    const msgParts = rawMessage.split(" ");
    
    if (msgParts[0].toLowerCase() === "!withdraw") {
        event.cancel = true;
        
        system.runTimeout(() => {
            if (msgParts.length < 3) {
                player.sendMessage("§c§lWithdraw §r§8>> §rUsage: !withdraw money/tokens all/AMOUNT");
                return;
            }
            
            const type = msgParts[1].toLowerCase();
            const amountStr = msgParts[2];
            
            if (type !== "money" && type !== "tokens") {
                player.sendMessage("§c§lWithdraw §r§8>> §rPlease specify 'money' or 'tokens'");
                return;
            }
            
            let amount = 0;
            let playerBalance = 0;
            
            if (type === "money") {
                playerBalance = getBalance(player);
            } else {
                playerBalance = getTokens(player);
            }
            
            if (amountStr.toLowerCase() === "all") {
                amount = playerBalance;
            } else {
                amount = parseMoneyAmount(amountStr);
                if (isNaN(amount) || amount <= 0) {
                    player.sendMessage("§c§lWithdraw §r§8>> §rInvalid amount!");
                    return;
                }
            }
            
            if (amount > playerBalance) {
                player.sendMessage(`§c§lWithdraw §r§8>> §rYou don't have enough ${type}!`);
                return;
            }
            
            if (type === "money") {
                removeMoney(player, amount);
            } else {
                removeTokens(player, amount);
            }
            
            const inv = player.getComponent("minecraft:inventory");
            if (!inv || !inv.container) {
                player.sendMessage("§c§lWithdraw §r§8>> §rError accessing inventory!");
                return;
            }
            
            let noteItem;
            let noteName;
            let noteLore;
            
            if (type === "money") {
                noteItem = new ItemStack("minecraft:paper", 1);
                const formattedAmount = formatMoney(amount);
                noteName = `§r§a§lMoney Note §r§f($${formattedAmount})`;
                noteLore = [
                    "§r§fRedeem this note to",
                    `§r§freceive §a$${formattedAmount}§f.`,
                    "§r",
                    "§r§a§lInformation",
                    `§r§a| §fCreated by: §f${player.name}`,
                    `§r§a| §fValue: §a$${formattedAmount}`
                ];
            } else {
                noteItem = new ItemStack("minecraft:sunflower", 1);
                const formattedAmount = formatTokens(amount);
                noteName = `§r§e§lTokens Note §r§f(${formattedAmount})`;
                noteLore = [
                    "§r§fRedeem this note to",
                    `§r§freceive §e${formattedAmount} tokens§f.`,
                    "§r",
                    "§r§e§lInformation",
                    `§r§e| §fCreated by: §f${player.name}`,
                    `§r§e| §fValue: §e${formattedAmount}`
                ];
            }
            
            noteItem.nameTag = noteName;
            noteItem.setLore(noteLore);
            noteItem.keepOnDeath = true;
            noteItem.lockMode = "slot";
            
            inv.container.addItem(noteItem);
            
            if (type === "money") {
                player.sendMessage(`§a§lWithdraw §r§8>> §rYou withdrew §a$${formatMoney(amount)} §rinto a Money Note!`);
            } else {
                player.sendMessage(`§e§lWithdraw §r§8>> §rYou withdrew §e${formatTokens(amount)} tokens §rinto a Tokens Note!`);
            }
            player.runCommand("playsound random.pop @s");
        }, 1);
    }

    // COMANDO !note get - CREAR NOTAS SIN NECESIDAD DE SACAR DE BALANCE
    if (msgParts[0].toLowerCase() === "!note") {
        event.cancel = true;

        system.runTimeout(() => {
            const action = msgParts[1]?.toLowerCase();

            if (action === "get") {
                if (!player.hasTag("Rank:§dOwner")) {
                    player.sendMessage("§cYou don't have permission to use this command.");
                    return;
                }

                if (msgParts.length < 5) {
                    player.sendMessage("§c§lNote §7>> §cUsage: !note get <money/tokens> <amount> <quantity>");
                    return;
                }

                const type = msgParts[2].toLowerCase();
                const amountStr = msgParts[3];
                const quantityStr = msgParts[4];

                if (type !== "money" && type !== "tokens") {
                    player.sendMessage("§c§lNote §7>> §cPlease specify 'money' or 'tokens'");
                    return;
                }

                const amount = parseMoneyAmount(amountStr);
                const quantity = parseInt(quantityStr);

                if (isNaN(amount) || amount <= 0) {
                    player.sendMessage("§c§lNote §7>> §cAmount must be a positive number!");
                    return;
                }

                if (isNaN(quantity) || quantity <= 0) {
                    player.sendMessage("§c§lNote §7>> §cQuantity must be a positive number!");
                    return;
                }

                const inv = player.getComponent("minecraft:inventory");
                if (!inv || !inv.container) {
                    player.sendMessage("§c§lNote §7>> §cError accessing inventory!");
                    return;
                }

                // Crear y dar la cantidad especificada
                for (let i = 0; i < quantity; i++) {
                    let noteItem;
                    let noteName;
                    let noteLore;

                    if (type === "money") {
                        noteItem = new ItemStack("minecraft:paper", 1);
                        const formattedAmount = formatMoney(amount);
                        noteName = `§r§a§lMoney Note §r§f($${formattedAmount})`;
                        noteLore = [
                            "§r§fRedeem this note to",
                            `§r§freceive §a$${formattedAmount}§f.`,
                            "§r",
                            "§r§a§lInformation",
                            `§r§a| §fCreated by: §f${player.name}`,
                            `§r§a| §fValue: §a$${formattedAmount}`
                        ];
                    } else {
                        noteItem = new ItemStack("minecraft:sunflower", 1);
                        const formattedAmount = formatTokens(amount);
                        noteName = `§r§e§lTokens Note §r§f(${formattedAmount})`;
                        noteLore = [
                            "§r§fRedeem this note to",
                            `§r§freceive §e${formattedAmount} tokens§f.`,
                            "§r",
                            "§r§e§lInformation",
                            `§r§e| §fCreated by: §f${player.name}`,
                            `§r§e| §fValue: §e${formattedAmount}`
                        ];
                    }

                    noteItem.nameTag = noteName;
                    noteItem.setLore(noteLore);
                    noteItem.keepOnDeath = true;
                    noteItem.lockMode = "slot";

                    inv.container.addItem(noteItem);
                }

                const formattedAmount = type === "money" ? formatMoney(amount) : formatTokens(amount);
                const currencySymbol = type === "money" ? "$" : "";
                player.sendMessage(`§a§lNote §7>> §rCreated §f${quantity}x§r ${type === "money" ? "§aMoneyNote" : "§eTokenNote"}§r (§f${currencySymbol}${formattedAmount}§r)!`);
                player.runCommand("playsound random.pop @s");
                return;
            }

            player.sendMessage("§c§lNote §7>> §cUsage: !note get <money/tokens> <amount> <quantity>");
        }, 1);
    }
});

world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    
    if (!item || !item.nameTag) return;
    
    const itemName = item.nameTag;
    
    if (itemName.includes("Money Note") || itemName.includes("Tokens Note")) {
        const lore = item.getLore();
        
        if (lore.length < 6) return;
        
        const valueLine = lore[5]; 
        
        let amount = 0;
        let isMoney = itemName.includes("Money Note");
        
        if (isMoney) {
            const match = valueLine.match(/\$([0-9.]+[A-Za-z]*)/);
            if (match) {
                const amountStr = match[1];
                amount = parseFormattedAmount(amountStr);
            }
        } else {
            const parts = valueLine.split("Value: §e");
            if (parts.length > 1) {
                const amountStr = parts[1].trim();
                amount = parseFormattedAmount(amountStr);
            }
        }
        
        if (amount <= 0) {
            player.sendMessage("§c§lRedeem §r§8>> §rError reading note value!");
            player.sendMessage(`§cDebug: valueLine = "${valueLine}"`);
            player.sendMessage(`§cDebug: amount = ${amount}`);
            return;
        }
        
        if (isMoney) {
            addMoney(player, amount);
            player.sendMessage(`§a§lRedeem §r§8>> §rYou redeemed §a$${formatMoney(amount)} §rfrom a Money Note!`);
        } else {
            addTokens(player, amount);
            player.sendMessage(`§e§lRedeem §r§8>> §rYou redeemed §e${formatTokens(amount)} tokens §rfrom a Tokens Note!`);
        }
        
        player.runCommand("playsound random.levelup @s");
        
        system.run(() => {
            const inv = player.getComponent("minecraft:inventory");
            if (!inv || !inv.container) return;
            
            const slot = player.selectedSlotIndex;
            const currentItem = inv.container.getItem(slot);
            
            if (currentItem && currentItem.typeId === item.typeId) {
                if (currentItem.amount > 1) {
                    currentItem.amount -= 1;
                    inv.container.setItem(slot, currentItem);
                } else {
                    inv.container.setItem(slot, undefined);
                }
            }
        });
    }
});

function parseFormattedAmount(str) {
    str = str.replace(/§[0-9a-fk-or]/gi, "").trim();
    
    const suffixes = {
        "Tg": 1e99,
        "Dtg": 1e96,
        "Utg": 1e93,
        "Vg": 1e90,
        "Uvg": 1e87,
        "Dvg": 1e84,
        "Tvg": 1e81,
        "Qavg": 1e78,
        "Qivg": 1e75,
        "Sxvg": 1e72,
        "Spvg": 1e69,
        "Ocvg": 1e66,
        "Nvg": 1e63,
        "Ud": 1e60,
        "Dd": 1e57,
        "Td": 1e54,
        "Qad": 1e51,
        "Qid": 1e48,
        "Sxd": 1e45,
        "Spd": 1e42,
        "Ocd": 1e39,
        "Nd": 1e36,
        "Dc": 1e33,
        "No": 1e30,
        "Oc": 1e27,
        "Sp": 1e24,
        "Sx": 1e21,
        "Qi": 1e18,
        "Q": 1e15,
        "T": 1e12,
        "B": 1e9,
        "M": 1e6,
        "K": 1e3
    };
    
    for (const [suffix, multiplier] of Object.entries(suffixes)) {
        if (str.endsWith(suffix)) {
            const numStr = str.slice(0, -suffix.length);
            const num = parseFloat(numStr);
            if (!isNaN(num)) {
                return num * multiplier;
            }
        }
    }
    
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

export { };