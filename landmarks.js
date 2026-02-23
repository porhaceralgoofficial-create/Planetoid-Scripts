import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { addMoney, addTokens, formatMoney, formatTokens } from "./sidebar.js";

const pendingForms = new Map();

const TIME_LANDMARKS = [];
for (let i = 1; i <= 100; i++) {
    const baseTime = 300; 
    const timeRequired = Math.floor(baseTime * Math.pow(1.5, i - 1));
    
    let rewards = {
        money: Math.floor(1000 * Math.pow(1.8, i - 1)),
        tokens: Math.floor(50 * Math.pow(1.7, i - 1))
    };
    
    if (i % 10 === 0) {
        const boosterTier = Math.min(Math.floor(i / 10), 5);
        rewards.booster = {
            tier: boosterTier,
            type: i % 20 === 0 ? "legendary" : "epic"
        };
    }
    
    if (i % 25 === 0) {
        const keyRarity = i >= 75 ? "madmax" : i >= 50 ? "event" : i >= 25 ? "legend" : "epic";
        rewards.key = keyRarity;
    }
    
    TIME_LANDMARKS.push({
        id: i,
        name: `Time Played ${i}`,
        requirement: timeRequired,
        rewards: rewards
    });
}

const BLOCKS_LANDMARKS = [];
for (let i = 1; i <= 100; i++) {
    const baseBlocks = 100;
    const blocksRequired = Math.floor(baseBlocks * Math.pow(2.5, i - 1));
    
    let rewards = {
        money: Math.floor(2000 * Math.pow(2, i - 1)),
        tokens: Math.floor(100 * Math.pow(1.75, i - 1))
    };
    
    if (i % 10 === 0) {
        const boosterTier = Math.min(Math.floor(i / 10), 5);
        rewards.booster = {
            tier: boosterTier,
            type: i % 20 === 0 ? "legendary" : "rare"
        };
    }
    
    if (i % 20 === 0) {
        const keyRarity = i >= 80 ? "madmax" : i >= 60 ? "event" : i >= 40 ? "legend" : i >= 20 ? "epic" : "rare";
        rewards.key = keyRarity;
    }
    
    BLOCKS_LANDMARKS.push({
        id: i,
        name: `Blocks Mined ${i}`,
        requirement: blocksRequired,
        rewards: rewards
    });
}

const PRESTIGE_LANDMARKS = [];
for (let i = 1; i <= 100; i++) {
    const prestigeRequired = i;
    
    let rewards = {
        money: Math.floor(10000 * Math.pow(2.5, i - 1)),
        tokens: Math.floor(500 * Math.pow(2, i - 1))
    };
    
    if (i % 5 === 0) {
        const boosterTier = Math.min(Math.floor(i / 5), 5);
        rewards.booster = {
            tier: boosterTier,
            type: i % 10 === 0 ? "legendary" : "epic"
        };
    }
    
    if (i % 10 === 0) {
        const keyRarity = i >= 90 ? "madmax" : i >= 70 ? "event" : i >= 50 ? "legend" : i >= 30 ? "epic" : i >= 10 ? "rare" : "common";
        rewards.key = keyRarity;
        
        if (i >= 50 && i % 25 === 0) {
            rewards.keyAmount = Math.floor(i / 25);
        }
    }
    
    PRESTIGE_LANDMARKS.push({
        id: i,
        name: `Prestige ${i}`,
        requirement: prestigeRequired,
        rewards: rewards
    });
}

function getPlayTime(player) {
    const secObj = world.scoreboard.getObjective("sec");
    const minObj = world.scoreboard.getObjective("min");
    const hoursObj = world.scoreboard.getObjective("hours");
    
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    
    if (secObj) {
        try { seconds = secObj.getScore(player) || 0; } catch {}
    }
    
    if (minObj) {
        try { minutes = minObj.getScore(player) || 0; } catch {}
    }
    
    if (hoursObj) {
        try { hours = hoursObj.getScore(player) || 0; } catch {}
    }
    
    return (hours * 3600) + (minutes * 60) + seconds;
}

function getBlocksMined(player) {
    const blocksObj = world.scoreboard.getObjective("blocks");
    if (blocksObj) {
        try {
            return blocksObj.getScore(player) || 0;
        } catch {
            return 0;
        }
    }
    return 0;
}

function getPrestige(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("currPrestige:")) {
            const prestigeStr = tag.replace("currPrestige:", "");
            const amount = parseInt(prestigeStr);
            if (!isNaN(amount)) {
                return amount;
            }
        }
    }
    return 0;
}

function hasClaimedLandmark(player, category, landmarkId) {
    return player.hasTag(`landmark_${category}_${landmarkId}`);
}

function claimLandmark(player, category, landmarkId) {
    player.addTag(`landmark_${category}_${landmarkId}`);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function formatBlocks(amount) {
    if (amount === 0) return "0";
    
    const suffixes = [
        { value: 1e99, suffix: "Tg" },
        { value: 1e96, suffix: "Dtg" },
        { value: 1e93, suffix: "Utg" },
        { value: 1e90, suffix: "Vg" },
        { value: 1e87, suffix: "Uvg" },
        { value: 1e84, suffix: "Dvg" },
        { value: 1e81, suffix: "Tvg" },
        { value: 1e78, suffix: "Qavg" },
        { value: 1e75, suffix: "Qivg" },
        { value: 1e72, suffix: "Sxvg" },
        { value: 1e69, suffix: "Spvg" },
        { value: 1e66, suffix: "Ocvg" },
        { value: 1e63, suffix: "Nvg" },
        { value: 1e60, suffix: "Ud" },
        { value: 1e57, suffix: "Dd" },
        { value: 1e54, suffix: "Td" },
        { value: 1e51, suffix: "Qad" },
        { value: 1e48, suffix: "Qid" },
        { value: 1e45, suffix: "Sxd" },
        { value: 1e42, suffix: "Spd" },
        { value: 1e39, suffix: "Ocd" },
        { value: 1e36, suffix: "Nd" },
        { value: 1e33, suffix: "Dc" },
        { value: 1e30, suffix: "No" },
        { value: 1e27, suffix: "Oc" },
        { value: 1e24, suffix: "Sp" },
        { value: 1e21, suffix: "Sx" },
        { value: 1e18, suffix: "Qi" },
        { value: 1e15, suffix: "Q" },
        { value: 1e12, suffix: "T" },
        { value: 1e9, suffix: "B" },
        { value: 1e6, suffix: "M" },
        { value: 1e3, suffix: "K" }
    ];

    for (const { value, suffix } of suffixes) {
        if (amount >= value) {
            const formatted = (amount / value).toFixed(2);
            return `${formatted}${suffix}`;
        }
    }

    return Math.floor(amount).toString();
}

function getKeyName(keyRarity) {
    switch (keyRarity) {
        case "common": return "§fCommon Key";
        case "rare": return "§9Rare Key";
        case "epic": return "§5Epic Key";
        case "legend": return "§6Legend Key";
        case "event": return "§dEvent Key";
        case "madmax": return "§cMad Max Key";
        default: return "Key";
    }
}

function getBoosterName(boosterType, tier) {
    const typeColor = boosterType === "legendary" ? "§6" : boosterType === "epic" ? "§5" : "§9";
    const typeName = boosterType.charAt(0).toUpperCase() + boosterType.slice(1);
    return `${typeColor}${typeName} Booster Tier ${tier}`;
}

function tryShowLandmarksMenu(player) {
    if (pendingForms.has(player.id)) {
        return;
    }
    
    pendingForms.set(player.id, true);
    
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryShow = () => {
        attempts++;
        
        showLandmarksMenu(player).then(() => {
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

async function showLandmarksMenu(player) {
    const form = new ActionFormData();
    form.title("§l§6Landmarks");
    form.body("§fSelect a category to view your progress:");
    
    form.button("§e⏰ Time Played\n§8View time milestones", "textures/items/clock_item");
    form.button("§b⛏ Blocks Mined\n§8View mining milestones", "textures/items/netherite_pickaxe");
    form.button("§d★ Prestige\n§8View prestige milestones", "textures/items/nether_star");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    if (response.selection === 0) {
        await showTimeLandmarks(player);
    } else if (response.selection === 1) {
        await showBlocksLandmarks(player);
    } else if (response.selection === 2) {
        await showPrestigeLandmarks(player);
    }
}

async function showTimeLandmarks(player, page = 0) {
    const playerTime = getPlayTime(player);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(TIME_LANDMARKS.length / itemsPerPage);
    const startIndex = page * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, TIME_LANDMARKS.length);
    
    const form = new ActionFormData();
    form.title(`§l§e⏰ Time Played Landmarks §8(${page + 1}/${totalPages})`);
    
    let bodyText = `§fYour Time: §e${formatTime(playerTime)}\n\n`;
    
    for (let i = startIndex; i < endIndex; i++) {
        const landmark = TIME_LANDMARKS[i];
        const isClaimed = hasClaimedLandmark(player, "time", landmark.id);
        const canClaim = playerTime >= landmark.requirement && !isClaimed;
        
        let status = isClaimed ? "§a✓" : canClaim ? "§e!" : "§c✗";
        bodyText += `${status} §fLandmark ${landmark.id}: §e${formatTime(landmark.requirement)}\n`;
    }
    
    form.body(bodyText);
    
    for (let i = startIndex; i < endIndex; i++) {
        const landmark = TIME_LANDMARKS[i];
        const isClaimed = hasClaimedLandmark(player, "time", landmark.id);
        const canClaim = playerTime >= landmark.requirement && !isClaimed;
        
        let buttonText = `§f#${landmark.id} - ${formatTime(landmark.requirement)}\n`;
        if (isClaimed) {
            buttonText += "§a✓ Claimed";
        } else if (canClaim) {
            buttonText += "§e! Click to Claim";
        } else {
            buttonText += "§c✗ Locked";
        }
        
        form.button(buttonText, "textures/items/clock_item");
    }
    
    if (page > 0) {
        form.button("§e← Previous Page", "textures/ui/arrow_left");
    }
    if (page < totalPages - 1) {
        form.button("§eNext Page →", "textures/ui/arrow_right");
    }
    form.button("§cBack to Categories", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const selectedIndex = response.selection;
    const landmarkCount = endIndex - startIndex;
    
    if (selectedIndex < landmarkCount) {
        const landmark = TIME_LANDMARKS[startIndex + selectedIndex];
        await showLandmarkDetails(player, "time", landmark, playerTime);
    } else if (selectedIndex === landmarkCount && page > 0) {
        await showTimeLandmarks(player, page - 1);
    } else if (selectedIndex === landmarkCount + (page > 0 ? 1 : 0) && page < totalPages - 1) {
        await showTimeLandmarks(player, page + 1);
    } else {
        await showLandmarksMenu(player);
    }
}

async function showBlocksLandmarks(player, page = 0) {
    const playerBlocks = getBlocksMined(player);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(BLOCKS_LANDMARKS.length / itemsPerPage);
    const startIndex = page * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, BLOCKS_LANDMARKS.length);
    
    const form = new ActionFormData();
    form.title(`§l§b⛏ Blocks Mined Landmarks §8(${page + 1}/${totalPages})`);
    
    let bodyText = `§fYour Blocks: §b${formatBlocks(playerBlocks)}\n\n`;
    
    for (let i = startIndex; i < endIndex; i++) {
        const landmark = BLOCKS_LANDMARKS[i];
        const isClaimed = hasClaimedLandmark(player, "blocks", landmark.id);
        const canClaim = playerBlocks >= landmark.requirement && !isClaimed;
        
        let status = isClaimed ? "§a✓" : canClaim ? "§e!" : "§c✗";
        bodyText += `${status} §fLandmark ${landmark.id}: §b${formatBlocks(landmark.requirement)}\n`;
    }
    
    form.body(bodyText);
    
    for (let i = startIndex; i < endIndex; i++) {
        const landmark = BLOCKS_LANDMARKS[i];
        const isClaimed = hasClaimedLandmark(player, "blocks", landmark.id);
        const canClaim = playerBlocks >= landmark.requirement && !isClaimed;
        
        let buttonText = `§f#${landmark.id} - ${formatBlocks(landmark.requirement)}\n`;
        if (isClaimed) {
            buttonText += "§a✓ Claimed";
        } else if (canClaim) {
            buttonText += "§e! Click to Claim";
        } else {
            buttonText += "§c✗ Locked";
        }
        
        form.button(buttonText, "textures/items/netherite_pickaxe");
    }
    
    if (page > 0) {
        form.button("§e← Previous Page", "textures/ui/arrow_left");
    }
    if (page < totalPages - 1) {
        form.button("§eNext Page →", "textures/ui/arrow_right");
    }
    form.button("§cBack to Categories", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const selectedIndex = response.selection;
    const landmarkCount = endIndex - startIndex;
    
    if (selectedIndex < landmarkCount) {
        const landmark = BLOCKS_LANDMARKS[startIndex + selectedIndex];
        await showLandmarkDetails(player, "blocks", landmark, playerBlocks);
    } else if (selectedIndex === landmarkCount && page > 0) {
        await showBlocksLandmarks(player, page - 1);
    } else if (selectedIndex === landmarkCount + (page > 0 ? 1 : 0) && page < totalPages - 1) {
        await showBlocksLandmarks(player, page + 1);
    } else {
        await showLandmarksMenu(player);
    }
}

async function showPrestigeLandmarks(player, page = 0) {
    const playerPrestige = getPrestige(player);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(PRESTIGE_LANDMARKS.length / itemsPerPage);
    const startIndex = page * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, PRESTIGE_LANDMARKS.length);
    
    const form = new ActionFormData();
    form.title(`§l§d★ Prestige Landmarks §8(${page + 1}/${totalPages})`);
    
    let bodyText = `§fYour Prestige: §d${playerPrestige}\n\n`;
    
    for (let i = startIndex; i < endIndex; i++) {
        const landmark = PRESTIGE_LANDMARKS[i];
        const isClaimed = hasClaimedLandmark(player, "prestige", landmark.id);
        const canClaim = playerPrestige >= landmark.requirement && !isClaimed;
        
        let status = isClaimed ? "§a✓" : canClaim ? "§e!" : "§c✗";
        bodyText += `${status} §fLandmark ${landmark.id}: §dPrestige ${landmark.requirement}\n`;
    }
    
    form.body(bodyText);
    
    for (let i = startIndex; i < endIndex; i++) {
        const landmark = PRESTIGE_LANDMARKS[i];
        const isClaimed = hasClaimedLandmark(player, "prestige", landmark.id);
        const canClaim = playerPrestige >= landmark.requirement && !isClaimed;
        
        let buttonText = `§f#${landmark.id} - Prestige ${landmark.requirement}\n`;
        if (isClaimed) {
            buttonText += "§a✓ Claimed";
        } else if (canClaim) {
            buttonText += "§e! Click to Claim";
        } else {
            buttonText += "§c✗ Locked";
        }
        
        form.button(buttonText, "textures/items/nether_star");
    }
    
    if (page > 0) {
        form.button("§e← Previous Page", "textures/ui/arrow_left");
    }
    if (page < totalPages - 1) {
        form.button("§eNext Page →", "textures/ui/arrow_right");
    }
    form.button("§cBack to Categories", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const selectedIndex = response.selection;
    const landmarkCount = endIndex - startIndex;
    
    if (selectedIndex < landmarkCount) {
        const landmark = PRESTIGE_LANDMARKS[startIndex + selectedIndex];
        await showLandmarkDetails(player, "prestige", landmark, playerPrestige);
    } else if (selectedIndex === landmarkCount && page > 0) {
        await showPrestigeLandmarks(player, page - 1);
    } else if (selectedIndex === landmarkCount + (page > 0 ? 1 : 0) && page < totalPages - 1) {
        await showPrestigeLandmarks(player, page + 1);
    } else {
        await showLandmarksMenu(player);
    }
}

async function showLandmarkDetails(player, category, landmark, currentProgress) {
    const isClaimed = hasClaimedLandmark(player, category, landmark.id);
    const canClaim = currentProgress >= landmark.requirement && !isClaimed;
    
    const form = new ActionFormData();
    form.title(`§l§6Landmark #${landmark.id}`);
    
    let requirementText = "";
    if (category === "time") {
        requirementText = `§fRequired: §e${formatTime(landmark.requirement)}\n§fYour Progress: §e${formatTime(currentProgress)}`;
    } else if (category === "blocks") {
        requirementText = `§fRequired: §b${formatBlocks(landmark.requirement)}\n§fYour Progress: §b${formatBlocks(currentProgress)}`;
    } else if (category === "prestige") {
        requirementText = `§fRequired: §dPrestige ${landmark.requirement}\n§fYour Progress: §dPrestige ${currentProgress}`;
    }
    
    let rewardsText = "\n\n§l§6Rewards:\n";
    rewardsText += `§f  • Money: §a$${formatMoney(landmark.rewards.money)}\n`;
    rewardsText += `§f  • Tokens: §e${formatTokens(landmark.rewards.tokens)}\n`;
    
    if (landmark.rewards.booster) {
        const boosterName = getBoosterName(landmark.rewards.booster.type, landmark.rewards.booster.tier);
        rewardsText += `§f  • ${boosterName}\n`;
    }
    
    if (landmark.rewards.key) {
        const keyName = getKeyName(landmark.rewards.key);
        const keyAmount = landmark.rewards.keyAmount || 1;
        rewardsText += `§f  • ${keyName} §fx${keyAmount}\n`;
    }
    
    let statusText = "\n\n";
    if (isClaimed) {
        statusText += "§a§l✓ CLAIMED";
    } else if (canClaim) {
        statusText += "§e§l! READY TO CLAIM";
    } else {
        statusText += "§c§l✗ LOCKED";
    }
    
    form.body(requirementText + rewardsText + statusText);
    
    if (canClaim) {
        form.button("§a✓ Claim Rewards", "textures/items/gold_ingot");
    }
    form.button("§cBack", "textures/ui/cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    if (response.selection === 0 && canClaim) {
        claimLandmarkRewards(player, category, landmark);
    }
    
    if (category === "time") {
        await showTimeLandmarks(player);
    } else if (category === "blocks") {
        await showBlocksLandmarks(player);
    } else if (category === "prestige") {
        await showPrestigeLandmarks(player);
    }
}

function claimLandmarkRewards(player, category, landmark) {
    claimLandmark(player, category, landmark.id);
    
    addMoney(player, landmark.rewards.money);
    addTokens(player, landmark.rewards.tokens);
    
    let rewardMsg = `§6|--------------------------------|\n`;
    rewardMsg += `§6| §l§aLandmark Claimed!\n`;
    rewardMsg += `§6|\n`;
    rewardMsg += `§6| §fLandmark #${landmark.id}\n`;
    rewardMsg += `§6| §a+$${formatMoney(landmark.rewards.money)}\n`;
    rewardMsg += `§6| §e+${formatTokens(landmark.rewards.tokens)} tokens\n`;
    
    if (landmark.rewards.booster) {
        const boosterType = landmark.rewards.booster.type;
        const boosterTier = landmark.rewards.booster.tier;
        const duration = 3600 * boosterTier; 
        
        player.addTag(`booster_${boosterType}_${Date.now()}_${duration}`);
        const boosterName = getBoosterName(boosterType, boosterTier);
        rewardMsg += `§6| ${boosterName}\n`;
    }
    
    if (landmark.rewards.key) {
        const keyAmount = landmark.rewards.keyAmount || 1;
        const keyId = `planetoid:${landmark.rewards.key}_key`;
        player.runCommand(`give @s ${keyId} ${keyAmount}`);
        const keyName = getKeyName(landmark.rewards.key);
        rewardMsg += `§6| ${keyName} §fx${keyAmount}\n`;
    }
    
    rewardMsg += `§6|--------------------------------|`;
    
    player.sendMessage(rewardMsg);
    player.runCommand(`playsound random.levelup @s`);
}

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const msg = event.message.toLowerCase();

    if (msg === "!landmarks") {
        event.cancel = true;
        system.runTimeout(() => {
            tryShowLandmarksMenu(player);
        }, 1);
    }
});