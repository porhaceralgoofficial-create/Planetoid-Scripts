import { world, system, ItemStack } from "@minecraft/server";

// Configuración de rarezas de Pet Eggs
const PET_EGG_CONFIG = {
    "common": {
        item: "minecraft:turtle_egg",
        color: "§8",
        display: "§r§8[§r§8Common Pet Egg§r§8]",
        minLevel: 1,
        maxLevel: 1,
        probabilities: {
            common: 50,
            uncommon: 25,
            rare: 13,
            epic: 7,
            legendary: 3,
            mythic: 1.5,
            unreal: 0.5
        },
        lore: [
            "§r",
            "§r§7A mysterious egg containing",
            "§r§7a random pet companion.",
            "§r",
            "§r§6Information",
            "§r§6| §fRarity: §8Common",
            "§r§6| §fStarting Level: §f1",
            "§r§6| §fPossible Pets: §fAll Rarities",
            "§r",
            "§r§8Right-click to hatch!"
        ]
    },
    "uncommon": {
        item: "minecraft:turtle_egg",
        color: "§a",
        display: "§r§8[§r§aUncommon Pet Egg§r§8]",
        minLevel: 1,
        maxLevel: 1,
        probabilities: {
            uncommon: 45,
            rare: 30,
            epic: 15,
            legendary: 7,
            mythic: 2.5,
            unreal: 0.5
        },
        lore: [
            "§r",
            "§r§7A mysterious egg containing",
            "§r§7a random pet companion.",
            "§r",
            "§r§6Information",
            "§r§6| §fRarity: §aUncommon",
            "§r§6| §fStarting Level: §f1",
            "§r§6| §fPossible Pets: §aUncommon+",
            "§r",
            "§r§8Right-click to hatch!"
        ]
    },
    "rare": {
        item: "minecraft:turtle_egg",
        color: "§9",
        display: "§r§8[§r§9Rare Pet Egg§r§8]",
        minLevel: 1,
        maxLevel: 1,
        probabilities: {
            rare: 50,
            epic: 30,
            legendary: 13,
            mythic: 5,
            unreal: 2
        },
        lore: [
            "§r",
            "§r§7A mysterious egg containing",
            "§r§7a random pet companion.",
            "§r",
            "§r§6Information",
            "§r§6| §fRarity: §9Rare",
            "§r§6| §fStarting Level: §f1",
            "§r§6| §fPossible Pets: §9Rare+",
            "§r",
            "§r§8Right-click to hatch!"
        ]
    },
    "epic": {
        item: "minecraft:turtle_egg",
        color: "§5",
        display: "§r§8[§r§5Epic Pet Egg§r§8]",
        minLevel: 1,
        maxLevel: 1,
        probabilities: {
            epic: 60,
            legendary: 25,
            mythic: 10,
            unreal: 5
        },
        lore: [
            "§r",
            "§r§7A mysterious egg containing",
            "§r§7a random pet companion.",
            "§r",
            "§r§6Information",
            "§r§6| §fRarity: §5Epic",
            "§r§6| §fStarting Level: §f1",
            "§r§6| §fPossible Pets: §5Epic+",
            "§r",
            "§r§8Right-click to hatch!"
        ]
    },
    "legendary": {
        item: "minecraft:turtle_egg",
        color: "§6",
        display: "§r§8[§r§6Legendary Pet Egg§r§8]",
        minLevel: 1,
        maxLevel: 15,
        probabilities: {
            epic: 15,
            legendary: 60,
            mythic: 20,
            unreal: 5
        },
        lore: [
            "§r",
            "§r§7A mysterious egg containing",
            "§r§7a random pet companion.",
            "§r",
            "§r§6Information",
            "§r§6| §fRarity: §6Legendary",
            "§r§6| §fStarting Level: §f1-15",
            "§r§6| §fPossible Pets: §5Epic+",
            "§r",
            "§r§8Right-click to hatch!"
        ]
    },
    "mythic": {
        item: "minecraft:turtle_egg",
        color: "§3",
        display: "§r§8[§r§3Mythic Pet Egg§r§8]",
        minLevel: 15,
        maxLevel: 37,
        probabilities: {
            epic: 10,
            legendary: 25,
            mythic: 55,
            unreal: 10
        },
        lore: [
            "§r",
            "§r§7A mysterious egg containing",
            "§r§7a random pet companion.",
            "§r",
            "§r§6Information",
            "§r§6| §fRarity: §3Mythic",
            "§r§6| §fStarting Level: §f15-37",
            "§r§6| §fPossible Pets: §5Epic+",
            "§r",
            "§r§8Right-click to hatch!"
        ]
    },
    "unreal": {
        item: "minecraft:turtle_egg",
        color: "§9",
        display: "§r§8[§r§l§9Unreal Pet Egg§r§8]",
        minLevel: 40,
        maxLevel: 62,
        probabilities: {
            legendary: 20,
            mythic: 30,
            unreal: 50
        },
        lore: [
            "§r",
            "§r§7A mysterious egg containing",
            "§r§7a random pet companion.",
            "§r",
            "§r§6Information",
            "§r§6| §fRarity: §l§9Unreal",
            "§r§6| §fStarting Level: §f40-62",
            "§r§6| §fPossible Pets: §6Legendary+",
            "§r",
            "§r§8Right-click to hatch!"
        ]
    }
};

// Tipos de pets disponibles
const PET_TYPES = [
    "zombie",
    "creeper",
    "skeleton",
    "dragon",
    "wither",
    "piglin",
    "steve"
];

// Tipos de boosters predefinidos que puede tener una pet
const PREDEFINED_BOOSTERS = [
    "token",
    "upgrade",
    "sell"
];

// Colores de rarezas
const RARITY_COLORS = {
    common: "§8",
    uncommon: "§a",
    rare: "§9",
    epic: "§5",
    legendary: "§6",
    mythic: "§3",
    unreal: "§l§9"
};

// Crear un Pet Egg
function createPetEgg(rarity) {
    if (!PET_EGG_CONFIG[rarity]) {
        return null;
    }

    const config = PET_EGG_CONFIG[rarity];
    const eggItem = new ItemStack(config.item, 1);
    
    eggItem.nameTag = config.display;
    eggItem.setLore(config.lore);
    eggItem.keepOnDeath = true;

    return eggItem;
}

// Obtener rareza del Pet Egg desde el item (por lore)
function getEggRarity(item) {
    if (!item || !item.typeId || item.typeId !== "minecraft:turtle_egg") return null;
    
    const lore = item.getLore();
    if (!lore || lore.length === 0) return null;

    // Buscar en el lore la línea que contiene "Rarity:"
    for (const line of lore) {
        if (line.includes("Rarity:")) {
            if (line.includes("§8Common")) return "common";
            if (line.includes("§aUncommon")) return "uncommon";
            if (line.includes("§9Rare")) return "rare";
            if (line.includes("§5Epic")) return "epic";
            if (line.includes("§6Legendary")) return "legendary";
            if (line.includes("§3Mythic")) return "mythic";
            if (line.includes("§l§9Unreal")) return "unreal";
        }
    }

    return null;
}

// Verificar si un item es un Pet Egg
function isPetEgg(item) {
    if (!item || item.typeId !== "minecraft:turtle_egg") return false;
    const lore = item.getLore();
    if (!lore || lore.length === 0) return false;
    
    // Verificar si tiene el lore característico
    return lore.some(line => line.includes("Right-click to hatch!"));
}

// Seleccionar rareza de pet según probabilidades del egg
function selectPetRarity(eggRarity) {
    const config = PET_EGG_CONFIG[eggRarity];
    if (!config) return "common";

    const probabilities = config.probabilities;
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [rarity, chance] of Object.entries(probabilities)) {
        cumulative += chance;
        if (random <= cumulative) {
            return rarity;
        }
    }

    return Object.keys(probabilities)[0];
}

// Seleccionar tipo de pet (todos tienen misma probabilidad)
function selectPetType() {
    const randomIndex = Math.floor(Math.random() * PET_TYPES.length);
    return PET_TYPES[randomIndex];
}

// Seleccionar booster predefinido (todos tienen misma probabilidad)
function selectPredefinedBooster() {
    const randomIndex = Math.floor(Math.random() * PREDEFINED_BOOSTERS.length);
    return PREDEFINED_BOOSTERS[randomIndex];
}

// Seleccionar nivel inicial del pet según el egg
function selectPetLevel(eggRarity) {
    const config = PET_EGG_CONFIG[eggRarity];
    if (!config) return 1;

    const minLevel = config.minLevel;
    const maxLevel = config.maxLevel;

    return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
}

// Contar cuántas pets tiene un jugador
function getPlayerPetCount(player) {
    const tags = player.getTags();
    let count = 0;

    for (const tag of tags) {
        if (tag.startsWith("pet_owned_")) {
            count++;
        }
    }

    return count;
}

// Generar ID único para la pet
function generatePetId(player) {
    const tags = player.getTags();
    let maxId = 0;

    for (const tag of tags) {
        if (tag.startsWith("pet_owned_")) {
            const parts = tag.split("_");
            if (parts.length >= 4) {
                const id = parseInt(parts[3].split(":")[0]);
                if (!isNaN(id) && id > maxId) {
                    maxId = id;
                }
            }
        }
    }

    return maxId + 1;
}

// Abrir Pet Egg
function openPetEgg(player, item) {
    // Verificar límite de 50 pets
    const petCount = getPlayerPetCount(player);
    if (petCount >= 50) {
        player.sendMessage("§c§lPet Egg §7>> §cYou have reached the maximum of 50 pets! Sell some to make space.");
        player.runCommand("playsound note.bass @s");
        return;
    }

    const eggRarity = getEggRarity(item);
    if (!eggRarity) {
        player.sendMessage("§c§lPet Egg §7>> §cInvalid Pet Egg!");
        return;
    }

    // Generar pet random
    const petRarity = selectPetRarity(eggRarity);
    const petType = selectPetType();
    const petLevel = selectPetLevel(eggRarity);
    const predefinedBooster = selectPredefinedBooster();
    const petId = generatePetId(player);

    // Guardar pet en tags
    // Formato: pet_owned_<tipo>_<id>:<rareza>:<nivel>:<xp>:<boosterPred>:<tokenLvl>:<upgradeLvl>:<sellLvl>
    const petTag = `pet_owned_${petType}_${petId}:${petRarity}:${petLevel}:0:${predefinedBooster}:0:0:0`;
    
    system.run(() => {
        player.addTag(petTag);
    });

    // Mensaje de éxito
    const rarityColor = RARITY_COLORS[petRarity];
    const petTypeName = petType.charAt(0).toUpperCase() + petType.slice(1);
    
    player.sendMessage("§6|--------------------------------|");
    player.sendMessage("§6| §l§aPet Hatched!");
    player.sendMessage("§6|");
    player.sendMessage(`§6| §fType: ${rarityColor}${petTypeName} Pet`);
    player.sendMessage(`§6| §fRarity: ${rarityColor}${petRarity.charAt(0).toUpperCase() + petRarity.slice(1)}`);
    player.sendMessage(`§6| §fLevel: §e${petLevel}`);
    player.sendMessage(`§6| §fBooster: §b${predefinedBooster.charAt(0).toUpperCase() + predefinedBooster.slice(1)} +${petLevel}%`);
    player.sendMessage("§6|");
    player.sendMessage("§6| §7Use §f!pet§7 to manage your pets!");
    player.sendMessage("§6|--------------------------------|");
    
    player.runCommand("playsound random.levelup @s");
    player.runCommand("playsound mob.enderdragon.growl @s");

    // Eliminar el egg del inventario
    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;

        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);

        if (currentItem && isPetEgg(currentItem)) {
            if (currentItem.amount > 1) {
                currentItem.amount -= 1;
                inv.container.setItem(slot, currentItem);
            } else {
                inv.container.setItem(slot, undefined);
            }
        }
    });
}

// Event: Usar Pet Egg (click derecho)
world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;

    if (!isPetEgg(item)) return;

    event.cancel = true;
    
    system.run(() => {
        openPetEgg(player, item);
    });
});

// Bloquear colocación de Pet Eggs (usando el mismo sistema que ya tienes)
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;

    try {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory || !inventory.container) return;

        const hand = inventory.container.getItem(player.selectedSlotIndex);
        if (!isPetEgg(hand)) return;

        event.cancel = true;
        system.run(() => {
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place this item on the ground!");
            player.runCommand("playsound note.bass @s");
        });
    } catch (e) {}
});

// Comando: !pet egg <player> <rarity> <cantidad>
world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const args = event.message.split(" ");

    if (args[0].toLowerCase() === "!pet" && args[1]?.toLowerCase() === "egg") {
        event.cancel = true;

        system.runTimeout(() => {
            if (!player.hasTag("Rank:§dOwner")) {
                player.sendMessage("§cYou don't have permission to use this command.");
                return;
            }

            if (args.length < 5) {
                player.sendMessage("§c§lPet Egg §7>> §cUsage: !pet egg <player> <rarity> <quantity>");
                player.sendMessage("§7Rarities: common, uncommon, rare, epic, legendary, mythic, unreal");
                return;
            }

            const targetName = args[2];
            const rarity = args[3].toLowerCase();
            const quantity = parseInt(args[4]);

            if (!PET_EGG_CONFIG[rarity]) {
                player.sendMessage("§c§lPet Egg §7>> §cInvalid rarity! Use: common, uncommon, rare, epic, legendary, mythic, unreal");
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                player.sendMessage("§c§lPet Egg §7>> §cQuantity must be a positive number!");
                return;
            }

            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§c§lPet Egg §7>> §cPlayer not found!");
                return;
            }

            const target = targetPlayers[0];
            const inv = target.getComponent("minecraft:inventory");
            if (!inv || !inv.container) {
                player.sendMessage("§c§lPet Egg §7>> §cError accessing target's inventory!");
                return;
            }

            for (let i = 0; i < quantity; i++) {
                const eggItem = createPetEgg(rarity);
                if (eggItem) {
                    inv.container.addItem(eggItem);
                }
            }

            const config = PET_EGG_CONFIG[rarity];
            player.sendMessage(`§a§lPet Egg §7>> §rGiven §f${quantity}x ${config.color}${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Pet Egg§r to §b${targetName}§r!`);
            target.sendMessage(`§a§lPet Egg §7>> §rYou received §f${quantity}x ${config.color}${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Pet Egg§r!`);

            system.run(() => {
                player.runCommand("playsound random.levelup @s");
                target.runCommand("playsound random.levelup @s");
            });
        }, 1);
    }
});

export { PET_EGG_CONFIG, PET_TYPES, PREDEFINED_BOOSTERS, RARITY_COLORS, getPlayerPetCount };