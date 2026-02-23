import { world, system, ItemStack } from "@minecraft/server";

// Configuración de todas las keys
const KEY_CONFIG = {
    // KEYS NORMALES (de peor a mejor)
    "common": {
        color: "§8",
        name: "§8Common Crate Key",
        tier: "Common",
        lore: [
            "§r",
            "§r§7Open a §8Common Crate §7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §8Common Crate §7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §8Common"
        ]
    },
    "uncommon": {
        color: "§a",
        name: "§aUncommon Crate Key",
        tier: "Uncommon",
        lore: [
            "§r",
            "§r§7Open a §aUncommon Crate §7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §aUncommon Crate §7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §aUncommon"
        ]
    },
    "rare": {
        color: "§b",
        name: "§bRare Crate Key",
        tier: "Rare",
        lore: [
            "§r",
            "§r§7Open a §bRare Crate §7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §bRare Crate §7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §bRare"
        ]
    },
    "epic": {
        color: "§5",
        name: "§5Epic Crate Key",
        tier: "Epic",
        lore: [
            "§r",
            "§r§7Open a §5Epic Crate §7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §5Epic Crate §7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §5Epic"
        ]
    },
    "legendary": {
        color: "§6",
        name: "§6Legendary Crate Key",
        tier: "Legendary",
        lore: [
            "§r",
            "§r§7Open a §6Legendary Crate §7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §6Legendary Crate §7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §6Legendary"
        ]
    },
    "mythic": {
        color: "§3",
        name: "§3Mythic Crate Key",
        tier: "Mythic",
        lore: [
            "§r",
            "§r§7Open a §3Mythic Crate §7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §3Mythic Crate §7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §3Mythic"
        ]
    },
    "unreal": {
        color: "§9",
        name: "§9Unreal Crate Key",
        tier: "Unreal",
        lore: [
            "§r",
            "§r§7Open a §9Unreal Crate §7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §9Unreal Crate §7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §9Unreal"
        ]
    },
    "event": {
        color: "§d",
        name: "§dEvent Crate Key",
        tier: "Event",
        lore: [
            "§r",
            "§r§7Open a §dEvent Crate §7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §dEvent Crate §7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §dEvent"
        ]
    },
    "madmax": {
        color: "§l§4",
        name: "§l§4Mad Max Crate Key",
        tier: "Mad Max",
        lore: [
            "§r",
            "§r§7Open a §l§4Mad Max Crate §r§7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §l§4Mad Max Crate §r§7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §l§4Mad Max"
        ]
    },
    "ripper": {
        color: "§l§c",
        name: "§l§cRipper Crate Key",
        tier: "Ripper",
        lore: [
            "§r",
            "§r§7Open a §l§cRipper Crate §r§7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §l§cRipper Crate §r§7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §l§cRipper"
        ]
    },

    // KEYS ESPECIALES
    "tag": {
        color: "§m",
        name: "§mTag Crate Key",
        tier: "Tag",
        lore: [
            "§r",
            "§r§7Open a §mTag Crate §r§7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §mTag Crate §r§7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §mTag"
        ]
    },
    "luminous": {
        color: "§l§t",
        name: "§l§tLuminous Crate Key",
        tier: "Luminous",
        lore: [
            "§r",
            "§r§7Open a §l§tLuminous Crate §r§7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §l§tLuminous Crate §r§7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §l§tLuminous"
        ]
    },
    "planetoid": {
        color: "§4",
        name: "§4Planetoid Crate Key",
        tier: "Planetoid",
        lore: [
            "§r",
            "§r§7Open a §4Planetoid Crate §7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §4Planetoid Crate §7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §4Planetoid"
        ]
    },
    "monthly": {
        color: "§l§u",
        name: "§l§uMonthly Crate Key",
        tier: "Monthly",
        lore: [
            "§r",
            "§r§7Open a §l§uMonthly Crate §r§7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §l§uMonthly Crate §r§7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §l§uMonthly"
        ]
    },
    "vote": {
        color: "§l§s",
        name: "§l§sVote Crate Key",
        tier: "Vote",
        lore: [
            "§r",
            "§r§7Open a §l§sVote Crate §r§7at §e/crates §7to",
            "§r§7receive random rewards. Right-click",
            "§r§7the §l§sVote Crate §r§7to open it, or",
            "§r§7left-click it to view its rewards.",
            "§r",
            "§r§6Information",
            "§r§6| §7Open at: §e/crates",
            "§r§6| §7Tier: §l§sVote"
        ]
    }
};

// Crear una key con nombre y lore personalizados
function createKey(keyType, quantity = 1) {
    const config = KEY_CONFIG[keyType];
    if (!config) return null;

    const keyItem = new ItemStack("minecraft:tripwire_hook", quantity);
    keyItem.nameTag = config.name;
    keyItem.setLore(config.lore);
    keyItem.keepOnDeath = true;

    return keyItem;
}

// Detectar tipo de key desde el lore
function getKeyTypeFromItem(item) {
    if (!item || item.typeId !== "minecraft:tripwire_hook") return null;
    
    const lore = item.getLore();
    if (!lore || lore.length === 0) return null;

    // Buscar la línea que contiene "Tier:"
    for (const line of lore) {
        if (line.includes("Tier:")) {
            // Buscar el tipo de key comparando con la config
            for (const [keyType, config] of Object.entries(KEY_CONFIG)) {
                if (line.includes(`Tier: ${config.tier}`) || line.includes(`Tier: ${config.color}${config.tier}`)) {
                    return keyType;
                }
            }
        }
    }

    return null;
}

// Verificar si un item es una key
function isKey(item) {
    return getKeyTypeFromItem(item) !== null;
}

// Dar key a un jugador
function giveKeyToPlayer(player, keyType, quantity) {
    const keyItem = createKey(keyType, quantity);
    if (!keyItem) return false;

    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) return false;

    inventory.container.addItem(keyItem);
    return true;
}

// Comando: !key give <player> <key> <quantity>
world.beforeEvents.chatSend.subscribe((event) => {
    const sender = event.sender;
    const args = event.message.split(" ");

    if (args[0].toLowerCase() === "!key") {
        event.cancel = true;

        system.runTimeout(() => {
            const action = args[1]?.toLowerCase();

            // !key give <player> <key> <quantity>
            if (action === "give") {
                if (!sender.hasTag("adminCMDS")) {
                    sender.sendMessage("§cYou don't have permission to use this command.");
                    return;
                }

                if (args.length < 5) {
                    sender.sendMessage("§c§lKey §7>> §cUsage: !key give <player> <key> <quantity>");
                    sender.sendMessage("§7Available keys: common, uncommon, rare, epic, legendary, mythic, unreal, event, madmax, ripper, tag, luminous, planetoid, monthly, vote");
                    return;
                }

                const targetName = args[2];
                const keyType = args[3].toLowerCase();
                const quantity = parseInt(args[4]);

                if (!KEY_CONFIG[keyType]) {
                    sender.sendMessage("§c§lKey §7>> §cInvalid key type!");
                    sender.sendMessage("§7Available keys: common, uncommon, rare, epic, legendary, mythic, unreal, event, madmax, ripper, tag, luminous, planetoid, monthly, vote");
                    return;
                }

                if (isNaN(quantity) || quantity <= 0) {
                    sender.sendMessage("§c§lKey §7>> §cQuantity must be a positive number!");
                    return;
                }

                const targetPlayers = world.getPlayers({ name: targetName });
                if (targetPlayers.length === 0) {
                    sender.sendMessage("§c§lKey §7>> §cPlayer not found!");
                    return;
                }

                const target = targetPlayers[0];
                const config = KEY_CONFIG[keyType];

                if (giveKeyToPlayer(target, keyType, quantity)) {
                    sender.sendMessage(`§a§lKey §7>> §rGiven §f${quantity}x ${config.name} §rto §b${targetName}§r!`);
                    target.sendMessage(`§a§lKey §7>> §rYou received §f${quantity}x ${config.name}§r!`);
                    
                    system.run(() => {
                        sender.runCommand("playsound random.levelup @s");
                        target.runCommand("playsound random.levelup @s");
                    });
                } else {
                    sender.sendMessage("§c§lKey §7>> §cError giving key!");
                }
                return;
            }

            // !key all <key> <quantity>
            if (action === "all") {
                if (!sender.hasTag("adminCMDS")) {
                    sender.sendMessage("§cYou don't have permission to use this command.");
                    return;
                }

                if (args.length < 4) {
                    sender.sendMessage("§c§lKey §7>> §cUsage: !key all <key> <quantity>");
                    sender.sendMessage("§7Available keys: common, uncommon, rare, epic, legendary, mythic, unreal, event, madmax, ripper, tag, luminous, planetoid, monthly, vote");
                    return;
                }

                const keyType = args[2].toLowerCase();
                const quantity = parseInt(args[3]);

                if (!KEY_CONFIG[keyType]) {
                    sender.sendMessage("§c§lKey §7>> §cInvalid key type!");
                    sender.sendMessage("§7Available keys: common, uncommon, rare, epic, legendary, mythic, unreal, event, madmax, ripper, tag, luminous, planetoid, monthly, vote");
                    return;
                }

                if (isNaN(quantity) || quantity <= 0) {
                    sender.sendMessage("§c§lKey §7>> §cQuantity must be a positive number!");
                    return;
                }

                const config = KEY_CONFIG[keyType];
                const allPlayers = world.getAllPlayers();
                let successCount = 0;

                for (const player of allPlayers) {
                    if (giveKeyToPlayer(player, keyType, quantity)) {
                        successCount++;
                        player.sendMessage(`§a§lKey §7>> §rYou received §f${quantity}x ${config.name}§r!`);
                        system.run(() => {
                            player.runCommand("playsound random.levelup @s");
                        });
                    }
                }

                sender.sendMessage(`§a§lKey §7>> §rGiven §f${quantity}x ${config.name} §rto §e${successCount}§r player(s)!`);
                system.run(() => {
                    sender.runCommand("playsound random.levelup @s");
                });
                return;
            }

            // Mensaje de ayuda
            sender.sendMessage("§c§lKey §7>> §cUsage:");
            sender.sendMessage("§c§lKey §7>> §f!key give <player> <key> <quantity>");
            sender.sendMessage("§c§lKey §7>> §f!key all <key> <quantity>");
            sender.sendMessage("§7Available keys: common, uncommon, rare, epic, legendary, mythic, unreal, event, madmax, ripper, tag, luminous, planetoid, monthly, vote");
        }, 1);
    }
});

// Bloquear colocación de keys
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;

    try {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory || !inventory.container) return;

        const hand = inventory.container.getItem(player.selectedSlotIndex);
        if (!isKey(hand)) return;

        event.cancel = true;
        system.run(() => {
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place this item on the ground!");
            player.runCommand(`playsound note.bass @s`);
        });
    } catch (e) {}
});

export { KEY_CONFIG, createKey, giveKeyToPlayer, getKeyTypeFromItem, isKey };