import { world, system, ItemStack } from "@minecraft/server";
import { applyPickaxeXPBoost } from "./booster-integration.js";
import { getActivePet } from "./pets.js";

const XP = "xp";
const XPPM = "xpPm";
const LVL = "lvl";
const LVLP = "lvlp";

function ensurePickaxeObjectives() {
    const objectives = world.scoreboard.getObjectives().map(o => o.id);
    if (!objectives.includes(XP)) world.scoreboard.addObjective(XP, "XP");
    if (!objectives.includes(XPPM)) world.scoreboard.addObjective(XPPM, "XP per Mine");
    if (!objectives.includes(LVL)) world.scoreboard.addObjective(LVL, "Level");
    if (!objectives.includes(LVLP)) world.scoreboard.addObjective(LVLP, "Level Progress");
}
system.run(ensurePickaxeObjectives);

function getRequiredXP(level) {
    const baseXP = 100;
    return Math.floor(baseXP * Math.pow(1.2, level));
}

function setPickaxePercentage(player, percentage) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("pickaxePercent:")) {
            player.removeTag(tag);
        }
    }
    player.addTag(`pickaxePercent:${percentage.toFixed(2)}`);
}

function getPickaxePercentage(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("pickaxePercent:")) {
            const percentStr = tag.replace("pickaxePercent:", "");
            const amount = parseFloat(percentStr);
            if (!isNaN(amount)) {
                return amount;
            }
        }
    }
    return 0;
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const identity = player.scoreboardIdentity;
        if (!identity) continue;

        const xpObj = world.scoreboard.getObjective(XP);
        const lvlObj = world.scoreboard.getObjective(LVL);
        const lvlpObj = world.scoreboard.getObjective(LVLP);

        let currentXP = 0;
        let currentLevel = 0;

        if (xpObj) {
            try { currentXP = xpObj.getScore(identity) || 0; } catch {}
        }

        if (lvlObj) {
            try { currentLevel = lvlObj.getScore(identity) || 0; } catch {}
        }

        const requiredXP = getRequiredXP(currentLevel);

        if (currentXP >= requiredXP) {
            currentLevel++;
            if (lvlObj) {
                lvlObj.setScore(identity, currentLevel);
            }

            currentXP -= requiredXP;
            if (xpObj) {
                xpObj.setScore(identity, currentXP);
            }

            player.runCommand(`playsound random.levelup @s`);
            player.sendMessage(`§l§aLevel Up! §r§7Your pickaxe is now level §e${currentLevel}§7!`);
        }

        const nextLevelRequiredXP = getRequiredXP(currentLevel);
        const percentage = (currentXP / nextLevelRequiredXP) * 100;

        setPickaxePercentage(player, percentage);

        if (lvlpObj) {
            lvlpObj.setScore(identity, Math.floor(percentage));
        }
    }
}, 20);

world.beforeEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  const inventory = player.getComponent("minecraft:inventory")?.container;
  
  if (!inventory) return;
  
  const slot0 = inventory.getItem(0);
  
  if (slot0?.typeId === "minecraft:netherite_pickaxe") {
    system.run(() => {
      const newPickaxe = new ItemStack("minecraft:netherite_pickaxe", 1);
      inventory.setItem(0, newPickaxe);
    });
  }
});

world.afterEvents.playerBreakBlock.subscribe(event => {
    const player = event.player;
    const identity = player.scoreboardIdentity;
    if (!identity) return;

    const xpObj = world.scoreboard.getObjective(XP);
    
    const xppicObj = world.scoreboard.getObjective("xppic");
    let xppicLevel = 0;
    if (xppicObj) {
        try { xppicLevel = xppicObj.getScore(player) || 0; } catch {}
    }
    
    const xpMultiplier = xppicLevel === 0 ? 1 : xppicLevel;
    const baseXP = 1 * xpMultiplier;
    
    const boostedXP = applyPickaxeXPBoost(player, baseXP);
    
    if (xpObj) {
        xpObj.addScore(identity, boostedXP);
    }
});

function getPickaxeTime(player) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("pickaxeTime:")) {
      const timeStr = tag.replace("pickaxeTime:", "");
      const amount = parseInt(timeStr);
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  return 0;
}

function setPickaxeTime(player, seconds) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("pickaxeTime:")) {
      player.removeTag(tag);
    }
  }
  player.addTag(`pickaxeTime:${seconds}`);
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) continue;
    
    const slot0 = inventory.getItem(0);
    
    if (slot0?.typeId === "minecraft:netherite_pickaxe") {
      const currentTime = getPickaxeTime(player);
      setPickaxeTime(player, currentTime + 1);
    }
  }
}, 20);

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

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const tags = player.getTags();
    let hasPickaxeTime = false;
    
    for (const tag of tags) {
      if (tag.startsWith("pickaxeTime:")) {
        hasPickaxeTime = true;
        break;
      }
    }
    
    if (!hasPickaxeTime) {
      player.addTag("pickaxeTime:0");
    }
  }
}, 20);

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) return;
    
    const slot0 = inventory.getItem(0);
    
    if (slot0?.typeId === "minecraft:netherite_pickaxe") {
      const totalSeconds = getPickaxeTime(player);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      let timeString = "";
      if (hours > 0) {
        timeString += `§r${hours.toString().padStart(2, '0')}hs `;
      }
      if (minutes > 0 || hours > 0) {
        timeString += `§r${minutes.toString().padStart(2, '0')}m `;
      }
      timeString += `§r${seconds.toString().padStart(2, '0')}s`;
      
      const blocksObj = world.scoreboard.getObjective("blocks");
      let blocksScore = 0;
      if (blocksObj) {
        try { blocksScore = blocksObj.getScore(player) || 0; } catch { blocksScore = 0; }
      }

      const effObj = world.scoreboard.getObjective("efficiency");
      let effScore = 0;
      if (effObj) {
        try { effScore = effObj.getScore(player) || 0; } catch { effScore = 0; }
      }

      const fortObj = world.scoreboard.getObjective("fort");
      let fortScore = 0;
      if (fortObj) {
        try { fortScore = fortObj.getScore(player) || 0; } catch { fortScore = 0; }
      }

      const tokObj = world.scoreboard.getObjective("tok");
      let tokScore = 0;
      if (tokObj) {
        try { tokScore = tokObj.getScore(player) || 0; } catch { tokScore = 0; }
      }

      const baseTokenChance = (tokScore / 50) * 5;

      const keyObj = world.scoreboard.getObjective("key");
      let keyScore = 0;
      if (keyObj) {
        try { keyScore = keyObj.getScore(player) || 0; } catch { keyScore = 0; }
      }

      const baseKeyChance = (keyScore / 50) * 0.75;

      const xppicObj = world.scoreboard.getObjective("xppic");
      let xppicScore = 0;
      if (xppicObj) {
        try { xppicScore = xppicObj.getScore(player) || 0; } catch { xppicScore = 0; }
      }

      const lvlObj = world.scoreboard.getObjective(LVL);
      let lvlScore = 0;
      if (lvlObj) {
        try { lvlScore = lvlObj.getScore(player) || 0; } catch { lvlScore = 0; }
      }

      const lvlpScore = getPickaxePercentage(player);

      const newPickaxe = new ItemStack("minecraft:netherite_pickaxe", 1);
      newPickaxe.nameTag = `§r§l§4${player.name}'s §r§cPickaxe`;
      
      const formattedBlocks = formatBlocks(blocksScore);
      
      // 🔥 OBTENER BOOSTERS ACTIVOS
      function getActiveBooster(player, type) {
        const tags = player.getTags();
        for (const tag of tags) {
          if (tag.startsWith(`booster_${type}_`)) {
            const parts = tag.split("_");
            if (parts.length >= 4) {
              const multiplier = parseFloat(parts[2]);
              const endTime = parseInt(parts[3]);
              const currentTime = system.currentTick;
              
              if (currentTime < endTime) {
                const remainingTicks = endTime - currentTime;
                const remainingSeconds = Math.floor(remainingTicks / 20);
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const secs = remainingSeconds % 60;
                
                let timeStr = "";
                if (hours > 0) timeStr += `${hours}h`;
                if (minutes > 0) timeStr += `${minutes}m`;
                if (secs > 0 || timeStr === "") timeStr += `${secs}s`;
                
                const percentBoost = Math.round((multiplier - 1) * 100);
                return `§8(§6+${percentBoost}% §8| §7${timeStr}§8)`;
              }
            }
          }
        }
        return "";
      }
      
      const tokenBooster = getActiveBooster(player, "tokenFinder");
      const upgradeBooster = getActiveBooster(player, "upgrades");
      const moneyBooster = getActiveBooster(player, "moneyEarning");
      
      const lines = [
        `§r§l§cUpgrades`,
        `§r§l§c| §r§7Efficiency: §r${effScore}§8/20`,
        `§r§l§c| §r§7Fortune: §r${fortScore}§8/10`,
        `§r§l§c| §r§7Token Finder: §r${tokScore}§8/50 §8(§7${baseTokenChance.toFixed(1)}%§8) ${tokenBooster}`,
        `§r§l§c| §r§7Key Finder: §r${keyScore}§8/50 §8(§7${baseKeyChance.toFixed(2)}%§8) ${upgradeBooster}`,
        `§r§l§c| §r§7XP Lurker: §r${xppicScore}§8/25 §8(§7x${xppicScore === 0 ? 1 : xppicScore}§8)`,
        `§r`,
        `§r§l§cStats`,
        `§r§l§c| §r§7Blocks Mined: §r${formattedBlocks}`,
        `§r§l§c| §r§7Time Used: ${timeString}`,
        `§r§l§c| §r§7Level: §r${lvlScore} §8(${lvlpScore.toFixed(2)}%)`
      ];
      
      // Obtener multiplicador de pet activa
      const activePet = getActivePet(player);
      if (activePet) {
        let petBoostText = `§r§l§c| §r§7Pet Boost: `;
        
        // Boost predefinido
        const predefinedBoost = activePet.level;
        const boosterType = activePet.predefinedBooster;
        
        // Boost predeterminado
        const tokenBoost = activePet.tokenLevel * 5;
        const upgradeBoost = activePet.upgradeLevel * 5;
        const sellBoost = activePet.sellLevel * 5;
        
        // Construir texto según tipo
        let boosts = [];
        if (boosterType === "token") {
          boosts.push(`§eToken +${predefinedBoost}%`);
        } else if (boosterType === "upgrade") {
          boosts.push(`§dUpgrade +${predefinedBoost}%`);
        } else if (boosterType === "sell") {
          boosts.push(`§aSell +${predefinedBoost}%`);
        }
        
        if (tokenBoost > 0) boosts.push(`§eToken +${tokenBoost}%`);
        if (upgradeBoost > 0) boosts.push(`§dUpgrade +${upgradeBoost}%`);
        if (sellBoost > 0) boosts.push(`§aSell +${sellBoost}%`);
        
        petBoostText += boosts.join(" §8| ");
        lines.push(petBoostText);
      }
      
      // 🔥 MOSTRAR BOOSTER DE MONEY (SELL) AL FINAL SI EXISTE
      if (moneyBooster) {
        lines.push(`§r§l§c| §r§7Money Booster: ${moneyBooster}`);
      }
      
      newPickaxe.setLore(lines);
      inventory.setItem(0, newPickaxe);
    }
  }
}, 10);