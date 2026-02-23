import { world, system } from "@minecraft/server";
import { getActivePet, getPetCustomName } from "./pets.js";
import { RARITY_COLORS } from "./pet-eggs.js";

// Mapa para almacenar entidades visuales de cada jugador
const playerPetVisuals = new Map();

// Obtener head según tipo de pet
function getPetHead(petType) {
    const headMap = {
        zombie: "minecraft:zombie_head",
        creeper: "minecraft:creeper_head",
        skeleton: "minecraft:skeleton_skull",
        dragon: "minecraft:dragon_head",
        wither: "minecraft:wither_skeleton_skull",
        piglin: "minecraft:piglin_head",
        steve: "minecraft:player_head"
    };
    
    return headMap[petType] || "minecraft:zombie_head";
}

// Calcular posición objetivo (atrás a la izquierda, altura del jugador)
function getTargetPosition(player) {
    const playerLocation = player.location;
    const viewDirection = player.getViewDirection();
    
    // Calcular dirección perpendicular (izquierda)
    const leftX = viewDirection.z;
    const leftZ = -viewDirection.x;
    
    // Calcular atrás
    const backX = -viewDirection.x * 1.5;
    const backZ = -viewDirection.z * 1.5;
    
    return {
        x: playerLocation.x + backX + leftX * 1.5,
        y: playerLocation.y,
        z: playerLocation.z + backZ + leftZ * 1.5
    };
}

// Calcular ángulo de rotación hacia un punto
function getYawTowards(from, to) {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    let yaw = Math.atan2(dz, dx) * (180 / Math.PI) - 90;
    if (yaw < 0) yaw += 360;
    return yaw;
}

// Calcular diferencia angular más corta
function angleDifference(from, to) {
    let diff = to - from;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
}

// Easing function: in_out_quad
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// 🎨 Easing function: in_out_elastic (rebote suave)
function easeInOutElastic(t) {
    const c5 = (2 * Math.PI) / 4.5;
    
    if (t === 0) return 0;
    if (t === 1) return 1;
    
    if (t < 0.5) {
        return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
    } else {
        return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
    }
}

// Interpolación suave con easing aplicado (para movimiento)
function lerpEased(start, end, rawFactor) {
    const easedFactor = easeInOutQuad(rawFactor);
    return start + (end - start) * easedFactor;
}

// Calcular distancia 3D
function getDistance3D(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Verificar si el armor stand de una pet existe
function petArmorStandExists(playerId, dimension) {
    try {
        const stands = dimension.getEntities({
            type: "minecraft:armor_stand",
            tags: [`pet_${playerId}`]
        });
        return stands.length > 0;
    } catch (e) {
        return false;
    }
}

// 🔥 SISTEMA DE PARTÍCULAS PROGRESIVO EN ESFERA
// SOLO A PARTIR DE NIVEL 10
// Nivel 10 = 3 partículas
// +2 por cada 10 niveles
// Nivel 100 = 21 partículas
// Radio esférico de 0.75 bloques alrededor de la cabeza
function spawnPetParticles(player, armorStand, level) {
    try {
        // NO MOSTRAR PARTÍCULAS SI EL NIVEL ES MENOR A 10
        if (level < 10) return;
        
        // USAR LA POSICIÓN REAL DEL ARMOR STAND
        const baseLocation = armorStand.location;
        const headY = baseLocation.y + 1.8; // Altura de la cabeza
        
        // Calcular cantidad de partículas: 3 base + 2 por cada 10 niveles
        const particleCount = 3 + Math.floor(level / 10) * 2;
        
        // Radio esférico de 0.75 bloques
        const radius = 0.75;
        
        // Tipos de partículas disponibles en Bedrock
        const particleTypes = [
            "minecraft:basic_flame_particle",      // Llama naranja
            "minecraft:blue_flame_particle",       // Llama azul
            "minecraft:colored_flame_particle"     // Llama de colores
        ];
        
        // Spawnear partículas en esfera de 0.75 bloques alrededor de la cabeza
        for (let i = 0; i < particleCount; i++) {
            // Distribución esférica uniforme usando coordenadas esféricas
            // Ángulo horizontal (0 a 2π)
            const theta = Math.random() * Math.PI * 2;
            
            // Ángulo vertical (-π/2 a π/2 para esfera completa)
            const phi = Math.acos(2 * Math.random() - 1) - Math.PI / 2;
            
            // Radio con pequeña variación (0.6 a 0.9 bloques)
            const radiusOffset = radius * (0.8 + Math.random() * 0.4);
            
            // Convertir coordenadas esféricas a cartesianas
            const offsetX = radiusOffset * Math.cos(phi) * Math.cos(theta);
            const offsetY = radiusOffset * Math.sin(phi);
            const offsetZ = radiusOffset * Math.cos(phi) * Math.sin(theta);
            
            const particleLocation = {
                x: baseLocation.x + offsetX,
                y: headY + offsetY,
                z: baseLocation.z + offsetZ
            };
            
            // Seleccionar tipo de partícula basado en nivel
            let particleType;
            if (level < 30) {
                // Niveles bajos: solo llamas naranjas
                particleType = particleTypes[0];
            } else if (level < 60) {
                // Niveles medios: mix de naranja y azul
                particleType = particleTypes[Math.floor(Math.random() * 2)];
            } else {
                // Niveles altos: todas las partículas (incluyendo colored flame)
                particleType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            }
            
            player.dimension.spawnParticle(particleType, particleLocation);
        }
        
    } catch (e) {
        // Ignorar errores de partículas
    }
}

// Crear visuales de la pet (armor stand + floating texts)
function createPetVisuals(player, petData) {
    try {
        removePetVisuals(player.id);
        
        const targetPos = getTargetPosition(player);
        
        // Crear armor stand
        const armorStand = player.dimension.spawnEntity("minecraft:armor_stand", targetPos);
        armorStand.nameTag = "";
        
        // Tags de identificación
        armorStand.addTag("pet_visual");
        armorStand.addTag(`pet_${player.id}`);
        armorStand.addTag("pet_protected");
        
        // Hacer invisible, dar fire resistance y equipar cabeza
        system.runTimeout(() => {
            try {
                player.dimension.runCommand(`effect @e[type=armor_stand,tag=pet_${player.id}] invisibility 999999 0 true`);
                player.dimension.runCommand(`effect @e[type=armor_stand,tag=pet_${player.id}] fire_resistance 999999 255 true`);
                
                const headId = getPetHead(petData.type);
                player.dimension.runCommand(`replaceitem entity @e[type=armor_stand,tag=pet_${player.id}] slot.armor.head 0 ${headId}`);
            } catch (e) {}
        }, 2);
        
        // Crear floating text 1 (nombre + nivel) - Color de rareza
        const customName = getPetCustomName(player, petData);
        const displayName = customName || petData.type.charAt(0).toUpperCase() + petData.type.slice(1);
        const rarityColor = RARITY_COLORS[petData.rarity];
        
        const floatingText1 = player.dimension.spawnEntity("add:floating_text", {
            x: targetPos.x,
            y: targetPos.y + 2.3,
            z: targetPos.z
        });
        floatingText1.nameTag = `${rarityColor}${displayName} (Lvl ${petData.level})`;
        floatingText1.addTag("pet_visual");
        floatingText1.addTag(`pet_${player.id}`);
        
        // Crear floating text 2 (tipo de pet)
        const floatingText2 = player.dimension.spawnEntity("add:floating_text", {
            x: targetPos.x,
            y: targetPos.y + 2.0,
            z: targetPos.z
        });
        floatingText2.nameTag = `§8${petData.type.charAt(0).toUpperCase() + petData.type.slice(1)} Pet`;
        floatingText2.addTag("pet_visual");
        floatingText2.addTag(`pet_${player.id}`);
        
        const initialYaw = getYawTowards(targetPos, player.location);
        
        playerPetVisuals.set(player.id, {
            armorStand: armorStand,
            floatingText1: floatingText1,
            floatingText2: floatingText2,
            targetPos: { x: targetPos.x, y: targetPos.y, z: targetPos.z },
            lastPlayerPos: { x: player.location.x, y: player.location.y, z: player.location.z },
            currentYaw: initialYaw,
            idleTimer: 0,
            isRotating: false,
            rotationProgress: 0,
            rotationStartYaw: 0,
            rotationEndYaw: 0,
            isFollowing: false,
            floatTimer: 0,
            petData: petData,
            petId: `${petData.type}_${petData.id}`,
            petType: petData.type,
            particleTimer: 0  // Timer para partículas suaves
        });
        
    } catch (e) {
        console.warn("Error creating pet visuals: " + e);
    }
}

// Remover visuales de la pet
function removePetVisuals(playerId) {
    const visuals = playerPetVisuals.get(playerId);
    
    if (visuals) {
        try {
            if (visuals.armorStand) {
                visuals.armorStand.remove();
            }
        } catch (e) {}
        
        try {
            if (visuals.floatingText1) {
                visuals.floatingText1.remove();
            }
        } catch (e) {}
        
        try {
            if (visuals.floatingText2) {
                visuals.floatingText2.remove();
            }
        } catch (e) {}
    }
    
    try {
        for (const dimension of [world.getDimension("overworld"), world.getDimension("nether"), world.getDimension("the_end")]) {
            try {
                const entities = dimension.getEntities({
                    tags: [`pet_${playerId}`]
                });
                
                for (const entity of entities) {
                    try {
                        entity.remove();
                    } catch (e) {}
                }
            } catch (e) {}
        }
    } catch (e) {}
    
    playerPetVisuals.delete(playerId);
}

// Actualizar visuales de la pet
function updatePetVisuals(player, petData) {
    const visuals = playerPetVisuals.get(player.id);
    if (!visuals) return;
    
    try {
        const customName = getPetCustomName(player, petData);
        const displayName = customName || petData.type.charAt(0).toUpperCase() + petData.type.slice(1);
        const rarityColor = RARITY_COLORS[petData.rarity];
        
        if (visuals.floatingText1) {
            try {
                visuals.floatingText1.nameTag = `${rarityColor}${displayName} (Lvl ${petData.level})`;
            } catch (e) {}
        }
        
        visuals.petData = petData;
    } catch (e) {}
}

// Sistema de actualización (cada tick)
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try {
            const activePet = getActivePet(player);
            const visuals = playerPetVisuals.get(player.id);
            
            if (activePet && !visuals) {
                createPetVisuals(player, activePet);
                continue;
            }
            
            if (!activePet && visuals) {
                removePetVisuals(player.id);
                continue;
            }
            
            if (activePet && visuals) {
                const currentPetId = `${activePet.type}_${activePet.id}`;
                if (currentPetId !== visuals.petId) {
                    removePetVisuals(player.id);
                    createPetVisuals(player, activePet);
                    continue;
                }
            }
            
            if (activePet && visuals) {
                try {
                    // VERIFICAR SI EL ARMOR STAND FUE DESTRUIDO - RECREARLO
                    if (!petArmorStandExists(player.id, player.dimension)) {
                        console.warn(`Pet armor stand destroyed for player ${player.id}, recreating...`);
                        removePetVisuals(player.id);
                        createPetVisuals(player, activePet);
                        continue;
                    }
                    
                    if (!visuals.armorStand || !visuals.floatingText1 || !visuals.floatingText2) {
                        removePetVisuals(player.id);
                        continue;
                    }
                    
                    visuals.floatTimer += 3;
                    if (visuals.floatTimer >= 360) {
                        visuals.floatTimer = 0;
                    }
                    
                    const floatProgress = visuals.floatTimer / 360;
                    // 🎨 USAR ELASTIC EASING PARA ANIMACIÓN DE IDLE (rebote suave)
                    const floatOffset = Math.sin(floatProgress * Math.PI * 2) * 0.15 * easeInOutElastic(Math.abs(Math.sin(floatProgress * Math.PI)));
                    
                    const idealTargetPos = getTargetPosition(player);
                    const distanceToIdeal = getDistance3D(visuals.targetPos, idealTargetPos);
                    
                    const playerMoved = 
                        Math.abs(player.location.x - visuals.lastPlayerPos.x) > 0.01 ||
                        Math.abs(player.location.y - visuals.lastPlayerPos.y) > 0.01 ||
                        Math.abs(player.location.z - visuals.lastPlayerPos.z) > 0.01;
                    
                    if (distanceToIdeal > 5.0) {
                        visuals.isFollowing = true;
                    }
                    
                    if (visuals.isFollowing) {
                        visuals.isRotating = false;
                        visuals.idleTimer = 0;
                        
                        const lerpFactor = 0.25;
                        
                        visuals.targetPos = {
                            x: lerpEased(visuals.targetPos.x, idealTargetPos.x, lerpFactor),
                            y: lerpEased(visuals.targetPos.y, idealTargetPos.y, lerpFactor),
                            z: lerpEased(visuals.targetPos.z, idealTargetPos.z, lerpFactor)
                        };
                        
                        const targetYaw = getYawTowards(visuals.targetPos, player.location);
                        const yawDiff = angleDifference(visuals.currentYaw, targetYaw);
                        
                        visuals.currentYaw = visuals.currentYaw + (yawDiff * lerpFactor);
                        
                        if (visuals.currentYaw < 0) visuals.currentYaw += 360;
                        if (visuals.currentYaw >= 360) visuals.currentYaw -= 360;
                        
                        const finalY = visuals.targetPos.y + floatOffset;
                        
                        try {
                            player.dimension.runCommand(`tp @e[type=armor_stand,tag=pet_${player.id}] ${visuals.targetPos.x.toFixed(2)} ${finalY.toFixed(2)} ${visuals.targetPos.z.toFixed(2)} ${visuals.currentYaw.toFixed(1)} 0`);
                        } catch (e) {}
                        
                        try {
                            visuals.floatingText1.teleport({
                                x: visuals.targetPos.x,
                                y: finalY + 2.3,
                                z: visuals.targetPos.z
                            }, { dimension: player.dimension });
                        } catch (e) {}
                        
                        try {
                            visuals.floatingText2.teleport({
                                x: visuals.targetPos.x,
                                y: finalY + 2.0,
                                z: visuals.targetPos.z
                            }, { dimension: player.dimension });
                        } catch (e) {}
                        
                        visuals.lastPlayerPos = { x: player.location.x, y: player.location.y, z: player.location.z };
                        
                        if (distanceToIdeal < 0.5) {
                            visuals.isFollowing = false;
                        }
                    } else {
                        if (playerMoved) {
                            visuals.lastPlayerPos = { x: player.location.x, y: player.location.y, z: player.location.z };
                        }
                        
                        const finalY = visuals.targetPos.y + floatOffset;
                        
                        if (!visuals.isRotating) {
                            visuals.idleTimer++;
                            
                            try {
                                player.dimension.runCommand(`tp @e[type=armor_stand,tag=pet_${player.id}] ${visuals.targetPos.x.toFixed(2)} ${finalY.toFixed(2)} ${visuals.targetPos.z.toFixed(2)} ${visuals.currentYaw.toFixed(1)} 0`);
                            } catch (e) {}
                            
                            try {
                                visuals.floatingText1.teleport({
                                    x: visuals.targetPos.x,
                                    y: finalY + 2.3,
                                    z: visuals.targetPos.z
                                }, { dimension: player.dimension });
                            } catch (e) {}
                            
                            try {
                                visuals.floatingText2.teleport({
                                    x: visuals.targetPos.x,
                                    y: finalY + 2.0,
                                    z: visuals.targetPos.z
                                }, { dimension: player.dimension });
                            } catch (e) {}
                            
                            if (visuals.idleTimer >= 80) {
                                visuals.isRotating = true;
                                visuals.rotationProgress = 0;
                                visuals.rotationStartYaw = visuals.currentYaw;
                                visuals.rotationEndYaw = visuals.currentYaw + 360;
                                visuals.idleTimer = 0;
                            }
                        } else {
                            // 🐌 ROTACIÓN MÁS LENTA: 0.01 en lugar de 0.02 (50% más lenta)
                            visuals.rotationProgress += 0.01;
                            
                            if (visuals.rotationProgress >= 1.0) {
                                visuals.isRotating = false;
                                visuals.rotationProgress = 0;
                                visuals.currentYaw = visuals.rotationEndYaw % 360;
                                visuals.idleTimer = 0;
                            } else {
                                // 🎨 USAR ELASTIC EASING PARA ROTACIÓN (rebote suave)
                                const easedProgress = easeInOutElastic(visuals.rotationProgress);
                                const currentRotation = visuals.rotationStartYaw + ((visuals.rotationEndYaw - visuals.rotationStartYaw) * easedProgress);
                                visuals.currentYaw = currentRotation;
                                
                                try {
                                    player.dimension.runCommand(`tp @e[type=armor_stand,tag=pet_${player.id}] ${visuals.targetPos.x.toFixed(2)} ${finalY.toFixed(2)} ${visuals.targetPos.z.toFixed(2)} ${currentRotation.toFixed(1)} 0`);
                                } catch (e) {}
                                
                                try {
                                    visuals.floatingText1.teleport({
                                        x: visuals.targetPos.x,
                                        y: finalY + 2.3,
                                        z: visuals.targetPos.z
                                    }, { dimension: player.dimension });
                                } catch (e) {}
                                
                                try {
                                    visuals.floatingText2.teleport({
                                        x: visuals.targetPos.x,
                                        y: finalY + 2.0,
                                        z: visuals.targetPos.z
                                    }, { dimension: player.dimension });
                                } catch (e) {}
                            }
                        }
                    }
                    
                    try {
                        if (activePet.level !== visuals.petData.level || 
                            activePet.xp !== visuals.petData.xp) {
                            updatePetVisuals(player, activePet);
                        }
                    } catch (e) {}
                    
                    // 🔥 SISTEMA DE PARTÍCULAS SMOOTH EN ESFERA (cada 3 ticks)
                    visuals.particleTimer++;
                    if (visuals.particleTimer >= 3) {
                        visuals.particleTimer = 0;
                        spawnPetParticles(player, visuals.armorStand, activePet.level);
                    }
                    
                } catch (e) {
                    removePetVisuals(player.id);
                }
            }
        } catch (e) {}
    }
}, 1);

// Re-aplicar fire resistance cada 1 segundo (backup)
system.runInterval(() => {
    for (const [playerId, visuals] of playerPetVisuals.entries()) {
        try {
            if (visuals.armorStand && visuals.petType) {
                const player = world.getAllPlayers().find(p => p.id === playerId);
                if (player) {
                    const headId = getPetHead(visuals.petType);
                    
                    // Re-equipar cabeza
                    player.dimension.runCommand(`replaceitem entity @e[type=armor_stand,tag=pet_${playerId}] slot.armor.head 0 ${headId}`);
                    
                    // Re-aplicar fire resistance
                    player.dimension.runCommand(`effect @e[type=armor_stand,tag=pet_${playerId}] fire_resistance 999999 255 true`);
                }
            }
        } catch (e) {}
    }
}, 20);

// Bloquear interacción con armor stands de pets
world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    const entity = event.target;
    
    if (entity.typeId === "minecraft:armor_stand" && entity.hasTag("pet_protected")) {
        event.cancel = true;
    }
});

// Limpiar visuales cuando un jugador se desconecta
world.afterEvents.playerLeave.subscribe((event) => {
    const player = event.player;
    removePetVisuals(player.id);
});

// Limpiar visuales al entrar
world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    
    if (!event.initialSpawn) return;
    
    system.runTimeout(() => {
        removePetVisuals(player.id);
    }, 20);
});

// Limpiar visuales huérfanas (cada 10 segundos)
system.runInterval(() => {
    const onlinePlayerIds = new Set();
    for (const player of world.getAllPlayers()) {
        onlinePlayerIds.add(player.id);
    }
    
    for (const dimension of [world.getDimension("overworld"), world.getDimension("nether"), world.getDimension("the_end")]) {
        try {
            const allPetVisuals = dimension.getEntities({
                tags: ["pet_visual"]
            });
            
            for (const visual of allPetVisuals) {
                try {
                    const tags = visual.getTags();
                    let hasOwner = false;
                    
                    for (const tag of tags) {
                        if (tag.startsWith("pet_")) {
                            const playerId = tag.replace("pet_", "");
                            if (playerId !== "visual" && playerId !== "protected" && onlinePlayerIds.has(playerId)) {
                                hasOwner = true;
                                break;
                            }
                        }
                    }
                    
                    if (!hasOwner) {
                        visual.remove();
                    }
                } catch (e) {}
            }
        } catch (e) {}
    }
}, 200);

export { createPetVisuals, removePetVisuals, updatePetVisuals };