import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { getTokens, removeTokens, formatTokens } from "./sidebar.js";

const pendingForms = new Map();

const UPGRADE_COSTS = {
    efficiency: (level) => Math.floor(100 * Math.pow(1.5, level)),
    fort: (level) => Math.floor(500 * Math.pow(2.2, level)),
    tok: (level) => Math.floor(1000 * Math.pow(2.8, level)), // ⬆️ AUMENTADO: antes 150 base y 1.55 exponente, ahora 1000 base y 2.8 exponente
    key: (level) => Math.floor(1000 * Math.pow(2.5, level)),
    xppic: (level) => Math.floor(300 * Math.pow(1.75, level))
};

const MAX_LEVELS = {
    efficiency: 20,
    fort: 10,
    tok: 50,
    key: 50,
    xppic: 25
};

function getPickaxeLevel(player) {
    const lvlObj = world.scoreboard.getObjective("lvl");
    if (lvlObj) {
        try {
            return lvlObj.getScore(player) || 0;
        } catch {
            return 0;
        }
    }
    return 0;
}

function getUpgradeLevel(player, upgradeName) {
    const obj = world.scoreboard.getObjective(upgradeName);
    if (obj) {
        try {
            return obj.getScore(player) || 0;
        } catch {
            return 0;
        }
    }
    return 0;
}

function setUpgradeLevel(player, upgradeName, level) {
    const obj = world.scoreboard.getObjective(upgradeName);
    if (obj) {
        try {
            obj.setScore(player, level);
        } catch {}
    }
}

function calculateMaxLevels(upgradeId, currentLevel, maxLevel, playerTokens) {
    let totalCost = 0;
    let levelsBought = 0;
    let tempLevel = currentLevel;
    let tempTokens = playerTokens;
    
    while (tempLevel < maxLevel) {
        const cost = UPGRADE_COSTS[upgradeId](tempLevel);
        if (tempTokens >= cost) {
            tempTokens -= cost;
            totalCost += cost;
            levelsBought++;
            tempLevel++;
        } else {
            break;
        }
    }
    
    return { levelsBought, totalCost };
}

function tryShowUpgradesForm(player) {
    if (pendingForms.has(player.id)) {
        return;
    }
    
    pendingForms.set(player.id, true);
    
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryShow = () => {
        attempts++;
        
        showUpgradesMenu(player).then(() => {
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

async function showUpgradesMenu(player) {
    const pickaxeLevel = getPickaxeLevel(player);
    const effLevel = getUpgradeLevel(player, "efficiency");
    const fortLevel = getUpgradeLevel(player, "fort");
    const tokLevel = getUpgradeLevel(player, "tok");
    const keyLevel = getUpgradeLevel(player, "key");
    const xpLevel = getUpgradeLevel(player, "xppic");
    
    const form = new ActionFormData();
    form.title("§l§cPickaxe Upgrades");
    form.body("§fSelect an upgrade to purchase levels:");
    
    form.button(`§6Efficiency\n§fLevel ${effLevel}§7/§f20`, "textures/items/diamond_pickaxe");
    form.button(`§aFortune\n§fLevel ${fortLevel}§7/§f10`, "textures/items/diamond");
    form.button(`§eToken Finder\n§fLevel ${tokLevel}§7/§f50`, "textures/items/gold_ingot");
    
    if (pickaxeLevel >= 25) {
        form.button(`§dKey Finder\n§fLevel ${keyLevel}§7/§f50`, "textures/items/key");
        form.button(`§bXP Lurker\n§fLevel ${xpLevel}§7/§f25`, "textures/items/experience_bottle");
    } else {
        form.button(`§8Key Finder\n§7§oUnlocks at level 25`, "textures/ui/icon_lock");
        form.button(`§8XP Lurker\n§7§oUnlocks at level 25`, "textures/ui/icon_lock");
    }
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    if (response.selection === 0) {
        await showEfficiencyForm(player);
    } else if (response.selection === 1) {
        await showFortuneForm(player);
    } else if (response.selection === 2) {
        await showTokenFinderForm(player);
    } else if (response.selection === 3) {
        if (pickaxeLevel >= 25) {
            await showKeyFinderForm(player);
        } else {
            player.sendMessage("§6§lUpgrade §l§7>> §rThis upgrade unlocks at pickaxe level 25!");
            player.runCommand(`playsound note.bass @s`);
        }
    } else if (response.selection === 4) {
        if (pickaxeLevel >= 25) {
            await showXPLurkerForm(player);
        } else {
            player.sendMessage("§6§lUpgrade §l§7>> §rThis upgrade unlocks at pickaxe level 25!");
            player.runCommand(`playsound note.bass @s`);
        }
    }
}

async function showEfficiencyForm(player) {
    const currentLevel = getUpgradeLevel(player, "efficiency");
    const maxLevel = MAX_LEVELS.efficiency;
    
    if (currentLevel >= maxLevel) {
        player.sendMessage(`§6§lUpgrade §l§7>> §rYour §6Efficiency§r is already at max level!`);
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    const costForNext = UPGRADE_COSTS.efficiency(currentLevel);
    const playerTokens = getTokens(player);
    const maxCalc = calculateMaxLevels("efficiency", currentLevel, maxLevel, playerTokens);
    
    const form = new ActionFormData();
    form.title("§6Efficiency §r§fUpgrade");
    form.body(
        `§fCurrent Level: §e${currentLevel}§7/§e${maxLevel}\n` +
        `§fNext Level Cost: §e${formatTokens(costForNext)} tokens\n` +
        `§fYour Tokens: §e${formatTokens(playerTokens)} tokens\n\n` +
        `§7Mine blocks faster!\n\n` +
        `§7Choose your purchase option:`
    );
    
    form.button("§aBuy 1 Level\n§fPurchase next level", "textures/items/paper");
    form.button(`§6Buy Max Levels\n§f${maxCalc.levelsBought} levels (${formatTokens(maxCalc.totalCost)} tokens)`, "textures/items/book_writable");
    form.button("§cBack", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled || response.selection === 2) {
        await showUpgradesMenu(player);
        return;
    }
    
    if (response.selection === 0) {
        buyOneLevel(player, "efficiency", "§6Efficiency", currentLevel, maxLevel);
    } else if (response.selection === 1) {
        buyMaxLevels(player, "efficiency", "§6Efficiency", currentLevel, maxLevel);
    }
}

async function showFortuneForm(player) {
    const currentLevel = getUpgradeLevel(player, "fort");
    const maxLevel = MAX_LEVELS.fort;
    
    if (currentLevel >= maxLevel) {
        player.sendMessage(`§6§lUpgrade §l§7>> §rYour §aFortune§r is already at max level!`);
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    const costForNext = UPGRADE_COSTS.fort(currentLevel);
    const playerTokens = getTokens(player);
    const maxCalc = calculateMaxLevels("fort", currentLevel, maxLevel, playerTokens);
    
    const form = new ActionFormData();
    form.title("§aFortune §r§fUpgrade");
    form.body(
        `§fCurrent Level: §e${currentLevel}§7/§e${maxLevel}\n` +
        `§fCurrent Multiplier: §ax${currentLevel === 0 ? 1 : currentLevel}\n` +
        `§fNext Level Cost: §e${formatTokens(costForNext)} tokens\n` +
        `§fYour Tokens: §e${formatTokens(playerTokens)} tokens\n\n` +
        `§7Multiply blocks gained per mine!\n\n` +
        `§7Choose your purchase option:`
    );
    
    form.button("§aBuy 1 Level\n§fPurchase next level", "textures/items/paper");
    form.button(`§6Buy Max Levels\n§f${maxCalc.levelsBought} levels (${formatTokens(maxCalc.totalCost)} tokens)`, "textures/items/book_writable");
    form.button("§cBack", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled || response.selection === 2) {
        await showUpgradesMenu(player);
        return;
    }
    
    if (response.selection === 0) {
        buyOneLevel(player, "fort", "§aFortune", currentLevel, maxLevel);
    } else if (response.selection === 1) {
        buyMaxLevels(player, "fort", "§aFortune", currentLevel, maxLevel);
    }
}

async function showTokenFinderForm(player) {
    const currentLevel = getUpgradeLevel(player, "tok");
    const maxLevel = MAX_LEVELS.tok;
    
    if (currentLevel >= maxLevel) {
        player.sendMessage(`§6§lUpgrade §l§7>> §rYour §eToken Finder§r is already at max level!`);
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    const costForNext = UPGRADE_COSTS.tok(currentLevel);
    const playerTokens = getTokens(player);
    const baseChance = (currentLevel / 50) * 5;
    const maxCalc = calculateMaxLevels("tok", currentLevel, maxLevel, playerTokens);
    
    const form = new ActionFormData();
    form.title("§eToken Finder §r§fUpgrade");
    form.body(
        `§fCurrent Level: §e${currentLevel}§7/§e${maxLevel}\n` +
        `§fCurrent Chance: §e${baseChance.toFixed(1)}%\n` +
        `§fNext Level Cost: §e${formatTokens(costForNext)} tokens\n` +
        `§fYour Tokens: §e${formatTokens(playerTokens)} tokens\n\n` +
        `§7Find bonus tokens while mining!\n\n` +
        `§7Choose your purchase option:`
    );
    
    form.button("§aBuy 1 Level\n§fPurchase next level", "textures/items/paper");
    form.button(`§6Buy Max Levels\n§f${maxCalc.levelsBought} levels (${formatTokens(maxCalc.totalCost)} tokens)`, "textures/items/book_writable");
    form.button("§cBack", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled || response.selection === 2) {
        await showUpgradesMenu(player);
        return;
    }
    
    if (response.selection === 0) {
        buyOneLevel(player, "tok", "§eToken Finder", currentLevel, maxLevel);
    } else if (response.selection === 1) {
        buyMaxLevels(player, "tok", "§eToken Finder", currentLevel, maxLevel);
    }
}

async function showKeyFinderForm(player) {
    const currentLevel = getUpgradeLevel(player, "key");
    const maxLevel = MAX_LEVELS.key;
    
    if (currentLevel >= maxLevel) {
        player.sendMessage(`§6§lUpgrade §l§7>> §rYour §dKey Finder§r is already at max level!`);
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    const costForNext = UPGRADE_COSTS.key(currentLevel);
    const playerTokens = getTokens(player);
    const baseKeyChance = (currentLevel / 50) * 0.75;
    const maxCalc = calculateMaxLevels("key", currentLevel, maxLevel, playerTokens);
    
    const form = new ActionFormData();
    form.title("§dKey Finder §r§fUpgrade");
    form.body(
        `§fCurrent Level: §e${currentLevel}§7/§e${maxLevel}\n` +
        `§fCurrent Chance: §d${baseKeyChance.toFixed(2)}%\n` +
        `§fNext Level Cost: §e${formatTokens(costForNext)} tokens\n` +
        `§fYour Tokens: §e${formatTokens(playerTokens)} tokens\n\n` +
        `§7Find crate keys while mining!\n\n` +
        `§7Choose your purchase option:`
    );
    
    form.button("§aBuy 1 Level\n§fPurchase next level", "textures/items/paper");
    form.button(`§6Buy Max Levels\n§f${maxCalc.levelsBought} levels (${formatTokens(maxCalc.totalCost)} tokens)`, "textures/items/book_writable");
    form.button("§cBack", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled || response.selection === 2) {
        await showUpgradesMenu(player);
        return;
    }
    
    if (response.selection === 0) {
        buyOneLevel(player, "key", "§dKey Finder", currentLevel, maxLevel);
    } else if (response.selection === 1) {
        buyMaxLevels(player, "key", "§dKey Finder", currentLevel, maxLevel);
    }
}

async function showXPLurkerForm(player) {
    const currentLevel = getUpgradeLevel(player, "xppic");
    const maxLevel = MAX_LEVELS.xppic;
    
    if (currentLevel >= maxLevel) {
        player.sendMessage(`§6§lUpgrade §l§7>> §rYour §bXP Lurker§r is already at max level!`);
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    const costForNext = UPGRADE_COSTS.xppic(currentLevel);
    const playerTokens = getTokens(player);
    const currentMultiplier = currentLevel === 0 ? 1 : currentLevel;
    const maxCalc = calculateMaxLevels("xppic", currentLevel, maxLevel, playerTokens);
    
    const form = new ActionFormData();
    form.title("§bXP Lurker §r§fUpgrade");
    form.body(
        `§fCurrent Level: §e${currentLevel}§7/§e${maxLevel}\n` +
        `§fCurrent Multiplier: §bx${currentMultiplier}\n` +
        `§fNext Level Cost: §e${formatTokens(costForNext)} tokens\n` +
        `§fYour Tokens: §e${formatTokens(playerTokens)} tokens\n\n` +
        `§7Gain more pickaxe XP!\n\n` +
        `§7Choose your purchase option:`
    );
    
    form.button("§aBuy 1 Level\n§fPurchase next level", "textures/items/paper");
    form.button(`§6Buy Max Levels\n§f${maxCalc.levelsBought} levels (${formatTokens(maxCalc.totalCost)} tokens)`, "textures/items/book_writable");
    form.button("§cBack", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled || response.selection === 2) {
        await showUpgradesMenu(player);
        return;
    }
    
    if (response.selection === 0) {
        buyOneLevel(player, "xppic", "§bXP Lurker", currentLevel, maxLevel);
    } else if (response.selection === 1) {
        buyMaxLevels(player, "xppic", "§bXP Lurker", currentLevel, maxLevel);
    }
}

function buyOneLevel(player, upgradeId, upgradeName, currentLevel, maxLevel) {
    if (currentLevel >= maxLevel) {
        player.sendMessage(`§6§lUpgrade §l§7>> §rYour ${upgradeName}§r is already at max level!`);
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    const cost = UPGRADE_COSTS[upgradeId](currentLevel);
    const playerTokens = getTokens(player);
    
    if (playerTokens < cost) {
        player.sendMessage(`§6§lUpgrade §l§7>> §rYou need §e${formatTokens(cost)} tokens§r but only have §e${formatTokens(playerTokens)} tokens§r!`);
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    removeTokens(player, cost);
    setUpgradeLevel(player, upgradeId, currentLevel + 1);
    
    player.sendMessage(`§6|--------------------------------|`);
    player.sendMessage(`§6| §l§aUpgrade Purchased!`);
    player.sendMessage(`§6|`);
    player.sendMessage(`§6| ${upgradeName}§r §e${currentLevel} §7-> §e${currentLevel + 1}`);
    player.sendMessage(`§6| §7Cost: §e${formatTokens(cost)} tokens`);
    player.sendMessage(`§6| §7Remaining: §e${formatTokens(getTokens(player))} tokens`);
    player.sendMessage(`§6|--------------------------------|`);
    player.runCommand(`playsound random.levelup @s`);
}

function buyMaxLevels(player, upgradeId, upgradeName, currentLevel, maxLevel) {
    if (currentLevel >= maxLevel) {
        player.sendMessage(`§6§lUpgrade §l§7>> §rYour ${upgradeName}§r is already at max level!`);
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    let playerTokens = getTokens(player);
    let totalCost = 0;
    let levelsBought = 0;
    let tempLevel = currentLevel;
    
    while (tempLevel < maxLevel) {
        const cost = UPGRADE_COSTS[upgradeId](tempLevel);
        if (playerTokens >= cost) {
            playerTokens -= cost;
            totalCost += cost;
            levelsBought++;
            tempLevel++;
        } else {
            break;
        }
    }
    
    if (levelsBought === 0) {
        const cost = UPGRADE_COSTS[upgradeId](currentLevel);
        player.sendMessage(`§6§lUpgrade §l§7>> §rYou need §e${formatTokens(cost)} tokens§r but only have §e${formatTokens(getTokens(player))} tokens§r!`);
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    removeTokens(player, totalCost);
    setUpgradeLevel(player, upgradeId, currentLevel + levelsBought);
    
    player.sendMessage(`§6|--------------------------------|`);
    player.sendMessage(`§6| §l§aUpgrades Purchased!`);
    player.sendMessage(`§6|`);
    player.sendMessage(`§6| ${upgradeName}§r §e${currentLevel} §7-> §e${currentLevel + levelsBought}`);
    player.sendMessage(`§6| §7Levels Bought: §e${levelsBought}`);
    player.sendMessage(`§6| §7Total Cost: §e${formatTokens(totalCost)} tokens`);
    player.sendMessage(`§6| §7Remaining: §e${formatTokens(getTokens(player))} tokens`);
    player.sendMessage(`§6|--------------------------------|`);
    player.runCommand(`playsound random.levelup @s`);
}

world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    
    if (item.typeId === "minecraft:netherite_pickaxe") {
        tryShowUpgradesForm(player);
    }
});

export { };