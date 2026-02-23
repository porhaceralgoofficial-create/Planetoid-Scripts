import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { PICKAXE_EFFECT_CONFIG, WALK_TRAIL_CONFIG } from "./cosmetic-vouchers.js";

const pendingForms = new Map();

function getOwnedPickaxeEffects(player) {
    const tags = player.getTags();
    const owned = [];
    for (const tag of tags) {
        if (tag.startsWith("pickaxeEffect_owned:")) {
            const effectType = tag.replace("pickaxeEffect_owned:", "");
            if (PICKAXE_EFFECT_CONFIG[effectType]) {
                owned.push(effectType);
            }
        }
    }
    return owned;
}

function getOwnedWalkTrails(player) {
    const tags = player.getTags();
    const owned = [];
    for (const tag of tags) {
        if (tag.startsWith("walkTrail_owned:")) {
            const trailType = tag.replace("walkTrail_owned:", "");
            if (WALK_TRAIL_CONFIG[trailType]) {
                owned.push(trailType);
            }
        }
    }
    return owned;
}

function getActivePickaxeEffect(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("pickaxeEffect_active:")) {
            return tag.replace("pickaxeEffect_active:", "");
        }
    }
    return null;
}

function getActiveWalkTrail(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("walkTrail_active:")) {
            return tag.replace("walkTrail_active:", "");
        }
    }
    return null;
}

function activatePickaxeEffect(player, effectType) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("pickaxeEffect_active:")) {
            player.removeTag(tag);
        }
    }
    system.run(() => {
        player.addTag(`pickaxeEffect_active:${effectType}`);
    });
    const config = PICKAXE_EFFECT_CONFIG[effectType];
    player.sendMessage(`§a§lCosmetic §7>> §rActivated ${config.color}${config.display.split("[§r")[1].split(" Pickaxe Effect")[0]}§r!`);
    player.runCommand("playsound random.orb @s");
}

function deactivatePickaxeEffect(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("pickaxeEffect_active:")) {
            player.removeTag(tag);
        }
    }
    player.sendMessage(`§a§lCosmetic §7>> §rDeactivated pickaxe effect!`);
    player.runCommand("playsound random.pop @s");
}

function activateWalkTrail(player, trailType) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("walkTrail_active:")) {
            player.removeTag(tag);
        }
    }
    system.run(() => {
        player.addTag(`walkTrail_active:${trailType}`);
    });
    const config = WALK_TRAIL_CONFIG[trailType];
    player.sendMessage(`§a§lCosmetic §7>> §rActivated ${config.color}${config.display.split("[§r")[1].split(" Trail Effect")[0]}§r!`);
    player.runCommand("playsound random.orb @s");
}

function deactivateWalkTrail(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("walkTrail_active:")) {
            player.removeTag(tag);
        }
    }
    player.sendMessage(`§a§lCosmetic §7>> §rDeactivated walk trail!`);
    player.runCommand("playsound random.pop @s");
}

async function showCosmeticsMenu(player) {
    const form = new ActionFormData();
    form.title("§l§6Cosmetics");
    form.body("§fManage your cosmetic effects:");
    form.button("§l§ePickaxe Effects\n§r§7Manage mining particles", "textures/items/diamond_pickaxe");
    form.button("§l§aWalk Trails\n§r§7Manage walk effects", "textures/items/leather_boots");
    const response = await form.show(player);
    if (response.canceled) return;
    if (response.selection === 0) {
        await showPickaxeEffectsMenu(player);
    } else if (response.selection === 1) {
        await showWalkTrailsMenu(player);
    }
}

async function showPickaxeEffectsMenu(player) {
    const owned = getOwnedPickaxeEffects(player);
    const active = getActivePickaxeEffect(player);
    const form = new ActionFormData();
    form.title("§l§ePickaxe Effects");
    if (owned.length === 0) {
        form.body("§cYou don't own any pickaxe effects yet!\n§7Obtain them from crates or the store.");
        form.button("§cBack", "textures/ui/cancel");
        const response = await form.show(player);
        if (!response.canceled) {
            await showCosmeticsMenu(player);
        }
        return;
    }
    form.body(`§fOwned: §e${owned.length}§f effects\n§fActive: ${active ? PICKAXE_EFFECT_CONFIG[active].color + PICKAXE_EFFECT_CONFIG[active].display.split("[§r")[1].split(" Pickaxe Effect")[0] : "§7None"}`);
    for (const effectType of owned) {
        const config = PICKAXE_EFFECT_CONFIG[effectType];
        const isActive = active === effectType;
        const statusIcon = isActive ? "§a✓" : "§7○";
        form.button(`${statusIcon} ${config.color}${config.display.split("[§r")[1].split(" Pickaxe Effect")[0]}\n§r${config.rarityColor}${config.rarityName}`, "textures/items/diamond");
    }
    if (active) {
        form.button("§c§lDeactivate Current Effect", "textures/ui/cancel");
    }
    form.button("§7Back", "textures/ui/cancel");
    const response = await form.show(player);
    if (response.canceled) return;
    if (response.selection === owned.length + (active ? 1 : 0)) {
        await showCosmeticsMenu(player);
        return;
    }
    if (active && response.selection === owned.length) {
        deactivatePickaxeEffect(player);
        system.runTimeout(() => { showPickaxeEffectsMenu(player); }, 10);
        return;
    }
    const selectedEffect = owned[response.selection];
    activatePickaxeEffect(player, selectedEffect);
    system.runTimeout(() => { showPickaxeEffectsMenu(player); }, 10);
}

async function showWalkTrailsMenu(player) {
    const owned = getOwnedWalkTrails(player);
    const active = getActiveWalkTrail(player);
    const form = new ActionFormData();
    form.title("§l§aWalk Trails");
    if (owned.length === 0) {
        form.body("§cYou don't own any walk trails yet!\n§7Obtain them from crates or the store.");
        form.button("§cBack", "textures/ui/cancel");
        const response = await form.show(player);
        if (!response.canceled) {
            await showCosmeticsMenu(player);
        }
        return;
    }
    form.body(`§fOwned: §e${owned.length}§f trails\n§fActive: ${active ? WALK_TRAIL_CONFIG[active].color + WALK_TRAIL_CONFIG[active].display.split("[§r")[1].split(" Trail Effect")[0] : "§7None"}`);
    for (const trailType of owned) {
        const config = WALK_TRAIL_CONFIG[trailType];
        const isActive = active === trailType;
        const statusIcon = isActive ? "§a✓" : "§7○";
        form.button(`${statusIcon} ${config.color}${config.display.split("[§r")[1].split(" Trail Effect")[0]}\n§r${config.rarityColor}${config.rarityName}`, "textures/items/emerald");
    }
    if (active) {
        form.button("§c§lDeactivate Current Trail", "textures/ui/cancel");
    }
    form.button("§7Back", "textures/ui/cancel");
    const response = await form.show(player);
    if (response.canceled) return;
    if (response.selection === owned.length + (active ? 1 : 0)) {
        await showCosmeticsMenu(player);
        return;
    }
    if (active && response.selection === owned.length) {
        deactivateWalkTrail(player);
        system.runTimeout(() => { showWalkTrailsMenu(player); }, 10);
        return;
    }
    const selectedTrail = owned[response.selection];
    activateWalkTrail(player, selectedTrail);
    system.runTimeout(() => { showWalkTrailsMenu(player); }, 10);
}

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const msg = event.message.toLowerCase();
    if (msg === "!cosmetics") {
        event.cancel = true;
        system.runTimeout(() => {
            if (pendingForms.has(player.id)) return;
            pendingForms.set(player.id, true);
            showCosmeticsMenu(player).finally(() => {
                pendingForms.delete(player.id);
            });
        }, 1);
    }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    const activeEffect = getActivePickaxeEffect(player);
    if (!activeEffect) return;
    const config = PICKAXE_EFFECT_CONFIG[activeEffect];
    if (!config) return;
    const blockLocation = { x: block.location.x + 0.5, y: block.location.y + 0.5, z: block.location.z + 0.5 };
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const radius = 0.4;
        const offsetX = Math.cos(angle) * radius;
        const offsetZ = Math.sin(angle) * radius;
        const offsetY = (Math.random() - 0.5) * 0.4;
        const particleLocation = { x: blockLocation.x + offsetX, y: blockLocation.y + offsetY, z: blockLocation.z + offsetZ };
        try {
            player.dimension.spawnParticle(config.particle, particleLocation);
        } catch (e) {}
    }
});

const lastPlayerPositions = new Map();
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        try {
            const activeTrail = getActiveWalkTrail(player);
            if (!activeTrail) continue;
            const config = WALK_TRAIL_CONFIG[activeTrail];
            if (!config) continue;
            const currentPos = player.location;
            const lastPos = lastPlayerPositions.get(player.id);
            if (lastPos) {
                const distance = Math.sqrt(Math.pow(currentPos.x - lastPos.x, 2) + Math.pow(currentPos.z - lastPos.z, 2));
                if (distance > 0.1) {
                    const trailLocation = { x: currentPos.x, y: currentPos.y + 0.1, z: currentPos.z };
                    try {
                        player.dimension.spawnParticle(config.particle, trailLocation);
                    } catch (e) {}
                }
            }
            lastPlayerPositions.set(player.id, { x: currentPos.x, y: currentPos.y, z: currentPos.z });
        } catch (e) {}
    }
}, 5);

export { getOwnedPickaxeEffects, getOwnedWalkTrails, getActivePickaxeEffect, getActiveWalkTrail, activatePickaxeEffect, deactivatePickaxeEffect, activateWalkTrail, deactivateWalkTrail };
