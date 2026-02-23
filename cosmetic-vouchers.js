const PICKAXE_EFFECT_VOUCHERS = {
    villager_happy: {
        display: { name: '\u00A7r\u00A78[\u00A7r Villager Happy]', lore: ['\u00A7r This effect brings happiness to villagers!'] },
        particle: 'happy_particles'
    },
    heart: {
        display: { name: '\u00A7r\u00A78[\u00A7r Heart]', lore: ['\u00A7r A heart warming effect!'] },
        particle: 'heart_particles'
    },
    note: {
        display: { name: '\u00A7r\u00A78[\u00A7r Note]', lore: ['\u00A7r A musical effect!'] },
        particle: 'note_particles'
    },
    redstone: {
        display: { name: '\u00A7r\u00A78[\u00A7r Redstone]', lore: ['\u00A7r A spark of redstone energy!'] },
        particle: 'redstone_particles'
    },
    flame: {
        display: { name: '\u00A7r\u00A78[\u00A7r Flame]', lore: ['\u00A7r A blazing effect!'] },
        particle: 'flame_particles'
    },
    smoke: {
        display: { name: '\u00A7r\u00A78[\u00A7r Smoke]', lore: ['\u00A7r A smoky effect!'] },
        particle: 'smoke_particles'
    },
    electric: {
        display: { name: '\u00A7r\u00A78[\u00A7r Electric]', lore: ['\u00A7r An electric effect!'] },
        particle: 'electric_particles'
    },
    dragon_breath: {
        display: { name: '\u00A7r\u00A78[\u00A7r Dragon Breath]', lore: ['\u00A7r A fiery dragon breath effect!'] },
        particle: 'dragon_breath_particles'
    },
    soul: {
        display: { name: '\u00A7r\u00A78[\u00A7r Soul]', lore: ['\u00A7r A soul effect!'] },
        particle: 'soul_particles'
    },
    blue_flame: {
        display: { name: '\u00A7r\u00A78[\u00A7r Blue Flame]', lore: ['\u00A7r A blue flame effect!'] },
        particle: 'blue_flame_particles'
    },
    cherry: {
        display: { name: '\u00A7r\u00A78[\u00A7r Cherry]', lore: ['\u00A7r A cherry blossom effect!'] },
        particle: 'cherry_particles'
    },
    end_rod: {
        display: { name: '\u00A7r\u00A78[\u00A7r End Rod]', lore: ['\u00A7r An end rod effect!'] },
        particle: 'end_rod_particles'
    },
    enchanting: {
        display: { name: '\u00A7r\u00A78[\u00A7r Enchanting]', lore: ['\u00A7r An enchanting effect!'] },
        particle: 'enchanting_particles'
    },
    lava: {
        display: { name: '\u00A7r\u00A78[\u00A7r Lava]', lore: ['\u00A7r A lava effect!'] },
        particle: 'lava_particles'
    },
    portal: {
        display: { name: '\u00A7r\u00A78[\u00A7r Portal]', lore: ['\u00A7r A portal effect!'] },
        particle: 'portal_particles'
    },
    critical: {
        display: { name: '\u00A7r\u00A78[\u00A7r Critical]', lore: ['\u00A7r A critical effect!'] },
        particle: 'critical_particles'
    },
    snowflake: {
        display: { name: '\u00A7r\u00A78[\u00A7r Snowflake]', lore: ['\u00A7r A snowflake effect!'] },
        particle: 'snowflake_particles'
    },
    sparkler: {
        display: { name: '\u00A7r\u00A78[\u00A7r Sparkler]', lore: ['\u00A7r A sparkler effect!'] },
        particle: 'sparkler_particles'
    },
    wax: {
        display: { name: '\u00A7r\u00A78[\u00A7r Wax]', lore: ['\u00A7r A wax effect!'] },
        particle: 'wax_particles'
    },
    totem: {
        display: { name: '\u00A7r\u00A78[\u00A7r Totem]', lore: ['\u00A7r A totem effect!'] },
        particle: 'totem_particles'
    }
};

const WALK_TRAIL_VOUCHERS = {
    smoke_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Smoke Trail]', lore: ['\u00A7r A smoky trail!'] },
        particle: 'smoke_trail_particles'
    },
    water_drip: {
        display: { name: '\u00A7r\u00A78[\u00A7r Water Drip]', lore: ['\u00A7r A water drip trail!'] },
        particle: 'water_drip_particles'
    },
    cherry_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Cherry Trail]', lore: ['\u00A7r A cherry trail!'] },
        particle: 'cherry_trail_particles'
    },
    flame_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Flame Trail]', lore: ['\u00A7r A fiery trail!'] },
        particle: 'flame_trail_particles'
    },
    electric_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Electric Trail]', lore: ['\u00A7r An electric trail!'] },
        particle: 'electric_trail_particles'
    },
    soul_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Soul Trail]', lore: ['\u00A7r A soul trail!'] },
        particle: 'soul_trail_particles'
    },
    portal_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Portal Trail]', lore: ['\u00A7r A portal trail!'] },
        particle: 'portal_trail_particles'
    },
    end_rod_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r End Rod Trail]', lore: ['\u00A7r An end rod trail!'] },
        particle: 'end_rod_trail_particles'
    },
    heart_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Heart Trail]', lore: ['\u00A7r A heart trail!'] },
        particle: 'heart_trail_particles'
    },
    note_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Note Trail]', lore: ['\u00A7r A musical trail!'] },
        particle: 'note_trail_particles'
    },
    redstone_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Redstone Trail]', lore: ['\u00A7r A redstone trail!'] },
        particle: 'redstone_trail_particles'
    },
    dragon_breath_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Dragon Breath Trail]', lore: ['\u00A7r A fiery dragon breath trail!'] },
        particle: 'dragon_breath_trail_particles'
    },
    blue_flame_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Blue Flame Trail]', lore: ['\u00A7r A blue flame trail!'] },
        particle: 'blue_flame_trail_particles'
    },
    enchanting_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Enchanting Trail]', lore: ['\u00A7r An enchanting trail!'] },
        particle: 'enchanting_trail_particles'
    },
    lava_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Lava Trail]', lore: ['\u00A7r A lava trail!'] },
        particle: 'lava_trail_particles'
    },
    snowflake_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Snowflake Trail]', lore: ['\u00A7r A snowflake trail!'] },
        particle: 'snowflake_trail_particles'
    },
    totem_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Totem Trail]', lore: ['\u00A7r A totem trail!'] },
        particle: 'totem_trail_particles'
    },
    sparkler_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Sparkler Trail]', lore: ['\u00A7r A sparkler trail!'] },
        particle: 'sparkler_trail_particles'
    },
    honey_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Honey Trail]', lore: ['\u00A7r A honey trail!'] },
        particle: 'honey_trail_particles'
    },
    villager_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Villager Trail]', lore: ['\u00A7r A villager trail!'] },
        particle: 'villager_trail_particles'
    },
    critical_trail: {
        display: { name: '\u00A7r\u00A78[\u00A7r Critical Trail]', lore: ['\u00A7r A critical trail!'] },
        particle: 'critical_trail_particles'
    }
};

function createPickaxeVoucher(effectType) {
    const voucher = PICKAXE_EFFECT_VOUCHERS[effectType];
    if (!voucher) return null;
    return new ItemStack('minecraft:diamond', 1, { display: { name: voucher.display.name, lore: voucher.display.lore }, particle: voucher.particle });
}

function createWalkTrailVoucher(trailType) {
    const voucher = WALK_TRAIL_VOUCHERS[trailType];
    if (!voucher) return null;
    return new ItemStack('minecraft:emerald', 1, { display: { name: voucher.display.name, lore: voucher.display.lore }, particle: voucher.particle });
}

function getEffectFromVoucher(voucher) {
    const lore = voucher.display.lore.join('|');
    const effectMatch = lore.match(/\u00A7r (.+)/);
    return effectMatch ? effectMatch[1] : null;
}

function claimVoucher(player, voucherType, voucher) {
    player.tags.add(`${voucherType}_owned:${voucher.display.name}`);
}

world.beforeEvents.itemUse.subscribe(event => {
    // Handle right-click claiming
});

world.beforeEvents.playerPlaceBlock.subscribe(event => {
    // Block placement logic
});

function handleCommand(command) {
    const args = command.split(' ');
    if (args[0] === '!cosmetic-voucher') {
        const player = args[1];
        const type = args[2];
        const effect = args[3];
        const quantity = args[4];
        // Implement logic based on mining|walking and effectType
    }
}

