import { world, system } from "@minecraft/server";
import { getBackpackValue, setBackpackValue, getBackpackMaxValue, setBackpackMaxValue, formatBackpack } from "./sidebar.js";
import { getMoneyEarningMultiplier } from "./booster-integration.js";

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const backpackValue = getBackpackValue(player);
        const bpmValue = getBackpackMaxValue(player);

        const moneyBoosterMultiplier = getMoneyEarningMultiplier(player);
        const hasMoneyBooster = moneyBoosterMultiplier > 1;
        const boostPercent = Math.round((moneyBoosterMultiplier - 1) * 100);

        const tags = player.getTags();
        const hasAutoSell = tags.includes("Auto-Sell");

        const formattedBackpack = formatBackpack(backpackValue);
        const formattedBPM = formatBackpack(bpmValue);

        // Calcular porcentaje de llenado
        const fillPercentage = bpmValue > 0 ? (backpackValue / bpmValue) * 100 : 0;
        const formattedPercentage = fillPercentage.toFixed(2);

        // Determinar color según el porcentaje
        let percentColor = "§a"; // Verde por defecto
        if (fillPercentage >= 100) {
            percentColor = "§c"; // Rojo si está lleno o más
        } else if (fillPercentage >= 75) {
            percentColor = "§6"; // Naranja si está más del 75%
        } else if (fillPercentage >= 50) {
            percentColor = "§e"; // Amarillo si está más del 50%
        }

        if (backpackValue >= bpmValue) {
            if (!hasAutoSell) {
                setBackpackValue(player, bpmValue);
            }
            
            if (hasMoneyBooster) {
                player.onScreenDisplay.setActionBar(`§l§cBackpack Full §7(+${boostPercent}%§7) §l§8(${percentColor}100.00%§r§8)§r`);
            } else {
                player.onScreenDisplay.setActionBar(`§l§cBackpack Full §l§8(${percentColor}100.00%§r§8)§r`);
            }
        } else {
            if (hasMoneyBooster) {
                player.onScreenDisplay.setActionBar(`§l§6Backpack: §r${formattedBackpack}§7/${formattedBPM} §8(+${boostPercent}%§8) §l§8(${percentColor}${formattedPercentage}%§r§8)§r`);
            } else {
                player.onScreenDisplay.setActionBar(`§l§6Backpack: §r${formattedBackpack}§7/${formattedBPM} §l§8(${percentColor}${formattedPercentage}%§r§8)§r`);
            }
        }
    }
}, 20);

// Inicializar backpack para nuevos jugadores
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const tags = player.getTags();
    let hasBackpack = false;
    let hasBackpackMax = false;
    
    for (const tag of tags) {
      if (tag.startsWith("currBackpack:")) {
        hasBackpack = true;
      }
      if (tag.startsWith("currBackpackMax:")) {
        hasBackpackMax = true;
      }
    }
    
    if (!hasBackpack) {
      player.addTag("currBackpack:0");
    }
    if (!hasBackpackMax) {
      player.addTag("currBackpackMax:100");
    }
  }
}, 20);

export { };