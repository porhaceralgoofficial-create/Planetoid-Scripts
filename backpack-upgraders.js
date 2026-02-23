import { world, system, ItemStack } from "@minecraft/server";
import { formatBackpack, getBackpackValue, setBackpackValue, getBackpackMaxValue, setBackpackMaxValue, addBackpackMaxValue } from "./sidebar.js";

const BACKPACK_UPGRADER_CONFIG = {
    "common": {
        item: "minecraft:gray_candle",
        color: "dark_gray",
        dye_color: "dark_gray",
        display: "§r§8[§r§8Common Backpack Upgrader§r§8]",
        lore: (amount) => [
            `§r`,
            `§r§7Increases your backpack storage`,
            `§r§7by §8${formatBackpack(amount)} blocks§r§7.`,
            `§r`,
            `§r§fRarity: §8Common`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §8+${formatBackpack(amount)} blocks`
        ],
        minAmount: 1,
        maxAmount: 5000
    },
    "uncommon": {
        item: "minecraft:lime_candle",
        color: "lime",
        dye_color: "lime",
        display: "§r§8[§r§aUncommon Backpack Upgrader§r§8]",
        lore: (amount) => [
            `§r`,
            `§r§7Increases your backpack storage`,
            `§r§7by §a${formatBackpack(amount)} blocks§r§7.`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §a+${formatBackpack(amount)} blocks`
        ],
        minAmount: 5001,
        maxAmount: 25000
    },
    "rare": {
        item: "minecraft:light_blue_candle",
        color: "light_blue",
        dye_color: "light_blue",
        display: "§r§8[§r§bRare Backpack Upgrader§r§8]",
        lore: (amount) => [
            `§r`,
            `§r§7Increases your backpack storage`,
            `§r§7by §b${formatBackpack(amount)} blocks§r§7.`,
            `§r`,
            `§r§fRarity: §bRare`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §b+${formatBackpack(amount)} blocks`
        ],
        minAmount: 25001,
        maxAmount: 100000
    },
    "epic": {
        item: "minecraft:purple_candle",
        color: "purple",
        dye_color: "purple",
        display: "§r§8[§r§5Epic Backpack Upgrader§r§8]",
        lore: (amount) => [
            `§r`,
            `§r§7Increases your backpack storage`,
            `§r§7by §5${formatBackpack(amount)} blocks§r§7.`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §5+${formatBackpack(amount)} blocks`
        ],
        minAmount: 100001,
        maxAmount: 500000
    },
    "legendary": {
        item: "minecraft:orange_candle",
        color: "orange",
        dye_color: "orange",
        display: "§r§8[§r§6Legendary Backpack Upgrader§r§8]",
        lore: (amount) => [
            `§r`,
            `§r§7Increases your backpack storage`,
            `§r§7by §6${formatBackpack(amount)} blocks§r§7.`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §6+${formatBackpack(amount)} blocks`
        ],
        minAmount: 500001,
        maxAmount: 1000000
    },
    "mythic": {
        item: "minecraft:green_candle",
        color: "green",
        dye_color: "dark_green",
        display: "§r§8[§r§3Mythic Backpack Upgrader§r§8]",
        lore: (amount) => [
            `§r`,
            `§r§7Increases your backpack storage`,
            `§r§7by §3${formatBackpack(amount)} blocks§r§7.`,
            `§r`,
            `§r§fRarity: §3Mythic`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §3+${formatBackpack(amount)} blocks`
        ],
        minAmount: 1000001,
        maxAmount: 10000000
    },
    "unreal": {
        item: "minecraft:blue_candle",
        color: "blue",
        dye_color: "blue",
        display: "§r§8[§r§l§9Unreal Backpack Upgrader§r§8]",
        lore: (amount) => [
            `§r`,
            `§r§7Increases your backpack storage`,
            `§r§7by §l§9${formatBackpack(amount)} blocks§r§7.`,
            `§r`,
            `§r§fRarity: §l§9Unreal`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §l§9+${formatBackpack(amount)} blocks`
        ],
        minAmount: 10000001,
        maxAmount: Infinity
    }
};

function getRarityFromAmount(amount) {
    if (amount <= 5000) return "common";
    if (amount <= 25000) return "uncommon";
    if (amount <= 100000) return "rare";
    if (amount <= 500000) return "epic";
    if (amount <= 1000000) return "legendary";
    if (amount <= 10000000) return "mythic";
    return "unreal";
}

function createBackpackUpgrader(amount) {
    if (!amount || amount <= 0) {
        return null;
    }

    const rarity = getRarityFromAmount(amount);
    const config = BACKPACK_UPGRADER_CONFIG[rarity];

    if (!config) {
        return null;
    }

    const upgraderItem = new ItemStack(config.item, 1);
    upgraderItem.nameTag = config.display;
    upgraderItem.setLore(config.lore(amount));
    upgraderItem.keepOnDeath = true;

    return { item: upgraderItem, amount: amount, rarity: rarity };
}

function getUpgraderAmount(item) {
    if (!item || !item.nameTag) return null;

    if (!item.nameTag.includes("Backpack Upgrader")) {
        return null;
    }

    const lore = item.getLore();
    if (!lore) return null;

    for (const line of lore) {
        if (line.includes("Amount:")) {
            const match = line.match(/\+([0-9.,]+[A-Za-z]*)/);
            if (match) {
                const amountStr = match[1];
                
                // Parsear el formato abreviado
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
                    if (amountStr.endsWith(suffix)) {
                        const numStr = amountStr.slice(0, -suffix.length);
                        const num = parseFloat(numStr);
                        if (!isNaN(num)) {
                            return Math.floor(num * multiplier);
                        }
                    }
                }
                
                // Si no tiene sufijo, parsear como número normal
                const num = parseFloat(amountStr.replace(/,/g, ""));
                if (!isNaN(num)) {
                    return Math.floor(num);
                }
            }
        }
    }

    return null;
}

function claimBackpackUpgrader(player, item) {
    const amount = getUpgraderAmount(item);

    if (!amount) {
        player.sendMessage("§c§lBackpack Upgrader §7>> §cInvalid upgrader!");
        return;
    }

    const currentMax = getBackpackMaxValue(player);
    const newMax = currentMax + amount;
    setBackpackMaxValue(player, newMax);

    const rarity = getRarityFromAmount(amount);
    const config = BACKPACK_UPGRADER_CONFIG[rarity];
    
    // Extraer el código de color correctamente
    const colorMatch = config.display.match(/§(.)/);
    const colorCode = colorMatch ? colorMatch[0] : "§f";

    const formattedAmount = formatBackpack(amount);
    const formattedNewMax = formatBackpack(newMax);

    player.sendMessage(`§a§lBackpack Upgrader §7>> §rYou increased your backpack by ${colorCode}+${formattedAmount}§r!`);
    player.sendMessage(`§a§lBackpack Upgrader §7>> §rYour new backpack size: §e${formattedNewMax}`);

    system.run(() => {
        player.runCommand(`playsound random.levelup @s`);
    });

    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;

        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);

        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Backpack Upgrader")) {
            if (currentItem.amount > 1) {
                currentItem.amount -= 1;
                inv.container.setItem(slot, currentItem);
            } else {
                inv.container.setItem(slot, undefined);
            }
        }
    });
}
// Item use event (click derecho)
world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;

    if (!item || !item.nameTag) return;
    if (!item.nameTag.includes("Backpack Upgrader")) return;

    const amount = getUpgraderAmount(item);
    if (!amount) return;

    claimBackpackUpgrader(player, item);
});

// Bloquear colocación
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;

    try {
        const inventory = player.getComponent("minecraft:inventory");

        if (!inventory || !inventory.container) return;

        const hand = inventory.container.getItem(player.selectedSlotIndex);

        if (!hand || !hand.nameTag) return;
        if (!hand.nameTag.includes("Backpack Upgrader")) return;

        event.cancel = true;
        system.run(() => {
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place this item on the ground!");
            player.runCommand(`playsound note.bass @s`);
        });
    } catch (e) {}
});

// Función para parsear cantidades con formato (76,12k, 1.5m, etc)
function parseBackpackAmount(input) {
    input = input.replace(/,/g, "."); // Convertir coma a punto
    
    let amount = 0;
    const inputLower = input.toLowerCase();

    const suffixes = {
        "tg": 1e99,
        "dtg": 1e96,
        "utg": 1e93,
        "vg": 1e90,
        "uvg": 1e87,
        "dvg": 1e84,
        "tvg": 1e81,
        "qavg": 1e78,
        "qivg": 1e75,
        "sxvg": 1e72,
        "spvg": 1e69,
        "ocvg": 1e66,
        "nvg": 1e63,
        "ud": 1e60,
        "dd": 1e57,
        "td": 1e54,
        "qad": 1e51,
        "qid": 1e48,
        "sxd": 1e45,
        "spd": 1e42,
        "ocd": 1e39,
        "nd": 1e36,
        "dc": 1e33,
        "no": 1e30,
        "oc": 1e27,
        "sp": 1e24,
        "sx": 1e21,
        "qi": 1e18,
        "q": 1e15,
        "t": 1e12,
        "b": 1e9,
        "m": 1e6,
        "k": 1e3
    };

    for (const [suffix, multiplier] of Object.entries(suffixes)) {
        if (inputLower.endsWith(suffix)) {
            const numStr = inputLower.slice(0, -suffix.length);
            const num = parseFloat(numStr);
            if (!isNaN(num)) {
                return num * multiplier;
            }
        }
    }

    const num = parseFloat(inputLower);
    return isNaN(num) ? NaN : num;
}

// Comando para dar backpack upgraders
world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const rawMessage = event.message;
    const args = rawMessage.split(" ");

    if (args[0].toLowerCase() === "!backpack") {
        event.cancel = true;

        system.runTimeout(() => {
            const action = args[1]?.toLowerCase();

            if (action === "upgrader" && args[2]?.toLowerCase() === "give") {
                if (!player.hasTag("Rank:§dOwner")) {
                    player.sendMessage("§cYou don't have permission to use this command.");
                    return;
                }

                if (args.length < 5) {
                    player.sendMessage("§c§lBackpack Upgrader §7>> §cUsage: !backpack upgrader give <player> <amount>");
                    return;
                }

                const targetName = args[3];
                const amount = parseInt(args[4]);

                if (isNaN(amount) || amount <= 0) {
                    player.sendMessage("§c§lBackpack Upgrader §7>> §cAmount must be a positive number!");
                    return;
                }

                const targetPlayers = world.getPlayers({ name: targetName });
                if (targetPlayers.length === 0) {
                    player.sendMessage("§c§lBackpack Upgrader §7>> §cPlayer not found!");
                    return;
                }

                const target = targetPlayers[0];
                const upgraderData = createBackpackUpgrader(amount);

                if (!upgraderData) {
                    player.sendMessage("§c§lBackpack Upgrader §7>> §cError creating upgrader!");
                    return;
                }

                const inv = target.getComponent("minecraft:inventory");
                if (!inv || !inv.container) {
                    player.sendMessage("§c§lBackpack Upgrader §7>> §cError accessing target's inventory!");
                    return;
                }

                inv.container.addItem(upgraderData.item);

                const config = BACKPACK_UPGRADER_CONFIG[upgraderData.rarity];
                const formattedAmount = formatBackpack(amount);
                player.sendMessage(`§a§lBackpack Upgrader §7>> §rGiven §${config.display.match(/§./)[0]}${upgraderData.rarity}§r upgrader (§e+${formattedAmount}§r) to §b${targetName}§r!`);
                target.sendMessage(`§a§lBackpack Upgrader §7>> §rYou received a backpack upgrader! Right-click to claim it.`);

                system.run(() => {
                    player.runCommand(`playsound random.levelup @s`);
                    target.runCommand(`playsound random.levelup @s`);
                });
                return;
            }

            if (action === "set") {
                if (!player.hasTag("Rank:§dOwner")) {
                    player.sendMessage("§cYou don't have permission to use this command.");
                    return;
                }

                if (args.length < 4) {
                    player.sendMessage("§c§lBackpack §7>> §cUsage: !backpack set <current|max> <player> [amount]");
                    return;
                }

                const type = args[2]?.toLowerCase();
                const targetName = args[3];
                let amountStr = args[4];

                // Si solo hay 3 parámetros y el tipo es current/max, asumimos que falta el jugador
                if (!type || (type !== "current" && type !== "max")) {
                    player.sendMessage("§c§lBackpack §7>> §cUsage: !backpack set <current|max> <player> [amount]");
                    return;
                }

                const targetPlayers = world.getPlayers({ name: targetName });
                if (targetPlayers.length === 0) {
                    player.sendMessage("§c§lBackpack §7>> §cPlayer not found!");
                    return;
                }

                const target = targetPlayers[0];

                if (type === "current") {
                    // Si no hay cantidad, significa "max"
                    let amount;
                    if (!amountStr) {
                        amount = getBackpackMaxValue(target);
                    } else if (amountStr.toLowerCase() === "max") {
                        amount = getBackpackMaxValue(target);
                    } else {
                        amount = parseBackpackAmount(amountStr);
                    }

                    if (isNaN(amount) || amount < 0) {
                        player.sendMessage("§c§lBackpack §7>> §cInvalid amount!");
                        return;
                    }

                    setBackpackValue(target, amount);
                    const formattedAmount = formatBackpack(amount);
                    player.sendMessage(`§a§lBackpack §7>> §fSet §b${targetName}§f's backpack current to §e${formattedAmount}§f!`);
                    target.sendMessage(`§a§lBackpack §7>> §fYour backpack current has been set to §e${formattedAmount}§f!`);
                } else if (type === "max") {
                    if (!amountStr) {
                        player.sendMessage("§c§lBackpack §7>> §cUsage: !backpack set max <player> <amount>");
                        return;
                    }

                    const amount = parseBackpackAmount(amountStr);
                    if (isNaN(amount) || amount <= 0) {
                        player.sendMessage("§c§lBackpack §7>> §cAmount must be a positive number!");
                        return;
                    }

                    setBackpackMaxValue(target, amount);
                    const formattedAmount = formatBackpack(amount);
                    player.sendMessage(`§a§lBackpack §7>> §fSet §b${targetName}§f's backpack max to §e${formattedAmount}§f!`);
                    target.sendMessage(`§a§lBackpack §7>> §fYour backpack max has been set to §e${formattedAmount}§f!`);
                }

                system.run(() => {
                    player.runCommand(`playsound random.levelup @s`);
                    target.runCommand(`playsound random.levelup @s`);
                });
                return;
            }

            player.sendMessage("§c§lBackpack §7>> §cUsage:");
            player.sendMessage("§c§lBackpack §7>> §f!backpack set current <player> [max|amount]");
            player.sendMessage("§c§lBackpack §7>> §f!backpack set max <player> <amount>");
            player.sendMessage("§c§lBackpack §7>> §f!backpack upgrader give <player> <amount>");
        }, 1);
    }
});

export { createBackpackUpgrader, BACKPACK_UPGRADER_CONFIG, getRarityFromAmount };