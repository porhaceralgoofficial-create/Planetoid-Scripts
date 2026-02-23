import { world, system, ItemStack } from "@minecraft/server";
import { addMoney, getBalance, addTokens, getTokens, formatMoney, formatTokens } from "./sidebar.js";

const PUNCH_CONFIG = {
    money: {
        name: "§aMoneyPunch",
        displayName: "Money Punch",
        color: "a",
        item: "minecraft:lime_shulker_box",
        sizes: {
            tiny: { min: 150000, max: 2000000 },
            small: { min: 5000000, max: 50000000 },
            medium: { min: 550000000, max: 2000000000 },
            large: { min: 5000000000, max: 50000000000 },
            huge: { min: 150000000000, max: 1000000000000 }
        }
    },
    tokens: {
        name: "§eTokenPunch",
        displayName: "Token Punch",
        color: "e",
        item: "minecraft:orange_shulker_box",
        sizes: {
            tiny: { min: 150000, max: 2000000 },
            small: { min: 5000000, max: 50000000 },
            medium: { min: 550000000, max: 2000000000 },
            large: { min: 5000000000, max: 50000000000 },
            huge: { min: 150000000000, max: 1000000000000 }
        }
    }
};

function createPunchItem(type, size) {
    if (!PUNCH_CONFIG[type] || !PUNCH_CONFIG[type].sizes[size]) {
        return null;
    }

    const config = PUNCH_CONFIG[type];
    const sizeConfig = config.sizes[size];
    
    const punchItem = new ItemStack(config.item, 1);
    
    const minFormatted = type === "money" ? formatMoney(sizeConfig.min) : formatTokens(sizeConfig.min);
    const maxFormatted = type === "money" ? formatMoney(sizeConfig.max) : formatTokens(sizeConfig.max);
    const currencySymbol = type === "money" ? "$" : "";
    
    punchItem.nameTag = `§${config.color}§l${config.displayName} §r§8(§r${size.charAt(0).toUpperCase() + size.slice(1)}§8)`;
    
    const lore = [
        `§r`,
        `§r§7Open this pouch to receive a`,
        `§r§7random amount of ${type === "money" ? "money" : "tokens"}`,
        `§r§7between §${config.color}${currencySymbol}${minFormatted}§r and §${config.color}${currencySymbol}${maxFormatted}§r.`,
        `§r`,
        `§r§fInformation`,
        `§r§f| Minimum: §${config.color}${currencySymbol}${minFormatted}`,
        `§r§f| Maximum: §${config.color}${currencySymbol}${maxFormatted}`,
    ];
    
    punchItem.setLore(lore);
    punchItem.keepOnDeath = true;
    
    return punchItem;
}

function getPunchData(item) {
    if (!item || !item.nameTag) return null;
    
    const nameTag = item.nameTag;
    
    let type = null;
    let size = null;
    
    if (nameTag.includes("Money Punch")) {
        type = "money";
    } else if (nameTag.includes("Token Punch")) {
        type = "tokens";
    }
    
    if (!type) return null;
    
    if (nameTag.includes("Tiny")) size = "tiny";
    else if (nameTag.includes("Small")) size = "small";
    else if (nameTag.includes("Medium")) size = "medium";
    else if (nameTag.includes("Large")) size = "large";
    else if (nameTag.includes("Huge")) size = "huge";
    
    if (!size) return null;
    
    return { type, size };
}

function openPunch(player, item) {
    const punchData = getPunchData(item);
    
    if (!punchData) {
        player.sendMessage("§c§lPunch §7>> §cInvalid punch item!");
        return;
    }
    
    const { type, size } = punchData;
    const config = PUNCH_CONFIG[type];
    const sizeConfig = config.sizes[size];
    
    const randomAmount = Math.floor(Math.random() * (sizeConfig.max - sizeConfig.min + 1)) + sizeConfig.min;
    
    if (type === "money") {
        addMoney(player, randomAmount);
        player.sendMessage(`§l§a${config.displayName} §7>> §r+$${formatMoney(randomAmount)}`);
    } else {
        addTokens(player, randomAmount);
        player.sendMessage(`§l§e${config.displayName} §7>> §r+${formatTokens(randomAmount)}`);
    }
    
    system.run(() => {
        player.runCommand(`playsound firework.blast @s`);
        player.runCommand(`playsound block.bell.hit @s`);
    });
    
    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;
        
        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);
        
        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Punch")) {
            if (currentItem.amount > 1) {
                currentItem.amount -= 1;
                inv.container.setItem(slot, currentItem);
            } else {
                inv.container.setItem(slot, undefined);
            }
        }
    });
}

// USAR itemUse para detectar click derecho en el item
world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    
    if (!item || !item.nameTag) return;
    if (!item.nameTag.includes("Punch")) return;
    
    openPunch(player, item);
});

// Bloquear la colocación
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    
    try {
        const inventory = player.getComponent("minecraft:inventory");
        
        if (!inventory || !inventory.container) return;
        
        const hand = inventory.container.getItem(player.selectedSlotIndex);
        
        if (!hand || !hand.nameTag) return;
        if (!hand.nameTag.includes("Punch")) return;
        
        event.cancel = true;
        player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place this item on the ground!");
        system.run(() => {
            player.runCommand(`playsound note.bass @s`);
        });
    } catch (e) {}
});

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const args = event.message.split(" ");
    
    if (args[0].toLowerCase() === "!punch") {
        event.cancel = true;
        
        system.runTimeout(() => {
            if (!player.hasTag("admin")) {
                player.sendMessage("§cYou don't have permission to use this command.");
                return;
            }
            
            if (args.length < 3) {
                player.sendMessage("§c§lPunch §7>> §cUsage: !punch <money/tokens> <tiny/small/medium/large/huge>");
                return;
            }
            
            const type = args[1].toLowerCase();
            const size = args[2].toLowerCase();
            
            if (!PUNCH_CONFIG[type]) {
                player.sendMessage("§c§lPunch §7>> §cInvalid type! Use: money or tokens");
                return;
            }
            
            if (!PUNCH_CONFIG[type].sizes[size]) {
                player.sendMessage("§c§lPunch §7>> §cInvalid size! Use: tiny, small, medium, large, or huge");
                return;
            }
            
            const punchItem = createPunchItem(type, size);
            
            if (!punchItem) {
                player.sendMessage("§c§lPunch §7>> §cError creating punch item!");
                return;
            }
            
            const inv = player.getComponent("minecraft:inventory");
            if (!inv || !inv.container) {
                player.sendMessage("§c§lPunch §7>> §cError accessing inventory!");
                return;
            }
            
            inv.container.addItem(punchItem);
            
            const config = PUNCH_CONFIG[type];
            system.run(() => {
                player.sendMessage(`§a§lPunch §7>> §rCreated §${config.color}${config.displayName} §r(§e${size}§r)!`);
                player.runCommand(`playsound random.levelup @s`);
            });
        }, 1);
    }
});

export { createPunchItem, PUNCH_CONFIG };