import { world, system, ItemStack } from "@minecraft/server";

const BOOSTER_CONFIG = {
    pickaxeXP: {
        item: "minecraft:emerald",
        name: "§bPickaxe XP Booster",
        displayName: "Pickaxe XP",
        description: "Increase pickaxe XP gain",
        multipliers: [1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0],
        durations: {
            "15m": 15 * 60 * 20,
            "30m": 30 * 60 * 20,
            "45m": 45 * 60 * 20,
            "1hr": 60 * 60 * 20
        }
    },
    tokenFinder: {
        item: "minecraft:gold_ingot",
        name: "§6Token Booster",
        displayName: "Token",
        description: "Increase the amount of tokens you gain",
        multipliers: [1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0],
        durations: {
            "15m": 15 * 60 * 20,
            "30m": 30 * 60 * 20,
            "45m": 45 * 60 * 20,
            "1hr": 60 * 60 * 20
        }
    },
    upgrades: {
        item: "minecraft:amethyst_cluster",
        name: "§dUpgrade Booster",
        displayName: "Upgrade",
        description: "Increase upgrade chance probability",
        multipliers: [1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0],
        durations: {
            "15m": 15 * 60 * 20,
            "30m": 30 * 60 * 20,
            "45m": 45 * 60 * 20,
            "1hr": 60 * 60 * 20
        }
    },
    moneyEarning: {
        item: "minecraft:orange_dye",
        name: "§6Money Booster",
        displayName: "Money",
        description: "Increase the amount of money you earn",
        multipliers: [1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0],
        durations: {
            "15m": 15 * 60 * 20,
            "30m": 30 * 60 * 20,
            "45m": 45 * 60 * 20,
            "1hr": 60 * 60 * 20
        }
    },
    petXP: {
        item: "minecraft:experience_bottle",
        name: "§ePet XP Booster",
        displayName: "Pet XP",
        description: "Increase pet XP gain",
        multipliers: [1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0],
        durations: {
            "15m": 15 * 60 * 20,
            "30m": 30 * 60 * 20,
            "45m": 45 * 60 * 20,
            "1hr": 60 * 60 * 20
        }
    }
};

const boosterUsedFlag = new Set();

function getDurationDisplay(durationTicks) {
    const seconds = Math.floor(durationTicks / 20);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h${minutes}m`;
    }
    return `${minutes}m`;
}

export function createBoosterItem(boosterType, multiplier, duration) {
    if (!BOOSTER_CONFIG[boosterType]) {
        return null;
    }

    const config = BOOSTER_CONFIG[boosterType];
    const boosterItem = new ItemStack(config.item, 1);
    
    const durationDisplay = getDurationDisplay(duration);
    const percentageBoost = Math.round((multiplier - 1) * 100);
    
    boosterItem.nameTag = `${config.name} §r§8(§r+${percentageBoost}% for ${durationDisplay}§r§8)`;
    
    const lore = [
        `§r`,
        `§r§7${config.description}`,
        `§r`,
        `§r§6Information`,
        `§r§6| Boost: §r+${percentageBoost}%`,
        `§r§6| Duration: §r${durationDisplay}`
    ];
    
    boosterItem.setLore(lore);
    boosterItem.keepOnDeath = true;
    
    return boosterItem;
}

function parseBoosterData(item) {
    if (!item || !item.nameTag) return null;
    
    const nameTag = item.nameTag;
    
    const percentMatch = nameTag.match(/\+(\d+)%/);
    const durationMatch = nameTag.match(/for\s+(\d+)([hm]+)/);
    
    if (!percentMatch || !durationMatch) return null;
    
    const percentageBoost = parseInt(percentMatch[1]);
    const multiplier = 1 + (percentageBoost / 100);
    
    let boosterType = null;
    for (const [type, config] of Object.entries(BOOSTER_CONFIG)) {
        if (nameTag.includes(config.displayName)) {
            boosterType = type;
            break;
        }
    }
    
    if (!boosterType) {
        return null;
    }
    
    const durationValue = parseInt(durationMatch[1]);
    const durationUnit = durationMatch[2];
    
    let duration = 0;
    if (durationUnit.includes("h")) {
        const minutes = durationUnit.includes("m") ? parseInt(durationMatch[1].split("")[1]) : 0;
        duration = ((durationValue * 3600) + (minutes * 60)) * 20;
    } else {
        duration = (durationValue * 60) * 20;
    }
    
    return { boosterType, multiplier, duration };
}

function activateBooster(player, boosterType, multiplier, duration) {
    const endTime = system.currentTick + duration;
    const tag = `booster_${boosterType}_${multiplier}_${endTime}`;
    
    const existingTags = player.getTags();
    for (const existingTag of existingTags) {
        if (existingTag.startsWith(`booster_${boosterType}_`)) {
            system.run(() => {
                player.removeTag(existingTag);
            });
        }
    }
    
    system.run(() => {
        player.addTag(tag);
    });
    
    return true;
}

function formatTimeRemaining(ticks) {
    const seconds = Math.floor(ticks / 20);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h${minutes}m${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m${secs}s`;
    } else {
        return `${secs}s`;
    }
}

export function getActiveBooster(player, type) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith(`booster_${type}_`)) {
            const parts = tag.split("_");
            if (parts.length >= 4) {
                const multiplier = parseFloat(parts[2]);
                const endTime = parseInt(parts[3]);
                const currentTime = system.currentTick;
                
                if (currentTime < endTime) {
                    return { multiplier, endTime, tag };
                } else {
                    system.run(() => {
                        player.removeTag(tag);
                    });
                }
            }
        }
    }
    return null;
}

function useBooster(player, item) {
    const flagKey = `${player.id}_${system.currentTick}`;
    if (boosterUsedFlag.has(flagKey)) {
        return;
    }
    boosterUsedFlag.add(flagKey);
    
    if (boosterUsedFlag.size > 100) {
        const arr = Array.from(boosterUsedFlag);
        arr.slice(0, 50).forEach(f => boosterUsedFlag.delete(f));
    }
    
    const boosterData = parseBoosterData(item);
    if (!boosterData) return;
    
    const { boosterType, multiplier, duration } = boosterData;
    
    if (!BOOSTER_CONFIG[boosterType]) {
        player.sendMessage("§c§lBooster §7>> §cInvalid booster type!");
        return;
    }
    
    activateBooster(player, boosterType, multiplier, duration);
    
    const config = BOOSTER_CONFIG[boosterType];
    const percentageBoost = Math.round((multiplier - 1) * 100);
    player.sendMessage(`§a§lBooster Activated! §7>> §r${config.name} §r§8+${percentageBoost}% for ${formatTimeRemaining(duration)}`);
    
    system.run(() => {
        player.runCommand(`playsound random.levelup @s`);
    });
    
    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;
        
        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);
        
        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Booster")) {
            if (currentItem.amount > 1) {
                currentItem.amount -= 1;
                inv.container.setItem(slot, currentItem);
            } else {
                inv.container.setItem(slot, undefined);
            }
        }
    });
}

world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    
    if (!item || !item.nameTag) return;
    if (!item.nameTag.includes("Booster")) return;
    
    useBooster(player, item);
});

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const tags = player.getTags();
        for (const tag of tags) {
            if (tag.startsWith("booster_")) {
                const parts = tag.split("_");
                if (parts.length >= 4) {
                    const endTime = parseInt(parts[3]);
                    const currentTime = system.currentTick;
                    
                    if (currentTime >= endTime) {
                        system.run(() => {
                            player.removeTag(tag);
                        });
                        const boosterType = parts[1];
                        const config = BOOSTER_CONFIG[boosterType];
                        if (config) {
                            player.sendMessage(`§8§lBooster §7>> §rYour ${config.name} §rhas expired!`);
                            system.run(() => {
                                player.runCommand("playsound random.pop @s");
                            });
                        }
                    }
                }
            }
        }
    }
}, 20);

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const args = event.message.split(" ");
    
    if (args[0].toLowerCase() === "!boosters") {
        event.cancel = true;
        
        system.runTimeout(() => {
            const action = args[1]?.toLowerCase() || "list";
            
            if (action === "list" || args.length === 1) {
                const pickaxeBooster = getActiveBooster(player, "pickaxeXP");
                const tokenBooster = getActiveBooster(player, "tokenFinder");
                const upgradesBooster = getActiveBooster(player, "upgrades");
                const moneyBooster = getActiveBooster(player, "moneyEarning");
                const petXPBooster = getActiveBooster(player, "petXP");
                
                if (!pickaxeBooster && !tokenBooster && !upgradesBooster && !moneyBooster && !petXPBooster) {
                    player.sendMessage("§8§lBoosters §7>> §rYou don't have any active boosters.");
                    return;
                }
                
                let message = "§6ACTIVE BOOSTERS:\n";
                
                if (pickaxeBooster) {
                    const timeLeft = formatTimeRemaining(pickaxeBooster.endTime - system.currentTick);
                    const percentageBoost = Math.round((pickaxeBooster.multiplier - 1) * 100);
                    message += `§bPickaxe XP: +${percentageBoost}% (${timeLeft})\n`;
                }
                
                if (tokenBooster) {
                    const timeLeft = formatTimeRemaining(tokenBooster.endTime - system.currentTick);
                    const percentageBoost = Math.round((tokenBooster.multiplier - 1) * 100);
                    message += `§6Token: +${percentageBoost}% (${timeLeft})\n`;
                }
                
                if (upgradesBooster) {
                    const timeLeft = formatTimeRemaining(upgradesBooster.endTime - system.currentTick);
                    const percentageBoost = Math.round((upgradesBooster.multiplier - 1) * 100);
                    message += `§dUpgrade: +${percentageBoost}% (${timeLeft})\n`;
                }
                
                if (moneyBooster) {
                    const timeLeft = formatTimeRemaining(moneyBooster.endTime - system.currentTick);
                    const percentageBoost = Math.round((moneyBooster.multiplier - 1) * 100);
                    message += `§6Money: +${percentageBoost}% (${timeLeft})\n`;
                }
                
                if (petXPBooster) {
                    const timeLeft = formatTimeRemaining(petXPBooster.endTime - system.currentTick);
                    const percentageBoost = Math.round((petXPBooster.multiplier - 1) * 100);
                    message += `§ePet XP: +${percentageBoost}% (${timeLeft})`;
                }
                
                player.sendMessage(message);
            }
            
            else if (action === "remove") {
                if (args.length < 3) {
                    player.sendMessage("§c§lBooster §7>> §rUsage: !boosters remove <type>");
                    player.sendMessage("§7Types: pickaxeXP, tokenFinder, upgrades, moneyEarning, petXP");
                    return;
                }
                
                const boosterType = args[2];
                
                if (!BOOSTER_CONFIG[boosterType]) {
                    player.sendMessage("§c§lBooster §7>> §rInvalid booster type!");
                    return;
                }
                
                const booster = getActiveBooster(player, boosterType);
                if (!booster) {
                    player.sendMessage(`§c§lBooster §7>> §rYou don't have an active ${BOOSTER_CONFIG[boosterType].name}!`);
                    return;
                }
                
                system.run(() => {
                    player.removeTag(booster.tag);
                });
                
                player.sendMessage(`§a§lBooster §7>> §rRemoved your active ${BOOSTER_CONFIG[boosterType].name}!`);
                player.runCommand("playsound note.bass @s");
            }
            
            else if (action === "item") {
                if (!player.hasTag("admin")) {
                    player.sendMessage("§cYou don't have permission to use this command.");
                    return;
                }
                
                if (args.length < 6) {
                    player.sendMessage("§c§lBooster §7>> §rUsage: !boosters item <player> <type> <multiplier> <duration>");
                    player.sendMessage("§7Types: pickaxeXP, tokenFinder, upgrades, moneyEarning, petXP");
                    player.sendMessage("§7Multipliers: 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0");
                    player.sendMessage("§7Durations: 15m, 30m, 45m, 1hr");
                    return;
                }
                
                const targetName = args[2];
                const boosterType = args[3];
                const multiplier = parseFloat(args[4]);
                const durationKey = args[5]?.toLowerCase();
                
                if (!BOOSTER_CONFIG[boosterType]) {
                    player.sendMessage("§c§lBooster §7>> §rInvalid booster type!");
                    return;
                }
                
                if (!BOOSTER_CONFIG[boosterType].multipliers.includes(multiplier)) {
                    player.sendMessage("§c§lBooster §7>> §rInvalid multiplier!");
                    return;
                }
                
                const duration = BOOSTER_CONFIG[boosterType].durations[durationKey];
                if (!duration) {
                    player.sendMessage("§c§lBooster §7>> §rInvalid duration!");
                    return;
                }
                
                const target = world.getAllPlayers().find(p => p.name === targetName);
                if (!target) {
                    player.sendMessage("§c§lBooster §7>> §rPlayer not found!");
                    return;
                }
                
                const boosterItem = createBoosterItem(boosterType, multiplier, duration);
                const inv = target.getComponent("minecraft:inventory");
                if (inv && inv.container) {
                    inv.container.addItem(boosterItem);
                    const percentageBoost = Math.round((multiplier - 1) * 100);
                    player.sendMessage(`§a§lBooster §7>> §rGave ${BOOSTER_CONFIG[boosterType].name} §r§8+${percentageBoost}%§r item to §f${targetName}`);
                    target.sendMessage(`§a§lBooster §7>> §rYou received a booster item! Right-click to activate it.`);
                    system.run(() => {
                        target.runCommand("playsound random.levelup @s");
                    });
                }
            }
            
            else if (action === "give") {
                if (!player.hasTag("admin")) {
                    player.sendMessage("§cYou don't have permission to use this command.");
                    return;
                }
                
                if (args.length < 6) {
                    player.sendMessage("§c§lBooster §7>> §rUsage: !boosters give <player> <type> <multiplier> <duration>");
                    player.sendMessage("§7Types: pickaxeXP, tokenFinder, upgrades, moneyEarning, petXP");
                    player.sendMessage("§7Multipliers: 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0");
                    player.sendMessage("§7Durations: 15m, 30m, 45m, 1hr");
                    return;
                }
                
                const targetName = args[2];
                const boosterType = args[3];
                const multiplier = parseFloat(args[4]);
                const durationKey = args[5]?.toLowerCase();
                
                if (!BOOSTER_CONFIG[boosterType]) {
                    player.sendMessage("§c§lBooster §7>> §rInvalid booster type!");
                    return;
                }
                
                if (!BOOSTER_CONFIG[boosterType].multipliers.includes(multiplier)) {
                    player.sendMessage("§c§lBooster §7>> §rInvalid multiplier!");
                    return;
                }
                
                const duration = BOOSTER_CONFIG[boosterType].durations[durationKey];
                if (!duration) {
                    player.sendMessage("§c§lBooster §7>> §rInvalid duration!");
                    return;
                }
                
                const target = world.getAllPlayers().find(p => p.name === targetName);
                if (!target) {
                    player.sendMessage("§c§lBooster §7>> §rPlayer not found!");
                    return;
                }
                
                activateBooster(target, boosterType, multiplier, duration);
                
                const percentageBoost = Math.round((multiplier - 1) * 100);
                player.sendMessage(`§a§lBooster §7>> §rGave active ${BOOSTER_CONFIG[boosterType].name} §r§8+${percentageBoost}%§r to §f${targetName}`);
                target.sendMessage(`§a§lBooster §7>> §rYou received an active ${BOOSTER_CONFIG[boosterType].name} §r§8+${percentageBoost}%§r for §e${formatTimeRemaining(duration)}`);
                system.run(() => {
                    target.runCommand("playsound random.levelup @s");
                });
            }
            
            else {
                player.sendMessage("§c§lBooster §7>> §rUsage: !boosters [list|remove|item|give]");
            }
        }, 1);
    }
});

export { BOOSTER_CONFIG, formatTimeRemaining };