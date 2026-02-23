import { world, system, ItemStack } from "@minecraft/server";

const GIFTCARD_CONFIG = {
    "common": {
        item: "minecraft:paper",
        color: "§8",
        display: "§r§8[§r§8Common Gift Card§r§8]",
        minAmount: 1,
        maxAmount: 5,
        lore: (amount) => [
            `§r`,
            `§r§7A representative gift card for`,
            `§r§7real money purchases on the realm.`,
            `§r`,
            `§r§fValue: §8$${amount.toFixed(2)}`,
            `§r`,
            `§r§fRarity: §8Common`,
            `§r§fBound to: §eAccount`,
            `§r§fUsage: §7Real Store Purchases`,
            `§r`,
            `§r§8This is a §8representative§r item`,
            `§r§8for tracking purposes only.`
        ]
    },
    "uncommon": {
        item: "minecraft:paper",
        color: "§a",
        display: "§r§8[§r§aUncommon Gift Card§r§8]",
        minAmount: 5,
        maxAmount: 10,
        lore: (amount) => [
            `§r`,
            `§r§7A representative gift card for`,
            `§r§7real money purchases on the realm.`,
            `§r`,
            `§r§fValue: §a$${amount.toFixed(2)}`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fBound to: §eAccount`,
            `§r§fUsage: §7Real Store Purchases`,
            `§r`,
            `§r§8This is a §arepresentative§r item`,
            `§r§8for tracking purposes only.`
        ]
    },
    "rare": {
        item: "minecraft:paper",
        color: "§9",
        display: "§r§8[§r§9Rare Gift Card§r§8]",
        minAmount: 10,
        maxAmount: 20,
        lore: (amount) => [
            `§r`,
            `§r§7A representative gift card for`,
            `§r§7real money purchases on the realm.`,
            `§r`,
            `§r§fValue: §9$${amount.toFixed(2)}`,
            `§r`,
            `§r§fRarity: §9Rare`,
            `§r§fBound to: §eAccount`,
            `§r§fUsage: §7Real Store Purchases`,
            `§r`,
            `§r§8This is a §9representative§r item`,
            `§r§8for tracking purposes only.`
        ]
    },
    "epic": {
        item: "minecraft:paper",
        color: "§5",
        display: "§r§8[§r§5Epic Gift Card§r§8]",
        minAmount: 20,
        maxAmount: 40,
        lore: (amount) => [
            `§r`,
            `§r§7A representative gift card for`,
            `§r§7real money purchases on the realm.`,
            `§r`,
            `§r§fValue: §5$${amount.toFixed(2)}`,
            `§r`,
            `§r§fRarity: §5Epic`,
            `§r§fBound to: §eAccount`,
            `§r§fUsage: §7Real Store Purchases`,
            `§r`,
            `§r§8This is a §5representative§r item`,
            `§r§8for tracking purposes only.`
        ]
    },
    "legendary": {
        item: "minecraft:paper",
        color: "§6",
        display: "§r§8[§r§6Legendary Gift Card§r§8]",
        minAmount: 40,
        maxAmount: 70,
        lore: (amount) => [
            `§r`,
            `§r§7A representative gift card for`,
            `§r§7real money purchases on the realm.`,
            `§r`,
            `§r§fValue: §6$${amount.toFixed(2)}`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fBound to: §eAccount`,
            `§r§fUsage: §7Real Store Purchases`,
            `§r`,
            `§r§8This is a §6representative§r item`,
            `§r§8for tracking purposes only.`
        ]
    },
    "mythic": {
        item: "minecraft:paper",
        color: "§3",
        display: "§r§8[§r§3Mythic Gift Card§r§8]",
        minAmount: 70,
        maxAmount: 100,
        lore: (amount) => [
            `§r`,
            `§r§7A representative gift card for`,
            `§r§7real money purchases on the realm.`,
            `§r`,
            `§r§fValue: §3$${amount.toFixed(2)}`,
            `§r`,
            `§r§fRarity: §3Mythic`,
            `§r§fBound to: §eAccount`,
            `§r§fUsage: §7Real Store Purchases`,
            `§r`,
            `§r§8This is a §3representative§r item`,
            `§r§8for tracking purposes only.`
        ]
    },
    "unreal": {
        item: "minecraft:paper",
        color: "§9",
        display: "§r§8[§r§9Unreal Gift Card§r§8]",
        minAmount: 100,
        maxAmount: Infinity,
        lore: (amount) => [
            `§r`,
            `§r§7A representative gift card for`,
            `§r§7real money purchases on the realm.`,
            `§r`,
            `§r§fValue: §l§9$${amount.toFixed(2)}`,
            `§r`,
            `§r§fRarity: §l§9Unreal`,
            `§r§fBound to: §eAccount`,
            `§r§fUsage: §7Real Store Purchases`,
            `§r`,
            `§r§8This is a §l§9representative§r item`,
            `§r§8for tracking purposes only.`
        ]
    }
};

function convertToPriceFormat(amount) {
    // Convertir a .99 automáticamente
    const roundedDown = Math.floor(amount);
    
    if (roundedDown === 0) {
        return 0.99;
    }
    
    return roundedDown - 0.01;
}

function getRarityFromAmount(amount) {
    if (amount < 5) return "common";
    if (amount < 10) return "uncommon";
    if (amount < 20) return "rare";
    if (amount < 40) return "epic";
    if (amount < 70) return "legendary";
    if (amount < 100) return "mythic";
    return "unreal";
}

function createGiftCard(amount) {
    if (!amount || amount <= 0) {
        return null;
    }

    // Convertir el monto al formato .99
    const finalAmount = convertToPriceFormat(amount);

    const rarity = getRarityFromAmount(finalAmount);
    const config = GIFTCARD_CONFIG[rarity];

    if (!config) {
        return null;
    }

    const giftcard = new ItemStack(config.item, 1);
    giftcard.nameTag = `§l${config.color}$${finalAmount.toFixed(2)} Gift Card`;
    giftcard.setLore(config.lore(finalAmount));
    giftcard.keepOnDeath = true;

    return { item: giftcard, amount: finalAmount, rarity: rarity };
}

function getGiftCardAmount(item) {
    if (!item || !item.nameTag) return null;

    if (!item.nameTag.includes("Gift Card")) {
        return null;
    }

    const match = item.nameTag.match(/\$([0-9]+\.?[0-9]*)/);
    if (match) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount)) {
            return amount;
        }
    }

    return null;
}

function parseGiftCardAmount(input) {
    input = input.replace(/,/g, "."); // Convertir coma a punto
    
    const inputLower = input.toLowerCase();
    const num = parseFloat(inputLower);
    
    return isNaN(num) ? NaN : num;
}

// Comando para dar giftcards
world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const rawMessage = event.message;
    const args = rawMessage.split(" ");

    if (args[0].toLowerCase() === "!giftcard") {
        event.cancel = true;

        system.runTimeout(() => {
            const action = args[1]?.toLowerCase();

            if (action === "give") {
                if (!player.hasTag("Rank:§dOwner")) {
                    player.sendMessage("§cYou don't have permission to use this command.");
                    return;
                }

                if (args.length < 5) {
                    player.sendMessage("§c§lGift Card §7>> §cUsage: !giftcard give <player> <amount> <quantity>");
                    return;
                }

                const targetName = args[2];
                const amountStr = args[3];
                const quantityStr = args[4];

                const amount = parseGiftCardAmount(amountStr);
                const quantity = parseInt(quantityStr);

                if (isNaN(amount) || amount <= 0) {
                    player.sendMessage("§c§lGift Card §7>> §cAmount must be a positive number!");
                    return;
                }

                if (isNaN(quantity) || quantity <= 0) {
                    player.sendMessage("§c§lGift Card §7>> §cQuantity must be a positive number!");
                    return;
                }

                const targetPlayers = world.getPlayers({ name: targetName });
                if (targetPlayers.length === 0) {
                    player.sendMessage("§c§lGift Card §7>> §cPlayer not found!");
                    return;
                }

                const target = targetPlayers[0];
                const giftcardData = createGiftCard(amount);

                if (!giftcardData) {
                    player.sendMessage("§c§lGift Card §7>> §cError creating gift card!");
                    return;
                }

                const inv = target.getComponent("minecraft:inventory");
                if (!inv || !inv.container) {
                    player.sendMessage("§c§lGift Card §7>> §cError accessing target's inventory!");
                    return;
                }

                // Crear y dar la cantidad especificada
                for (let i = 0; i < quantity; i++) {
                    const cardCopy = giftcardData.item.clone();
                    inv.container.addItem(cardCopy);
                }

                const config = GIFTCARD_CONFIG[giftcardData.rarity];
                const rarityColor = config.color;
                const displayAmount = giftcardData.amount.toFixed(2);
                player.sendMessage(`§a§lGift Card §7>> §rGiven §f${quantity}x ${rarityColor}$${displayAmount} Gift Card§r (${giftcardData.rarity}) to §b${targetName}§r!`);
                target.sendMessage(`§a§lGift Card §7>> §rYou received §f${quantity}x ${rarityColor}$${displayAmount} Gift Card§r!`);

                system.run(() => {
                    player.runCommand(`playsound random.levelup @s`);
                    target.runCommand(`playsound random.levelup @s`);
                });
                return;
            }

            player.sendMessage("§c§lGift Card §7>> §cUsage:");
            player.sendMessage("§c§lGift Card §7>> §f!giftcard give <player> <amount> <quantity>");
        }, 1);
    }
});

export { createGiftCard, GIFTCARD_CONFIG, getRarityFromAmount };