import { world, system } from "@minecraft/server";
import { getActiveBooster } from "./booster-items.js";

export function getPickaxeXPMultiplier(player) {
    try {
        const booster = getActiveBooster(player, "pickaxeXP");
        return booster ? booster.multiplier : 1.0;
    } catch {
        return 1.0;
    }
}

export function getTokenFinderMultiplier(player) {
    try {
        const booster = getActiveBooster(player, "tokenFinder");
        return booster ? booster.multiplier : 1.0;
    } catch {
        return 1.0;
    }
}

export function getUpgradesMultiplier(player) {
    try {
        const booster = getActiveBooster(player, "upgrades");
        return booster ? booster.multiplier : 1.0;
    } catch {
        return 1.0;
    }
}

export function getMoneyEarningMultiplier(player) {
    try {
        const booster = getActiveBooster(player, "moneyEarning");
        return booster ? booster.multiplier : 1.0;
    } catch {
        return 1.0;
    }
}

export function applyPickaxeXPBoost(player, baseXP) {
    const multiplier = getPickaxeXPMultiplier(player);
    return Math.floor(baseXP * multiplier);
}

export function applyTokenFinderBoost(player, baseTokens) {
    const multiplier = getTokenFinderMultiplier(player);
    return Math.floor(baseTokens * multiplier);
}

export function applyUpgradeBoost(player, baseChance) {
    const multiplier = getUpgradesMultiplier(player);
    return baseChance * multiplier;
}

export function applyMoneyEarningBoost(player, baseMoney) {
    const multiplier = getMoneyEarningMultiplier(player);
    return baseMoney * multiplier;
}

export function getAllBoosts(player) {
    return {
        pickaxeXP: getPickaxeXPMultiplier(player),
        tokenFinder: getTokenFinderMultiplier(player),
        upgrades: getUpgradesMultiplier(player),
        moneyEarning: getMoneyEarningMultiplier(player),
        isActive: getPickaxeXPMultiplier(player) > 1 || 
                  getTokenFinderMultiplier(player) > 1 || 
                  getUpgradesMultiplier(player) > 1 ||
                  getMoneyEarningMultiplier(player) > 1
    };
}