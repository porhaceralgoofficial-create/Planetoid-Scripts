import { world, system, ItemStack } from "@minecraft/server";

// Crear Pet Shard item
function createPetShard(amount = 1) {
    const shardItem = new ItemStack("minecraft:prismarine_shard", amount);
    
    shardItem.nameTag = "§r§b§lPet Shard";
    shardItem.setLore([
        "§r",
        "§r§7A mystical shard used to upgrade",
        "§r§7your pet's predetermined boosters.",
        "§r",
        "§r§6Information",
        "§r§6| §fUsed for: §bPet Upgrades",
        "§r§6| §fRarity: §bRare",
        "§r",
        "§r§8Use §f!pet§8 to upgrade your pets!"
    ]);
    shardItem.keepOnDeath = true;

    return shardItem;
}

// Verificar si un item es un Pet Shard (por lore)
function isPetShard(item) {
    if (!item || item.typeId !== "minecraft:prismarine_shard") return false;
    
    const lore = item.getLore();
    if (!lore || lore.length === 0) return false;
    
    // Verificar si tiene el lore característico
    return lore.some(line => line.includes("Pet Upgrades"));
}

// Contar Pet Shards en el inventario del jugador
function getPetShardCount(player) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) return 0;

    let count = 0;
    for (let i = 0; i < inventory.container.size; i++) {
        const item = inventory.container.getItem(i);
        if (isPetShard(item)) {
            count += item.amount;
        }
    }

    return count;
}

// Remover Pet Shards del inventario del jugador
function removePetShards(player, amount) {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory || !inventory.container) return false;

    let remaining = amount;

    for (let i = 0; i < inventory.container.size && remaining > 0; i++) {
        const item = inventory.container.getItem(i);
        if (!isPetShard(item)) continue;

        if (item.amount >= remaining) {
            if (item.amount === remaining) {
                inventory.container.setItem(i, undefined);
            } else {
                item.amount -= remaining;
                inventory.container.setItem(i, item);
            }
            remaining = 0;
        } else {
            remaining -= item.amount;
            inventory.container.setItem(i, undefined);
        }
    }

    return remaining === 0;
}

// Bloquear colocación de Pet Shards
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;

    try {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory || !inventory.container) return;

        const hand = inventory.container.getItem(player.selectedSlotIndex);
        if (!isPetShard(hand)) return;

        event.cancel = true;
        system.run(() => {
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place this item on the ground!");
            player.runCommand("playsound note.bass @s");
        });
    } catch (e) {}
});

// Actualizar lore de Pet Shards en el inventario (para prismarine shards sin lore)
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory || !inventory.container) continue;

        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (!item) continue;

            // Solo actualizar prismarine shards sin lore personalizado
            if (item.typeId === "minecraft:prismarine_shard") {
                const lore = item.getLore();
                if (!lore || lore.length === 0 || !lore.some(line => line.includes("Pet Upgrades"))) {
                    const newShard = createPetShard(item.amount);
                    inventory.container.setItem(i, newShard);
                }
            }
        }
    }
}, 100);

// Comando: !pet shard <player> <cantidad>
world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const args = event.message.split(" ");

    if (args[0].toLowerCase() === "!pet" && args[1]?.toLowerCase() === "shard") {
        event.cancel = true;

        system.runTimeout(() => {
            if (!player.hasTag("Rank:§dOwner")) {
                player.sendMessage("§cYou don't have permission to use this command.");
                return;
            }

            if (args.length < 4) {
                player.sendMessage("§c§lPet Shard §7>> §cUsage: !pet shard <player> <quantity>");
                return;
            }

            const targetName = args[2];
            const quantity = parseInt(args[3]);

            if (isNaN(quantity) || quantity <= 0) {
                player.sendMessage("§c§lPet Shard §7>> §cQuantity must be a positive number!");
                return;
            }

            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§c§lPet Shard §7>> §cPlayer not found!");
                return;
            }

            const target = targetPlayers[0];
            const inv = target.getComponent("minecraft:inventory");
            if (!inv || !inv.container) {
                player.sendMessage("§c§lPet Shard §7>> §cError accessing target's inventory!");
                return;
            }

            // Dar los shards en stacks de 64
            let remaining = quantity;
            while (remaining > 0) {
                const stackSize = Math.min(remaining, 64);
                const shardItem = createPetShard(stackSize);
                inv.container.addItem(shardItem);
                remaining -= stackSize;
            }

            player.sendMessage(`§a§lPet Shard §7>> §rGiven §b${quantity} Pet Shards§r to §b${targetName}§r!`);
            target.sendMessage(`§a§lPet Shard §7>> §rYou received §b${quantity} Pet Shards§r!`);

            system.run(() => {
                player.runCommand("playsound random.levelup @s");
                target.runCommand("playsound random.levelup @s");
            });
        }, 1);
    }
});

export { createPetShard, isPetShard, getPetShardCount, removePetShards };