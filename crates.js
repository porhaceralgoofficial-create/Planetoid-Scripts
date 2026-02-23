import { world, system, ItemStack } from "@minecraft/server";
import { getKeyTypeFromItem } from "./key-system.js";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";

const crateConfig = {
  // 1. COMMON CRATE
  "minecraft:light_gray_wool": { 
    keyId: "planetoid:common_key", 
    crateName: "Common", 
    color: "7",
    rewards: [
      { item: "minecraft:diamond", amount: 5, chance: 12.5 },
      { item: "minecraft:iron_ingot", amount: 10, chance: 12.0 },
      { item: "minecraft:gold_ingot", amount: 8, chance: 11.5 },
      { item: "minecraft:emerald", amount: 3, chance: 11.0 },
      { item: "minecraft:coal", amount: 20, chance: 10.5 },
      { item: "minecraft:redstone", amount: 15, chance: 10.0 },
      { item: "minecraft:lapis_lazuli", amount: 12, chance: 9.5 },
      { item: "minecraft:quartz", amount: 10, chance: 9.0 },
      { item: "minecraft:glowstone_dust", amount: 8, chance: 8.0 },
      { item: "minecraft:ender_pearl", amount: 2, chance: 6.0 }
    ]
  },

  // 2. UNCOMMON CRATE
  "minecraft:lime_wool": { 
    keyId: "planetoid:uncommon_key", 
    crateName: "Uncommon", 
    color: "a",
    rewards: [
      { item: "minecraft:diamond", amount: 8, chance: 10.0 },
      { item: "minecraft:emerald", amount: 5, chance: 9.5 },
      { item: "minecraft:gold_block", amount: 3, chance: 9.0 },
      { item: "minecraft:iron_block", amount: 5, chance: 8.5 },
      { item: "minecraft:ender_pearl", amount: 4, chance: 8.0 },
      { item: "minecraft:obsidian", amount: 10, chance: 7.5 },
      { item: "minecraft:enchanted_golden_apple", amount: 1, chance: 7.0 },
      { item: "minecraft:blaze_rod", amount: 3, chance: 6.5 },
      { item: "minecraft:ghast_tear", amount: 2, chance: 6.0 },
      { item: "minecraft:nether_wart", amount: 15, chance: 5.5 },
      { item: "minecraft:magma_cream", amount: 8, chance: 5.0 },
      { item: "minecraft:prismarine_shard", amount: 10, chance: 4.5 }
    ]
  },

  // 3. RARE CRATE
  "minecraft:light_blue_wool": { 
    keyId: "planetoid:rare_key", 
    crateName: "Rare",
    color: "9",
    rewards: [
      { item: "minecraft:diamond", amount: 10, chance: 9.0 },
      { item: "minecraft:emerald", amount: 8, chance: 8.5 },
      { item: "minecraft:netherite_scrap", amount: 2, chance: 8.0 },
      { item: "minecraft:gold_block", amount: 5, chance: 7.5 },
      { item: "minecraft:enchanted_golden_apple", amount: 1, chance: 7.0 },
      { item: "minecraft:iron_block", amount: 8, chance: 7.0 },
      { item: "minecraft:obsidian", amount: 16, chance: 6.5 },
      { item: "minecraft:ender_pearl", amount: 5, chance: 6.5 },
      { item: "minecraft:blaze_rod", amount: 4, chance: 6.0 },
      { item: "minecraft:ghast_tear", amount: 3, chance: 6.0 },
      { item: "minecraft:diamond_block", amount: 1, chance: 5.5 },
      { item: "minecraft:nether_wart", amount: 20, chance: 5.5 },
      { item: "minecraft:magma_cream", amount: 10, chance: 5.0 },
      { item: "minecraft:chorus_fruit", amount: 15, chance: 4.5 },
      { item: "minecraft:prismarine_shard", amount: 12, chance: 4.0 }
    ]
  },

  // 4. EPIC CRATE
  "minecraft:purple_wool": { 
    keyId: "planetoid:epic_key", 
    crateName: "Epic",
    color: "5",
    rewards: [
      { item: "minecraft:diamond_block", amount: 3, chance: 7.5 },
      { item: "minecraft:netherite_scrap", amount: 5, chance: 7.0 },
      { item: "minecraft:emerald_block", amount: 2, chance: 6.5 },
      { item: "minecraft:enchanted_golden_apple", amount: 3, chance: 6.5 },
      { item: "minecraft:nether_star", amount: 1, chance: 6.0 },
      { item: "minecraft:totem_of_undying", amount: 1, chance: 6.0 },
      { item: "minecraft:elytra", amount: 1, chance: 5.5 },
      { item: "minecraft:shulker_shell", amount: 4, chance: 5.5 },
      { item: "minecraft:dragon_breath", amount: 8, chance: 5.0 },
      { item: "minecraft:trident", amount: 1, chance: 5.0 },
      { item: "minecraft:netherite_ingot", amount: 2, chance: 4.5 },
      { item: "minecraft:beacon", amount: 1, chance: 4.5 },
      { item: "minecraft:heart_of_the_sea", amount: 2, chance: 4.0 },
      { item: "minecraft:nautilus_shell", amount: 5, chance: 4.0 },
      { item: "minecraft:ancient_debris", amount: 3, chance: 3.5 },
      { item: "minecraft:end_crystal", amount: 2, chance: 3.5 },
      { item: "minecraft:ghast_tear", amount: 10, chance: 3.0 },
      { item: "minecraft:blaze_rod", amount: 15, chance: 3.0 },
      { item: "minecraft:ender_eye", amount: 8, chance: 2.5 },
      { item: "minecraft:wither_skeleton_skull", amount: 1, chance: 2.0 }
    ]
  },

  // 5. LEGENDARY CRATE
  "minecraft:yellow_wool": { 
    keyId: "planetoid:legendary_key", 
    crateName: "Legendary",
    color: "6",
    rewards: [
      { item: "minecraft:netherite_ingot", amount: 4, chance: 6.5 },
      { item: "minecraft:diamond_block", amount: 6, chance: 6.2 },
      { item: "minecraft:nether_star", amount: 2, chance: 6.0 },
      { item: "minecraft:enchanted_golden_apple", amount: 6, chance: 5.8 },
      { item: "minecraft:elytra", amount: 1, chance: 5.5 },
      { item: "minecraft:totem_of_undying", amount: 2, chance: 5.5 },
      { item: "minecraft:beacon", amount: 1, chance: 5.2 },
      { item: "minecraft:netherite_block", amount: 1, chance: 5.0 },
      { item: "minecraft:trident", amount: 2, chance: 5.0 },
      { item: "minecraft:end_crystal", amount: 4, chance: 4.8 },
      { item: "minecraft:ancient_debris", amount: 6, chance: 4.5 },
      { item: "minecraft:shulker_box", amount: 1, chance: 4.5 },
      { item: "minecraft:wither_skeleton_skull", amount: 2, chance: 4.2 },
      { item: "minecraft:dragon_breath", amount: 20, chance: 4.0 },
      { item: "minecraft:heart_of_the_sea", amount: 4, chance: 4.0 },
      { item: "minecraft:conduit", amount: 1, chance: 3.8 },
      { item: "minecraft:emerald_block", amount: 6, chance: 3.5 },
      { item: "minecraft:enchanted_book", amount: 4, chance: 3.5 },
      { item: "minecraft:experience_bottle", amount: 48, chance: 3.0 },
      { item: "minecraft:golden_apple", amount: 20, chance: 3.0 },
      { item: "minecraft:name_tag", amount: 6, chance: 2.8 },
      { item: "minecraft:saddle", amount: 4, chance: 2.5 },
      { item: "minecraft:horse_armor_diamond", amount: 3, chance: 2.0 },
      { item: "minecraft:music_disc_pigstep", amount: 1, chance: 1.5 },
      { item: "minecraft:lodestone", amount: 3, chance: 1.0 }
    ]
  },

  // 6. MYTHIC CRATE
  "minecraft:cyan_wool": { 
    keyId: "planetoid:mythic_key", 
    crateName: "Mythic",
    color: "3",
    rewards: [
      { item: "minecraft:netherite_block", amount: 2, chance: 6.0 },
      { item: "minecraft:nether_star", amount: 3, chance: 5.8 },
      { item: "minecraft:elytra", amount: 2, chance: 5.5 },
      { item: "minecraft:beacon", amount: 2, chance: 5.2 },
      { item: "minecraft:totem_of_undying", amount: 3, chance: 5.0 },
      { item: "minecraft:enchanted_golden_apple", amount: 10, chance: 5.0 },
      { item: "minecraft:netherite_ingot", amount: 8, chance: 4.8 },
      { item: "minecraft:trident", amount: 3, chance: 4.5 },
      { item: "minecraft:end_crystal", amount: 6, chance: 4.5 },
      { item: "minecraft:shulker_box", amount: 2, chance: 4.2 },
      { item: "minecraft:ancient_debris", amount: 12, chance: 4.0 },
      { item: "minecraft:wither_skeleton_skull", amount: 4, chance: 4.0 },
      { item: "minecraft:conduit", amount: 2, chance: 3.8 },
      { item: "minecraft:heart_of_the_sea", amount: 6, chance: 3.5 },
      { item: "minecraft:dragon_head", amount: 1, chance: 3.5 },
      { item: "minecraft:dragon_breath", amount: 32, chance: 3.2 },
      { item: "minecraft:diamond_block", amount: 12, chance: 3.0 },
      { item: "minecraft:emerald_block", amount: 12, chance: 3.0 },
      { item: "minecraft:enchanted_book", amount: 6, chance: 3.0 },
      { item: "minecraft:music_disc_pigstep", amount: 2, chance: 2.5 },
      { item: "minecraft:recovery_compass", amount: 2, chance: 2.5 },
      { item: "minecraft:echo_shard", amount: 6, chance: 2.0 },
      { item: "minecraft:disc_fragment_5", amount: 4, chance: 2.0 },
      { item: "minecraft:reinforced_deepslate", amount: 6, chance: 1.8 },
      { item: "minecraft:sniffer_egg", amount: 1, chance: 1.5 },
      { item: "minecraft:sculk_catalyst", amount: 6, chance: 1.5 },
      { item: "minecraft:lodestone", amount: 4, chance: 1.2 },
      { item: "minecraft:respawn_anchor", amount: 2, chance: 1.0 },
      { item: "minecraft:crying_obsidian", amount: 12, chance: 1.0 },
      { item: "minecraft:budding_amethyst", amount: 2, chance: 0.5 }
    ]
  },

  // 7. UNREAL CRATE
  "minecraft:pink_wool": { 
    keyId: "planetoid:unreal_key", 
    crateName: "Unreal",
    color: "l§9",
    rewards: [
      { item: "minecraft:netherite_block", amount: 4, chance: 5.5 },
      { item: "minecraft:nether_star", amount: 5, chance: 5.3 },
      { item: "minecraft:elytra", amount: 3, chance: 5.0 },
      { item: "minecraft:beacon", amount: 3, chance: 4.8 },
      { item: "minecraft:dragon_egg", amount: 1, chance: 4.5 },
      { item: "minecraft:totem_of_undying", amount: 5, chance: 4.5 },
      { item: "minecraft:enchanted_golden_apple", amount: 20, chance: 4.2 },
      { item: "minecraft:netherite_ingot", amount: 15, chance: 4.0 },
      { item: "minecraft:trident", amount: 4, chance: 4.0 },
      { item: "minecraft:end_crystal", amount: 10, chance: 3.8 },
      { item: "minecraft:shulker_box", amount: 4, chance: 3.5 },
      { item: "minecraft:ancient_debris", amount: 20, chance: 3.5 },
      { item: "minecraft:wither_skeleton_skull", amount: 6, chance: 3.2 },
      { item: "minecraft:conduit", amount: 3, chance: 3.0 },
      { item: "minecraft:heart_of_the_sea", amount: 8, chance: 3.0 },
      { item: "minecraft:dragon_head", amount: 2, chance: 2.8 },
      { item: "minecraft:dragon_breath", amount: 48, chance: 2.8 },
      { item: "minecraft:diamond_block", amount: 20, chance: 2.5 },
      { item: "minecraft:emerald_block", amount: 20, chance: 2.5 },
      { item: "minecraft:enchanted_book", amount: 10, chance: 2.5 },
      { item: "minecraft:music_disc_pigstep", amount: 3, chance: 2.2 },
      { item: "minecraft:recovery_compass", amount: 3, chance: 2.2 },
      { item: "minecraft:echo_shard", amount: 10, chance: 2.0 },
      { item: "minecraft:disc_fragment_5", amount: 6, chance: 2.0 },
      { item: "minecraft:reinforced_deepslate", amount: 10, chance: 1.8 },
      { item: "minecraft:sniffer_egg", amount: 2, chance: 1.8 },
      { item: "minecraft:sculk_catalyst", amount: 10, chance: 1.5 },
      { item: "minecraft:lodestone", amount: 6, chance: 1.5 },
      { item: "minecraft:respawn_anchor", amount: 4, chance: 1.2 },
      { item: "minecraft:crying_obsidian", amount: 20, chance: 1.2 },
      { item: "minecraft:gilded_blackstone", amount: 48, chance: 1.0 },
      { item: "minecraft:budding_amethyst", amount: 6, chance: 1.0 },
      { item: "minecraft:spawner", amount: 1, chance: 0.5 }
    ]
  },

  // 8. EVENT CRATE
  "minecraft:blue_wool": { 
    keyId: "planetoid:event_key", 
    crateName: "Event",
    color: "b",
    rewards: [
      { item: "minecraft:diamond_block", amount: 10, chance: 5.5 },
      { item: "minecraft:netherite_ingot", amount: 5, chance: 5.3 },
      { item: "minecraft:nether_star", amount: 3, chance: 5.0 },
      { item: "minecraft:enchanted_golden_apple", amount: 10, chance: 5.0 },
      { item: "minecraft:totem_of_undying", amount: 2, chance: 4.8 },
      { item: "minecraft:elytra", amount: 2, chance: 4.5 },
      { item: "minecraft:beacon", amount: 1, chance: 4.3 },
      { item: "minecraft:trident", amount: 2, chance: 4.0 },
      { item: "minecraft:netherite_block", amount: 2, chance: 4.0 },
      { item: "minecraft:dragon_breath", amount: 16, chance: 3.8 },
      { item: "minecraft:ancient_debris", amount: 8, chance: 3.5 },
      { item: "minecraft:shulker_box", amount: 2, chance: 3.5 },
      { item: "minecraft:wither_skeleton_skull", amount: 3, chance: 3.3 },
      { item: "minecraft:end_crystal", amount: 5, chance: 3.0 },
      { item: "minecraft:conduit", amount: 1, chance: 3.0 },
      { item: "minecraft:heart_of_the_sea", amount: 4, chance: 2.8 },
      { item: "minecraft:enchanted_book", amount: 5, chance: 2.5 },
      { item: "minecraft:experience_bottle", amount: 64, chance: 2.5 },
      { item: "minecraft:emerald_block", amount: 8, chance: 2.3 },
      { item: "minecraft:music_disc_pigstep", amount: 1, chance: 2.0 },
      { item: "minecraft:recovery_compass", amount: 1, chance: 2.0 },
      { item: "minecraft:echo_shard", amount: 3, chance: 1.8 },
      { item: "minecraft:disc_fragment_5", amount: 2, chance: 1.5 },
      { item: "minecraft:sculk_catalyst", amount: 4, chance: 1.5 },
      { item: "minecraft:sculk_shrieker", amount: 3, chance: 1.3 },
      { item: "minecraft:reinforced_deepslate", amount: 2, chance: 1.0 },
      { item: "minecraft:suspicious_stew", amount: 8, chance: 1.0 },
      { item: "minecraft:goat_horn", amount: 4, chance: 0.8 },
      { item: "minecraft:sniffer_egg", amount: 1, chance: 0.5 },
      { item: "minecraft:dragon_head", amount: 1, chance: 0.3 }
    ]
  },

  // 9. MAD MAX CRATE
  "minecraft:magenta_wool": { 
    keyId: "planetoid:madmax_key", 
    crateName: "Mad Max",
    color: "d",
    rewards: [
      { item: "minecraft:netherite_block", amount: 3, chance: 5.0 },
      { item: "minecraft:nether_star", amount: 5, chance: 4.8 },
      { item: "minecraft:elytra", amount: 2, chance: 4.5 },
      { item: "minecraft:beacon", amount: 1, chance: 4.3 },
      { item: "minecraft:dragon_egg", amount: 1, chance: 4.0 },
      { item: "minecraft:totem_of_undying", amount: 5, chance: 4.0 },
      { item: "minecraft:enchanted_golden_apple", amount: 16, chance: 3.8 },
      { item: "minecraft:netherite_ingot", amount: 10, chance: 3.5 },
      { item: "minecraft:trident", amount: 3, chance: 3.5 },
      { item: "minecraft:end_crystal", amount: 8, chance: 3.3 },
      { item: "minecraft:shulker_box", amount: 3, chance: 3.0 },
      { item: "minecraft:ancient_debris", amount: 16, chance: 3.0 },
      { item: "minecraft:wither_skeleton_skull", amount: 5, chance: 2.8 },
      { item: "minecraft:conduit", amount: 2, chance: 2.5 },
      { item: "minecraft:heart_of_the_sea", amount: 5, chance: 2.5 },
      { item: "minecraft:dragon_head", amount: 1, chance: 2.3 },
      { item: "minecraft:dragon_breath", amount: 32, chance: 2.3 },
      { item: "minecraft:diamond_block", amount: 16, chance: 2.0 },
      { item: "minecraft:emerald_block", amount: 16, chance: 2.0 },
      { item: "minecraft:enchanted_book", amount: 8, chance: 2.0 },
      { item: "minecraft:music_disc_pigstep", amount: 2, chance: 1.8 },
      { item: "minecraft:recovery_compass", amount: 2, chance: 1.8 },
      { item: "minecraft:echo_shard", amount: 8, chance: 1.5 },
      { item: "minecraft:disc_fragment_5", amount: 5, chance: 1.5 },
      { item: "minecraft:reinforced_deepslate", amount: 8, chance: 1.3 },
      { item: "minecraft:sniffer_egg", amount: 2, chance: 1.3 },
      { item: "minecraft:sculk_catalyst", amount: 8, chance: 1.0 },
      { item: "minecraft:sculk_shrieker", amount: 6, chance: 1.0 },
      { item: "minecraft:lodestone", amount: 5, chance: 1.0 },
      { item: "minecraft:respawn_anchor", amount: 3, chance: 0.8 },
      { item: "minecraft:crying_obsidian", amount: 16, chance: 0.8 },
      { item: "minecraft:gilded_blackstone", amount: 32, chance: 0.5 },
      { item: "minecraft:budding_amethyst", amount: 4, chance: 0.5 },
      { item: "minecraft:spawner", amount: 1, chance: 0.3 },
      { item: "minecraft:command_block", amount: 1, chance: 0.1 }
    ]
  },

  // 10. RIPPER CRATE
  "minecraft:red_wool": { 
    keyId: "planetoid:ripper_key", 
    crateName: "Ripper",
    color: "l§c",
    rewards: [
      { item: "minecraft:netherite_block", amount: 5, chance: 5.0 },
      { item: "minecraft:nether_star", amount: 6, chance: 4.8 },
      { item: "minecraft:elytra", amount: 3, chance: 4.6 },
      { item: "minecraft:beacon", amount: 2, chance: 4.4 },
      { item: "minecraft:dragon_egg", amount: 1, chance: 4.2 },
      { item: "minecraft:totem_of_undying", amount: 6, chance: 4.0 },
      { item: "minecraft:enchanted_golden_apple", amount: 25, chance: 3.8 },
      { item: "minecraft:netherite_ingot", amount: 20, chance: 3.6 },
      { item: "minecraft:trident", amount: 5, chance: 3.4 },
      { item: "minecraft:end_crystal", amount: 12, chance: 3.2 },
      { item: "minecraft:shulker_box", amount: 5, chance: 3.0 },
      { item: "minecraft:ancient_debris", amount: 25, chance: 3.0 },
      { item: "minecraft:wither_skeleton_skull", amount: 8, chance: 2.8 },
      { item: "minecraft:conduit", amount: 3, chance: 2.6 },
      { item: "minecraft:heart_of_the_sea", amount: 10, chance: 2.4 },
      { item: "minecraft:dragon_head", amount: 2, chance: 2.2 },
      { item: "minecraft:dragon_breath", amount: 64, chance: 2.2 },
      { item: "minecraft:diamond_block", amount: 25, chance: 2.0 },
      { item: "minecraft:emerald_block", amount: 25, chance: 2.0 },
      { item: "minecraft:enchanted_book", amount: 12, chance: 2.0 },
      { item: "minecraft:music_disc_pigstep", amount: 4, chance: 1.8 },
      { item: "minecraft:recovery_compass", amount: 4, chance: 1.8 },
      { item: "minecraft:echo_shard", amount: 12, chance: 1.6 },
      { item: "minecraft:disc_fragment_5", amount: 8, chance: 1.6 },
      { item: "minecraft:reinforced_deepslate", amount: 12, chance: 1.4 },
      { item: "minecraft:sniffer_egg", amount: 3, chance: 1.4 },
      { item: "minecraft:sculk_catalyst", amount: 12, chance: 1.2 },
      { item: "minecraft:lodestone", amount: 8, chance: 1.2 },
      { item: "minecraft:respawn_anchor", amount: 5, chance: 1.0 },
      { item: "minecraft:crying_obsidian", amount: 32, chance: 1.0 },
      { item: "minecraft:gilded_blackstone", amount: 64, chance: 0.8 },
      { item: "minecraft:budding_amethyst", amount: 8, chance: 0.8 },
      { item: "minecraft:spawner", amount: 2, chance: 0.5 },
      { item: "minecraft:command_block", amount: 1, chance: 0.3 }
    ]
  },

  // 11. TAG CRATE
  "minecraft:white_wool": { 
    keyId: "planetoid:tag_key", 
    crateName: "Tag",
    color: "m",
    rewards: [
      { item: "minecraft:name_tag", amount: 10, chance: 15.0 },
      { item: "minecraft:diamond", amount: 15, chance: 12.0 },
      { item: "minecraft:emerald", amount: 12, chance: 10.0 },
      { item: "minecraft:gold_block", amount: 8, chance: 9.0 },
      { item: "minecraft:enchanted_book", amount: 5, chance: 8.0 },
      { item: "minecraft:experience_bottle", amount: 32, chance: 7.5 },
      { item: "minecraft:totem_of_undying", amount: 1, chance: 7.0 },
      { item: "minecraft:elytra", amount: 1, chance: 6.5 },
      { item: "minecraft:nether_star", amount: 2, chance: 6.0 },
      { item: "minecraft:beacon", amount: 1, chance: 5.5 },
      { item: "minecraft:shulker_box", amount: 2, chance: 5.0 },
      { item: "minecraft:netherite_ingot", amount: 4, chance: 4.5 },
      { item: "minecraft:ancient_debris", amount: 6, chance: 4.0 }
    ]
  },

  // 12. LUMINOUS CRATE
  "minecraft:brown_wool": { 
    keyId: "planetoid:luminous_key", 
    crateName: "Luminous",
    color: "l§t",
    rewards: [
      { item: "minecraft:glowstone", amount: 32, chance: 10.0 },
      { item: "minecraft:sea_lantern", amount: 24, chance: 9.5 },
      { item: "minecraft:shroomlight", amount: 20, chance: 9.0 },
      { item: "minecraft:redstone_lamp", amount: 16, chance: 8.5 },
      { item: "minecraft:torch", amount: 64, chance: 8.0 },
      { item: "minecraft:jack_o_lantern", amount: 32, chance: 7.5 },
      { item: "minecraft:lantern", amount: 24, chance: 7.0 },
      { item: "minecraft:soul_lantern", amount: 20, chance: 6.5 },
      { item: "minecraft:glow_lichen", amount: 32, chance: 6.0 },
      { item: "minecraft:glow_ink_sac", amount: 16, chance: 5.5 },
      { item: "minecraft:glow_squid_spawn_egg", amount: 1, chance: 5.0 },
      { item: "minecraft:beacon", amount: 1, chance: 4.5 },
      { item: "minecraft:end_rod", amount: 16, chance: 4.0 },
      { item: "minecraft:sea_pickle", amount: 20, chance: 3.5 },
      { item: "minecraft:conduit", amount: 1, chance: 3.0 },
      { item: "minecraft:magma_block", amount: 32, chance: 2.5 }
    ]
  },

  // 13. PLANETOID CRATE
  "minecraft:black_wool": { 
    keyId: "planetoid:planetoid_key", 
    crateName: "Planetoid",
    color: "4",
    rewards: [
      { item: "minecraft:netherite_block", amount: 6, chance: 5.0 },
      { item: "minecraft:nether_star", amount: 8, chance: 4.8 },
      { item: "minecraft:elytra", amount: 4, chance: 4.6 },
      { item: "minecraft:beacon", amount: 3, chance: 4.4 },
      { item: "minecraft:dragon_egg", amount: 2, chance: 4.2 },
      { item: "minecraft:totem_of_undying", amount: 8, chance: 4.0 },
      { item: "minecraft:enchanted_golden_apple", amount: 32, chance: 3.8 },
      { item: "minecraft:netherite_ingot", amount: 25, chance: 3.6 },
      { item: "minecraft:trident", amount: 6, chance: 3.4 },
      { item: "minecraft:end_crystal", amount: 15, chance: 3.2 },
      { item: "minecraft:shulker_box", amount: 6, chance: 3.0 },
      { item: "minecraft:ancient_debris", amount: 32, chance: 3.0 },
      { item: "minecraft:wither_skeleton_skull", amount: 10, chance: 2.8 },
      { item: "minecraft:conduit", amount: 4, chance: 2.6 },
      { item: "minecraft:heart_of_the_sea", amount: 12, chance: 2.4 },
      { item: "minecraft:dragon_head", amount: 3, chance: 2.2 },
      { item: "minecraft:dragon_breath", amount: 64, chance: 2.2 },
      { item: "minecraft:diamond_block", amount: 32, chance: 2.0 },
      { item: "minecraft:emerald_block", amount: 32, chance: 2.0 },
      { item: "minecraft:enchanted_book", amount: 15, chance: 2.0 },
      { item: "minecraft:music_disc_pigstep", amount: 5, chance: 1.8 },
      { item: "minecraft:recovery_compass", amount: 5, chance: 1.8 },
      { item: "minecraft:echo_shard", amount: 15, chance: 1.6 },
      { item: "minecraft:disc_fragment_5", amount: 10, chance: 1.6 },
      { item: "minecraft:reinforced_deepslate", amount: 15, chance: 1.4 },
      { item: "minecraft:sniffer_egg", amount: 4, chance: 1.4 },
      { item: "minecraft:sculk_catalyst", amount: 15, chance: 1.2 },
      { item: "minecraft:lodestone", amount: 10, chance: 1.2 },
      { item: "minecraft:respawn_anchor", amount: 6, chance: 1.0 },
      { item: "minecraft:crying_obsidian", amount: 48, chance: 1.0 },
      { item: "minecraft:gilded_blackstone", amount: 64, chance: 0.8 },
      { item: "minecraft:budding_amethyst", amount: 10, chance: 0.8 },
      { item: "minecraft:spawner", amount: 3, chance: 0.6 },
      { item: "minecraft:command_block", amount: 2, chance: 0.4 }
    ]
  },

  // 14. MONTHLY CRATE
  "minecraft:green_wool": { 
    keyId: "planetoid:monthly_key", 
    crateName: "Monthly",
    color: "l§u",
    rewards: [
      { item: "minecraft:netherite_block", amount: 4, chance: 5.5 },
      { item: "minecraft:nether_star", amount: 6, chance: 5.2 },
      { item: "minecraft:elytra", amount: 3, chance: 5.0 },
      { item: "minecraft:beacon", amount: 2, chance: 4.8 },
      { item: "minecraft:dragon_egg", amount: 1, chance: 4.5 },
      { item: "minecraft:totem_of_undying", amount: 4, chance: 4.5 },
      { item: "minecraft:enchanted_golden_apple", amount: 16, chance: 4.2 },
      { item: "minecraft:netherite_ingot", amount: 12, chance: 4.0 },
      { item: "minecraft:trident", amount: 4, chance: 3.8 },
      { item: "minecraft:end_crystal", amount: 8, chance: 3.6 },
      { item: "minecraft:shulker_box", amount: 3, chance: 3.4 },
      { item: "minecraft:ancient_debris", amount: 16, chance: 3.2 },
      { item: "minecraft:wither_skeleton_skull", amount: 5, chance: 3.0 },
      { item: "minecraft:conduit", amount: 2, chance: 2.8 },
      { item: "minecraft:heart_of_the_sea", amount: 6, chance: 2.6 },
      { item: "minecraft:dragon_head", amount: 1, chance: 2.4 },
      { item: "minecraft:dragon_breath", amount: 32, chance: 2.4 },
      { item: "minecraft:diamond_block", amount: 16, chance: 2.2 },
      { item: "minecraft:emerald_block", amount: 16, chance: 2.2 },
      { item: "minecraft:enchanted_book", amount: 8, chance: 2.0 },
      { item: "minecraft:music_disc_pigstep", amount: 2, chance: 1.8 },
      { item: "minecraft:recovery_compass", amount: 2, chance: 1.8 },
      { item: "minecraft:echo_shard", amount: 8, chance: 1.6 },
      { item: "minecraft:disc_fragment_5", amount: 5, chance: 1.6 },
      { item: "minecraft:reinforced_deepslate", amount: 8, chance: 1.4 },
      { item: "minecraft:sniffer_egg", amount: 2, chance: 1.4 },
      { item: "minecraft:sculk_catalyst", amount: 8, chance: 1.2 },
      { item: "minecraft:lodestone", amount: 5, chance: 1.2 },
      { item: "minecraft:respawn_anchor", amount: 3, chance: 1.0 },
      { item: "minecraft:crying_obsidian", amount: 24, chance: 1.0 },
      { item: "minecraft:gilded_blackstone", amount: 48, chance: 0.8 },
      { item: "minecraft:budding_amethyst", amount: 5, chance: 0.8 },
      { item: "minecraft:spawner", amount: 1, chance: 0.5 }
    ]
  },

  // 15. VOTE CRATE
  "minecraft:gray_wool": { 
    keyId: "planetoid:vote_key", 
    crateName: "Vote",
    color: "l§s",
    rewards: [
      { item: "minecraft:diamond", amount: 10, chance: 12.0 },
      { item: "minecraft:emerald", amount: 8, chance: 11.0 },
      { item: "minecraft:gold_block", amount: 5, chance: 10.0 },
      { item: "minecraft:iron_block", amount: 8, chance: 9.5 },
      { item: "minecraft:enchanted_golden_apple", amount: 2, chance: 9.0 },
      { item: "minecraft:experience_bottle", amount: 24, chance: 8.5 },
      { item: "minecraft:enchanted_book", amount: 3, chance: 8.0 },
      { item: "minecraft:name_tag", amount: 5, chance: 7.5 },
      { item: "minecraft:totem_of_undying", amount: 1, chance: 7.0 },
      { item: "minecraft:elytra", amount: 1, chance: 6.5 },
      { item: "minecraft:nether_star", amount: 1, chance: 6.0 },
      { item: "minecraft:beacon", amount: 1, chance: 5.0 }
    ]
  }
};

const CRATE_LOCATIONS = {};
const pendingRewardForms = new Map();

function loadCrateLocations() {
    for (const woolType in crateConfig) {
        const rarity = crateConfig[woolType].crateName.toLowerCase().replace(" ", "");
        try {
            const savedX = world.getDynamicProperty(`crate_${rarity}_x`);
            const savedY = world.getDynamicProperty(`crate_${rarity}_y`);
            const savedZ = world.getDynamicProperty(`crate_${rarity}_z`);
            
            if (savedX !== undefined && savedY !== undefined && savedZ !== undefined) {
                CRATE_LOCATIONS[woolType] = { x: savedX, y: savedY, z: savedZ };
            }
        } catch {}
    }
}

function saveCrateLocation(woolType, x, y, z) {
    const rarity = crateConfig[woolType].crateName.toLowerCase().replace(" ", "");
    world.setDynamicProperty(`crate_${rarity}_x`, x);
    world.setDynamicProperty(`crate_${rarity}_y`, y);
    world.setDynamicProperty(`crate_${rarity}_z`, z);
    CRATE_LOCATIONS[woolType] = { x, y, z };
}

function selectReward(rewards) {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const reward of rewards) {
        cumulative += reward.chance;
        if (random <= cumulative) {
            return reward;
        }
    }
    
    return rewards[0];
}

function getItemTexture(itemId) {
    const itemName = itemId.replace("minecraft:", "");
    return `textures/items/${itemName}`;
}

loadCrateLocations();

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;
  
  if (block.typeId !== "minecraft:chest") return;
  
  const blockBelow = block.below();
  const woolType = blockBelow?.typeId;
  
  if (!woolType?.includes("wool")) return;
  
  const crate = crateConfig[woolType];
  if (!crate) return;
  
  event.cancel = true;
  
  if (!CRATE_LOCATIONS[woolType]) {
      saveCrateLocation(woolType, block.location.x, block.location.y, block.location.z);
  }
  
  system.run(() => {
      openCrate(player, crate);
  });
});

function openCrate(player, crate) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) return;
    
    let hasKey = false;
    let keySlot = -1;
    
    // Obtener el tipo de key esperado (ej: "epic" desde "planetoid:epic_key")
    const expectedKeyType = crate.keyId.replace("planetoid:", "").replace("_key", "");
    
    for (let i = 0; i < inventory.container.size; i++) {
        const item = inventory.container.getItem(i);
        
        if (item && item.typeId === "minecraft:tripwire_hook") {
            const keyType = getKeyTypeFromItem(item);
            
            if (keyType === expectedKeyType) {
                hasKey = true;
                keySlot = i;
                break;
            }
        }
    }
    
    if (!hasKey) {
        player.sendMessage(`§8§lCrates §7>> §rYou need a §${crate.color}${crate.crateName} Key §rto open this crate!`);
        player.runCommand("playsound note.bass @s");
        return;
    }
    
    const keyItem = inventory.container.getItem(keySlot);
    if (keyItem.amount > 1) {
        keyItem.amount--;
        inventory.container.setItem(keySlot, keyItem);
    } else {
        inventory.container.setItem(keySlot, undefined);
    }
    
    const reward = selectReward(crate.rewards);
    
    player.runCommand(`give @s ${reward.item} ${reward.amount}`);
    
    const itemName = reward.item.replace("minecraft:", "").replace(/_/g, " ");
    player.sendMessage(`§8§lCrates §7>> §rYou opened a §${crate.color}${crate.crateName} Crate §rand received §e${reward.amount}x §f${itemName}§r!`);
    player.runCommand("playsound random.levelup @s");
}

world.afterEvents.entityHitBlock.subscribe((event) => {
  const player = event.damagingEntity;
  
  if (player.typeId !== "minecraft:player") return;
  
  const block = event.hitBlock;
  
  if (block.typeId !== "minecraft:chest") return;
  
  const blockBelow = block.below();
  const woolType = blockBelow?.typeId;
  
  if (!woolType?.includes("wool")) return;
  
  const crate = crateConfig[woolType];
  if (!crate) return;
  
  system.run(() => {
    tryShowRewardForm(player, crate);
  });
});

function tryShowRewardForm(player, crate) {
    if (pendingRewardForms.has(player.id)) {
        return;
    }
    
    pendingRewardForms.set(player.id, true);
    
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryShow = () => {
        attempts++;
        
        showRewardForm(player, crate).then(() => {
            pendingRewardForms.delete(player.id);
        }).catch(() => {
            if (attempts < maxAttempts) {
                system.runTimeout(tryShow, 5);
            } else {
                pendingRewardForms.delete(player.id);
            }
        });
    };
    
    system.runTimeout(tryShow, 5);
}

async function showRewardForm(player, crate) {
    const form = new ActionFormData();
    form.title(`§${crate.color}§l${crate.crateName} Crate §r§8- Rewards`);
    form.body(`§fClick on a reward to see more information.\n§8Total: ${crate.rewards.length} possible rewards`);
    
    for (const reward of crate.rewards) {
        const itemName = reward.item.replace("minecraft:", "").replace(/_/g, " ");
        const capitalizedName = itemName.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        const texture = getItemTexture(reward.item);
        
        form.button(`§f${capitalizedName}\n§e${reward.amount}x §8- §a(${reward.chance}%)`, texture);
    }
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const selectedReward = crate.rewards[response.selection];
    if (selectedReward) {
        showRewardInfo(player, selectedReward, crate);
    }
}

async function showRewardInfo(player, reward, crate) {
    const itemName = reward.item.replace("minecraft:", "").replace(/_/g, " ");
    const capitalizedName = itemName.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    
    const form = new MessageFormData();
    form.title(`§${crate.color}§l${capitalizedName}`);
    form.body(
        `§f§lReward Information\n` +
        `§8━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `§7Item: §f${capitalizedName}\n` +
        `§7Amount: §e${reward.amount}x\n` +
        `§7Chance: §a${reward.chance}%\n` +
        `§7Crate: §${crate.color}${crate.crateName}\n\n` +
        `§8━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `§7This reward can be obtained by opening\n` +
        `§7a §${crate.color}${crate.crateName} Crate §7with a §${crate.color}${crate.crateName} Key§7.`
    );
    form.button1("§aBack to Rewards");
    form.button2("§cClose");
    
    const response = await form.show(player);
    
    if (response.selection === 0) {
        tryShowRewardForm(player, crate);
    }
}

world.beforeEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;
  
  if (block.typeId !== "minecraft:chest") return;
  
  const blockBelow = block.below();
  const woolType = blockBelow?.typeId;
  
  if (!woolType?.includes("wool")) return;
  
  event.cancel = true;
});

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const msg = event.message.toLowerCase();
    
    if (msg.startsWith("!reset-crate-")) {
        const crateName = msg.replace("!reset-crate-", "");
        
        event.cancel = true;
        
        system.runTimeout(() => {
            if (!player.hasTag("admin")) {
                player.sendMessage("§cYou don't have permission to use this command.");
                return;
            }
            
            let found = false;
            for (const woolType in crateConfig) {
                const rarity = crateConfig[woolType].crateName.toLowerCase().replace(" ", "");
                if (rarity === crateName) {
                    world.setDynamicProperty(`crate_${rarity}_x`, undefined);
                    world.setDynamicProperty(`crate_${rarity}_y`, undefined);
                    world.setDynamicProperty(`crate_${rarity}_z`, undefined);
                    delete CRATE_LOCATIONS[woolType];
                    
                    player.sendMessage(`§8§lCrates §7>> §rReset §${crateConfig[woolType].color}${crateConfig[woolType].crateName} Crate §rlocation!`);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                player.sendMessage("§cInvalid crate name! Use: common, uncommon, rare, epic, legendary, mythic, unreal, event, madmax, ripper, tag, luminous, planetoid, monthly, vote");
            }
        }, 1);
    }
});

world.afterEvents.itemCompleteUse.subscribe((event) => {
    updateKeyLore(event.source);
});

world.afterEvents.playerSpawn.subscribe((event) => {
    updateKeyLore(event.player);
});

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        updateKeyLore(player);
    }
}, 100);

function updateKeyLore(player) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) return;

    for (let i = 0; i < inventory.container.size; i++) {
        const item = inventory.container.getItem(i);
        if (!item) continue;

        let newLore = null;

        switch (item.typeId) {
            case "planetoid:common_key":
                newLore = [
                    "§r§7A basic key found throughout",
                    "§r§7the mines. Opens common crates",
                    "§r§7for starter rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Mining blocks",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §7Common Crate"
                ];
                break;

            case "planetoid:uncommon_key":
                newLore = [
                    "§r§aAn uncommon key with basic",
                    "§r§aenergy. Opens uncommon crates",
                    "§r§afor decent rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Mining blocks §8(Uncommon)",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §aUncommon Crate"
                ];
                break;

            case "planetoid:rare_key":
                newLore = [
                    "§r§9An uncommon key with a faint",
                    "§r§9blue glow. Opens rare crates",
                    "§r§9for better rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Mining blocks §8(Rare)",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §9Rare Crate"
                ];
                break;

            case "planetoid:epic_key":
                newLore = [
                    "§r§5A powerful key radiating",
                    "§r§5purple energy. Opens epic crates",
                    "§r§5for valuable rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Mining blocks §8(Very Rare)",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §5Epic Crate"
                ];
                break;

            case "planetoid:legendary_key":
                newLore = [
                    "§r§6A legendary key forged from",
                    "§r§6pure gold. Opens legendary crates",
                    "§r§6for extraordinary rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Mining blocks §8(Extremely Rare)",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §6Legendary Crate"
                ];
                break;

            case "planetoid:mythic_key":
                newLore = [
                    "§r§3A mythic key pulsing with",
                    "§r§3ancient power. Opens mythic crates",
                    "§r§3for incredible rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Mining blocks §8(§4Ultra Rare§8)",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §3Mythic Crate"
                ];
                break;

            case "planetoid:unreal_key":
                newLore = [
                    "§r§l§9An unreal key beyond",
                    "§r§l§9comprehension. Opens unreal crates",
                    "§r§l§9for unimaginable rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Mining blocks §8(§4§lGODLY§8)",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §l§9Unreal Crate"
                ];
                break;

            case "planetoid:event_key":
                newLore = [
                    "§r§bA mysterious event key that",
                    "§r§bshimmers with magic. Opens event",
                    "§r§bcrates for exclusive rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Special Events",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §bEvent Crate"
                ];
                break;

            case "planetoid:madmax_key":
                newLore = [
                    "§r§d§l§nTHE ULTIMATE KEY",
                    "§r§dA key of unimaginable power.",
                    "§r§dOpens the Mad Max crate for",
                    "§r§dthe most insane rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Mining blocks §8(§4§lULTRA RARE§8)",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §dMad Max Crate"
                ];
                break;

            case "planetoid:ripper_key":
                newLore = [
                    "§r§l§cRIPPER KEY",
                    "§r§cA key for the most elite.",
                    "§r§cOpens the Ripper crate for",
                    "§r§cexclusive VIP rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Ripper Rank Exclusive",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §l§cRipper Crate"
                ];
                break;

            case "planetoid:tag_key":
                newLore = [
                    "§r§mA special key for tag",
                    "§r§menthusiasts. Opens tag crates",
                    "§r§mfor name tag rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Special Missions",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §mTag Crate"
                ];
                break;

            case "planetoid:luminous_key":
                newLore = [
                    "§r§l§tA glowing key radiating",
                    "§r§l§tpure light. Opens luminous crates",
                    "§r§l§tfor illuminating rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Special Events",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §l§tLuminous Crate"
                ];
                break;

            case "planetoid:planetoid_key":
                newLore = [
                    "§r§4THE PLANETOID KEY",
                    "§r§4The key to the server's best",
                    "§r§4crate. Opens planetoid crates",
                    "§r§4for ultimate rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Ultra Rare Drop",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §4Planetoid Crate"
                ];
                break;

            case "planetoid:monthly_key":
                newLore = [
                    "§r§l§uA monthly exclusive key",
                    "§r§l§uthat resets each month. Opens",
                    "§r§l§umonthly crates for limited rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Monthly Events",
                    "§r§8  • Discord giveaways",
                    "§r§8  • Purchase on Discord",
                    "§r",
                    "§r§8Used at: §l§uMonthly Crate"
                ];
                break;

            case "planetoid:vote_key":
                newLore = [
                    "§r§l§sA key earned by voting",
                    "§r§l§sfor the server. Opens vote crates",
                    "§r§l§sfor voting rewards.",
                    "§r",
                    "§r§8How to obtain:",
                    "§r§8  • Voting for the server",
                    "§r§8  • Discord giveaways",
                    "§r",
                    "§r§8Used at: §l§sVote Crate"
                ];
                break;
        }

        if (newLore) {
            const currentLore = item.getLore();
            
            if (currentLore.length === newLore.length && 
                currentLore.every((line, index) => line === newLore[index])) {
                continue;
            }

            try {
                item.setLore(newLore);
                inventory.container.setItem(i, item);
            } catch (e) {
                try {
                    item.clearDynamicProperties();
                    item.setLore(newLore);
                    inventory.container.setItem(i, item);
                } catch (e2) {
                    try {
                        inventory.container.setItem(i, undefined);
                        player.runCommand(`give @s ${item.typeId} ${item.amount}`);
                    } catch (e3) {
                    }
                }
            }
        }
    }
}