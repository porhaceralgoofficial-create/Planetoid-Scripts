import { world, system, ItemStack } from "@minecraft/server";

// ===========================
// PICKAXE EFFECT VOUCHERS
// ===========================
const PICKAXE_EFFECT_CONFIG = {
    "villager_happy": {
        color: "§a",
        display: "§r§8[§r§aHappy Faces Pickaxe Effect§r§8]",
        particle: "minecraft:villager_happy",
        rarityName: "Common",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns happy faces around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §aCommon",
            "§r§fEffect: §aHappy Faces",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "heart": {
        color: "§c",
        display: "§r§8[§r§cLovely Hearts Pickaxe Effect§r§8]",
        particle: "minecraft:heart_particle",
        rarityName: "Uncommon",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns hearts around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §aUncommon",
            "§r§fEffect: §cHearts",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "note": {
        color: "§d",
        display: "§r§8[§r§dMusical Notes Pickaxe Effect§r§8]",
        particle: "minecraft:note_particle",
        rarityName: "Uncommon",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns musical notes around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §aUncommon",
            "§r§fEffect: §dNotes",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "redstone": {
        color: "§c",
        display: "§r§8[§r§cRedstone Dust Pickaxe Effect§r§8]",
        particle: "minecraft:redstone_ore_dust_particle",
        rarityName: "Rare",
        rarityColor: "§9",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns redstone dust around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §9Rare",
            "§r§fEffect: §cRedstone",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "flame": {
        color: "§6",
        display: "§r§8[§r§6Flame Trail Pickaxe Effect§r§8]",
        particle: "minecraft:basic_flame_particle",
        rarityName: "Rare",
        rarityColor: "§9",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns flames around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §9Rare",
            "§r§fEffect: §6Flames",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "smoke": {
        color: "§7",
        display: "§r§8[§r§7Smoke Cloud Pickaxe Effect§r§8]",
        particle: "minecraft:large_smoke_particle",
        rarityName: "Common",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns smoke around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §aCommon",
            "§r§fEffect: §7Smoke",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "electric": {
        color: "§e",
        display: "§r§8[§r§eElectric Sparks Pickaxe Effect§r§8]",
        particle: "minecraft:electric_spark_particle",
        rarityName: "Epic",
        rarityColor: "§5",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns electric sparks around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §5Epic",
            "§r§fEffect: §eElectric",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "dragon_breath": {
        color: "§5",
        display: "§r§8[§r§5Dragon Breath Pickaxe Effect§r§8]",
        particle: "minecraft:dragon_breath_particle",
        rarityName: "Legendary",
        rarityColor: "§6",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns dragon breath around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §6Legendary",
            "§r§fEffect: §5Dragon Breath",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "soul": {
        color: "§b",
        display: "§r§8[§r§bSoul Flame Pickaxe Effect§r§8]",
        particle: "minecraft:soul_particle",
        rarityName: "Legendary",
        rarityColor: "§6",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns soul flames around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §6Legendary",
            "§r§fEffect: §bSoul Flame",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "blue_flame": {
        color: "§9",
        display: "§r§8[§r§9Blue Flame Pickaxe Effect§r§8]",
        particle: "minecraft:blue_flame_particle",
        rarityName: "Epic",
        rarityColor: "§5",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns blue flames around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §5Epic",
            "§r§fEffect: §9Blue Flame",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "cherry": {
        color: "§d",
        display: "§r§8[§r§dCherry Petals Pickaxe Effect§r§8]",
        particle: "minecraft:cherry_leaves_particle",
        rarityName: "Mythic",
        rarityColor: "§3",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns cherry petals around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §3Mythic",
            "§r§fEffect: §dCherry Petals",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "end_rod": {
        color: "§f",
        display: "§r§8[§r§fEnd Rod Pickaxe Effect§r§8]",
        particle: "minecraft:end_rod_particle",
        rarityName: "Mythic",
        rarityColor: "§3",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns end rod particles around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §3Mythic",
            "§r§fEffect: §fEnd Rod",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "enchanting": {
        color: "§b",
        display: "§r§8[§r§bEnchanting Runes Pickaxe Effect§r§8]",
        particle: "minecraft:enchanting_table_particle",
        rarityName: "Epic",
        rarityColor: "§5",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns enchanting runes around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §5Epic",
            "§r§fEffect: §bRunes",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "lava": {
        color: "§c",
        display: "§r§8[§r§cLava Drip Pickaxe Effect§r§8]",
        particle: "minecraft:dripping_lava_particle",
        rarityName: "Rare",
        rarityColor: "§9",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns lava drips around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §9Rare",
            "§r§fEffect: §cLava Drip",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "portal": {
        color: "§5",
        display: "§r§8[§r§5Portal Swirl Pickaxe Effect§r§8]",
        particle: "minecraft:portal_particle",
        rarityName: "Legendary",
        rarityColor: "§6",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns portal swirls around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §6Legendary",
            "§r§fEffect: §5Portal",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "critical": {
        color: "§e",
        display: "§r§8[§r§eCritical Hit Pickaxe Effect§r§8]",
        particle: "minecraft:critical_hit_emitter",
        rarityName: "Uncommon",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns critical hits around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §aUncommon",
            "§r§fEffect: §eCrit Hits",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "snowflake": {
        color: "§b",
        display: "§r§8[§r§bSnowflake Pickaxe Effect§r§8]",
        particle: "minecraft:falling_dust_top_snow_particle",
        rarityName: "Rare",
        rarityColor: "§9",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns snowflakes around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §9Rare",
            "§r§fEffect: §bSnowflake",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "sparkler": {
        color: "§e",
        display: "§r§8[§r§eSparkler Pickaxe Effect§r§8]",
        particle: "minecraft:sparkler_emitter",
        rarityName: "Epic",
        rarityColor: "§5",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns sparkles around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §5Epic",
            "§r§fEffect: §eSparkler",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "wax": {
        color: "§6",
        display: "§r§8[§r§6Wax Drip Pickaxe Effect§r§8]",
        particle: "minecraft:wax_particle",
        rarityName: "Uncommon",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns wax drips around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §aUncommon",
            "§r§fEffect: §6Wax Drip",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "totem": {
        color: "§a",
        display: "§r§8[§r§aTotem Aura Pickaxe Effect§r§8]",
        particle: "minecraft:totem_particle",
        rarityName: "Legendary",
        rarityColor: "§6",
        lore: [
            "§r",
            "§r§7Unlocks a mining particle effect",
            "§r§7that spawns totem particles around",
            "§r§7broken blocks when mining.",
            "§r",
            "§r§fRarity: §6Legendary",
            "§r§fEffect: §aTotem",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    }
};

// ===========================
// WALK TRAIL VOUCHERS
// ===========================
const WALK_TRAIL_CONFIG = {
    "smoke_trail": {
        color: "§7",
        display: "§r§8[§r§7Smoke Trail Effect§r§8]",
        particle: "minecraft:campfire_smoke_particle",
        rarityName: "Common",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves smoke behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §aCommon",
            "§r§fEffect: §7Smoke Trail",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "water_drip": {
        color: "§9",
        display: "§r§8[§r§9Water Drip Trail Effect§r§8]",
        particle: "minecraft:drip_water_particle",
        rarityName: "Common",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves water drips behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §aCommon",
            "§r§fEffect: §9Water Drip",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "cherry_trail": {
        color: "§d",
        display: "§r§8[§r§dCherry Blossom Trail Effect§r§8]",
        particle: "minecraft:cherry_leaves_particle",
        rarityName: "Rare",
        rarityColor: "§9",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves cherry petals behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §9Rare",
            "§r§fEffect: §dCherry Blossom",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "flame_trail": {
        color: "§6",
        display: "§r§8[§r§6Flame Trail Effect§r§8]",
        particle: "minecraft:basic_flame_particle",
        rarityName: "Rare",
        rarityColor: "§9",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves flames behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §9Rare",
            "§r§fEffect: §6Flame Trail",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "electric_trail": {
        color: "§e",
        display: "§r§8[§r§eElectric Trail Effect§r§8]",
        particle: "minecraft:electric_spark_particle",
        rarityName: "Epic",
        rarityColor: "§5",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves electric sparks behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §5Epic",
            "§r§fEffect: §eElectric",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "soul_trail": {
        color: "§b",
        display: "§r§8[§r§bSoul Trail Effect§r§8]",
        particle: "minecraft:soul_particle",
        rarityName: "Legendary",
        rarityColor: "§6",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves soul flames behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §6Legendary",
            "§r§fEffect: §bSoul Trail",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "portal_trail": {
        color: "§5",
        display: "§r§8[§r§5Portal Trail Effect§r§8]",
        particle: "minecraft:portal_particle",
        rarityName: "Legendary",
        rarityColor: "§6",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves portal particles behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §6Legendary",
            "§r§fEffect: §5Portal",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "end_rod_trail": {
        color: "§f",
        display: "§r§8[§r§fEnd Rod Trail Effect§r§8]",
        particle: "minecraft:end_rod_particle",
        rarityName: "Mythic",
        rarityColor: "§3",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves end rod particles behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §3Mythic",
            "§r§fEffect: §fEnd Rod",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "heart_trail": {
        color: "§c",
        display: "§r§8[§r§cHeart Trail Effect§r§8]",
        particle: "minecraft:heart_particle",
        rarityName: "Uncommon",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves hearts behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §aUncommon",
            "§r§fEffect: §cHearts",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "note_trail": {
        color: "§d",
        display: "§r§8[§r§dMusic Note Trail Effect§r§8]",
        particle: "minecraft:note_particle",
        rarityName: "Uncommon",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves musical notes behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §aUncommon",
            "§r§fEffect: §dMusic Notes",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "redstone_trail": {
        color: "§c",
        display: "§r§8[§r§cRedstone Trail Effect§r§8]",
        particle: "minecraft:redstone_ore_dust_particle",
        rarityName: "Rare",
        rarityColor: "§9",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves redstone dust behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §9Rare",
            "§r§fEffect: §cRedstone",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "dragon_breath_trail": {
        color: "§5",
        display: "§r§8[§r§5Dragon Breath Trail Effect§r§8]",
        particle: "minecraft:dragon_breath_particle",
        rarityName: "Legendary",
        rarityColor: "§6",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves dragon breath behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §6Legendary",
            "§r§fEffect: §5Dragon Breath",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "blue_flame_trail": {
        color: "§9",
        display: "§r§8[§r§9Blue Flame Trail Effect§r§8]",
        particle: "minecraft:blue_flame_particle",
        rarityName: "Epic",
        rarityColor: "§5",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves blue flames behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §5Epic",
            "§r§fEffect: §9Blue Flame",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "enchanting_trail": {
        color: "§b",
        display: "§r§8[§r§bEnchanting Trail Effect§r§8]",
        particle: "minecraft:enchanting_table_particle",
        rarityName: "Epic",
        rarityColor: "§5",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves enchanting runes behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §5Epic",
            "§r§fEffect: §bRunes",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "lava_trail": {
        color: "§c",
        display: "§r§8[§r§cLava Trail Effect§r§8]",
        particle: "minecraft:dripping_lava_particle",
        rarityName: "Rare",
        rarityColor: "§9",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves lava drips behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §9Rare",
            "§r§fEffect: §cLava",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "snowflake_trail": {
        color: "§b",
        display: "§r§8[§r§bSnowflake Trail Effect§r§8]",
        particle: "minecraft:falling_dust_top_snow_particle",
        rarityName: "Rare",
        rarityColor: "§9",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves snowflakes behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §9Rare",
            "§r§fEffect: §bSnowflake",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "totem_trail": {
        color: "§a",
        display: "§r§8[§r§aTotem Trail Effect§r§8]",
        particle: "minecraft:totem_particle",
        rarityName: "Legendary",
        rarityColor: "§6",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves totem particles behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §6Legendary",
            "§r§fEffect: §aTotem",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "sparkler_trail": {
        color: "§e",
        display: "§r§8[§r§eSparkler Trail Effect§r§8]",
        particle: "minecraft:sparkler_emitter",
        rarityName: "Epic",
        rarityColor: "§5",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves sparkles behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §5Epic",
            "§r§fEffect: §eSparkler",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "honey_trail": {
        color: "§6",
        display: "§r§8[§r§6Honey Trail Effect§r§8]",
        particle: "minecraft:honey_drip_particle",
        rarityName: "Uncommon",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves honey drips behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §aUncommon",
            "§r§fEffect: §6Honey",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "villager_trail": {
        color: "§a",
        display: "§r§8[§r§aHappy Trail Effect§r§8]",
        particle: "minecraft:villager_happy",
        rarityName: "Common",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves happy faces behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §aCommon",
            "§r§fEffect: §aHappy Faces",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    },
    "critical_trail": {
        color: "§e",
        display: "§r§8[§r§eCritical Trail Effect§r§8]",
        particle: "minecraft:critical_hit_emitter",
        rarityName: "Uncommon",
        rarityColor: "§a",
        lore: [
            "§r",
            "§r§7Unlocks a walking trail effect",
            "§r§7that leaves critical hits behind you",
            "§r§7as you walk.",
            "§r",
            "§r§fRarity: §aUncommon",
            "§r§fEffect: §eCritical",
            "§r§fBound to: §eAccount",
            "§r",
            "§r§8Right-click to unlock!"
        ]
    }
};

// Crear Pickaxe Effect Voucher
function createPickaxeEffectVoucher(effectType) {
    if (!PICKAXE_EFFECT_CONFIG[effectType]) {
        return null;
    }

    const config = PICKAXE_EFFECT_CONFIG[effectType];
    const voucherItem = new ItemStack("minecraft:diamond", 1);
    
    voucherItem.nameTag = config.display;
    voucherItem.setLore(config.lore);
    voucherItem.keepOnDeath = true;
    
    return { item: voucherItem, effectType: effectType };
}

// Crear Walk Trail Voucher
function createWalkTrailVoucher(trailType) {
    if (!WALK_TRAIL_CONFIG[trailType]) {
        return null;
    }

    const config = WALK_TRAIL_CONFIG[trailType];
    const voucherItem = new ItemStack("minecraft:emerald", 1);
    
    voucherItem.nameTag = config.display;
    voucherItem.setLore(config.lore);
    voucherItem.keepOnDeath = true;
    
    return { item: voucherItem, trailType: trailType };
}

// Obtener efecto de pickaxe desde voucher
function getPickaxeEffectFromVoucher(item) {
    if (!item || !item.nameTag) return null;
    
    if (!item.nameTag.includes("Pickaxe Effect")) {
        return null;
    }
    
    for (const [key, config] of Object.entries(PICKAXE_EFFECT_CONFIG)) {
        if (item.nameTag.includes(config.display.split("§r§8]") [0].split("[§r")[1])) {
            return key;
        }
    }
    
    return null;
}

// Obtener trail desde voucher
function getWalkTrailFromVoucher(item) {
    if (!item || !item.nameTag) return null;
    
    if (!item.nameTag.includes("Trail Effect")) {
        return null;
    }
    
    for (const [key, config] of Object.entries(WALK_TRAIL_CONFIG)) {
        if (item.nameTag.includes(config.display.split("§r§8]")[0].split("[§r")[1])) {
            return key;
        }
    }
    
    return null;
}

// Desbloquear Pickaxe Effect
function unlockPickaxeEffect(player, item) {
    const effectType = getPickaxeEffectFromVoucher(item);
    
    if (!effectType) {
        player.sendMessage("§c§lCosmetic §7>> §cInvalid voucher!");
        return;
    }
    
    const effectTag = `pickaxeEffect_owned:${effectType}`;
    
    if (player.hasTag(effectTag)) {
        player.sendMessage(`§c§lCosmetic §7>> §cYou already own this pickaxe effect!`);
        return;
    }
    
    system.run(() => {
        player.addTag(effectTag);
    });
    
    const config = PICKAXE_EFFECT_CONFIG[effectType];
    player.sendMessage(`§a§lCosmetic §7>> §rYou unlocked ${config.color}${config.display.split("[§r")[1].split(" Pickaxe Effect")[0]}§r pickaxe effect!`);
    
    system.run(() => {
        player.runCommand(`playsound random.levelup @s`);
    });
    
    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;
        
        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);
        
        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Pickaxe Effect")) {
            if (currentItem.amount > 1) {
                currentItem.amount -= 1;
                inv.container.setItem(slot, currentItem);
            } else {
                inv.container.setItem(slot, undefined);
            }
        }
    });
}

// Desbloquear Walk Trail
function unlockWalkTrail(player, item) {
    const trailType = getWalkTrailFromVoucher(item);
    
    if (!trailType) {
        player.sendMessage("§c§lCosmetic §7>> §cInvalid voucher!");
        return;
    }
    
    const trailTag = `walkTrail_owned:${trailType}`;
    
    if (player.hasTag(trailTag)) {
        player.sendMessage(`§c§lCosmetic §7>> §cYou already own this walk trail!`);
        return;
    }
    
    system.run(() => {
        player.addTag(trailTag);
    });
    
    const config = WALK_TRAIL_CONFIG[trailType];
    player.sendMessage(`§a§lCosmetic §7>> §rYou unlocked ${config.color}${config.display.split("[§r")[1].split(" Trail Effect")[0]}§r walk trail!`);
    
    system.run(() => {
        player.runCommand(`playsound random.levelup @s`);
    });
    
    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;
        
        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);
        
        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Trail Effect")) {
            if (currentItem.amount > 1) {
                currentItem.amount -= 1;
                inv.container.setItem(slot, currentItem);
            } else {
                inv.container.setItem(slot, undefined);
            }
        }
    });
}

// Item use event (click derecho)
world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    
    if (!item || !item.nameTag) return;
    
    if (item.nameTag.includes("Pickaxe Effect")) {
        unlockPickaxeEffect(player, item);
    } else if (item.nameTag.includes("Trail Effect")) {
        unlockWalkTrail(player, item);
    }
});

// Bloquear colocación
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    
    try {
        const inventory = player.getComponent("minecraft:inventory");
        
        if (!inventory || !inventory.container) return;
        
        const hand = inventory.container.getItem(player.selectedSlotIndex);
        
        if (!hand || !hand.nameTag) return;
        if (!hand.nameTag.includes("Pickaxe Effect") && !hand.nameTag.includes("Trail Effect")) return;
        
        event.cancel = true;
        system.run(() => {
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place cosmetic vouchers!");
            player.runCommand(`playsound note.bass @s`);
        });
    } catch (e) {}
});

export { 
    PICKAXE_EFFECT_CONFIG, 
    WALK_TRAIL_CONFIG, 
    createPickaxeEffectVoucher, 
    createWalkTrailVoucher,
    getPickaxeEffectFromVoucher,
    getWalkTrailFromVoucher
};