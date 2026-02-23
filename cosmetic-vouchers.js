import { world, system, ItemStack } from "@minecraft/server";

// ===========================
// PICKAXE EFFECT VOUCHERS
// ===========================
const PICKAXE_EFFECT_VOUCHERS = {
    "villager_happy": {
        display: "§a§lHappy Faces",
        particle: "minecraft:villager_happy",
        rarity: "§aCommon",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §ahappy faces§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §aCommon`,
            `§r§fEffect: §aHappy Faces`,
            `§r§fBound to: §eAccount`
        ]
    },
    "heart": {
        display: "§c§lLovely Hearts",
        particle: "minecraft:heart_particle",
        rarity: "§aUncommon",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §chearts§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fEffect: §cHearts`,
            `§r§fBound to: §eAccount`
        ]
    },
    "note": {
        display: "§d§lMusical Notes",
        particle: "minecraft:note_particle",
        rarity: "§aUncommon",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §dmusical notes§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fEffect: §dNotes`,
            `§r§fBound to: §eAccount`
        ]
    },
    "redstone": {
        display: "§c§lRedstone Dust",
        particle: "minecraft:redstone_ore_dust_particle",
        rarity: "§9Rare",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §credstone dust§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fEffect: §cRedstone`,
            `§r§fBound to: §eAccount`
        ]
    },
    "flame": {
        display: "§6§lFlame Trail",
        particle: "minecraft:basic_flame_particle",
        rarity: "§9Rare",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §6flames§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fEffect: §6Flames`,
            `§r§fBound to: §eAccount`
        ]
    },
    "smoke": {
        display: "§7§lSmoke Cloud",
        particle: "minecraft:large_smoke_particle",
        rarity: "§aCommon",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §7smoke§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §aCommon`,
            `§r§fEffect: §7Smoke`,
            `§r§fBound to: §eAccount`
        ]
    },
    "electric": {
        display: "§e§lElectric Sparks",
        particle: "minecraft:electric_spark_particle",
        rarity: "§5Epic",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §eelectric sparks§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fEffect: §eElectric`,
            `§r§fBound to: §eAccount`
        ]
    },
    "dragon_breath": {
        display: "§5§lDragon Breath",
        particle: "minecraft:dragon_breath_particle",
        rarity: "§6Legendary",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §5dragon breath§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fEffect: §5Dragon Breath`,
            `§r§fBound to: §eAccount`
        ]
    },
    "soul": {
        display: "§b§lSoul Flame",
        particle: "minecraft:soul_particle",
        rarity: "§6Legendary",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §bsoul flames§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fEffect: §bSoul Flame`,
            `§r§fBound to: §eAccount`
        ]
    },
    "blue_flame": {
        display: "§9§lBlue Flame",
        particle: "minecraft:blue_flame_particle",
        rarity: "§5Epic",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §9blue flames§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fEffect: §9Blue Flame`,
            `§r§fBound to: §eAccount`
        ]
    },
    "cherry": {
        display: "§d§lCherry Petals",
        particle: "minecraft:cherry_leaves_particle",
        rarity: "§3Mythic",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §dcherry petals§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §3Mythic`,
            `§r§fEffect: §dCherry Petals`,
            `§r§fBound to: §eAccount`
        ]
    },
    "end_rod": {
        display: "§f§lEnd Rod",
        particle: "minecraft:end_rod_particle",
        rarity: "§3Mythic",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §fend rod particles§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §3Mythic`,
            `§r§fEffect: §fEnd Rod`,
            `§r§fBound to: §eAccount`
        ]
    },
    "enchanting": {
        display: "§b§lEnchanting Runes",
        particle: "minecraft:enchanting_table_particle",
        rarity: "§5Epic",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §benchanting runes§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fEffect: §bRunes`,
            `§r§fBound to: §eAccount`
        ]
    },
    "lava": {
        display: "§c§lLava Drip",
        particle: "minecraft:dripping_lava_particle",
        rarity: "§9Rare",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §clava drips§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fEffect: §cLava Drip`,
            `§r§fBound to: §eAccount`
        ]
    },
    "portal": {
        display: "§5§lPortal Swirl",
        particle: "minecraft:portal_particle",
        rarity: "§6Legendary",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §5portal swirls§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fEffect: §5Portal`,
            `§r§fBound to: §eAccount`
        ]
    },
    "critical": {
        display: "§e§lCritical Hit",
        particle: "minecraft:critical_hit_emitter",
        rarity: "§aUncommon",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §ecritical hits§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fEffect: §eCrit Hits`,
            `§r§fBound to: §eAccount`
        ]
    },
    "snowflake": {
        display: "§b§lSnowflake",
        particle: "minecraft:falling_dust_top_snow_particle",
        rarity: "§9Rare",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §bsnowflakes§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fEffect: §bSnowflake`,
            `§r§fBound to: §eAccount`
        ]
    },
    "sparkler": {
        display: "§e§lSparkler",
        particle: "minecraft:sparkler_emitter",
        rarity: "§5Epic",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §esparkles§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fEffect: §eSparkler`,
            `§r§fBound to: §eAccount`
        ]
    },
    "wax": {
        display: "§6§lWax Drip",
        particle: "minecraft:wax_particle",
        rarity: "§aUncommon",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §6wax drips§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fEffect: §6Wax Drip`,
            `§r§fBound to: §eAccount`
        ]
    },
    "totem": {
        display: "§a§lTotem Aura",
        particle: "minecraft:totem_particle",
        rarity: "§6Legendary",
        lore: [
            `§r`,
            `§r§7Unlock a mining particle effect`,
            `§r§7that spawns §atotem particles§7 around`,
            `§r§7broken blocks when mining.`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fEffect: §aTotem`,
            `§r§fBound to: §eAccount`
        ]
    }
};

// ===========================
// WALK TRAIL VOUCHERS
// ===========================
const WALK_TRAIL_VOUCHERS = {
    "smoke_trail": {
        display: "§7§lSmoke Trail",
        particle: "minecraft:campfire_smoke_particle",
        rarity: "§aCommon",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §7smoke§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §aCommon`,
            `§r§fEffect: §7Smoke Trail`,
            `§r§fBound to: §eAccount`
        ]
    },
    "water_drip": {
        display: "§9§lWater Drip Trail",
        particle: "minecraft:drip_water_particle",
        rarity: "§aCommon",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §9water drips§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §aCommon`,
            `§r§fEffect: §9Water Drip`,
            `§r§fBound to: §eAccount`
        ]
    },
    "cherry_trail": {
        display: "§d§lCherry Blossom Trail",
        particle: "minecraft:cherry_leaves_particle",
        rarity: "§9Rare",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §dcherry petals§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fEffect: §dCherry Blossom`,
            `§r§fBound to: §eAccount`
        ]
    },
    "flame_trail": {
        display: "§6§lFlame Trail",
        particle: "minecraft:basic_flame_particle",
        rarity: "§9Rare",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §6flames§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fEffect: §6Flame Trail`,
            `§r§fBound to: §eAccount`
        ]
    },
    "electric_trail": {
        display: "§e§lElectric Trail",
        particle: "minecraft:electric_spark_particle",
        rarity: "§5Epic",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §eelectric sparks§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fEffect: §eElectric`,
            `§r§fBound to: §eAccount`
        ]
    },
    "soul_trail": {
        display: "§b§lSoul Trail",
        particle: "minecraft:soul_particle",
        rarity: "§6Legendary",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §bsoul flames§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fEffect: §bSoul Trail`,
            `§r§fBound to: §eAccount`
        ]
    },
    "portal_trail": {
        display: "§5§lPortal Trail",
        particle: "minecraft:portal_particle",
        rarity: "§6Legendary",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §5portal particles§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fEffect: §5Portal`,
            `§r§fBound to: §eAccount`
        ]
    },
    "end_rod_trail": {
        display: "§f§lEnd Rod Trail",
        particle: "minecraft:end_rod_particle",
        rarity: "§3Mythic",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §fend rod particles§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §3Mythic`,
            `§r§fEffect: §fEnd Rod`,
            `§r§fBound to: §eAccount`
        ]
    },
    "heart_trail": {
        display: "§c§lHeart Trail",
        particle: "minecraft:heart_particle",
        rarity: "§aUncommon",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §chearts§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fEffect: §cHearts`,
            `§r§fBound to: §eAccount`
        ]
    },
    "note_trail": {
        display: "§d§lMusic Note Trail",
        particle: "minecraft:note_particle",
        rarity: "§aUncommon",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §dmusical notes§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fEffect: §dMusic Notes`,
            `§r§fBound to: §eAccount`
        ]
    },
    "redstone_trail": {
        display: "§c§lRedstone Trail",
        particle: "minecraft:redstone_ore_dust_particle",
        rarity: "§9Rare",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §credstone dust§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fEffect: §cRedstone`,
            `§r§fBound to: §eAccount`
        ]
    },
    "dragon_breath_trail": {
        display: "§5§lDragon Breath Trail",
        particle: "minecraft:dragon_breath_particle",
        rarity: "§6Legendary",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §5dragon breath§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fEffect: §5Dragon Breath`,
            `§r§fBound to: §eAccount`
        ]
    },
    "blue_flame_trail": {
        display: "§9§lBlue Flame Trail",
        particle: "minecraft:blue_flame_particle",
        rarity: "§5Epic",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §9blue flames§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fEffect: §9Blue Flame`,
            `§r§fBound to: §eAccount`
        ]
    },
    "enchanting_trail": {
        display: "§b§lEnchanting Trail",
        particle: "minecraft:enchanting_table_particle",
        rarity: "§5Epic",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §benchanting runes§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fEffect: §bRunes`,
            `§r§fBound to: §eAccount`
        ]
    },
    "lava_trail": {
        display: "§c§lLava Trail",
        particle: "minecraft:dripping_lava_particle",
        rarity: "§9Rare",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §clava drips§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fEffect: §cLava`,
            `§r§fBound to: §eAccount`
        ]
    },
    "snowflake_trail": {
        display: "§b§lSnowflake Trail",
        particle: "minecraft:falling_dust_top_snow_particle",
        rarity: "§9Rare",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §bsnowflakes§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fEffect: §bSnowflake`,
            `§r§fBound to: §eAccount`
        ]
    },
    "totem_trail": {
        display: "§a§lTotem Trail",
        particle: "minecraft:totem_particle",
        rarity: "§6Legendary",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §atotem particles§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fEffect: §aTotem`,
            `§r§fBound to: §eAccount`
        ]
    },
    "sparkler_trail": {
        display: "§e§lSparkler Trail",
        particle: "minecraft:sparkler_emitter",
        rarity: "§5Epic",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §esparkles§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fEffect: §eSparkler`,
            `§r§fBound to: §eAccount`
        ]
    },
    "honey_trail": {
        display: "§6§lHoney Trail",
        particle: "minecraft:honey_drip_particle",
        rarity: "§aUncommon",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §6honey drips§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fEffect: §6Honey`,
            `§r§fBound to: §eAccount`
        ]
    },
    "villager_trail": {
        display: "§a§lHappy Trail",
        particle: "minecraft:villager_happy",
        rarity: "§aCommon",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §ahappy faces§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §aCommon`,
            `§r§fEffect: §aHappy Faces`,
            `§r§fBound to: §eAccount`
        ]
    },
    "critical_trail": {
        display: "§e§lCritical Trail",
        particle: "minecraft:critical_hit_emitter",
        rarity: "§aUncommon",
        lore: [
            `§r`,
            `§r§7Unlock a walking trail effect`,
            `§r§7that leaves §ecritical hits§7 behind you`,
            `§r§7as you walk.`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fEffect: §eCritical`,
            `§r§fBound to: §eAccount`
        ]
    }
};

// Crear Pickaxe Effect Voucher
function createPickaxeVoucher(effectType) {
    if (!PICKAXE_EFFECT_VOUCHERS[effectType]) {
        return null;
    }

    const config = PICKAXE_EFFECT_VOUCHERS[effectType];
    const voucherItem = new ItemStack("minecraft:diamond", 1);
    
    voucherItem.nameTag = "§r§8[§r§ePickaxe Effect Voucher§r§8]";
    voucherItem.setLore(config.lore);
    voucherItem.keepOnDeath = true;
    
    return { item: voucherItem, effectType: effectType };
}

// Crear Walk Trail Voucher
function createWalkTrailVoucher(trailType) {
    if (!WALK_TRAIL_VOUCHERS[trailType]) {
        return null;
    }

    const config = WALK_TRAIL_VOUCHERS[trailType];
    const voucherItem = new ItemStack("minecraft:emerald", 1);
    
    voucherItem.nameTag = "§r§8[§r§aWalk Trail Voucher§r§8]";
    voucherItem.setLore(config.lore);
    voucherItem.keepOnDeath = true;
    
    return { item: voucherItem, trailType: trailType };
}

// Obtener efecto de pickaxe desde voucher
function getPickaxeEffectFromVoucher(item) {
    if (!item || !item.nameTag) return null;
    
    if (!item.nameTag.includes("Pickaxe Effect Voucher")) {
        return null;
    }
    
    const lore = item.getLore();
    if (!lore) return null;
    
    for (const line of lore) {
        if (line.includes("Effect:")) {
            const effectName = line.replace(/§r§fEffect: /, "");
            
            // Buscar en el config cuál efecto coincide
            for (const [key, config] of Object.entries(PICKAXE_EFFECT_VOUCHERS)) {
                const configEffect = config.lore.find(l => l.includes("Effect:"));
                if (configEffect && configEffect.includes(effectName.substring(0, 10))) {
                    return key;
                }
            }
        }
    }
    
    return null;
}

// Obtener trail desde voucher
function getWalkTrailFromVoucher(item) {
    if (!item || !item.nameTag) return null;
    
    if (!item.nameTag.includes("Walk Trail Voucher")) {
        return null;
    }
    
    const lore = item.getLore();
    if (!lore) return null;
    
    for (const line of lore) {
        if (line.includes("Effect:")) {
            const effectName = line.replace(/§r§fEffect: /, "");
            
            // Buscar en el config cuál trail coincide
            for (const [key, config] of Object.entries(WALK_TRAIL_VOUCHERS)) {
                const configEffect = config.lore.find(l => l.includes("Effect:"));
                if (configEffect && configEffect.includes(effectName.substring(0, 10))) {
                    return key;
                }
            }
        }
    }
    
    return null;
}

// Reclamar Pickaxe Effect Voucher
function claimPickaxeVoucher(player, item) {
    const effectType = getPickaxeEffectFromVoucher(item);
    
    if (!effectType) {
        player.sendMessage("§c§lCosmetic Voucher §7>> §cInvalid voucher!");
        return;
    }
    
    const effectTag = `pickaxeEffect_owned:${effectType}`;
    
    if (player.hasTag(effectTag)) {
        player.sendMessage(`§c§lCosmetic Voucher §7>> §cYou already own this pickaxe effect!`);
        return;
    }
    
    system.run(() => {
        player.addTag(effectTag);
    });
    
    const config = PICKAXE_EFFECT_VOUCHERS[effectType];
    player.sendMessage(`§a§lCosmetic Voucher §7>> §rYou unlocked ${config.display}§r pickaxe effect!`);
    
    system.run(() => {
        player.runCommand(`playsound random.levelup @s`);
    });
    
    // Eliminar el item
    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;
        
        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);
        
        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Pickaxe Effect Voucher")) {
            if (currentItem.amount > 1) {
                currentItem.amount -= 1;
                inv.container.setItem(slot, currentItem);
            } else {
                inv.container.setItem(slot, undefined);
            }
        }
    });
}

// Reclamar Walk Trail Voucher
function claimWalkTrailVoucher(player, item) {
    const trailType = getWalkTrailFromVoucher(item);
    
    if (!trailType) {
        player.sendMessage("§c§lCosmetic Voucher §7>> §cInvalid voucher!");
        return;
    }
    
    const trailTag = `walkTrail_owned:${trailType}`;
    
    if (player.hasTag(trailTag)) {
        player.sendMessage(`§c§lCosmetic Voucher §7>> §cYou already own this walk trail!`);
        return;
    }
    
    system.run(() => {
        player.addTag(trailTag);
    });
    
    const config = WALK_TRAIL_VOUCHERS[trailType];
    player.sendMessage(`§a§lCosmetic Voucher §7>> §rYou unlocked ${config.display}§r walk trail!`);
    
    system.run(() => {
        player.runCommand(`playsound random.levelup @s`);
    });
    
    // Eliminar el item
    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;
        
        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);
        
        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Walk Trail Voucher")) {
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
    
    if (item.nameTag.includes("Pickaxe Effect Voucher")) {
        claimPickaxeVoucher(player, item);
    } else if (item.nameTag.includes("Walk Trail Voucher")) {
        claimWalkTrailVoucher(player, item);
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
        if (!hand.nameTag.includes("Pickaxe Effect Voucher") && !hand.nameTag.includes("Walk Trail Voucher")) return;
        
        event.cancel = true;
        system.run(() => {
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place cosmetic vouchers!");
            player.runCommand(`playsound note.bass @s`);
        });
    } catch (e) {}
});

// Comando para dar cosmetic vouchers
world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const rawMessage = event.message;
    const args = rawMessage.split(" ");
    
    if (args[0].toLowerCase() === "!cosmetic-voucher") {
        event.cancel = true;
        
        system.runTimeout(() => {
            if (!player.hasTag("admin")) {
                player.sendMessage("§cYou don't have permission to use this command.");
                return;
            }
            
            if (args.length < 4) {
                player.sendMessage("§c§lCosmetic Voucher §7>> §cUsage: !cosmetic-voucher <player> <mining|walking> <type> [quantity]");
                return;
            }
            
            const targetName = args[1];
            const category = args[2].toLowerCase();
            const type = args[3].toLowerCase();
            const quantity = args[4] ? parseInt(args[4]) : 1;
            
            if (isNaN(quantity) || quantity < 1 || quantity > 64) {
                player.sendMessage("§c§lCosmetic Voucher §7>> §cQuantity must be between 1 and 64!");
                return;
            }
            
            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§c§lCosmetic Voucher §7>> §cPlayer not found!");
                return;
            }
            
            const target = targetPlayers[0];
            
            let voucherData;
            let categoryName;
            
            if (category === "mining") {
                if (!PICKAXE_EFFECT_VOUCHERS[type]) {
                    const available = Object.keys(PICKAXE_EFFECT_VOUCHERS).join(", ");
                    player.sendMessage(`§c§lCosmetic Voucher §7>> §cInvalid mining effect! Available: ${available}`);
                    return;
                }
                voucherData = createPickaxeVoucher(type);
                categoryName = "pickaxe effect";
            } else if (category === "walking") {
                if (!WALK_TRAIL_VOUCHERS[type]) {
                    const available = Object.keys(WALK_TRAIL_VOUCHERS).join(", ");
                    player.sendMessage(`§c§lCosmetic Voucher §7>> §cInvalid walking trail! Available: ${available}`);
                    return;
                }
                voucherData = createWalkTrailVoucher(type);
                categoryName = "walk trail";
            } else {
                player.sendMessage("§c§lCosmetic Voucher §7>> §cCategory must be 'mining' or 'walking'!");
                return;
            }
            
            if (!voucherData) {
                player.sendMessage("§c§lCosmetic Voucher §7>> §cError creating voucher!");
                return;
            }
            
            const inv = target.getComponent("minecraft:inventory");
            if (!inv || !inv.container) {
                player.sendMessage("§c§lCosmetic Voucher §7>> §cError accessing target's inventory!");
                return;
            }
            
            // Dar múltiples vouchers
            voucherData.item.amount = quantity;
            inv.container.addItem(voucherData.item);
            
            player.sendMessage(`§a§lCosmetic Voucher §7>> §rGiven §e${quantity}x §r${categoryName} voucher(s) §7(§b${type}§7) §rto §b${targetName}§r!`);
            target.sendMessage(`§a§lCosmetic Voucher §7>> §rYou received §e${quantity}x §r${categoryName} voucher(s)!`);
            
            system.run(() => {
                player.runCommand(`playsound random.levelup @s`);
                target.runCommand(`playsound random.levelup @s`);
            });
        }, 1);
    }
});

export { 
    PICKAXE_EFFECT_VOUCHERS, 
    WALK_TRAIL_VOUCHERS, 
    createPickaxeVoucher, 
    createWalkTrailVoucher
};
