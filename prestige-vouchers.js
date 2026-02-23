import { world, system, ItemStack } from "@minecraft/server";
import { addPrestige, formatPrestige } from "./sidebar.js";

const PRESTIGE_VOUCHER_CONFIG = {
    "common": {
        color: "§8",
        display: "§r§8[§r§8Common Prestige Voucher§r§8]",
        minAmount: 1,
        maxAmount: 5,
        lore: (amount) => [
            `§r`,
            `§r§7Increase your prestige`,
            `§r§7by §8${amount}§r§7 level(s).`,
            `§r`,
            `§r§fRarity: §8Common`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §8+${amount} prestige`
        ]
    },
    "uncommon": {
        color: "§a",
        display: "§r§8[§r§aUncommon Prestige Voucher§r§8]",
        minAmount: 5,
        maxAmount: 10,
        lore: (amount) => [
            `§r`,
            `§r§7Increase your prestige`,
            `§r§7by §a${amount}§r§7 level(s).`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §a+${amount} prestige`
        ]
    },
    "rare": {
        color: "§9",
        display: "§r§8[§r§9Rare Prestige Voucher§r§8]",
        minAmount: 10,
        maxAmount: 20,
        lore: (amount) => [
            `§r`,
            `§r§7Increase your prestige`,
            `§r§7by §9${amount}§r§7 level(s).`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §9+${amount} prestige`
        ]
    },
    "epic": {
        color: "§5",
        display: "§r§8[§r§5Epic Prestige Voucher§r§8]",
        minAmount: 20,
        maxAmount: 50,
        lore: (amount) => [
            `§r`,
            `§r§7Increase your prestige`,
            `§r§7by §5${amount}§r§7 level(s).`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §5+${amount} prestige`
        ]
    },
    "legendary": {
        color: "§6",
        display: "§r§8[§r§6Legendary Prestige Voucher§r§8]",
        minAmount: 50,
        maxAmount: 100,
        lore: (amount) => [
            `§r`,
            `§r§7Increase your prestige`,
            `§r§7by §6${amount}§r§7 level(s).`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §6+${amount} prestige`
        ]
    },
    "mythic": {
        color: "§3",
        display: "§r§8[§r§3Mythic Prestige Voucher§r§8]",
        minAmount: 100,
        maxAmount: 500,
        lore: (amount) => [
            `§r`,
            `§r§7Increase your prestige`,
            `§r§7by §3${amount}§r§7 level(s).`,
            `§r`,
            `§r§fRarity: §3Mythic`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §3+${amount} prestige`
        ]
    },
    "unreal": {
        color: "§9",
        display: "§r§8[§r§9Unreal Prestige Voucher§r§8]",
        minAmount: 500,
        maxAmount: Infinity,
        lore: (amount) => [
            `§r`,
            `§r§7Increase your prestige`,
            `§r§7by §9${amount}§r§7 level(s).`,
            `§r`,
            `§r§fRarity: §9Unreal`,
            `§r§fBound to: §eAccount`,
            `§r§fAmount: §9+${amount} prestige`
        ]
    }
};

function getRarityFromAmount(amount) {
    if (amount < 5) return "common";
    if (amount < 10) return "uncommon";
    if (amount < 20) return "rare";
    if (amount < 50) return "epic";
    if (amount < 100) return "legendary";
    if (amount < 500) return "mythic";
    return "unreal";
}

function createPrestigeVoucher(amount) {
    if (!amount || amount <= 0) {
        return null;
    }

    const rarity = getRarityFromAmount(amount);
    const config = PRESTIGE_VOUCHER_CONFIG[rarity];

    if (!config) {
        return null;
    }

    const voucherItem = new ItemStack("minecraft:amethyst_shard", 1);
    voucherItem.nameTag = `${config.color}+${amount} Prestige Voucher`;
    voucherItem.setLore(config.lore(amount));
    voucherItem.keepOnDeath = true;

    return { item: voucherItem, amount: amount, rarity: rarity };
}

function getVoucherAmount(item) {
    if (!item || !item.nameTag) return null;

    if (!item.nameTag.includes("Prestige Voucher")) {
        return null;
    }

    const match = item.nameTag.match(/\+(\d+)/);
    if (match) {
        const amount = parseInt(match[1]);
        if (!isNaN(amount)) {
            return amount;
        }
    }

    return null;
}

function claimPrestigeVoucher(player, item) {
    const amount = getVoucherAmount(item);

    if (!amount) {
        player.sendMessage("§c§lPrestige Voucher §7>> §cInvalid voucher!");
        return;
    }

    addPrestige(player, amount);

    const rarity = getRarityFromAmount(amount);
    const config = PRESTIGE_VOUCHER_CONFIG[rarity];

    player.sendMessage(`§d§lPrestige Voucher §7>> §rYou gained §d+${amount}§r prestige!`);
    
    system.run(() => {
        player.runCommand(`playsound random.levelup @s`);
    });

    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;

        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);

        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Prestige Voucher")) {
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
    if (!item.nameTag.includes("Prestige Voucher")) return;

    const amount = getVoucherAmount(item);
    if (!amount) return;

    claimPrestigeVoucher(player, item);
});

// Bloquear colocacion
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;

    try {
        const inventory = player.getComponent("minecraft:inventory");

        if (!inventory || !inventory.container) return;

        const hand = inventory.container.getItem(player.selectedSlotIndex);

        if (!hand || !hand.nameTag) return;
        if (!hand.nameTag.includes("Prestige Voucher")) return;

        event.cancel = true;
        system.run(() => {
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place this item on the ground!");
            player.runCommand(`playsound note.bass @s`);
        });
    } catch (e) {}
});

// Comando para dar prestige vouchers
world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const args = event.message.split(" ");

    if (args[0].toLowerCase() === "!prestige" && args[1]?.toLowerCase() === "voucher") {
        event.cancel = true;

        system.runTimeout(() => {
            if (!player.hasTag("Rank:§dOwner")) {
                player.sendMessage("§cYou don't have permission to use this command.");
                return;
            }

            if (args.length < 5) {
                player.sendMessage("§c§lPrestige Voucher §7>> §cUsage: !prestige voucher <player> <amount> <quantity>");
                return;
            }

            const targetName = args[2];
            const amountStr = args[3];
            const quantityStr = args[4];

            const amount = parseInt(amountStr);
            const quantity = parseInt(quantityStr);

            if (isNaN(amount) || amount <= 0) {
                player.sendMessage("§c§lPrestige Voucher §7>> §cAmount must be a positive number!");
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                player.sendMessage("§c§lPrestige Voucher §7>> §cQuantity must be a positive number!");
                return;
            }

            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§c§lPrestige Voucher §7>> §cPlayer not found!");
                return;
            }

            const target = targetPlayers[0];
            const voucherData = createPrestigeVoucher(amount);

            if (!voucherData) {
                player.sendMessage("§c§lPrestige Voucher §7>> §cError creating voucher!");
                return;
            }

            const inv = target.getComponent("minecraft:inventory");
            if (!inv || !inv.container) {
                player.sendMessage("§c§lPrestige Voucher §7>> §cError accessing target's inventory!");
                return;
            }

            // Crear y dar la cantidad especificada
            for (let i = 0; i < quantity; i++) {
                const voucherCopy = voucherData.item.clone();
                inv.container.addItem(voucherCopy);
            }

            const config = PRESTIGE_VOUCHER_CONFIG[voucherData.rarity];
            const rarityColor = config.color;

            player.sendMessage(`§a§lPrestige Voucher §7>> §rGiven §f${quantity}x §${rarityColor}+${amount} Prestige Voucher§r (${voucherData.rarity}) to §b${targetName}§r!`);
            target.sendMessage(`§a§lPrestige Voucher §7>> §rYou received §f${quantity}x §${rarityColor}+${amount} Prestige Voucher§r!`);

            system.run(() => {
                player.runCommand(`playsound random.levelup @s`);
                target.runCommand(`playsound random.levelup @s`);
            });
        }, 1);
    }
});

export { createPrestigeVoucher, PRESTIGE_VOUCHER_CONFIG, getRarityFromAmount };