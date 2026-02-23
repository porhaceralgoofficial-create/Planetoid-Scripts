import { world, system, ItemStack } from "@minecraft/server";

const RANK_VOUCHERS = {
    "vip": {
        display: "§r§8[§r§2V.I.P§r§8]",
        lore: [
            `§r`,
            `§r§7Unlock the §2V.I.P§7 rank`,
            `§r§7for your account!`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fBound to: §eAccount`,
            `§r§fRank: §2V.I.P`
        ],
        tag: "Rank:§2V.I.P"
    },
    "vip+": {
        display: "§r§8[§r§q§lV.I.P §r§a+§r§8]",
        lore: [
            `§r`,
            `§r§7Unlock the §q§lV.I.P §r§a+§7 rank`,
            `§r§7for your account!`,
            `§r`,
            `§r§fRarity: §bRare`,
            `§r§fBound to: §eAccount`,
            `§r§fRank: §q§lV.I.P §r§a+`
        ],
        tag: "Rank:§q§lV.I.P §r§a+"
    },
    "ripper": {
        display: "§r§8[§r§l§cRipper§r§8]",
        lore: [
            `§r`,
            `§r§7Unlock the §l§cRipper§7 rank`,
            `§r§7for your account!`,
            `§r`,
            `§r§fRarity: §cLegendary`,
            `§r§fBound to: §eAccount`,
            `§r§fRank: §l§cRipper`
        ],
        tag: "Rank:§l§cRipper"
    }
};

function createRankVoucher(rankType) {
    if (!RANK_VOUCHERS[rankType]) {
        return null;
    }

    const config = RANK_VOUCHERS[rankType];
    const voucherItem = new ItemStack("minecraft:paper", 1);
    
    voucherItem.nameTag = "§r§8[§r§6Rank Voucher§r§8]";
    voucherItem.setLore([
        `§r`,
        `§r§7Unlock a premium rank`,
        `§r§7for your account!`,
        `§r`,
        ...config.lore.slice(4)
    ]);
    voucherItem.keepOnDeath = true;
    
    return { item: voucherItem, tag: config.tag, rankType: rankType };
}

function getRankFromVoucher(item) {
    if (!item || !item.nameTag) return null;
    
    // Verificar si es un Rank Voucher
    if (!item.nameTag.includes("Rank Voucher")) {
        return null;
    }
    
    // Buscar en el lore la línea que contiene "Rank:"
    const lore = item.getLore();
    if (!lore) return null;
    
    for (const line of lore) {
        if (line.includes("Rank:")) {
            // Extraer el rango del lore
            const rankContent = line.replace(/§r§fRank: /, "");
            return rankContent;
        }
    }
    
    return null;
}

function claimRankVoucher(player, item) {
    const rankContent = getRankFromVoucher(item);
    
    if (!rankContent) {
        player.sendMessage("§c§lRank Voucher §7>> §cInvalid voucher!");
        return;
    }
    
    const rankTag = `Rank:${rankContent}`;
    
    // Verificar si ya tiene el rango
    if (player.hasTag(rankTag)) {
        player.sendMessage(`§c§lRank Voucher §7>> §cYou already own this rank!`);
        return;
    }
    
    // Agregar el rango
    system.run(() => {
        player.addTag(rankTag);
    });
    
    player.sendMessage(`§a§lRank Voucher §7>> §rYou have unlocked a new rank: ${rankContent}`);
    
    system.run(() => {
        player.runCommand(`playsound random.levelup @s`);
    });
    
    // Eliminar el item
    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;
        
        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);
        
        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Rank Voucher")) {
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
    if (!item.nameTag.includes("Rank Voucher")) return;
    
    const rankContent = getRankFromVoucher(item);
    if (!rankContent) return;
    
    claimRankVoucher(player, item);
});

// Bloquear colocación
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    
    try {
        const inventory = player.getComponent("minecraft:inventory");
        
        if (!inventory || !inventory.container) return;
        
        const hand = inventory.container.getItem(player.selectedSlotIndex);
        
        if (!hand || !hand.nameTag) return;
        if (!hand.nameTag.includes("Rank Voucher")) return;
        
        event.cancel = true;
        system.run(() => {
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place this item on the ground!");
            player.runCommand(`playsound note.bass @s`);
        });
    } catch (e) {}
});

// Comando para dar rank vouchers
world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const args = event.message.split(" ");
    
    if (args[0].toLowerCase() === "!rank-voucher") {
        event.cancel = true;
        
        system.runTimeout(() => {
            if (!player.hasTag("Rank:§dOwner")) {
                player.sendMessage("§cYou don't have permission to use this command.");
                return;
            }
            
            if (args.length < 3) {
                player.sendMessage("§c§lRank Voucher §7>> §cUsage: !rank-voucher <player> <vip|vip+|ripper>");
                return;
            }
            
            const targetName = args[1];
            const rankType = args[2].toLowerCase();
            
            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§c§lRank Voucher §7>> §cPlayer not found!");
                return;
            }
            
            if (!RANK_VOUCHERS[rankType]) {
                player.sendMessage(`§c§lRank Voucher §7>> §cInvalid rank type! Available: vip, vip+, ripper`);
                return;
            }
            
            const target = targetPlayers[0];
            const voucherData = createRankVoucher(rankType);
            
            if (!voucherData) {
                player.sendMessage("§c§lRank Voucher §7>> §cError creating voucher!");
                return;
            }
            
            const inv = target.getComponent("minecraft:inventory");
            if (!inv || !inv.container) {
                player.sendMessage("§c§lRank Voucher §7>> §cError accessing target's inventory!");
                return;
            }
            
            inv.container.addItem(voucherData.item);
            
            const config = RANK_VOUCHERS[rankType];
            player.sendMessage(`§a§lRank Voucher §7>> §rGiven rank voucher to §b${targetName}§r!`);
            target.sendMessage(`§a§lRank Voucher §7>> §rYou received a rank voucher!`);
            
            system.run(() => {
                player.runCommand(`playsound random.levelup @s`);
                target.runCommand(`playsound random.levelup @s`);
            });
        }, 1);
    }
});

export { createRankVoucher, RANK_VOUCHERS };