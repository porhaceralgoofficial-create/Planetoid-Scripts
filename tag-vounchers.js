import { world, system, ItemStack } from "@minecraft/server";

const TAG_VOUCHERS = {
    "legendary": {
        display: "§6§lLegendary Tag",
        lore: [
            `§r`,
            `§r§7Unlock the §6Legendary§7 custom tag`,
            `§r§7for your chat!`,
            `§r`,
            `§r§fRarity: §6Legendary`,
            `§r§fBound to: §eAccount`,
            `§r§fTag: §6§lLegendary`
        ],
        tag: "customTag:§6§lLegendary"
    },
    "mythic": {
        display: "§5§lMythic Tag",
        lore: [
            `§r`,
            `§r§7Unlock the §5Mythic§7 custom tag`,
            `§r§7for your chat!`,
            `§r`,
            `§r§fRarity: §5Mythic`,
            `§r§fBound to: §eAccount`,
            `§r§fTag: §5§lMythic`
        ],
        tag: "customTag:§5§lMythic"
    },
    "elite": {
        display: "§b§lElite Tag",
        lore: [
            `§r`,
            `§r§7Unlock the §bElite§7 custom tag`,
            `§r§7for your chat!`,
            `§r`,
            `§r§fRarity: §bRare`,
            `§r§fBound to: §eAccount`,
            `§r§fTag: §b§lElite`
        ],
        tag: "customTag:§b§lElite"
    },
    "vip": {
        display: "§a§lVIP Tag",
        lore: [
            `§r`,
            `§r§7Unlock the §aVIP§7 custom tag`,
            `§r§7for your chat!`,
            `§r`,
            `§r§fRarity: §aUncommon`,
            `§r§fBound to: §eAccount`,
            `§r§fTag: §a§lVIP`
        ],
        tag: "customTag:§a§lVIP"
    },
    "pro": {
        display: "§e§lPro Tag",
        lore: [
            `§r`,
            `§r§7Unlock the §ePro§7 custom tag`,
            `§r§7for your chat!`,
            `§r`,
            `§r§fRarity: §eUncommon`,
            `§r§fBound to: §eAccount`,
            `§r§fTag: §e§lPro`
        ],
        tag: "customTag:§e§lPro"
    }
};

const COLOR_CODES = {
    // Colores estándar (0-f)
    "0": "§0", "1": "§1", "2": "§2", "3": "§3", "4": "§4", "5": "§5",
    "6": "§6", "7": "§7", "8": "§8", "9": "§9", "a": "§a", "b": "§b",
    "c": "§c", "d": "§d", "e": "§e", "f": "§f",
    // Colores adicionales de Bedrock
    "g": "§g", "h": "§h", "i": "§i", "j": "§j", "k": "§k", "l": "§l",
    "m": "§m", "n": "§n", "o": "§o", "p": "§p", "q": "§q", "r": "§r",
    "s": "§s", "t": "§t", "u": "§u", "v": "§v", "w": "§w", "x": "§x",
    "y": "§y", "z": "§z"
};

function applyGradient(text, colors) {
    if (colors.length < 2 || colors.length > 4) {
        return text;
    }
    
    const letters = text.split("");
    let result = "";
    
    for (let i = 0; i < letters.length; i++) {
        // Calcular la posición del color en el gradiente (0 a 1)
        const progress = letters.length > 1 ? i / (letters.length - 1) : 0;
        
        // Convertir el progreso a un índice de color
        const colorIndex = progress * (colors.length - 1);
        
        // Obtener el color exacto para esta posición
        const exactColor = colors[Math.round(colorIndex)];
        
        result += exactColor + letters[i];
    }
    
    return result;
}

function parseGradientTag(input) {
    // Formato: &gr[colores][Nombre]
    // Ejemplo: &gracTest (gradiente de a a c, nombre "Test")
    // Ejemplo: &grvnquMiTag (gradiente v→n→q→u, nombre "MiTag")
    // La última letra mayúscula marca el inicio del nombre de la tag
    const gradientRegex = /&gr([a-z0-9]+)([A-Z].*?)(?=&|$)/gi;
    let output = input;
    
    let match;
    const regex = new RegExp(gradientRegex);
    
    while ((match = regex.exec(input)) !== null) {
        const colorChars = match[1].toLowerCase();
        const tagName = match[2]; // Incluye la primera mayúscula
        
        // Obtener los colores especificados (solo letras minúsculas/números)
        const colors = [];
        for (let i = 0; i < colorChars.length; i++) {
            const char = colorChars[i];
            if (COLOR_CODES[char]) {
                colors.push(COLOR_CODES[char]);
            }
        }
        
        // Validar que haya al menos 2 colores y máximo 4
        if (colors.length >= 2 && colors.length <= 4 && tagName.length > 0) {
            const gradientText = applyGradient(tagName, colors);
            output = output.replace(match[0], gradientText);
        }
    }
    
    return output;
}

function createTagVoucher(tagType, customTagName = null) {
    let tagContent;
    let voucherItem = new ItemStack("minecraft:paper", 1);
    
    if (customTagName) {
        // Custom tag
        voucherItem.nameTag = "§r§8[§r§6Tag Voucher§r§8]";
        tagContent = customTagName;
        voucherItem.setLore([
            `§r`,
            `§r§7Unlock a custom tag`,
            `§r§7for your chat!`,
            `§r`,
            `§r§fRarity: §6Custom`,
            `§r§fBound to: §eAccount`,
            `§r§fTag: ${customTagName}`
        ]);
    } else {
        // Predefined tag
        if (!TAG_VOUCHERS[tagType]) {
            return null;
        }
        const config = TAG_VOUCHERS[tagType];
        voucherItem.nameTag = "§r§8[§r§6Tag Voucher§r§8]";
        voucherItem.setLore(config.lore);
        tagContent = config.tag;
    }
    
    voucherItem.keepOnDeath = true;
    
    return { item: voucherItem, tag: tagContent };
}

function getTagFromVoucher(item) {
    if (!item || !item.nameTag) return null;
    
    // Verificar si es un Tag Voucher
    if (!item.nameTag.includes("Tag Voucher")) {
        return null;
    }
    
    // Buscar en el lore la línea que contiene "Tag:"
    const lore = item.getLore();
    if (!lore) return null;
    
    for (const line of lore) {
        if (line.includes("Tag:")) {
            // Extraer la tag del lore
            const tagContent = line.replace(/§r§fTag: /, "");
            return tagContent;
        }
    }
    
    return null;
}

function claimTagVoucher(player, item) {
    const tagContent = getTagFromVoucher(item);
    
    if (!tagContent) {
        player.sendMessage("§c§lTag Voucher §7>> §cInvalid voucher!");
        return;
    }
    
    const customTag = `customTag:${tagContent}`;
    
    // Verificar si ya tiene la tag
    if (player.hasTag(customTag)) {
        player.sendMessage(`§c§lTag Voucher §7>> §cYou already own this tag!`);
        return;
    }
    
    // Agregar la tag
    system.run(() => {
        player.addTag(customTag);
    });
    
    player.sendMessage(`§a§lTag Voucher §7>> §rYou have unlocked a new tag: ${tagContent}`);
    
    system.run(() => {
        player.runCommand(`playsound random.levelup @s`);
    });
    
    // Eliminar el item
    system.run(() => {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv || !inv.container) return;
        
        const slot = player.selectedSlotIndex;
        const currentItem = inv.container.getItem(slot);
        
        if (currentItem && currentItem.nameTag && currentItem.nameTag.includes("Tag Voucher")) {
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
    if (!item.nameTag.includes("Tag Voucher")) return;
    
    const tagContent = getTagFromVoucher(item);
    if (!tagContent) return;
    
    claimTagVoucher(player, item);
});

// Bloquear colocación
world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    
    try {
        const inventory = player.getComponent("minecraft:inventory");
        
        if (!inventory || !inventory.container) return;
        
        const hand = inventory.container.getItem(player.selectedSlotIndex);
        
        if (!hand || !hand.nameTag) return;
        if (!hand.nameTag.includes("Tag Voucher")) return;
        
        event.cancel = true;
        system.run(() => {
            player.sendMessage("§c§lPlacement Blocked §7>> §rYou cannot place this item on the ground!");
            player.runCommand(`playsound note.bass @s`);
        });
    } catch (e) {}
});

// Comando para dar tag vouchers
world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const rawMessage = event.message;
    const args = rawMessage.split(" ");
    
    if (args[0].toLowerCase() === "!tag-voucher") {
        event.cancel = true;
        
        system.runTimeout(() => {
            if (!player.hasTag("admin")) {
                player.sendMessage("§cYou don't have permission to use this command.");
                return;
            }
            
            if (args.length < 3) {
                player.sendMessage("§c§lTag Voucher §7>> §cUsage: !tag-voucher <player> <legendary|mythic|elite|vip|pro> OR !tag-voucher <player> custom <&tag or &gr[colors]text>");
                return;
            }
            
            const targetName = args[1];
            const tagType = args[2].toLowerCase();
            
            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§c§lTag Voucher §7>> §cPlayer not found!");
                return;
            }
            
            const target = targetPlayers[0];
            
            // OPCIÓN 1: Custom tag
            if (tagType === "custom") {
                if (args.length < 4) {
                    player.sendMessage("§c§lTag Voucher §7>> §cUsage: !tag-voucher <player> custom <&tag or &gr[colors]text>");
                    return;
                }
                
                // Obtener todo lo que viene después de "custom"
                let customTagName = args.slice(3).join(" ");
                
                // Procesar gradientes ANTES de convertir & a §
                customTagName = parseGradientTag(customTagName);
                customTagName = customTagName.replace(/&/g, "§");
                
                const voucherData = createTagVoucher(null, customTagName);
                
                if (!voucherData) {
                    player.sendMessage("§c§lTag Voucher §7>> §cError creating voucher!");
                    return;
                }
                
                const inv = target.getComponent("minecraft:inventory");
                if (!inv || !inv.container) {
                    player.sendMessage("§c§lTag Voucher §7>> §cError accessing target's inventory!");
                    return;
                }
                
                inv.container.addItem(voucherData.item);
                
                player.sendMessage(`§a§lTag Voucher §7>> §rGiven custom tag voucher to §b${targetName}§r!`);
                target.sendMessage(`§a§lTag Voucher §7>> §rYou received a tag voucher!`);
                
                system.run(() => {
                    player.runCommand(`playsound random.levelup @s`);
                    target.runCommand(`playsound random.levelup @s`);
                });
                return;
            }
            
            // OPCIÓN 2: Voucher predefinido
            if (!TAG_VOUCHERS[tagType]) {
                player.sendMessage(`§c§lTag Voucher §7>> §cInvalid tag type! Available: legendary, mythic, elite, vip, pro`);
                return;
            }
            
            const voucherData = createTagVoucher(tagType);
            
            if (!voucherData) {
                player.sendMessage("§c§lTag Voucher §7>> §cError creating voucher!");
                return;
            }
            
            const inv = target.getComponent("minecraft:inventory");
            if (!inv || !inv.container) {
                player.sendMessage("§c§lTag Voucher §7>> §cError accessing target's inventory!");
                return;
            }
            
            inv.container.addItem(voucherData.item);
            
            const config = TAG_VOUCHERS[tagType];
            player.sendMessage(`§a§lTag Voucher §7>> §rGiven §${config.display.split("§")[1]}${tagType}§r voucher to §b${targetName}§r!`);
            target.sendMessage(`§a§lTag Voucher §7>> §rYou received a §${config.display.split("§")[1]}${tagType}§r voucher!`);
            
            system.run(() => {
                player.runCommand(`playsound random.levelup @s`);
                target.runCommand(`playsound random.levelup @s`);
            });
        }, 1);
    }
});

export { createTagVoucher, TAG_VOUCHERS };