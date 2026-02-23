import { world, ChatSendBeforeEvent, system } from "@minecraft/server";
import { formatMoney, formatPrestige, formatTokens, getBalance, getPrestige, getTokens } from "./sidebar.js";

const leaderboardEntities = new Map();

const allPlayersData = new Map();

function getChatName(player) {
    try {
        const tags = player.getTags();
        for (const tag of tags) {
            if (tag.startsWith("chatName:")) {
                return tag.replace("chatName:", "");
            }
        }
        return player.name;
    } catch {
        return player.name;
    }
}

system.runTimeout(() => {
    reloadLeaderboards();
}, 40);

function reloadLeaderboards() {
    const dimension = world.getDimension("overworld");
    
    try {
        const processedMarkers = dimension.getEntities({
            type: "add:floating_text",
            tags: ["leaderboard_processed"]
        });
        
        for (const marker of processedMarkers) {
            const pos = marker.location;
            const entityKey = `${Math.floor(pos.x)}_${Math.floor(pos.y)}_${Math.floor(pos.z)}`;
            
            const nearbyEntities = dimension.getEntities({
                type: "add:floating_text",
                location: pos,
                maxDistance: 3,
                tags: ["leaderboard_line"]
            });
            
            if (nearbyEntities.length === 8) {
                nearbyEntities.sort((a, b) => b.location.y - a.location.y);
                leaderboardEntities.set(entityKey, nearbyEntities);
            }
        }
    } catch (e) {}
}

function updateRankingTags() {
    const players = world.getAllPlayers();
    
    const prestigeData = players.map(p => ({
        name: p.name,
        player: p,
        value: getPrestige(p)
    })).sort((a, b) => b.value - a.value);
    
    const balanceData = players.map(p => ({
        name: p.name,
        player: p,
        value: getBalance(p)
    })).sort((a, b) => b.value - a.value);
    
    const tokensData = players.map(p => ({
        name: p.name,
        player: p,
        value: getTokens(p)
    })).sort((a, b) => b.value - a.value);
    
    const hoursObj = world.scoreboard.getObjective("hours");
    const minObj = world.scoreboard.getObjective("min");
    const timeData = players.map(p => {
        let hours = 0;
        let minutes = 0;
        
        if (hoursObj) {
            try { hours = hoursObj.getScore(p) || 0; } catch { hours = 0; }
        }
        if (minObj) {
            try { minutes = minObj.getScore(p) || 0; } catch { minutes = 0; }
        }
        
        return {
            name: p.name,
            player: p,
            value: (hours * 60) + minutes
        };
    }).sort((a, b) => b.value - a.value);
    
    const blocksObj = world.scoreboard.getObjective("blocks");
    const blocksData = players.map(p => {
        let blocks = 0;
        
        if (blocksObj) {
            try { blocks = blocksObj.getScore(p) || 0; } catch { blocks = 0; }
        }
        
        return {
            name: p.name,
            player: p,
            value: blocks
        };
    }).sort((a, b) => b.value - a.value);
    
    for (const player of players) {
        const tags = player.getTags();
        for (const tag of tags) {
            if (tag.startsWith("Rank:§5") && tag.length === 9 && tag.match(/\d$/)) {
                player.removeTag(tag);
            }
            if (tag.startsWith("Rank:§6") && tag.length === 9 && tag.match(/\d$/)) {
                player.removeTag(tag);
            }
            if (tag.startsWith("Rank:§e") && tag.length === 9 && tag.match(/\d$/)) {
                player.removeTag(tag);
            }
            if (tag.startsWith("Rank:§b") && tag.length === 9 && tag.match(/\d$/)) {
                player.removeTag(tag);
            }
            if (tag.startsWith("Rank:§a") && tag.length === 9 && tag.match(/\d$/)) {
                player.removeTag(tag);
            }
        }
    }
    
    if (prestigeData.length > 0 && prestigeData[0].value > 0) {
        prestigeData[0].player.addTag(`Rank:§51`);
    }
    
    if (balanceData.length > 0 && balanceData[0].value > 0) {
        balanceData[0].player.addTag(`Rank:§61`);
    }
    
    if (tokensData.length > 0 && tokensData[0].value > 0) {
        tokensData[0].player.addTag(`Rank:§e1`);
    }
    
    if (timeData.length > 0 && timeData[0].value > 0) {
        timeData[0].player.addTag(`Rank:§b1`);
    }
    
    if (blocksData.length > 0 && blocksData[0].value > 0) {
        blocksData[0].player.addTag(`Rank:§a1`);
    }
}

system.runInterval(() => {
    updateRankingTags();
}, 200);

system.runInterval(() => {
    const onlinePlayers = world.getAllPlayers();
    for (const player of onlinePlayers) {
        const displayName = getChatName(player);
        
        allPlayersData.set(player.name, {
            name: player.name,
            displayName: displayName,
            balance: getBalance(player),
            tokens: getTokens(player),
            prestige: getPrestige(player)
        });
    }
}, 20);

world.beforeEvents.chatSend.subscribe((event) => {
    const message = event.message;
    const player = event.sender;

    if (message.startsWith("!reset-")) {
        event.cancel = true;
        
        const type = message.replace("!reset-", "").toLowerCase();
        
        if (type === "balance" || type === "prestige" || type === "time" || type === "blocks" || type === "tokens") {
            resetLeaderboard(type);
            player.sendMessage(`§l§cLeaderboards §7>> §rResetting §f${type}§r leaderboard...`);
        } else {
            player.sendMessage(`§l§cLeaderboards §7>> §rInvalid type! Use: §f!reset-balance§r, §f!reset-prestige§r, §f!reset-time§r, §f!reset-blocks§r, or §f!reset-tokens`);
        }
    }
});

function resetLeaderboard(type) {
    for (const [key, entities] of leaderboardEntities.entries()) {
        const dimension = world.getDimension("overworld");
        const [x, y, z] = key.split('_').map(Number);
        
        let blockType = null;
        for (let i = 1; i <= 3; i++) {
            try {
                const testBlock = dimension.getBlock({ x: x, y: y - i, z: z });
                if (testBlock && testBlock.typeId) {
                    const testType = testBlock.typeId;
                    if (testType.includes("shulker_box")) {
                        blockType = testType;
                        break;
                    }
                }
            } catch (e) {
                continue;
            }
        }
        
        let shouldReset = false;
        if (type === "balance" && blockType === "minecraft:yellow_shulker_box") shouldReset = true;
        if (type === "prestige" && blockType === "minecraft:purple_shulker_box") shouldReset = true;
        if (type === "time" && blockType === "minecraft:light_blue_shulker_box") shouldReset = true;
        if (type === "blocks" && blockType === "minecraft:lime_shulker_box") shouldReset = true;
        if (type === "tokens" && blockType === "minecraft:orange_shulker_box") shouldReset = true;
        
        if (shouldReset) {
            for (const entity of entities) {
                try {
                    entity.remove();
                } catch (e) {}
            }
            
            leaderboardEntities.delete(key);
            
            const allEntities = dimension.getEntities({ type: "add:floating_text" });
            for (const entity of allEntities) {
                try {
                    const pos = entity.location;
                    const entityKey = `${Math.floor(pos.x)}_${Math.floor(pos.y)}_${Math.floor(pos.z)}`;
                    
                    if (entityKey === key) {
                        entity.removeTag("leaderboard_processed");
                        entity.nameTag = "§eMarker";
                    }
                } catch (e) {}
            }
        }
    }
}

function updateLeaderboards() {
    const dimension = world.getDimension("overworld");
    
    try {
        const allEntities = dimension.getEntities({ type: "add:floating_text" });
        
        const markers = allEntities.filter(e => {
            const tags = e.getTags();
            return !tags.includes("leaderboard_line") && !tags.includes("leaderboard_processed");
        });
        
        for (const entity of markers) {
            try {
                const pos = entity.location;
                const entityKey = `${Math.floor(pos.x)}_${Math.floor(pos.y)}_${Math.floor(pos.z)}`;
                
                if (leaderboardEntities.has(entityKey)) {
                    try {
                        entity.addTag("leaderboard_processed");
                    } catch (e) {}
                    continue;
                }
                
                let blockType = null;
                
                for (let i = 1; i <= 3; i++) {
                    try {
                        const blockPos = { 
                            x: Math.floor(pos.x), 
                            y: Math.floor(pos.y) - i, 
                            z: Math.floor(pos.z) 
                        };
                        const testBlock = dimension.getBlock(blockPos);
                        
                        if (testBlock && testBlock.typeId) {
                            const testType = testBlock.typeId;
                            
                            if (testType.includes("shulker_box")) {
                                blockType = testType;
                                break;
                            }
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (!blockType) {
                    continue;
                }
                
                try {
                    entity.addTag("leaderboard_processed");
                    entity.nameTag = "";
                } catch (e) {}
                
                if (blockType === "minecraft:yellow_shulker_box") {
                    updateBalanceLeaderboard(entityKey, pos, dimension);
                } else if (blockType === "minecraft:purple_shulker_box") {
                    updatePrestigeLeaderboard(entityKey, pos, dimension);
                } else if (blockType === "minecraft:light_blue_shulker_box") {
                    updateTimeLeaderboard(entityKey, pos, dimension);
                } else if (blockType === "minecraft:lime_shulker_box") {
                    updateBlocksLeaderboard(entityKey, pos, dimension);
                } else if (blockType === "minecraft:orange_shulker_box") {
                    updateTokensLeaderboard(entityKey, pos, dimension);
                }
            } catch (e) {
                continue;
            }
        }
        
        for (const [key, entities] of leaderboardEntities.entries()) {
            const [x, y, z] = key.split('_').map(Number);
            
            let blockType = null;
            for (let i = 1; i <= 3; i++) {
                try {
                    const testBlock = dimension.getBlock({ x: x, y: y - i, z: z });
                    if (testBlock && testBlock.typeId) {
                        const testType = testBlock.typeId;
                        if (testType.includes("shulker_box")) {
                            blockType = testType;
                            break;
                        }
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!blockType) continue;
            
            if (blockType === "minecraft:yellow_shulker_box") {
                updateBalanceLeaderboardData(entities);
            } else if (blockType === "minecraft:purple_shulker_box") {
                updatePrestigeLeaderboardData(entities);
            } else if (blockType === "minecraft:light_blue_shulker_box") {
                updateTimeLeaderboardData(entities);
            } else if (blockType === "minecraft:lime_shulker_box") {
                updateBlocksLeaderboardData(entities);
            } else if (blockType === "minecraft:orange_shulker_box") {
                updateTokensLeaderboardData(entities);
            }
        }
    } catch (e) {}
}

function createLeaderboardEntities(entityKey, centerPos, dimension, lines) {
    const totalLines = lines.length;
    const startY = centerPos.y + (totalLines * 0.3) / 2;
    
    const newEntities = [];
    
    for (let i = 0; i < lines.length; i++) {
        const yOffset = startY - (i * 0.3);
        const spawnPos = {
            x: centerPos.x,
            y: yOffset,
            z: centerPos.z
        };
        
        try {
            const newEntity = dimension.spawnEntity("add:floating_text", spawnPos);
            newEntity.nameTag = lines[i];
            
            try {
                newEntity.addTag("leaderboard_line");
            } catch (e) {}
            
            newEntities.push(newEntity);
        } catch (e) {}
    }
    
    leaderboardEntities.set(entityKey, newEntities);
}

function getAllPlayersBalanceData() {
    const onlinePlayers = world.getAllPlayers();
    const allData = new Map();
    
    for (const [name, data] of allPlayersData.entries()) {
        allData.set(name, data);
    }
    
    for (const player of onlinePlayers) {
        const displayName = getChatName(player);
        
        allData.set(player.name, {
            name: player.name,
            displayName: displayName,
            balance: getBalance(player),
            tokens: getTokens(player),
            prestige: getPrestige(player)
        });
    }
    
    return Array.from(allData.values());
}

function updateBalanceLeaderboard(entityKey, centerPos, dimension) {
    const allPlayers = getAllPlayersBalanceData();
    const balanceData = allPlayers
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);
    
    const lines = [
        `§r§l§6BALANCE LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < balanceData.length) {
            const entry = balanceData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§6${formatMoney(entry.balance)} $`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80 $`);
        }
    }
    
    createLeaderboardEntities(entityKey, centerPos, dimension, lines);
}

function updateBalanceLeaderboardData(entities) {
    const allPlayers = getAllPlayersBalanceData();
    const balanceData = allPlayers
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);
    
    const lines = [
        `§r§l§6BALANCE LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < balanceData.length) {
            const entry = balanceData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§6${formatMoney(entry.balance)} $`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80 $`);
        }
    }
    
    for (let i = 0; i < entities.length && i < lines.length; i++) {
        try {
            entities[i].nameTag = lines[i];
        } catch (e) {}
    }
}

function updatePrestigeLeaderboard(entityKey, centerPos, dimension) {
    const allPlayers = getAllPlayersBalanceData();
    const prestigeData = allPlayers
        .sort((a, b) => b.prestige - a.prestige)
        .slice(0, 5);
    
    const lines = [
        `§r§l§5PRESTIGE LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < prestigeData.length) {
            const entry = prestigeData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§5${formatPrestige(entry.prestige)} ✦`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80 ✦`);
        }
    }
    
    createLeaderboardEntities(entityKey, centerPos, dimension, lines);
}

function updatePrestigeLeaderboardData(entities) {
    const allPlayers = getAllPlayersBalanceData();
    const prestigeData = allPlayers
        .sort((a, b) => b.prestige - a.prestige)
        .slice(0, 5);
    
    const lines = [
        `§r§l§5PRESTIGE LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < prestigeData.length) {
            const entry = prestigeData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§5${formatPrestige(entry.prestige)} ✦`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80 ✦`);
        }
    }
    
    for (let i = 0; i < entities.length && i < lines.length; i++) {
        try {
            entities[i].nameTag = lines[i];
        } catch (e) {}
    }
}

function updateTimeLeaderboard(entityKey, centerPos, dimension) {
    const players = world.getAllPlayers();
    const hoursObj = world.scoreboard.getObjective("hours");
    const minObj = world.scoreboard.getObjective("min");
    
    const timeData = players.map(p => {
        let hours = 0;
        let minutes = 0;
        
        if (hoursObj) {
            try { hours = hoursObj.getScore(p) || 0; } catch { hours = 0; }
        }
        if (minObj) {
            try { minutes = minObj.getScore(p) || 0; } catch { minutes = 0; }
        }
        
        const totalMinutes = (hours * 60) + minutes;
        const displayName = getChatName(p);
        
        return {
            displayName: displayName,
            value: totalMinutes,
            hours: hours,
            minutes: minutes
        };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
    
    const lines = [
        `§r§l§bTIME PLAYED LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < timeData.length) {
            const entry = timeData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§b${entry.hours}h ${entry.minutes}m`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80h 0m`);
        }
    }
    
    createLeaderboardEntities(entityKey, centerPos, dimension, lines);
}

function updateTimeLeaderboardData(entities) {
    const players = world.getAllPlayers();
    const hoursObj = world.scoreboard.getObjective("hours");
    const minObj = world.scoreboard.getObjective("min");
    
    const timeData = players.map(p => {
        let hours = 0;
        let minutes = 0;
        
        if (hoursObj) {
            try { hours = hoursObj.getScore(p) || 0; } catch { hours = 0; }
        }
        if (minObj) {
            try { minutes = minObj.getScore(p) || 0; } catch { minutes = 0; }
        }
        
        const totalMinutes = (hours * 60) + minutes;
        const displayName = getChatName(p);
        
        return {
            displayName: displayName,
            value: totalMinutes,
            hours: hours,
            minutes: minutes
        };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
    
    const lines = [
        `§r§l§bTIME PLAYED LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < timeData.length) {
            const entry = timeData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§b${entry.hours}h ${entry.minutes}m`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80h 0m`);
        }
    }
    
    for (let i = 0; i < entities.length && i < lines.length; i++) {
        try {
            entities[i].nameTag = lines[i];
        } catch (e) {}
    }
}

function updateBlocksLeaderboard(entityKey, centerPos, dimension) {
    const players = world.getAllPlayers();
    const blocksObj = world.scoreboard.getObjective("blocks");
    
    const blocksData = players.map(p => {
        let blocks = 0;
        
        if (blocksObj) {
            try { blocks = blocksObj.getScore(p) || 0; } catch { blocks = 0; }
        }
        
        const displayName = getChatName(p);
        
        return {
            displayName: displayName,
            value: blocks
        };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
    
    const lines = [
        `§r§l§aBLOCKS MINED LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < blocksData.length) {
            const entry = blocksData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§a${formatMoney(entry.value)} ⛏`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80 ⛏`);
        }
    }
    
    createLeaderboardEntities(entityKey, centerPos, dimension, lines);
}

function updateBlocksLeaderboardData(entities) {
    const players = world.getAllPlayers();
    const blocksObj = world.scoreboard.getObjective("blocks");
    
    const blocksData = players.map(p => {
        let blocks = 0;
        
        if (blocksObj) {
            try { blocks = blocksObj.getScore(p) || 0; } catch { blocks = 0; }
        }
        
        const displayName = getChatName(p);
        
        return {
            displayName: displayName,
            value: blocks
        };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
    
    const lines = [
        `§r§l§aBLOCKS MINED LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < blocksData.length) {
            const entry = blocksData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§a${formatMoney(entry.value)} ⛏`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80 ⛏`);
        }
    }
    
    for (let i = 0; i < entities.length && i < lines.length; i++) {
        try {
            entities[i].nameTag = lines[i];
        } catch (e) {}
    }
}

function updateTokensLeaderboard(entityKey, centerPos, dimension) {
    const allPlayers = getAllPlayersBalanceData();
    const tokensData = allPlayers
        .sort((a, b) => b.tokens - a.tokens)
        .slice(0, 5);
    
    const lines = [
        `§r§l§eTOKENS LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < tokensData.length) {
            const entry = tokensData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§e${formatTokens(entry.tokens)} ⭐`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80 ⭐`);
        }
    }
    
    createLeaderboardEntities(entityKey, centerPos, dimension, lines);
}

function updateTokensLeaderboardData(entities) {
    const allPlayers = getAllPlayersBalanceData();
    const tokensData = allPlayers
        .sort((a, b) => b.tokens - a.tokens)
        .slice(0, 5);
    
    const lines = [
        `§r§l§eTOKENS LEADERBOARD`,
        `§r§7THIS TOP IS UPDATED EVERY DAY`,
        `§r`
    ];
    
    const circles = ['§a§l⓵', '§a§l⓶', '§a§l⓷', '§e§l⓸', '§e§l⓹'];
    
    for (let i = 0; i < 5; i++) {
        if (i < tokensData.length) {
            const entry = tokensData[i];
            lines.push(`§r${circles[i]} §r§f${entry.displayName} §r§7- §r§e${formatTokens(entry.tokens)} ⭐`);
        } else {
            lines.push(`§r§8§l${['⓵', '⓶', '⓷', '⓸', '⓹'][i]} §r§8--- §r§7- §r§80 ⭐`);
        }
    }
    
    for (let i = 0; i < entities.length && i < lines.length; i++) {
        try {
            entities[i].nameTag = lines[i];
        } catch (e) {}
    }
}

system.runInterval(() => {
    updateLeaderboards();
}, 100);

export { updateLeaderboards };