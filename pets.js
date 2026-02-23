import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { RARITY_COLORS, getPlayerPetCount } from "./pet-eggs.js";
import { getPetShardCount, removePetShards } from "./pet-shards.js";
import { formatTokens } from "./sidebar.js";

const pendingForms = new Map();

// Máximo nivel de boosters predeterminados
const MAX_PREDEFINED_BOOSTER_LEVEL = 10;

// Porcentaje por nivel de booster predeterminado
const BOOST_PER_LEVEL = 5; // 5% por nivel, máximo 50% (10 niveles)

// Parsear datos de una pet desde el tag
function parsePetData(tag) {
    // Formato: pet_owned_<tipo>_<id>:<rareza>:<nivel>:<xp>:<boosterPred>:<tokenLvl>:<upgradeLvl>:<sellLvl>
    if (!tag.startsWith("pet_owned_")) return null;

    const parts = tag.split(":");
    if (parts.length < 8) return null;

    const namePart = parts[0].replace("pet_owned_", "");
    const typeAndId = namePart.split("_");
    
    if (typeAndId.length < 2) return null;

    const id = typeAndId.pop();
    const type = typeAndId.join("_");

    return {
        tag: tag,
        type: type,
        id: parseInt(id),
        rarity: parts[1],
        level: parseInt(parts[2]),
        xp: parseInt(parts[3]),
        predefinedBooster: parts[4],
        tokenLevel: parseInt(parts[5]),
        upgradeLevel: parseInt(parts[6]),
        sellLevel: parseInt(parts[7])
    };
}

// Obtener todas las pets de un jugador
function getPlayerPets(player) {
    const tags = player.getTags();
    const pets = [];

    for (const tag of tags) {
        if (tag.startsWith("pet_owned_")) {
            const petData = parsePetData(tag);
            if (petData) {
                pets.push(petData);
            }
        }
    }

    return pets;
}

// Obtener pet activa
function getActivePet(player) {
    const tags = player.getTags();
    
    for (const tag of tags) {
        if (tag.startsWith("pet_active_")) {
            const petId = tag.replace("pet_active_", "");
            const pets = getPlayerPets(player);
            return pets.find(p => `${p.type}_${p.id}` === petId);
        }
    }

    return null;
}

// Activar una pet
function activatePet(player, petData) {
    // Desactivar pet anterior si existe
    deactivatePet(player);

    // Activar nueva pet
    system.run(() => {
        player.addTag(`pet_active_${petData.type}_${petData.id}`);
    });

    player.sendMessage(`§a§lPet §7>> §rActivated ${RARITY_COLORS[petData.rarity]}${petData.type.charAt(0).toUpperCase() + petData.type.slice(1)} Pet §r§8(Level ${petData.level})§r!`);
    player.runCommand("playsound random.orb @s");
}

// Desactivar pet activa
function deactivatePet(player) {
    const tags = player.getTags();
    
    for (const tag of tags) {
        if (tag.startsWith("pet_active_")) {
            system.run(() => {
                player.removeTag(tag);
            });
        }
    }
}

// Obtener nombre custom de una pet
function getPetCustomName(player, petData) {
    const tags = player.getTags();
    const nameTag = `pet_name_${petData.type}_${petData.id}:`;
    
    for (const tag of tags) {
        if (tag.startsWith(nameTag)) {
            return tag.replace(nameTag, "");
        }
    }

    return null;
}

// Establecer nombre custom de una pet
function setPetCustomName(player, petData, name) {
    // Remover nombre anterior
    const tags = player.getTags();
    const nameTag = `pet_name_${petData.type}_${petData.id}:`;
    
    for (const tag of tags) {
        if (tag.startsWith(nameTag)) {
            system.run(() => {
                player.removeTag(tag);
            });
        }
    }

    // Establecer nuevo nombre si no está vacío
    if (name && name.trim() !== "") {
        system.run(() => {
            player.addTag(`${nameTag}${name.trim()}`);
        });
    }
}

// Actualizar datos de una pet (SINCRÓNICO)
function updatePetData(player, oldTag, newData) {
    player.removeTag(oldTag);
    const newTag = `pet_owned_${newData.type}_${newData.id}:${newData.rarity}:${newData.level}:${newData.xp}:${newData.predefinedBooster}:${newData.tokenLevel}:${newData.upgradeLevel}:${newData.sellLevel}`;
    player.addTag(newTag);
}

// Calcular precio de venta de una pet
function calculateSellPrice(petData) {
    const basePrice = {
        common: 1500,
        uncommon: 7500,
        rare: 25000,
        epic: 80000,
        legendary: 250000,
        mythic: 800000,
        unreal: 3000000
    };

    const base = basePrice[petData.rarity] || 1000;
    const levelMultiplier = 1 + (petData.level / 50);
    const shardsSpent = petData.tokenLevel + petData.upgradeLevel + petData.sellLevel;
    const shardsMultiplier = 1 + (shardsSpent / 20);

    return Math.floor(base * levelMultiplier * shardsMultiplier);
}

// Vender una pet
function sellPet(player, petData) {
    const price = calculateSellPrice(petData);

    // Desactivar si está activa
    const activePet = getActivePet(player);
    if (activePet && activePet.id === petData.id && activePet.type === petData.type) {
        deactivatePet(player);
    }

    // Remover pet
    system.run(() => {
        player.removeTag(petData.tag);
        
        // Remover nombre custom si existe
        const tags = player.getTags();
        const nameTag = `pet_name_${petData.type}_${petData.id}:`;
        for (const tag of tags) {
            if (tag.startsWith(nameTag)) {
                player.removeTag(tag);
            }
        }
    });

    // Dar tokens
    player.runCommand(`tag @s add getTokens:${price}`);

    const rarityColor = RARITY_COLORS[petData.rarity];
    const petTypeName = petData.type.charAt(0).toUpperCase() + petData.type.slice(1);
    
    player.sendMessage(`§6|--------------------------------|`);
    player.sendMessage(`§6| §l§ePet Sold!`);
    player.sendMessage(`§6|`);
    player.sendMessage(`§6| §fPet: ${rarityColor}${petTypeName} §r§8(Level ${petData.level})§r`);
    player.sendMessage(`§6| §fPrice: §e${formatTokens(price)} tokens`);
    player.sendMessage(`§6|--------------------------------|`);
    
    player.runCommand("playsound random.orb @s");
}

// Mejorar booster predeterminado (FIX COMPLETO - SINCRÓNICO)
function upgradeBooster(player, petData, boosterType) {
    const currentLevel = boosterType === "token" ? petData.tokenLevel :
                        boosterType === "upgrade" ? petData.upgradeLevel :
                        petData.sellLevel;

    if (currentLevel >= MAX_PREDEFINED_BOOSTER_LEVEL) {
        player.sendMessage(`§c§lPet Upgrade §7>> §cThis booster is already at max level (${MAX_PREDEFINED_BOOSTER_LEVEL})!`);
        player.runCommand("playsound note.bass @s");
        return false;
    }

    const nextLevel = currentLevel + 1;
    const cost = nextLevel;

    const playerShards = getPetShardCount(player);
    if (playerShards < cost) {
        player.sendMessage(`§c§lPet Upgrade §7>> §cYou need §b${cost} Pet Shards §cbut only have §b${playerShards}§c!`);
        player.runCommand("playsound note.bass @s");
        return false;
    }

    // Remover shards
    if (!removePetShards(player, cost)) {
        player.sendMessage(`§c§lPet Upgrade §7>> §cError removing Pet Shards!`);
        return false;
    }

    // Crear nuevo objeto con datos actualizados
    const newPetData = {
        tag: petData.tag,
        type: petData.type,
        id: petData.id,
        rarity: petData.rarity,
        level: petData.level,
        xp: petData.xp,
        predefinedBooster: petData.predefinedBooster,
        tokenLevel: petData.tokenLevel,
        upgradeLevel: petData.upgradeLevel,
        sellLevel: petData.sellLevel
    };

    // Actualizar el nivel correspondiente
    if (boosterType === "token") {
        newPetData.tokenLevel = nextLevel;
    } else if (boosterType === "upgrade") {
        newPetData.upgradeLevel = nextLevel;
    } else {
        newPetData.sellLevel = nextLevel;
    }

    // Actualizar SINCRÓNICAMENTE (sin system.run)
    updatePetData(player, petData.tag, newPetData);

    const boostAmount = nextLevel * BOOST_PER_LEVEL;
    player.sendMessage(`§a§lPet Upgrade §7>> §r${boosterType.charAt(0).toUpperCase() + boosterType.slice(1)} Booster upgraded to level §e${nextLevel} §r§8(+${boostAmount}%)§r!`);
    player.runCommand("playsound random.levelup @s");
    
    return true;
}

// Mostrar menú principal de pets
async function showPetsMenu(player) {
    const form = new ActionFormData();
    form.title("§l§6Pet Management");
    
    const activePet = getActivePet(player);
    const petCount = getPlayerPetCount(player);
    const shardCount = getPetShardCount(player);

    let bodyText = `§fYour Pets: §e${petCount}§7/§e50\n`;
    bodyText += `§fPet Shards: §b${shardCount}\n`;
    if (activePet) {
        const customName = getPetCustomName(player, activePet);
        const displayName = customName || `${activePet.type.charAt(0).toUpperCase() + activePet.type.slice(1)}`;
        bodyText += `§fActive Pet: ${RARITY_COLORS[activePet.rarity]}${displayName} §r§8(Lvl ${activePet.level})§r\n`;
    } else {
        bodyText += `§fActive Pet: §cNone\n`;
    }

    form.body(bodyText);
    
    form.button("§aView All Pets\n§8Manage your collection", "textures/items/name_tag");
    
    if (activePet) {
        form.button("§eActive Pet Info\n§8Quick access", "textures/items/nether_star");
        form.button("§cDeactivate Pet\n§8Remove active pet", "textures/ui/cancel");
    }
    
    form.button("§cClose", "textures/ui/realms_red_x");

    const response = await form.show(player);
    
    if (response.canceled) return;

    if (response.selection === 0) {
        await showAllPets(player, 0);
    } else if (activePet && response.selection === 1) {
        await showPetDetails(player, activePet);
    } else if (activePet && response.selection === 2) {
        deactivatePet(player);
        player.sendMessage("§c§lPet §7>> §rDeactivated your pet!");
        player.runCommand("playsound random.pop @s");
    }
}

// Mostrar todas las pets (paginado)
async function showAllPets(player, page = 0) {
    const pets = getPlayerPets(player);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(pets.length / itemsPerPage);
    const startIndex = page * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, pets.length);

    if (pets.length === 0) {
        player.sendMessage("§c§lPet §7>> §cYou don't have any pets yet! Open a Pet Egg to get one.");
        return;
    }

    const form = new ActionFormData();
    form.title(`§l§6Your Pets §8(${page + 1}/${totalPages})`);
    form.body(`§fTotal Pets: §e${pets.length}§7/§e50\n§7Click on a pet to manage it.`);

    for (let i = startIndex; i < endIndex; i++) {
        const pet = pets[i];
        const customName = getPetCustomName(player, pet);
        const displayName = customName || pet.type.charAt(0).toUpperCase() + pet.type.slice(1);
        const rarityColor = RARITY_COLORS[pet.rarity];
        
        const activePet = getActivePet(player);
        const isActive = activePet && activePet.id === pet.id && activePet.type === pet.type;
        const activeIcon = isActive ? "§a✓ " : "";

        form.button(`${activeIcon}${rarityColor}${displayName}\n§8Level ${pet.level} | ${pet.rarity}`, "textures/items/name_tag");
    }

    if (page > 0) {
        form.button("§e← Previous Page", "textures/ui/arrow_left");
    }
    if (page < totalPages - 1) {
        form.button("§eNext Page →", "textures/ui/arrow_right");
    }
    form.button("§cBack", "textures/ui/cancel");

    const response = await form.show(player);
    
    if (response.canceled) return;

    const petsInPage = endIndex - startIndex;
    
    if (response.selection < petsInPage) {
        const selectedPet = pets[startIndex + response.selection];
        await showPetDetails(player, selectedPet);
    } else if (response.selection === petsInPage && page > 0) {
        await showAllPets(player, page - 1);
    } else if (response.selection === petsInPage + (page > 0 ? 1 : 0) && page < totalPages - 1) {
        await showAllPets(player, page + 1);
    } else {
        await showPetsMenu(player);
    }
}

// Mostrar detalles de una pet
async function showPetDetails(player, petData) {
    const customName = getPetCustomName(player, petData);
    const displayName = customName || petData.type.charAt(0).toUpperCase() + petData.type.slice(1);
    const rarityColor = RARITY_COLORS[petData.rarity];
    
    const activePet = getActivePet(player);
    const isActive = activePet && activePet.id === petData.id && activePet.type === petData.type;

    const predefinedBoost = petData.level;
    const tokenBoost = petData.tokenLevel * BOOST_PER_LEVEL;
    const upgradeBoost = petData.upgradeLevel * BOOST_PER_LEVEL;
    const sellBoost = petData.sellLevel * BOOST_PER_LEVEL;

    const sellPrice = calculateSellPrice(petData);

    const form = new ActionFormData();
    form.title(`${rarityColor}${displayName} Pet`);
    form.body(
        `§fType: ${rarityColor}${petData.type.charAt(0).toUpperCase() + petData.type.slice(1)}\n` +
        `§fRarity: ${rarityColor}${petData.rarity.charAt(0).toUpperCase() + petData.rarity.slice(1)}\n` +
        `§fLevel: §e${petData.level}§7/§e100\n` +
        `§fStatus: ${isActive ? "§a✓ Active" : "§c✗ Inactive"}\n\n` +
        `§l§6Predefined Booster:\n` +
        `§f  • ${petData.predefinedBooster.charAt(0).toUpperCase() + petData.predefinedBooster.slice(1)}: §b+${predefinedBoost}%\n\n` +
        `§l§6Predetermined Boosters:\n` +
        `§f  • Token: §b+${tokenBoost}% §8(Lvl ${petData.tokenLevel}/10)\n` +
        `§f  • Upgrade: §b+${upgradeBoost}% §8(Lvl ${petData.upgradeLevel}/10)\n` +
        `§f  • Sell: §b+${sellBoost}% §8(Lvl ${petData.sellLevel}/10)\n\n` +
        `§fSell Price: §e${formatTokens(sellPrice)} tokens`
    );

    if (!isActive) {
        form.button("§a✓ Activate Pet", "textures/items/nether_star");
    } else {
        form.button("§c✗ Deactivate Pet", "textures/ui/cancel");
    }
    
    form.button("§eRename Pet", "textures/items/name_tag");
    form.button("§bUpgrade Boosters", "textures/items/diamond");
    form.button("§6Sell Pet", "textures/items/gold_ingot");
    form.button("§cBack", "textures/ui/cancel");

    const response = await form.show(player);
    
    if (response.canceled) {
        await showAllPets(player, 0);
        return;
    }

    if (response.selection === 0) {
        if (!isActive) {
            activatePet(player, petData);
        } else {
            deactivatePet(player);
            player.sendMessage("§c§lPet §7>> §rDeactivated your pet!");
            player.runCommand("playsound random.pop @s");
        }
        const updatedPets = getPlayerPets(player);
        const updatedPet = updatedPets.find(p => p.id === petData.id && p.type === petData.type);
        if (updatedPet) {
            await showPetDetails(player, updatedPet);
        }
    } else if (response.selection === 1) {
        await new Promise(resolve => system.runTimeout(resolve, 10));
        await showRenamePet(player, petData);
    } else if (response.selection === 2) {
        await showUpgradeBoosters(player, petData);
    } else if (response.selection === 3) {
        await showSellConfirmation(player, petData);
    } else {
        await showAllPets(player, 0);
    }
}

// Mostrar menú de renombrado
async function showRenamePet(player, petData) {
    const currentName = getPetCustomName(player, petData);
    const defaultName = petData.type.charAt(0).toUpperCase() + petData.type.slice(1);

    let attempts = 0;
    const maxAttempts = 5;
    let formShown = false;

    while (attempts < maxAttempts && !formShown) {
        attempts++;
        await new Promise(resolve => system.runTimeout(resolve, 10 * attempts));

        try {
            const form = new ModalFormData();
            form.title("§eRename Pet");
            form.textField("§7Enter new name (leave empty to reset to default):", "Pet name");

            const response = await form.show(player);
            formShown = true;
            
            if (response.canceled) {
                await new Promise(resolve => system.runTimeout(resolve, 5));
                const updatedPet = getPlayerPets(player).find(p => p.id === petData.id && p.type === petData.type);
                if (updatedPet) {
                    await showPetDetails(player, updatedPet);
                }
                return;
            }

            const newName = response.formValues[0];
            setPetCustomName(player, petData, newName);

            if (newName && newName.trim() !== "") {
                player.sendMessage(`§a§lPet §7>> §rRenamed pet to §e${newName.trim()}§r!`);
            } else {
                player.sendMessage(`§a§lPet §7>> §rReset pet name to §e${defaultName}§r!`);
            }
            player.runCommand("playsound random.orb @s");

            await new Promise(resolve => system.runTimeout(resolve, 5));

            const updatedPet = getPlayerPets(player).find(p => p.id === petData.id && p.type === petData.type);
            if (updatedPet) {
                await showPetDetails(player, updatedPet);
            }
        } catch (e) {
            console.warn(`Rename form attempt ${attempts} failed: ${e}`);
            
            if (attempts >= maxAttempts) {
                player.sendMessage("§c§lPet §7>> §cError opening rename menu. Try again!");
                await new Promise(resolve => system.runTimeout(resolve, 5));
                
                const updatedPet = getPlayerPets(player).find(p => p.id === petData.id && p.type === petData.type);
                if (updatedPet) {
                    await showPetDetails(player, updatedPet);
                }
            }
        }
    }
}

// Mostrar menú de mejora de boosters (FIX COMPLETO CON TEXTURA CORRECTA)
async function showUpgradeBoosters(player, petData) {
    // RECARGAR DATOS FRESCOS SIEMPRE
    const freshPets = getPlayerPets(player);
    const freshPet = freshPets.find(p => p.id === petData.id && p.type === petData.type);
    
    if (!freshPet) {
        player.sendMessage("§c§lPet §7>> §cError loading pet data!");
        return;
    }
    
    const shardCount = getPetShardCount(player);

    const tokenCost = freshPet.tokenLevel + 1;
    const upgradeCost = freshPet.upgradeLevel + 1;
    const sellCost = freshPet.sellLevel + 1;

    const form = new ActionFormData();
    form.title("§bUpgrade Boosters");
    form.body(
        `§fYour Pet Shards: §b${shardCount}\n\n` +
        `§7Click on a booster to upgrade it.\n` +
        `§7Cost increases per level (1→2→3...→10)`
    );

    const tokenBoost = freshPet.tokenLevel * BOOST_PER_LEVEL;
    const upgradeBoost = freshPet.upgradeLevel * BOOST_PER_LEVEL;
    const sellBoost = freshPet.sellLevel * BOOST_PER_LEVEL;

    if (freshPet.tokenLevel < MAX_PREDEFINED_BOOSTER_LEVEL) {
        form.button(`§eToken Booster\n§8Lvl ${freshPet.tokenLevel}/10 (+${tokenBoost}%) | Cost: ${tokenCost} shards`, "textures/items/gold_ingot");
    } else {
        form.button(`§8Token Booster\n§7MAX LEVEL (+${tokenBoost}%)`, "textures/ui/icon_lock");
    }

    if (freshPet.upgradeLevel < MAX_PREDEFINED_BOOSTER_LEVEL) {
        form.button(`§dUpgrade Booster\n§8Lvl ${freshPet.upgradeLevel}/10 (+${upgradeBoost}%) | Cost: ${upgradeCost} shards`, "textures/items/diamond");
    } else {
        form.button(`§8Upgrade Booster\n§7MAX LEVEL (+${upgradeBoost}%)`, "textures/ui/icon_lock");
    }

    if (freshPet.sellLevel < MAX_PREDEFINED_BOOSTER_LEVEL) {
        form.button(`§aSell Booster\n§8Lvl ${freshPet.sellLevel}/10 (+${sellBoost}%) | Cost: ${sellCost} shards`, "textures/items/emerald");
    } else {
        form.button(`§8Sell Booster\n§7MAX LEVEL (+${sellBoost}%)`, "textures/ui/icon_lock");
    }

    form.button("§cBack", "textures/ui/cancel");

    const response = await form.show(player);
    
    if (response.canceled) {
        const updatedPets = getPlayerPets(player);
        const updatedPet = updatedPets.find(p => p.id === petData.id && p.type === petData.type);
        if (updatedPet) {
            await showPetDetails(player, updatedPet);
        }
        return;
    }

    // TOKEN BOOSTER
    if (response.selection === 0 && freshPet.tokenLevel < MAX_PREDEFINED_BOOSTER_LEVEL) {
        upgradeBooster(player, freshPet, "token");
        
        // DELAY PARA ASEGURAR ACTUALIZACIÓN
        await new Promise(resolve => system.runTimeout(resolve, 3));
        
        // RECARGAR Y REABRIR
        const updatedPets = getPlayerPets(player);
        const updatedPet = updatedPets.find(p => p.id === petData.id && p.type === petData.type);
        if (updatedPet) {
            await showUpgradeBoosters(player, updatedPet);
        }
    }
    // UPGRADE BOOSTER
    else if (response.selection === 1 && freshPet.upgradeLevel < MAX_PREDEFINED_BOOSTER_LEVEL) {
        upgradeBooster(player, freshPet, "upgrade");
        
        await new Promise(resolve => system.runTimeout(resolve, 3));
        
        const updatedPets = getPlayerPets(player);
        const updatedPet = updatedPets.find(p => p.id === petData.id && p.type === petData.type);
        if (updatedPet) {
            await showUpgradeBoosters(player, updatedPet);
        }
    }
    // SELL BOOSTER
    else if (response.selection === 2 && freshPet.sellLevel < MAX_PREDEFINED_BOOSTER_LEVEL) {
        upgradeBooster(player, freshPet, "sell");
        
        await new Promise(resolve => system.runTimeout(resolve, 3));
        
        const updatedPets = getPlayerPets(player);
        const updatedPet = updatedPets.find(p => p.id === petData.id && p.type === petData.type);
        if (updatedPet) {
            await showUpgradeBoosters(player, updatedPet);
        }
    }
    // BACK
    else if (response.selection === 3) {
        const updatedPets = getPlayerPets(player);
        const updatedPet = updatedPets.find(p => p.id === petData.id && p.type === petData.type);
        if (updatedPet) {
            await showPetDetails(player, updatedPet);
        }
    }
}

// Mostrar confirmación de venta
async function showSellConfirmation(player, petData) {
    const price = calculateSellPrice(petData);
    const customName = getPetCustomName(player, petData);
    const displayName = customName || petData.type.charAt(0).toUpperCase() + petData.type.slice(1);
    const rarityColor = RARITY_COLORS[petData.rarity];

    const form = new MessageFormData();
    form.title("§6Sell Pet");
    form.body(
        `§cAre you sure you want to sell this pet?\n\n` +
        `§fPet: ${rarityColor}${displayName}\n` +
        `§fLevel: §e${petData.level}\n` +
        `§fRarity: ${rarityColor}${petData.rarity}\n\n` +
        `§fYou will receive: §e${formatTokens(price)} tokens\n\n` +
        `§c§lThis action cannot be undone!`
    );
    form.button1("§aYes, Sell");
    form.button2("§cNo, Cancel");

    const response = await form.show(player);
    
    if (response.canceled || response.selection === 1) {
        await showPetDetails(player, petData);
        return;
    }

    if (response.selection === 0) {
        sellPet(player, petData);
        await showPetsMenu(player);
    }
}

// Función para intentar mostrar el menú con reintentos
function tryShowPetsMenu(player) {
    if (pendingForms.has(player.id)) {
        return;
    }
    
    pendingForms.set(player.id, true);
    
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryShow = () => {
        attempts++;
        
        showPetsMenu(player).then(() => {
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

// Función para buscar jugador por nombre
function findPlayerByName(nameOrSelector) {
    const allPlayers = world.getAllPlayers();
    
    let found = allPlayers.find(p => p.name.toLowerCase() === nameOrSelector.toLowerCase());
    if (found) return [found];
    
    found = allPlayers.find(p => p.name.toLowerCase().includes(nameOrSelector.toLowerCase()));
    if (found) return [found];
    
    for (const player of allPlayers) {
        if (player.nameTag && player.nameTag.toLowerCase().includes(nameOrSelector.toLowerCase())) {
            return [player];
        }
    }
    
    return null;
}

// COMANDO !PET MODIFY (ADMIN ONLY)
world.beforeEvents.chatSend.subscribe((event) => {
    const sender = event.sender;
    const args = event.message.split(" ");

    if (args[0].toLowerCase() === "!pet" && args.length >= 4 && args[1].toLowerCase() === "modify") {
        event.cancel = true;

        system.runTimeout(() => {
            if (!sender.hasTag("admin")) {
                sender.sendMessage("§c§lPet §7>> §cYou don't have permission to use this command!");
                sender.runCommand("playsound note.bass @s");
                return;
            }

            const targetSelector = args[2];
            const stat = args[3].toLowerCase();
            const value = args.slice(4).join(" ");

            let targets = [];
            
            if (targetSelector === "@s") {
                targets.push(sender);
            } else if (targetSelector === "@a") {
                targets = world.getAllPlayers();
            } else if (targetSelector.startsWith("@")) {
                sender.sendMessage("§c§lPet §7>> §cInvalid selector! Use: @s, @a, or player name");
                return;
            } else {
                const foundPlayers = findPlayerByName(targetSelector);
                
                if (!foundPlayers || foundPlayers.length === 0) {
                    sender.sendMessage(`§c§lPet §7>> §cPlayer §e${targetSelector}§c not found or not online!`);
                    return;
                }
                
                targets = foundPlayers;
            }

            const validStats = ["level", "xp", "rarity", "predefinedbooster", "tokenlevel", "upgradelevel", "selllevel", "type"];
            if (!validStats.includes(stat)) {
                sender.sendMessage("§c§lPet §7>> §cInvalid stat!");
                return;
            }

            if (!value || value.trim() === "") {
                sender.sendMessage(`§c§lPet §7>> §cYou must provide a value!`);
                return;
            }

            let successCount = 0;
            let failCount = 0;

            for (const target of targets) {
                const activePet = getActivePet(target);
                
                if (!activePet) {
                    if (targets.length === 1) {
                        sender.sendMessage(`§c§lPet §7>> §e${target.name}§c doesn't have an active pet!`);
                    }
                    failCount++;
                    continue;
                }

                let success = false;

                try {
                    if (stat === "level") {
                        const newLevel = parseInt(value);
                        if (!isNaN(newLevel) && newLevel >= 1 && newLevel <= 100) {
                            activePet.level = newLevel;
                            success = true;
                        }
                    } else if (stat === "xp") {
                        const newXP = parseInt(value);
                        if (!isNaN(newXP) && newXP >= 0) {
                            activePet.xp = newXP;
                            success = true;
                        }
                    } else if (stat === "rarity") {
                        const validRarities = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "unreal"];
                        if (validRarities.includes(value.toLowerCase())) {
                            activePet.rarity = value.toLowerCase();
                            success = true;
                        }
                    } else if (stat === "predefinedbooster") {
                        const validBoosters = ["token", "upgrade", "sell"];
                        if (validBoosters.includes(value.toLowerCase())) {
                            activePet.predefinedBooster = value.toLowerCase();
                            success = true;
                        }
                    } else if (stat === "tokenlevel") {
                        const newLevel = parseInt(value);
                        if (!isNaN(newLevel) && newLevel >= 0 && newLevel <= 10) {
                            activePet.tokenLevel = newLevel;
                            success = true;
                        }
                    } else if (stat === "upgradelevel") {
                        const newLevel = parseInt(value);
                        if (!isNaN(newLevel) && newLevel >= 0 && newLevel <= 10) {
                            activePet.upgradeLevel = newLevel;
                            success = true;
                        }
                    } else if (stat === "selllevel") {
                        const newLevel = parseInt(value);
                        if (!isNaN(newLevel) && newLevel >= 0 && newLevel <= 10) {
                            activePet.sellLevel = newLevel;
                            success = true;
                        }
                    } else if (stat === "type") {
                        if (value.trim()) {
                            activePet.type = value.toLowerCase().trim();
                            success = true;
                        }
                    }

                    if (success) {
                        updatePetData(target, activePet.tag, activePet);
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (e) {
                    failCount++;
                }
            }

            if (successCount > 0) {
                sender.sendMessage(`§a§lPet Modified §7>> §fSet §e${stat}§f to §e${value}§f for §e${successCount}§f player(s)!`);
                sender.runCommand("playsound random.levelup @s");
            }
            
            if (failCount > 0 && targets.length > 1) {
                sender.sendMessage(`§c§lPet §7>> §cFailed to modify §e${failCount}§c player(s).`);
            }
        }, 1);
        return;
    }

    // Comando !pet normal
    if (args[0].toLowerCase() === "!pet" && args.length === 1) {
        event.cancel = true;
        system.runTimeout(() => {
            tryShowPetsMenu(sender);
        }, 1);
    }
});

export { 
    getPlayerPets, 
    getActivePet, 
    activatePet, 
    deactivatePet, 
    getPetCustomName, 
    parsePetData,
    updatePetData
};