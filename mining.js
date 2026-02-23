import { world, system } from "@minecraft/server";
import { addMoney, getBalance, formatMoney, getMultiSell, getMultiBlock, addTokens } from "./sidebar.js";
import { addBackpackValue, getBackpackValue, getBackpackMaxValue, setBackpackValue } from "./sidebar.js";
import { applyTokenFinderBoost, applyUpgradeBoost, applyMoneyEarningBoost, getMoneyEarningMultiplier } from "./booster-integration.js";
import { getActivePet } from "./pets.js";
import { KEY_CONFIG } from "./key-system.js";

const BLOCK_VALUES = {
    "minecraft:dark_oak_log": 1,
    "minecraft:oak_log": 1,
    "minecraft:acasia_log": 1,
    "minecraft:mossy_cobblestone": 3,
    "minecraft:cobblestone": 3,
    "minecraft:stone": 3,
    "minecraft:coal_ore": 5,
    "minecraft:iron_ore": 5,
    "minecraft:gold_ore": 5,
    "minecraft:lapis_ore": 7,
    "minecraft:redstone_ore": 9,
    "minecraft:redstone_block": 11,
    "minecraft:lapis_block": 17,
    "minecraft:iron_block": 23,
    "minecraft:gold_block": 27,
    "minecraft:emerald_ore": 30,
    "minecraft:obsidian": 40,
    "minecraft:diamond_ore": 49,
    "minecraft:diamond_block": 56,
    "minecraft:emerald_block": 70,
    "minecraft:netherite_block": 90
};

function getRandomKey() {
    // Keys NORMALES (obtainables por Key Finder)
    const normalKeys = [
        { type: "common", weight: 35 },        // Muy común
        { type: "uncommon", weight: 25 },      // Común
        { type: "rare", weight: 18 },          // Poco común
        { type: "epic", weight: 10 },          // Raro
        { type: "legendary", weight: 6 },      // Muy raro
        { type: "mythic", weight: 3 },         // Ultra raro
        { type: "unreal", weight: 1.5 },       // Extremadamente raro
        { type: "event", weight: 1.0 },        // Super raro
        { type: "madmax", weight: 0.4 },       // Ultra mega raro
        { type: "ripper", weight: 0.1 }        // Legendario
    ];
    
    const totalWeight = normalKeys.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of normalKeys) {
        if (random < item.weight) {
            return item.type;
        }
        random -= item.weight;
    }
    
    return "common";
}

function getKeyName(keyType) {
    if (KEY_CONFIG[keyType]) {
        return KEY_CONFIG[keyType].name;
    }
    
    return "§fKey";
}

function getTokenFinderMultiplier(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("multiTokenFinder:")) {
            const multiStr = tag.replace("multiTokenFinder:", "");
            const amount = parseFloat(multiStr);
            if (!isNaN(amount)) {
                return amount;
            }
        }
    }
    return 1;
}

function getMultiBlock(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("multiBlock:")) {
            const multiStr = tag.replace("multiBlock:", "");
            const amount = parseFloat(multiStr);
            if (!isNaN(amount)) {
                return amount;
            }
        }
    }
    return 1;
}

// Obtener boost total de Token de la pet activa
function getPetTokenBoost(player) {
    const activePet = getActivePet(player);
    if (!activePet) return 0;

    let totalBoost = 0;

    // Booster predefinido (nivel de la pet)
    if (activePet.predefinedBooster === "token") {
        totalBoost += activePet.level;
    }

    // Booster predeterminado (nivel * 5%)
    totalBoost += activePet.tokenLevel * 5;

    return totalBoost;
}

// Obtener boost total de Upgrade de la pet activa
function getPetUpgradeBoost(player) {
    const activePet = getActivePet(player);
    if (!activePet) return 0;

    let totalBoost = 0;

    // Booster predefinido (nivel de la pet)
    if (activePet.predefinedBooster === "upgrade") {
        totalBoost += activePet.level;
    }

    // Booster predeterminado (nivel * 5%)
    totalBoost += activePet.upgradeLevel * 5;

    return totalBoost;
}

// Obtener boost total de Sell de la pet activa
function getPetSellBoost(player) {
    const activePet = getActivePet(player);
    if (!activePet) return 0;

    let totalBoost = 0;

    // Booster predefinido (nivel de la pet)
    if (activePet.predefinedBooster === "sell") {
        totalBoost += activePet.level;
    }

    // Booster predeterminado (nivel * 5%)
    totalBoost += activePet.sellLevel * 5;

    return totalBoost;
}

world.afterEvents.playerBreakBlock.subscribe(event => {
    const player = event.player;
    const blockId = event.brokenBlockPermutation.type.id;

    system.runTimeout(() => {
        const entities = player.dimension.getEntities({
            location: event.block.location,
            maxDistance: 2,
            type: "minecraft:item"
        });
        for (const e of entities) e.kill();
    }, 0);

    if (BLOCK_VALUES[blockId] !== undefined) {
        const baseValue = BLOCK_VALUES[blockId];
        const multiBlock = getMultiBlock(player);
        
        const fortObj = world.scoreboard.getObjective("fort");
        let fortLevel = 0;
        if (fortObj) {
            try { fortLevel = fortObj.getScore(player) || 0; } catch {}
        }
        
        const fortuneMultiplier = fortLevel === 0 ? 1 : fortLevel;
        const finalValue = Math.floor(baseValue * multiBlock * fortuneMultiplier);
        
        addBackpackValue(player, finalValue);
    }

    const blocksObjLocal = world.scoreboard.getObjective("blocks");
    if (blocksObjLocal) {
        const identity = player.scoreboardIdentity;
        if (identity) {
            blocksObjLocal.addScore(identity, 1);
        }
    }

    addTokens(player, 1);

    const tokObj = world.scoreboard.getObjective("tok");
    let tokLevel = 0;
    if (tokObj) {
        try { tokLevel = tokObj.getScore(player) || 0; } catch {}
    }

    // Token Finder con SUMA de boosters
    const baseChance = (tokLevel / 50) * 5;
    
    // Boosters de items temporales
    const itemBoosterMulti = applyUpgradeBoost(player, 1);
    const itemBonus = (itemBoosterMulti - 1) * 100;
    
    // Boosters de pet (suma directa)
    const petBonus = getPetTokenBoost(player);
    
    // SUMA total
    const totalBonus = itemBonus + petBonus;
    const finalChance = baseChance * (1 + totalBonus / 100);
    const cappedChance = Math.min(finalChance, 100);

    const roll = Math.random() * 100;
    if (roll < cappedChance) {
        const minTokens = 120;
        const maxTokens = 972;
        const foundTokens = Math.floor(Math.random() * (maxTokens - minTokens + 1)) + minTokens;
        
        const boostedTokens = applyTokenFinderBoost(player, foundTokens);
        
        addTokens(player, boostedTokens);
        player.sendMessage(`§l§6Token Finder §7>> §rYou found §e${boostedTokens} tokens§r!`);
        player.runCommand(`playsound note.pling @s`);
    }

    const keyObj = world.scoreboard.getObjective("key");
    let keyLevel = 0;
    if (keyObj) {
        try { keyLevel = keyObj.getScore(player) || 0; } catch {}
    }

    // Key Finder con SUMA de boosters
    const keyBaseChance = (keyLevel / 50) * 0.75;
    
    // Boosters de items temporales
    const itemBoosterMultiKey = applyUpgradeBoost(player, 1);
    const itemBonusKey = (itemBoosterMultiKey - 1) * 100;
    
    // Boosters de pet (upgrade booster afecta key finder)
    const petBonusKey = getPetUpgradeBoost(player);
    
    // SUMA total
    const totalBonusKey = itemBonusKey + petBonusKey;
    const finalKeyChance = keyBaseChance * (1 + totalBonusKey / 100);
    const cappedKeyChance = Math.min(finalKeyChance, 100);
    const keyRoll = Math.random() * 100;
    
    if (keyRoll < cappedKeyChance) {
        const foundKeyType = getRandomKey();
        const keyName = getKeyName(foundKeyType);
        
        // Dar la key usando el sistema de key-system.js
        player.runCommand(`give @s minecraft:tripwire_hook 1`);
        
        // Después, en el siguiente tick, aplicarle el lore correcto
        system.runTimeout(() => {
            const inventory = player.getComponent("minecraft:inventory");
            if (!inventory || !inventory.container) return;
            
            // Buscar el tripwire_hook sin lore (recién dado)
            for (let i = 0; i < inventory.container.size; i++) {
                const item = inventory.container.getItem(i);
                if (item && item.typeId === "minecraft:tripwire_hook") {
                    const lore = item.getLore();
                    if (!lore || lore.length === 0 || !lore.some(line => line.includes("Tier:"))) {
                        // Este es el nuevo, aplicarle el lore correcto
                        const config = KEY_CONFIG[foundKeyType];
                        if (config) {
                            item.nameTag = config.name;
                            item.setLore(config.lore);
                            item.keepOnDeath = true;
                            inventory.container.setItem(i, item);
                        }
                        break;
                    }
                }
            }
        }, 2);
        
        player.sendMessage(`§l§dKey Finder §7>> §rYou found a ${keyName}§r!`);
        player.runCommand(`playsound random.levelup @s`);
    }
});

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const msg = event.message;

    if (msg === "!sell") {
        system.runTimeout(() => {
            const tags = player.getTags();
            
            if (tags.includes("Rank:§eAuto-Sell")) {
                player.addTag("sellBackPack");
            } else {
                player.sendMessage("§cYou need the §eAuto-Sell§c rank to use this command. Buy it at our Discord server.");
            }
        }, 1);
        event.cancel = true;
    }
    
    if (msg === "!auto-sell") {
        system.runTimeout(() => {
            const tags = player.getTags();
            
            if (tags.includes("Rank:§eAuto-Sell")) {
                if (tags.includes("Auto-Sell")) {
                    player.removeTag("Auto-Sell");
                    player.runCommand(`playsound note.bass @s`);
                    player.sendMessage("§l§eAuto-Sell§7 §r>> §cDisabled");
                } else {
                    player.addTag("Auto-Sell");
                    player.runCommand(`playsound note.pling @s`);
                    player.sendMessage("§l§eAuto-Sell§7 §r>> §aEnabled");
                }
            } else {
                player.sendMessage("§cYou need the §eAuto-Sell§c rank to use this command. Buy it at our Discord server.");
            }
        }, 1);
        event.cancel = true;
    }
});

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const tags = player.getTags();
        
        if (tags.includes("sellBackPack")) {
            const backpackValue = getBackpackValue(player);
            const sellMultiplier = getMultiSell(player);
            
            if (backpackValue > 0) {
                const previousBalance = getBalance(player);
                
                // Aplicar multiplicador de venta base
                let moneyBeforeBoosters = backpackValue * sellMultiplier;
                
                // Aplicar boosters de items temporales (Money Booster)
                const itemBoosterMulti = applyMoneyEarningBoost(player, 1);
                const itemBonus = (itemBoosterMulti - 1) * 100;
                
                // Aplicar boosters de pet (Sell Booster)
                const petBonus = getPetSellBoost(player);
                
                // SUMA total
                const totalBonus = itemBonus + petBonus;
                const moneyAfterBoost = Math.floor(moneyBeforeBoosters * (1 + totalBonus / 100));
                
                addMoney(player, moneyAfterBoost);
                const newBalance = getBalance(player);
                
                setBackpackValue(player, 0);
                
                player.runCommand(`playsound random.orb @s`);
                
                const hasBoost = totalBonus > 0;
                const boostPercent = Math.round(totalBonus);
                
                // Desglosar boosters
                let boostDetails = [];
                if (itemBonus > 0) {
                    boostDetails.push(`§6Item +${Math.round(itemBonus)}%`);
                }
                if (petBonus > 0) {
                    boostDetails.push(`§bPet +${Math.round(petBonus)}%`);
                }
                
                let sellMsg = 
                    `§6|--------------------------------|\n` +
                    `§6| §eBlocks x${backpackValue} | §a$${formatMoney(backpackValue * sellMultiplier)}\n` +
                    `§6|\n` +
                    `§6| §eSold ${backpackValue} items\n` +
                    `§6| §eTotal §a$${formatMoney(moneyAfterBoost)}\n` +
                    `§6|\n` +
                    `§6| §eSell:`;
                
                if (hasBoost) {
                    sellMsg += ` §6+${boostPercent}%`;
                    if (boostDetails.length > 0) {
                        sellMsg += ` §8(${boostDetails.join(" §8| ")})`;
                    }
                } else {
                    sellMsg += ` §c§m+0%`;
                }
                
                sellMsg += `\n` +
                    `§6| §f$${formatMoney(previousBalance)} §7-> §a$${formatMoney(newBalance)}\n` +
                    `§6|--------------------------------|`;
                
                player.sendMessage(sellMsg);
            } else {
                player.runCommand(`playsound note.bass @s`);
                player.sendMessage("§c§lError §r>> §cYour backpack is empty!");
            }
            
            player.removeTag("sellBackPack");
        }
    }
}, 1);

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const tags = player.getTags();
        
        if (!tags.includes("Auto-Sell")) {
            continue;
        }
        
        if (tags.includes("autoSellCooldown")) {
            continue;
        }
        
        const backpackValue = getBackpackValue(player);
        const bpmValue = getBackpackMaxValue(player);
        
        if (backpackValue < bpmValue) {
            continue;
        }
        
        player.addTag("autoSellCooldown");
        
        const sellMultiplier = getMultiSell(player);
        const previousBalance = getBalance(player);
        
        // Aplicar multiplicador de venta base
        let moneyBeforeBoosters = backpackValue * sellMultiplier;
        
        // Aplicar boosters de items temporales (Money Booster)
        const itemBoosterMulti = applyMoneyEarningBoost(player, 1);
        const itemBonus = (itemBoosterMulti - 1) * 100;
        
        // Aplicar boosters de pet (Sell Booster)
        const petBonus = getPetSellBoost(player);
        
        // SUMA total
        const totalBonus = itemBonus + petBonus;
        const moneyAfterBoost = Math.floor(moneyBeforeBoosters * (1 + totalBonus / 100));
        
        setBackpackValue(player, 0);
        
        addMoney(player, moneyAfterBoost);
        const newBalance = getBalance(player);
        
        player.runCommand(`playsound random.levelup @s`);
        
        const hasBoost = totalBonus > 0;
        const boostPercent = Math.round(totalBonus);
        
        // Desglosar boosters
        let boostDetails = [];
        if (itemBonus > 0) {
            boostDetails.push(`§6Item +${Math.round(itemBonus)}%`);
        }
        if (petBonus > 0) {
            boostDetails.push(`§bPet +${Math.round(petBonus)}%`);
        }
        
        let sellMsg = 
            `§6|--------------------------------|\n` +
            `§6| §eBlocks x${backpackValue} | §a$${formatMoney(backpackValue * sellMultiplier)}\n` +
            `§6|\n` +
            `§6| §eSold ${backpackValue} items\n` +
            `§6| §eTotal §a$${formatMoney(moneyAfterBoost)}\n` +
            `§6|\n` +
            `§6| §eSell:`;
        
        if (hasBoost) {
            sellMsg += ` §6+${boostPercent}%`;
            if (boostDetails.length > 0) {
                sellMsg += ` §8(${boostDetails.join(" §8| ")})`;
            }
        } else {
            sellMsg += ` §c§m+0%`;
        }
        
        sellMsg += `\n` +
            `§6| §f$${formatMoney(previousBalance)} §7-> §a$${formatMoney(newBalance)}\n` +
            `§6|--------------------------------|`;
        
        player.sendMessage(sellMsg);
        
        system.runTimeout(() => {
            player.removeTag("autoSellCooldown");
        }, 20);
    }
}, 1);