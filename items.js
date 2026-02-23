import { world, system } from "@minecraft/server";

// Mapeo de items con sus nombres y colores
const ITEM_CONFIG = {
    // Keys
    "planetoid:common_key": {
        name: "Common Key",
        color: "§f",
        displayName: function(amount) {
            return `§fx${amount} §fCommon Key`;
        }
    },
    "planetoid:rare_key": {
        name: "Rare Key",
        color: "§9",
        displayName: function(amount) {
            return `§fx${amount} §9Rare Key`;
        }
    },
    "planetoid:epic_key": {
        name: "Epic Key",
        color: "§5",
        displayName: function(amount) {
            return `§fx${amount} §5Epic Key`;
        }
    },
    "planetoid:legend_key": {
        name: "Legend Key",
        color: "§6",
        displayName: function(amount) {
            return `§fx${amount} §6Legend Key`;
        }
    },
    "planetoid:event_key": {
        name: "Event Key",
        color: "§d",
        displayName: function(amount) {
            return `§fx${amount} §dEvent Key`;
        }
    },
    "planetoid:madmax_key": {
        name: "Mad Max Key",
        color: "§c",
        displayName: function(amount) {
            return `§fx${amount} §cMad Max Key`;
        }
    },

    // Gift Cards
    "minecraft:paper": {
        name: "Gift Card / Money Note / Tokens Note",
        color: "§e",
        displayName: function(amount) {
            return null;
        }
    },

    // Prestige Vouchers
    "minecraft:amethyst_shard": {
        name: "Prestige Voucher",
        color: "§d",
        displayName: function(amount) {
            return null;
        }
    },

    // Backpack Upgraders
    "minecraft:gray_candle": {
        name: "Backpack Upgrader",
        color: "§8",
        displayName: function(amount) {
            return `§fx${amount} §8Backpack Upgrader`;
        }
    },
    "minecraft:lime_candle": {
        name: "Backpack Upgrader",
        color: "§a",
        displayName: function(amount) {
            return `§fx${amount} §aBackpack Upgrader`;
        }
    },
    "minecraft:light_blue_candle": {
        name: "Backpack Upgrader",
        color: "§b",
        displayName: function(amount) {
            return `§fx${amount} §bBackpack Upgrader`;
        }
    },
    "minecraft:purple_candle": {
        name: "Backpack Upgrader",
        color: "§5",
        displayName: function(amount) {
            return `§fx${amount} §5Backpack Upgrader`;
        }
    },
    "minecraft:orange_candle": {
        name: "Backpack Upgrader",
        color: "§6",
        displayName: function(amount) {
            return `§fx${amount} §6Backpack Upgrader`;
        }
    },
    "minecraft:green_candle": {
        name: "Backpack Upgrader",
        color: "§3",
        displayName: function(amount) {
            return `§fx${amount} §3Backpack Upgrader`;
        }
    },
    "minecraft:blue_candle": {
        name: "Backpack Upgrader",
        color: "§9",
        displayName: function(amount) {
            return `§fx${amount} §9Backpack Upgrader`;
        }
    },

    // Boosters
    "minecraft:emerald": {
        name: "Pickaxe XP Booster",
        color: "§b",
        displayName: function(amount) {
            return null;
        }
    },
    "minecraft:gold_ingot": {
        name: "Token Booster / Money Booster",
        color: "§6",
        displayName: function(amount) {
            return null;
        }
    },
    "minecraft:amethyst_cluster": {
        name: "Upgrade Booster",
        color: "§d",
        displayName: function(amount) {
            return null;
        }
    },
    "minecraft:orange_dye": {
        name: "Money Booster",
        color: "§6",
        displayName: function(amount) {
            return null;
        }
    },

    // Punch Items
    "minecraft:lime_shulker_box": {
        name: "Money Punch",
        color: "§a",
        displayName: function(amount) {
            return null;
        }
    },
    "minecraft:orange_shulker_box": {
        name: "Token Punch",
        color: "§e",
        displayName: function(amount) {
            return null;
        }
    }
};

// Items que NO deben tener floating text (minería de bloques)
const BLOCK_VALUES = {
    "minecraft:dark_oak_log": 1,
    "minecraft:oak_log": 1,
    "minecraft:acasia_log": 1,
    "minecraft:mossy_cobblestone": 3,
    "minecraft:cobblestone": 3,
    "minecraft:stone": 3,
    "minecraft:coal_ore": 5,
    "minecraft:iron_ore": 5,
    "minecraft:gold_ore": 5,
    "minecraft:lapis_ore": 7,
    "minecraft:redstone_ore": 9,
    "minecraft:redstone_block": 11,
    "minecraft:lapis_block": 17,
    "minecraft:iron_block": 23,
    "minecraft:gold_block": 27,
    "minecraft:emerald_ore": 30,
    "minecraft:obsidian": 40,
    "minecraft:diamond_ore": 49,
    "minecraft:diamond_block": 56,
    "minecraft:emerald_block": 70,
    "minecraft:netherite_block": 90
};

// Rastrear items con sus floating texts
const itemFloatingTexts = new Map();

// Cuando un item se arroja
world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    
    // Solo procesar items
    if (entity.typeId !== "minecraft:item") return;
    
    system.runTimeout(() => {
        try {
            const itemStack = entity.getComponent("minecraft:item")?.itemStack;
            
            if (!itemStack) return;

            const itemId = itemStack.typeId;
            const amount = itemStack.amount;

            // No crear floating text para items de BLOCK_VALUES
            if (BLOCK_VALUES[itemId]) {
                return;
            }

            let displayName = null;

            // Intentar obtener nombre personalizado del item (nameTag)
            if (itemStack.nameTag) {
                displayName = `§fx${amount} ${itemStack.nameTag}`;
            } else if (ITEM_CONFIG[itemId]) {
                const config = ITEM_CONFIG[itemId];
                displayName = config.displayName(amount);
            } else {
                // Para items sin nameTag ni config, crear nombre genérico
                const itemName = itemId.replace("minecraft:", "").replace(/_/g, " ");
                const capitalizedName = itemName
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                displayName = `§fx${amount} §f${capitalizedName}`;
            }

            // Si se generó un nombre, crear floating text
            if (displayName) {
                try {
                    const floatingText = entity.dimension.spawnEntity(
                        "add:floating_text",
                        { 
                            x: entity.location.x, 
                            y: entity.location.y + 0.7, 
                            z: entity.location.z 
                        }
                    );
                    
                    floatingText.nameTag = displayName;
                    floatingText.addTag("item_label");
                    floatingText.addTag(`linked_to_${entity.id}`);
                    
                    itemFloatingTexts.set(entity.id, {
                        floatingText: floatingText,
                        dimension: entity.dimension
                    });
                } catch (e) {
                    // Error creando floating text
                }
            }
        } catch (e) {
            // Error general
        }
    }, 1);
});

// Sistema de actualización cada tick
system.runInterval(() => {
    const itemsToDelete = [];

    for (const [itemEntityId, data] of itemFloatingTexts.entries()) {
        try {
            const { floatingText, dimension } = data;

            // Obtener todos los items en la dimensión
            const allItems = dimension.getEntities({ type: "minecraft:item" });
            let itemFound = false;

            // Buscar si el item aún existe
            for (const item of allItems) {
                if (item.id === itemEntityId) {
                    // Item encontrado, actualizar posición
                    const loc = item.location;
                    try {
                        floatingText.teleport(
                            { x: loc.x, y: loc.y + 0.7, z: loc.z },
                            { dimension: dimension }
                        );
                    } catch (e) {
                        itemsToDelete.push(itemEntityId);
                    }
                    itemFound = true;
                    break;
                }
            }

            // Si el item no fue encontrado, marcar para eliminar
            if (!itemFound) {
                itemsToDelete.push(itemEntityId);
            }
        } catch (e) {
            itemsToDelete.push(itemEntityId);
        }
    }

    // Eliminar los floating texts de items que no existen
    for (const id of itemsToDelete) {
        const data = itemFloatingTexts.get(id);
        if (data) {
            const { floatingText } = data;
            try {
                floatingText.remove();
            } catch (e) {
                // Ignorar error si no se puede remover
            }
        }
        itemFloatingTexts.delete(id);
    }
}, 1);

// Limpiar cuando un item es recogido o se destruye
world.afterEvents.entityDie.subscribe((event) => {
    const entity = event.deadEntity;
    
    // Si muere un item, eliminar su floating text
    if (entity.typeId === "minecraft:item") {
        const data = itemFloatingTexts.get(entity.id);
        if (data) {
            try {
                data.floatingText.remove();
            } catch (e) {
                // Ignorar error
            }
            itemFloatingTexts.delete(entity.id);
        }
    }
});

export { ITEM_CONFIG };