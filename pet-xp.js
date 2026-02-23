import { world, system, ItemStack } from "@minecraft/server";
import { getActivePet, parsePetData, updatePetData } from "./pets.js";
import { RARITY_COLORS } from "./pet-eggs.js";

// Calcular XP requerida para el siguiente nivel
function getRequiredXP(level) {
    const baseXP = 50;
    const exponent = 1.15;
    return Math.floor(baseXP * Math.pow(exponent, level));
}

// Obtener multiplicador de Pet XP Booster activo
function getPetXPMultiplier(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("booster_petXP_")) {
            const parts = tag.split("_");
            if (parts.length >= 4) {
                const multiplier = parseFloat(parts[2]);
                const endTime = parseInt(parts[3]);
                const currentTime = system.currentTick;
                
                if (currentTime < endTime) {
                    return multiplier;
                } else {
                    system.run(() => {
                        player.removeTag(tag);
                    });
                }
            }
        }
    }
    return 1.0;
}

// Aplicar boost de Pet XP
function applyPetXPBoost(player, baseXP) {
    const multiplier = getPetXPMultiplier(player);
    return Math.floor(baseXP * multiplier);
}

// Dar XP a la pet activa
function addPetXP(player, amount) {
    const activePet = getActivePet(player);
    if (!activePet) return;

    // Aplicar boost de Pet XP Booster
    const boostedXP = applyPetXPBoost(player, amount);

    // Actualizar XP
    activePet.xp += boostedXP;

    // Verificar level up
    let leveled = false;
    while (activePet.level < 100) {
        const requiredXP = getRequiredXP(activePet.level);
        
        if (activePet.xp >= requiredXP) {
            activePet.level++;
            activePet.xp -= requiredXP;
            leveled = true;
        } else {
            break;
        }
    }

    // Actualizar datos de la pet
    updatePetData(player, activePet.tag, activePet);

    // Mensaje de level up
    if (leveled) {
        const rarityColor = RARITY_COLORS[activePet.rarity];
        const petTypeName = activePet.type.charAt(0).toUpperCase() + activePet.type.slice(1);
        
        player.sendMessage(`§l§aPet Level Up! §r${rarityColor}${petTypeName} §r§8is now level §e${activePet.level}§r!`);
        player.runCommand("playsound random.levelup @s");
    }
}

// Obtener porcentaje de progreso al siguiente nivel
function getPetXPProgress(petData) {
    if (petData.level >= 100) return 100;
    
    const requiredXP = getRequiredXP(petData.level);
    const progress = (petData.xp / requiredXP) * 100;
    return Math.min(progress, 100);
}

// Event: Ganar XP al minar bloques
world.afterEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    
    // Solo dar XP si tiene una pet activa
    const activePet = getActivePet(player);
    if (!activePet) return;

    // 1 bloque = 1 XP base
    addPetXP(player, 1);
});

// Limpiar boosters expirados
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const tags = player.getTags();
        for (const tag of tags) {
            if (tag.startsWith("booster_petXP_")) {
                const parts = tag.split("_");
                if (parts.length >= 4) {
                    const endTime = parseInt(parts[3]);
                    const currentTime = system.currentTick;
                    
                    if (currentTime >= endTime) {
                        system.run(() => {
                            player.removeTag(tag);
                        });
                        player.sendMessage("§8§lBooster §7>> §rYour §bPet XP Booster §rhas expired!");
                        system.run(() => {
                            player.runCommand("playsound random.pop @s");
                        });
                    }
                }
            }
        }
    }
}, 20);

export { 
    getRequiredXP, 
    getPetXPMultiplier, 
    applyPetXPBoost, 
    addPetXP, 
    getPetXPProgress 
};