import { world } from "@minecraft/server";

// Items que no se pueden colocar en el suelo
const BLOCKED_PLACEMENT_ITEMS = [
    // Notas
    "minecraft:paper",        // Money Note (papel)
    "minecraft:sunflower",    // Tokens Note (girasol)
    
    // Items de booster
    "minecraft:emerald",      // Pickaxe XP Booster
    "minecraft:gold_ingot",   // Token Booster
    "minecraft:amethyst_cluster", // Upgrade Booster
    "minecraft:orange_dye",   // Money Booster
    
    // Items de spawn/perks
    "minecraft:spawner",      // Custom item if used
    "minecraft:nether_star",  // Otros items especiales
];

world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    const inventory = player.getComponent("minecraft:inventory");
    
    if (!inventory || !inventory.container) return;
    
    const hand = inventory.container.getItem(player.selectedSlotIndex);
    
    if (!hand) return;
    
    // Verificar si el item está en la lista de bloqueados
    if (BLOCKED_PLACEMENT_ITEMS.includes(hand.typeId)) {
        // Verificar si tiene nameTag (items especiales)
        if (hand.nameTag && (
            hand.nameTag.includes("Note") ||
            hand.nameTag.includes("Booster") ||
            hand.nameTag.includes("Pickaxe")
        )) {
            event.cancel = true;
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place this item on the ground!");
            player.runCommand(`playsound note.bass @s`);
            return;
        }
    }
});

export { BLOCKED_PLACEMENT_ITEMS };