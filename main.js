import { world, system, ItemStack } from "@minecraft/server";
import './backpack.js';
import './sidebar.js';
import './crates.js';
import './mining.js';
import './ranks.js';
import './chat.js';
import './leaderboards.js';
import './pickaxe.js';
import './upgrades.js';
import './upgradesForm.js'
import './landmarks.js';
import './notes.js';
import './auctionhouse.js';
import './booster-integration.js';
import './booster-items.js';
import './item-placement-blocker.js';
import './punch.js';
import './tag-vounchers.js';
import './rank-vouchers.js';
import './backpack-upgraders.js';
import './giftcards.js';
import './prestige-vouchers.js';
import './items.js';
import './pet-eggs.js';
import './pet-shards.js';
import './pets.js';
import './pet-xp.js';
import './pet-visuals.js';
import './key-system.js';
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { getBalance, getTokens, setBalance, setTokens, addPrestige, formatPrestige, getPrestige, setPrestige } from "./sidebar.js";

function getScore(e,r){try{let t=world.scoreboard.getObjective(r).getScore(e.scoreboardIdentity);if(null==t||isNaN(t))return 0;return t}catch(c){return 0}}

const EFFICIENCY_OBJECTIVE = "efficiency";

const pendingForms = new Map();

// Lista de comandos válidos - ACTUALIZADA CON TODOS LOS COMANDOS
const VALID_COMMANDS = [
    "!help", "!mine", "!mines", "!claim", "!landmarks",
    "!crates", "!spawn", "!pvp", "!prestige", "!chat", "!lore", "!pay",
    "!kick", "!freeze", "!vanish", "!add-currency", "!fly", "!key-all", "!key",
    "!reset", "!rank", "!demote", "!ban", "!plist", "!push", "!clear",
    "!gmc", "!gms", "!pgive", "!reward", "!tag-voucher", "!booster",
    "!money", "!tokens", "!prestige-set"
];

system.runInterval(() => {

    const objective = world.scoreboard.getObjective(EFFICIENCY_OBJECTIVE);
    if (!objective) return;

    for (const player of world.getPlayers()) {

        const identity = player.scoreboardIdentity;
        if (!identity) continue;

        const inv = player.getComponent("minecraft:inventory");
        if (!inv) continue;

        const item = inv.container.getItem(player.selectedSlotIndex);

        if (!item || item.typeId !== "minecraft:netherite_pickaxe") {
            player.removeEffect("minecraft:haste");
            continue;
        }

        let score = 0;

        try {
            score = objective.getScore(identity) ?? 0;
        } catch {
            score = 0;
        }

        if (score <= 0) {
            player.removeEffect("minecraft:haste");
            continue;
        }

        const amplifier = score - 1;

        player.addEffect("minecraft:haste", 40, {
            amplifier: amplifier,
            showParticles: false
        });
    }

}, 20);

// EVENTO: Devolver pico inmediatamente si se suelta
world.afterEvents.entitySpawn.subscribe((event) => {
    try {
        const entity = event.entity;
        
        // Si es un item type netherite_pickaxe, devolverlo al jugador más cercano
        if (entity.typeId === "minecraft:item") {
            const itemComp = entity.getComponent("minecraft:item");
            if (itemComp && itemComp.itemStack.typeId === "minecraft:netherite_pickaxe") {
                // Encontrar el jugador más cercano
                const players = entity.dimension.getEntities({ type: "minecraft:player" });
                let closestPlayer = null;
                let closestDistance = 50;
                
                for (const player of players) {
                    const dx = player.location.x - entity.location.x;
                    const dy = player.location.y - entity.location.y;
                    const dz = player.location.z - entity.location.z;
                    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestPlayer = player;
                    }
                }
                
                // Devolver al jugador más cercano
                if (closestPlayer) {
                    const inv = closestPlayer.getComponent("minecraft:inventory");
                    if (inv && inv.container) {
                        inv.container.addItem(itemComp.itemStack.clone());
                        entity.remove();
                    }
                }
            }
        }
    } catch (e) {
        // Ignorar errores de entities removidos
    }
});

// INTERVALO: Verificar constantemente picos tirados
system.runInterval(() => {
    try {
        for (const player of world.getPlayers()) {
            try {
                const inv = player.getComponent("minecraft:inventory");
                if (!inv || !inv.container) continue;

                const container = inv.container;
                let found = false;
                let firstItem = null;

                // Consolidar múltiples picos en uno
                for (let i = 0; i < container.size; i++) {
                    try {
                        const item = container.getItem(i);
                        if (!item) continue;

                        if (item.typeId === "minecraft:netherite_pickaxe") {
                            if (!found) {
                                found = true;
                                firstItem = item.clone();
                            }
                            container.setItem(i, undefined);
                        }
                    } catch (e) {
                        // Ignorar errores de items
                    }
                }

                if (firstItem) {
                    firstItem.amount = 1;
                    container.addItem(firstItem);
                }

                // Buscar picos tirados
                if (!found) {
                    try {
                        const entities = player.dimension.getEntities({
                            type: "minecraft:item",
                            location: player.location,
                            maxDistance: 15
                        });

                        for (const entity of entities) {
                            try {
                                const comp = entity.getComponent("minecraft:item");
                                if (!comp) continue;

                                if (comp.itemStack.typeId === "minecraft:netherite_pickaxe") {
                                    container.addItem(comp.itemStack.clone());
                                    entity.remove();
                                    break;
                                }
                            } catch (e) {
                                // Ignorar errores de entidades inválidas
                            }
                        }
                    } catch (e) {
                        // Ignorar errores de getEntities
                    }
                }
            } catch (e) {
                // Ignorar errores por jugador
            }
        }
    } catch (e) {
        // Ignorar errores generales
    }
}, 1);

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (player.hasTag("prestigeDo")) {
            player.removeTag("prestigeDo");
            
            setBalance(player, 0);
            setTokens(player, 0);
            
            player.runCommand("clear @s");
            
            const mineObj = world.scoreboard.getObjective("mine");
            if (mineObj) {
                try {
                    mineObj.setScore(player, 0);
                } catch {}
            }
            
            const upgradeObjs = ["efficiency", "fort", "tok", "key", "xppic"];
            for (const upgrade of upgradeObjs) {
                const obj = world.scoreboard.getObjective(upgrade);
                if (obj) {
                    try {
                        obj.setScore(player, 0);
                    } catch {}
                }
            }
            
            const pickaxeObjs = ["xp", "lvl"];
            for (const stat of pickaxeObjs) {
                const obj = world.scoreboard.getObjective(stat);
                if (obj) {
                    try {
                        obj.setScore(player, 0);
                    } catch {}
                }
            }
            
            const backpackObj = world.scoreboard.getObjective("backpack");
            if (backpackObj) {
                try {
                    backpackObj.setScore(player, 0);
                } catch {}
            }
            
            addPrestige(player, 1);
            
            const currentPrestige = getPrestige(player);
            const prestigeText = formatPrestige(currentPrestige);
            
            player.sendMessage("§6|--------------------------------|");
            player.sendMessage("§6| §l§dPRESTIGE SUCCESSFUL!");
            player.sendMessage("§6|");
            player.sendMessage(`§6| §fYou are now §l§dPrestige ${prestigeText}§f!`);
            player.sendMessage("§6| §fYou now have access to prestige mines!");
            player.sendMessage("§6| §fAll your stats have been reset.");
            player.sendMessage("§6|--------------------------------|");
            player.runCommand("playsound random.levelup @s");
            player.runCommand("playsound ui.toast.challenge_complete @s");
        }
        
        if (player.hasTag("reset")) {
            player.removeTag("reset");
            
            const currentPrestige = getPrestige(player);
            
            setBalance(player, 0);
            setTokens(player, 0);
            
            player.runCommand("clear @s");
            
            const mineObj = world.scoreboard.getObjective("mine");
            if (mineObj) {
                try {
                    mineObj.setScore(player, 0);
                } catch {}
            }
            
            const upgradeObjs = ["efficiency", "fort", "tok", "key", "xppic"];
            for (const upgrade of upgradeObjs) {
                const obj = world.scoreboard.getObjective(upgrade);
                if (obj) {
                    try {
                        obj.setScore(player, 0);
                    } catch {}
                }
            }
            
            const pickaxeObjs = ["xp", "lvl", "blocks"];
            for (const stat of pickaxeObjs) {
                const obj = world.scoreboard.getObjective(stat);
                if (obj) {
                    try {
                        obj.setScore(player, 0);
                    } catch {}
                }
            }
            
            const backpackObj = world.scoreboard.getObjective("backpack");
            if (backpackObj) {
                try {
                    backpackObj.setScore(player, 0);
                } catch {}
            }
            
            const playerTags = player.getTags();
            for (const tag of playerTags) {
                if (tag.startsWith("pickaxeTime:")) {
                    player.removeTag(tag);
                }
            }
            player.addTag("pickaxeTime:0");
            
            for (const tag of playerTags) {
                if (tag.startsWith("landmark_")) {
                    player.removeTag(tag);
                }
            }
            
            player.sendMessage("§c§lReset §8>> §fYour account has been completely reset.");
            if (currentPrestige > 0) {
                const prestigeFormatted = formatPrestige(currentPrestige);
                player.sendMessage(`§c§lReset §8>> §fYour prestige (§d${prestigeFormatted}§f) has been preserved.`);
            }
            player.runCommand("playsound random.anvil_use @s");
        }
    }
}, 1);

function getCurrentMine(player) {
    const mineObj = world.scoreboard.getObjective("mine");
    if (mineObj) {
        try {
            return mineObj.getScore(player) || 0;
        } catch {
            return 0;
        }
    }
    return 0;
}

function tryShowPrestigeForm(player) {
    if (pendingForms.has(player.id)) {
        return;
    }
    
    pendingForms.set(player.id, true);
    
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryShow = () => {
        attempts++;
        
        showPrestigeConfirmation(player).then(() => {
            pendingForms.delete(player.id);
        }).catch(() => {
            if (attempts < maxAttempts) {
                system.runTimeout(tryShow, 5);
            } else {
                pendingForms.delete(player.id);
            }
        });
    };
    
    system.runTimeout(tryShow, 5);
}

async function showPrestigeConfirmation(player) {
    const currentMine = getCurrentMine(player);
    
    if (currentMine < 25) {
        player.sendMessage("§c§lPrestige §8>> §cIn order to prestige, you need to reach mine Z.");
        player.runCommand(`playsound note.bass @s`);
        return;
    }
    
    const form = new MessageFormData();
    form.title("§l§dPrestige Confirmation");
    form.body(
        "§fAre you §6sure§f you want to prestige?\n\n" +
        "§c§lYou will lose:\n" +
        "§f  • All your money\n" +
        "§f  • All your tokens\n" +
        "§f  • Your current inventory\n" +
        "§f  • All your upgrades\n" +
        "§f  • Your pickaxe XP and level\n" +
        "§f  • Go back to mine A\n\n" +
        "§a§lYou will keep:\n" +
        "§f  • Your total blocks mined\n" +
        "§f  • Your pickaxe time usage\n\n" +
        "§a§lYou will gain:\n" +
        "§f  • +1 Prestige level\n" +
        "§f  • Access to prestige mines\n" +
        "§f  • Prestige bonuses and rewards\n\n" +
        "§fDo you want to continue?"
    );
    form.button1("§a§lYes, Prestige!");
    form.button2("§c§lNo, Cancel");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    if (response.selection === 0) {
        player.addTag("prestigeDo");
        player.sendMessage("§d§lPrestige §8>> §aProcessing your prestige...");
    } else {
        player.sendMessage("§d§lPrestige §8>> §cPrestige cancelled.");
        player.runCommand(`playsound note.bass @s`);
    }
}

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const msg = event.message.toLowerCase();
    const rawMessage = event.message;
    const msgParts = rawMessage.split(" ");
    
    // Verificar si es un comando válido
    if (rawMessage.startsWith("!")) {
        const command = msgParts[0].toLowerCase();
        
        // Permitir comandos que usen prefijo ! pero validar después
        const commandsNeedingValidation = ["!money", "!tokens", "!prestige-set", "!booster"];
        const isSpecialCommand = commandsNeedingValidation.includes(command);
        
        if (!VALID_COMMANDS.includes(command) && !isSpecialCommand) {
            event.cancel = true;
            return;
        }
    }
    
    if (msgParts[0].toLowerCase() === "!lore") {
        system.runTimeout(() => {
            const inv = player.getComponent("minecraft:inventory");
            if (!inv) return;

            const container = inv.container;
            const slot = player.selectedSlotIndex;
            const item = container.getItem(slot);
            if (!item) return;

            const rawText = rawMessage.substring(6).replace(/&/g, "§");
            if (!rawText) return;

            const lines = rawText.split("//n");

            item.setLore(lines);
            container.setItem(slot, item);
        }, 1);
        event.cancel = true;
    }
    
   if (msg === "!help") {
    system.runTimeout(() => {
        // COMANDOS GENERALES - PARA TODOS
        player.sendMessage([
            "§8§m                                                  §r",
            "§6§l           PLANETOID PRISONS - COMMAND LIST",
            "§8§m                                                  §r",
            "",
            "§6GENERAL COMMANDS§r",
            "§8━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            "§e▪ §f!help §8│ §7Shows the list of available commands",
            "§e▪ §f!mine §8│ §7Teleports you to your actual mine",
            "§e▪ §f!mines §8│ §7Pops up the list of available mines",
            "§e▪ §f!claim §8│ §7Claims your daily rewards",
            "§e▪ §f!landmarks §8│ §7View and claim landmarks",
            "§e▪ §f!crates §8│ §7Teleports you to the crates",
            "§e▪ §f!spawn §8│ §7Teleports you back to spawn",
            "§e▪ §f!pvp §8│ §7Teleports you to the pvp mine",
            "§e▪ §f!prestige §8│ §7Rebirth and gain prestige",
            "§e▪ §f!chat §8│ §7Customize your chat",
            "§e▪ §f!boosters §8│ §7View your active boosters",
            "§e▪ §f!auctionhouse §8│ §7Access the auction house",
            "§e▪ §f!upgrades §8│ §7View your pickaxe upgrades",
            "§e▪ §f!pet §8│ §7Manage your pets",
            "§e▪ §f!withdraw §8│ §7Withdraw money/tokens as notes",
            "§e▪ §f!pay <player> <money|tokens> <amount> §8│ §7Transfer currency",
            "§8§m                                                  §r"
        ].join("\n"));

        // ADMIN COMMANDS - SOLO PARA adminCMDS
        if (player.hasTag("adminCMDS")) {
            player.sendMessage([
                "",
                "§6ADMIN COMMANDS§r",
                "§8━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                "§c▪ §f!kick <player> <reason> §8│ §7Kicks a player",
                "§c▪ §f!freeze <player> §8│ §7Freezes a player",
                "§c▪ §f!vanish §8│ §7Enables/disables vanish mode",
                "§c▪ §f!add-currency <player> <money|tokens> <amount> §8│ §7Gives currency",
                "§c▪ §f!fly §8│ §7Enables/disables the ability to fly",
                "§c▪ §f!key-all §8│ §7Gives 1 random key to everyone",
                "§c▪ §f!key <common|rare|epic|legend|madmax|event> §8│ §7Give yourself keys",
                "§c▪ §f!reset <player> §8│ §7Resets a player",
                "§8§m                                                  §r"
            ].join("\n"));
        }

        // MANAGEMENT COMMANDS - SOLO PARA admin
        if (player.hasTag("admin")) {
            player.sendMessage([
                "",
                "§6MANAGEMENT COMMANDS§r",
                "§8━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                "§d▪ §f!rank <player> <helper|builder|mod|admin|dev|vip|vipp|ripper> §8│ §7Gives any rank",
                "§d▪ §f!demote <player> §8│ §7Demotes a staff member",
                "§d▪ §f!ban <player> §8│ §7Permanently bans a player",
                "§d▪ §f!plist §8│ §7Displays the list of players",
                "§d▪ §f!push <player> §8│ §7Prevents someone from dealing damage",
                "§d▪ §f!clear <player> §8│ §7Clears someone's inventory",
                "§d▪ §f!gmc §8│ §7Sets your gamemode to creative",
                "§d▪ §f!gms §8│ §7Sets your gamemode to survival",
                "§d▪ §f!pgive <player> <amount> §8│ §7Gives prestige to a player",
                "§d▪ §f!tag-voucher <player> <type|custom> §8│ §7Give tag voucher",
                "§d▪ §f!punch <money|tokens> <tiny|small|medium|large|huge> §8│ §7Create punch item",
                "§8§m                                                  §r"
            ].join("\n"));
        }

        // OWNER COMMANDS - SOLO PARA Owner
        if (player.hasTag("Rank:§dOwner")) {
            player.sendMessage([
                "",
                "§6OWNER COMMANDS§r",
                "§8━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                "§e▪ §f!money <player> <add|remove|set> <amount> §8│ §7Manage player money",
                "§e▪ §f!tokens <player> <add|remove|set> <amount> §8│ §7Manage player tokens",
                "§e▪ §f!prestige-set <player> <amount> §8│ §7Set player prestige directly",
                "§e▪ §f!rank-voucher <player> <vip|vip+|ripper> §8│ §7Give rank voucher",
                "§e▪ §f!backpack set <current|max> <player> [amount] §8│ §7Set backpack current/max",
                "§e▪ §f!backpack upgrader give <player> <amount> §8│ §7Give backpack upgrader",
                "§e▪ §f!giftcard give <player> <amount> <quantity> §8│ §7Give gift cards",
                "§e▪ §f!note get <money|tokens> <amount> <quantity> §8│ §7Create money/token notes",
                "§e▪ §f!prestige voucher <player> <amount> <quantity> §8│ §7Give prestige vouchers",
                "§e▪ §f!pet egg <player> <rarity> <quantity> §8│ §7Give pet eggs",
                "§e▪ §f!pet shard <player> <quantity> §8│ §7Give pet shards",
                "§e▪ §f!pet modify <player> <stat> <value> §8│ §7Modify active pet stats",
                "§e▪ §f!booster item <player> <type> <multiplier> <duration> §8│ §7Give booster item",
                "§e▪ §f!booster give <player> <type> <multiplier> <duration> §8│ §7Activate booster directly",
                "§8§m                                                  §r"
            ].join("\n"));
        }
    }, 1);
    event.cancel = true;
}
   
   if (msg === "!mine") {
       system.runTimeout(() => {
                player.runCommand(`tp @s[scores={mine=0}] 486 -35 500`);
       }, 1);
       event.cancel = true;
   }
   
   if (msg === "!mines") {
       system.runTimeout(() => {
                player.runCommand(`tag @s add openmenu:mines`);
       }, 20);
       event.cancel = true;
   }
   
   if (msg === "!claim") {
       system.runTimeout(() => {
                player.runCommand(`tag @s[tag="Rank:§2V.I.P",tag=!claimed] add vipClaim`);
                player.runCommand(`tag @s[tag="Rank:§q§lV.I.P §r§a+",tag=!claimed] add vippClaim`);
                player.runCommand(`tag @s[tag="Rank:§l§cRipper",tag=!claimed] add ripperClaim`);
                player.runCommand(`tag @s[tag="Rank:§2V.I.P",tag=!claimed] add claimed`);
                player.runCommand(`tag @s[tag="Rank:§q§lV.I.P §r§a+",tag=!claimed] add claimed`);
                player.runCommand(`tag @s[tag="Rank:§l§cRipper",tag=!claimed] add claimed`);
                player.runCommand(`tellraw @s[tag=!"Rank:§2V.I.P",tag=!"Rank:§q§lV.I.P §r§a+",tag=!"Rank:§l§cRipper"] {"rawtext":[{"text":"§cYou have to buy a rank or get it from a crate box in order to be able to use this command and claim a kit."}]}`);
                player.runCommand(`tellraw @s[tag=claimed] {"rawtext":[{"text":"§eYou have already claimed your kit. In order to get another one, play §6§l"},{"score":{"name":"*","objective":"claimH"}},{"text":"§r§e hours and §6§l"},{"score":{"name":"*","objective":"claimM"}},{"text":"§r§e minutes more."}]}`);
       }, 1);
       event.cancel = true;
   }
   
   if (msg === "!crates") {
       system.runTimeout(() => {
                player.runCommand(`tp @s -327 -60 406`);
                player.sendMessage("§6§lCrates §8>> §rTeleported to crates!");
                player.runCommand(`playsound mob.endermen.portal @s`);
       }, 1);
       event.cancel = true;
   }
   
   if (msg === "!spawn") {
       system.runTimeout(() => {
                player.runCommand(`tp @s 0 11.5 74`);
                player.sendMessage("§a§lSpawn §8>> §rTeleported to spawn!");
                player.runCommand(`playsound mob.endermen.portal @s`);
       }, 1);
       event.cancel = true;
   }
   
   if (msg === "!pvp") {
       system.runTimeout(() => {
                player.runCommand(`tp @s -500 -35 -500`);
                player.sendMessage("§c§lPVP §8>> §rTeleported to PVP mine!");
                player.runCommand(`playsound mob.endermen.portal @s`);
       }, 1);
       event.cancel = true;
   }
   
   if (msg === "!prestige") {
       system.runTimeout(() => {
                tryShowPrestigeForm(player);
       }, 1);
       event.cancel = true;
   }
   
   if (msgParts[0] === "!pay") {
    if(msgParts[2] === "money") {
       system.runTimeout(() => {
                const playerBalance = getBalance(player);
                const amount = parseInt(msgParts[3]);
                const targetName = msgParts[1];
                
                if (isNaN(amount) || amount <= 0) {
                    player.sendMessage("§c§lPay §8>> §cInvalid amount!");
                    return;
                }
                
                if (playerBalance < amount) {
                    player.sendMessage("§c§lPay §8>> §cYou don't have enough money!");
                    return;
                }
                
                const targetPlayers = world.getPlayers({ name: targetName });
                if (targetPlayers.length === 0) {
                    player.sendMessage("§c§lPay §8>> §cPlayer not found!");
                    return;
                }
                
                const target = targetPlayers[0];
                setBalance(player, playerBalance - amount);
                setBalance(target, getBalance(target) + amount);
                
                player.sendMessage(`§a§lPay §8>> §fYou gave §a$${amount}§f to §b${targetName}§f!`);
                target.sendMessage(`§a§lPay §8>> §fYou received §a$${amount}§f from §b${player.name}§f!`);
                player.runCommand(`playsound random.orb @s`);
                target.runCommand(`playsound random.orb @s`);
       }, 1);
       event.cancel = true;
   }}
   
   if (msgParts[0] === "!pay") {
    if(msgParts[2] === "tokens") {
       system.runTimeout(() => {
                const playerTokens = getTokens(player);
                const amount = parseInt(msgParts[3]);
                const targetName = msgParts[1];
                
                if (isNaN(amount) || amount <= 0) {
                    player.sendMessage("§c§lPay §8>> §cInvalid amount!");
                    return;
                }
                
                if (playerTokens < amount) {
                    player.sendMessage("§c§lPay §8>> §cYou don't have enough tokens!");
                    return;
                }
                
                const targetPlayers = world.getPlayers({ name: targetName });
                if (targetPlayers.length === 0) {
                    player.sendMessage("§c§lPay §8>> §cPlayer not found!");
                    return;
                }
                
                const target = targetPlayers[0];
                setTokens(player, playerTokens - amount);
                setTokens(target, getTokens(target) + amount);
                
                player.sendMessage(`§a§lPay §8>> §fYou gave §e${amount} tokens§f to §b${targetName}§f!`);
                target.sendMessage(`§a§lPay §8>> §fYou received §e${amount} tokens§f from §b${player.name}§f!`);
                player.runCommand(`playsound random.orb @s`);
                target.runCommand(`playsound random.orb @s`);
       }, 1);
       event.cancel = true;
   }}
   
   if (msgParts[0] === "!kick") {
       system.runTimeout(() => {
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run kick ${msgParts[1]} §cYou have been kicked by a Staff: §f${msgParts[2]}`);
                player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
       }, 1);
       event.cancel = true;
   }
   
   if (msgParts[0] === "!freeze") {
       system.runTimeout(() => {
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run tag ${msgParts[1]} add freeze`);
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§eYou have freezed §b${msgParts[1]}"}]}`);
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run tellraw ${msgParts[1]} {"rawtext":[{"text":"§cYou have been freezed by a Staff member"}]}`);
                player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
       }, 1);
       event.cancel = true;
   }
   
   if (msgParts[0] === "!vanish") {
       system.runTimeout(() => {
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run tag @s add vanish`);
                player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
       }, 1);
       event.cancel = true;
   }
   
   if (msgParts[0] === "!add-currency") {
    if(msgParts[2] === "money") {
       system.runTimeout(() => {
                if (!player.hasTag("adminCMDS")) {
                    player.sendMessage("§cYou are not allowed to use this command.");
                    return;
                }
                
                const amount = parseInt(msgParts[3]);
                const targetName = msgParts[1];
                
                const targetPlayers = world.getPlayers({ name: targetName });
                if (targetPlayers.length === 0) {
                    player.sendMessage("§cPlayer not found!");
                    return;
                }
                
                const target = targetPlayers[0];
                setBalance(target, getBalance(target) + amount);
                
                player.addTag(`given $${amount} to ${targetName}`);
                player.sendMessage(`§aYou have given §q$${amount}§a to §b${targetName}`);
       }, 1);
       event.cancel = true;
   }}
   
   if (msgParts[0] === "!add-currency") {
    if(msgParts[2] === "tokens") {
       system.runTimeout(() => {
                if (!player.hasTag("adminCMDS")) {
                    player.sendMessage("§cYou are not allowed to use this command.");
                    return;
                }
                
                const amount = parseInt(msgParts[3]);
                const targetName = msgParts[1];
                
                const targetPlayers = world.getPlayers({ name: targetName });
                if (targetPlayers.length === 0) {
                    player.sendMessage("§cPlayer not found!");
                    return;
                }
                
                const target = targetPlayers[0];
                setTokens(target, getTokens(target) + amount);
                
                player.addTag(`given T${amount} to ${targetName}`);
                player.sendMessage(`§aYou have given §e${amount} tokens§a to §b${targetName}`);
       }, 1);
       event.cancel = true;
   }}
   
   if (msgParts[0] === "!fly") {
       system.runTimeout(() => {
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run tag @s add fly`);
                player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
       }, 1);
       event.cancel = true;
   }
   
   if (msgParts[0] === "!key-all") {
    system.runTimeout(() => {
             player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run tag @a add "key-all"`);
             player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
    }, 1);
    event.cancel = true;
   }
   
   if (msgParts[0] === "!key") {
    const keyType = msgParts[1]?.toLowerCase();
    if(keyType === "common") {
       system.runTimeout(() => {
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run give @s planetoid:common_key`);
                player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
       }, 1);
       event.cancel = true;
    }
    else if(keyType === "rare") {
        system.runTimeout(() => {
                 player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run give @s planetoid:rare_key`);
                 player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
        }, 1);
        event.cancel = true;
     }
    else if(keyType === "epic") {
       system.runTimeout(() => {
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run give @s planetoid:epic_key`);
                player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
       }, 1);
       event.cancel = true;
    }
    else if(keyType === "legend") {
       system.runTimeout(() => {
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run give @s planetoid:legend_key`);
                player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
       }, 1);
       event.cancel = true;
    }
    else if(keyType === "madmax") {
       system.runTimeout(() => {
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run give @s planetoid:madmax_key`);
                player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
       }, 1);
       event.cancel = true;
    }
    else if(keyType === "event") {
       system.runTimeout(() => {
                player.runCommand(`execute as @s if entity @s[tag=adminCMDS] run give @s planetoid:event_key`);
                player.runCommand(`execute as @s unless entity @s[tag=adminCMDS] run tellraw @s {"rawtext":[{"text":"§cYou are not allowed to use this command."}]}`);
       }, 1);
       event.cancel = true;
    }
   }
    
    if (msgParts[0] === "!reset") {
        system.runTimeout(() => {
                if (!player.hasTag("adminCMDS")) {
                    player.sendMessage("§cYou are not allowed to use this command.");
                    return;
                }
                
                const targetName = msgParts[1];
                const targetPlayers = world.getPlayers({ name: targetName });
                
                if (targetPlayers.length === 0) {
                    player.sendMessage("§cPlayer not found!");
                    return;
                }
                
                const target = targetPlayers[0];
                target.addTag("reset");
                
                player.sendMessage(`§a§lReset §8>> §fSuccessfully reset §b${targetName}§f!`);
        }, 1);
        event.cancel = true;
    }
    
    if (msgParts[0] === "!rank") {
     const rankType = msgParts[2]?.toLowerCase();
     const targetName = msgParts[1];
     
     if (rankType === "helper") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("Rank:§aHelper");
                 player.sendMessage(`§a§lRank §8>> §fSuccessfully promoted §b${targetName}§f to §aHelper§f!`);
                 target.sendMessage(`§a§lRank §8>> §fYou have been promoted to §aHelper§f!`);
        }, 1);
        event.cancel = true;
    }
    else if (rankType === "builder") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("Rank:§6Builder");
                 player.sendMessage(`§a§lRank §8>> §fSuccessfully promoted §b${targetName}§f to §6Builder§f!`);
                 target.sendMessage(`§a§lRank §8>> §fYou have been promoted to §6Builder§f!`);
        }, 1);
        event.cancel = true;
    }
    else if (rankType === "mod") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("Rank:§2Moderator");
                 player.sendMessage(`§a§lRank §8>> §fSuccessfully promoted §b${targetName}§f to §2Moderator§f!`);
                 target.sendMessage(`§a§lRank §8>> §fYou have been promoted to §2Moderator§f!`);
        }, 1);
        event.cancel = true;
    }
    else if (rankType === "admin") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("Rank:§5Administrator");
                 target.addTag("admin");
                 target.addTag("adminCMDS");
                 player.sendMessage(`§a§lRank §8>> §fSuccessfully promoted §b${targetName}§f to §5Administrator§f!`);
                 target.sendMessage(`§a§lRank §8>> §fYou have been promoted to §5Administrator§f!`);
        }, 1);
        event.cancel = true;
    }
    else if (rankType === "dev") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("Rank:§9Dev");
                 target.addTag("admin");
                 target.addTag("adminCMDS");
                 player.sendMessage(`§a§lRank §8>> §fSuccessfully promoted §b${targetName}§f to §9Dev§f!`);
                 target.sendMessage(`§a§lRank §8>> §fYou have been promoted to §9Dev§f!`);
        }, 1);
        event.cancel = true;
    }
    else if (rankType === "vip") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("Rank:§2V.I.P");
                 player.sendMessage(`§a§lRank §8>> §fSuccessfully promoted §b${targetName}§f to §2V.I.P§f!`);
                 target.sendMessage(`§a§lRank §8>> §fYou have been promoted to §2V.I.P§f!`);
        }, 1);
        event.cancel = true;
    }
    else if (rankType === "vipp") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("Rank:§q§lV.I.P §r§a+");
                 player.sendMessage(`§a§lRank §8>> §fSuccessfully promoted §b${targetName}§f to §q§lV.I.P §r§a+§f!`);
                 target.sendMessage(`§a§lRank §8>> §fYou have been promoted to §q§lV.I.P §r§a+§f!`);
        }, 1);
        event.cancel = true;
    }
    else if (rankType === "ripper") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("Rank:§l§cRipper");
                 player.sendMessage(`§a§lRank §8>> §fSuccessfully promoted §b${targetName}§f to §l§cRipper§f!`);
                 target.sendMessage(`§a§lRank §8>> §fYou have been promoted to §l§cRipper§f!`);
        }, 1);
        event.cancel = true;
    }
   }
    
    if (msgParts[0] === "!demote") {
    system.runTimeout(() => {
        if (!player.hasTag("admin")) {
            player.sendMessage("§cYou are not allowed to use this command.");
            return;
        }
        
        const targetName = msgParts[1];
        const targetPlayers = world.getPlayers({ name: targetName });
        
        if (targetPlayers.length === 0) {
            player.sendMessage("§cPlayer not found!");
            return;
        }
        
        const target = targetPlayers[0];
        
        const staffRanks = [
            "Rank:§dOwner",
            "Rank:§1Co-Owner",
            "Rank:§9Dev",
            "Rank:§5Administrator",
            "Rank:§2Moderator",
            "Rank:§6Builder",
            "Rank:§aHelper"
        ];
        
        for (const rank of staffRanks) {
            if (target.hasTag(rank)) {
                target.removeTag(rank);
            }
        }
        
        if (target.hasTag("admin")) {
            target.removeTag("admin");
        }
        if (target.hasTag("adminCMDS")) {
            target.removeTag("adminCMDS");
        }
        
        player.sendMessage(`§a§lDemote §8>> §fSuccessfully demoted §b${targetName}§f!`);
        target.sendMessage(`§c§lDemote §8>> §fYou have been demoted by §b${player.name}§f.`);
        player.runCommand(`playsound random.anvil_use @s`);
        target.runCommand(`playsound random.anvil_use @s`);
    }, 1);
    event.cancel = true;
    }
    
    if (msgParts[0] === "!ban") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetName = msgParts[1];
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("banTAG");
                 player.sendMessage(`§a§lBan §8>> §fSuccessfully banned §b${targetName}§f!`);
        }, 1);
        event.cancel = true;
    }
    
    if (msgParts[0] === "!plist") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 player.runCommand(`tellraw @s {"rawtext":[{"text":"§ePlayers on this realm:\n§a"},{"selector":"@a"},{"text":"§e."}]}`);
        }, 1);
        event.cancel = true;
    }
    
    if (msgParts[0] === "!push") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetName = msgParts[1];
                 const targetPlayers = world.getPlayers({ name: targetName });
                 if (targetPlayers.length === 0) {
                     player.sendMessage("§cPlayer not found!");
                     return;
                 }
                 const target = targetPlayers[0];
                 target.addTag("pushed");
                 player.sendMessage(`§a§lPush §8>> §fSuccessfully pushed §b${targetName}§f!`);
        }, 1);
        event.cancel = true;
    }
    
    if (msgParts[0] === "!clear") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 const targetName = msgParts[1];
                 player.runCommand(`clear ${targetName}`);
                 player.sendMessage(`§a§lClear §8>> §fSuccessfully cleared §b${targetName}§f's inventory!`);
        }, 1);
        event.cancel = true;
    }
    
    if (msgParts[0] === "!gmc") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 player.runCommand(`gamemode c`);
                 player.sendMessage("§a§lGamemode §8>> §fGamemode changed to §bCreative§f!");
        }, 1);
        event.cancel = true;
    }
    
    if (msgParts[0] === "!gms") {
        system.runTimeout(() => {
                 if (!player.hasTag("admin")) {
                     player.sendMessage("§cYou are not allowed to use this command.");
                     return;
                 }
                 player.runCommand(`gamemode s`);
                 player.sendMessage("§a§lGamemode §8>> §fGamemode changed to §aSurvival§f!");
        }, 1);
        event.cancel = true;
    }
    
    if (msgParts[0] === "!pgive") {
        system.runTimeout(() => {
                if (!player.hasTag("admin")) {
                    player.sendMessage("§cYou are not allowed to use this command.");
                    return;
                }
                
                const amount = parseInt(msgParts[2]);
                const targetName = msgParts[1];
                
                const targetPlayers = world.getPlayers({ name: targetName });
                if (targetPlayers.length === 0) {
                    player.sendMessage("§cPlayer not found!");
                    return;
                }
                
                const target = targetPlayers[0];
                addPrestige(target, amount);
                
                player.sendMessage(`§aYou have given §d${amount} prestige§a to §b${targetName}`);
                target.sendMessage(`§aYou have received §d${amount} prestige§a from §b${player.name}`);
        }, 1);
        event.cancel = true;
    }

    // COMANDOS OWNER - MANEJO AVANZADO DE DINERO, TOKENS Y PRESTIGIO
    if (msgParts[0] === "!money") {
        system.runTimeout(() => {
            if (!player.hasTag("Rank:§dOwner")) {
                player.sendMessage("§cYou are not allowed to use this command.");
                return;
            }
            
            const targetName = msgParts[1];
            const action = msgParts[2]?.toLowerCase();
            const amount = parseInt(msgParts[3]);
            
            if (!targetName || !action || isNaN(amount)) {
                player.sendMessage("§c§lMoney §8>> §cUsage: !money <player> <add|remove|set> <amount>");
                return;
            }
            
            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§cPlayer not found!");
                return;
            }
            
            const target = targetPlayers[0];
            const currentBalance = getBalance(target);
            
            if (action === "add") {
                setBalance(target, currentBalance + amount);
                player.sendMessage(`§a§lMoney §8>> §fAdded §a$${amount}§f to §b${targetName}§f! (Total: §a$${currentBalance + amount}§f)`);
                target.sendMessage(`§a§lMoney §8>> §fYou received §a$${amount}§f from §b${player.name}§f!`);
            } else if (action === "remove") {
                const newBalance = Math.max(0, currentBalance - amount);
                setBalance(target, newBalance);
                player.sendMessage(`§c§lMoney §8>> §fRemoved §a$${amount}§f from §b${targetName}§f! (Total: §a$${newBalance}§f)`);
                target.sendMessage(`§c§lMoney §8>> §fYou lost §a$${amount}§f!`);
            } else if (action === "set") {
                setBalance(target, amount);
                player.sendMessage(`§b§lMoney §8>> §fSet §b${targetName}§f's balance to §a$${amount}§f!`);
                target.sendMessage(`§b§lMoney §8>> §fYour balance has been set to §a$${amount}§f!`);
            }
        }, 1);
        event.cancel = true;
    }

    if (msgParts[0] === "!tokens") {
        system.runTimeout(() => {
            if (!player.hasTag("Rank:§dOwner")) {
                player.sendMessage("§cYou are not allowed to use this command.");
                return;
            }
            
            const targetName = msgParts[1];
            const action = msgParts[2]?.toLowerCase();
            const amount = parseInt(msgParts[3]);
            
            if (!targetName || !action || isNaN(amount)) {
                player.sendMessage("§c§lTokens §8>> §cUsage: !tokens <player> <add|remove|set> <amount>");
                return;
            }
            
            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§cPlayer not found!");
                return;
            }
            
            const target = targetPlayers[0];
            const currentTokens = getTokens(target);
            
            if (action === "add") {
                setTokens(target, currentTokens + amount);
                player.sendMessage(`§a§lTokens §8>> §fAdded §e${amount}§f tokens to §b${targetName}§f! (Total: §e${currentTokens + amount}§f)`);
                target.sendMessage(`§a§lTokens §8>> §fYou received §e${amount}§f tokens from §b${player.name}§f!`);
            } else if (action === "remove") {
                const newTokens = Math.max(0, currentTokens - amount);
                setTokens(target, newTokens);
                player.sendMessage(`§c§lTokens §8>> §fRemoved §e${amount}§f tokens from §b${targetName}§f! (Total: §e${newTokens}§f)`);
                target.sendMessage(`§c§lTokens §8>> §fYou lost §e${amount}§f tokens!`);
            } else if (action === "set") {
                setTokens(target, amount);
                player.sendMessage(`§b§lTokens §8>> §fSet §b${targetName}§f's tokens to §e${amount}§f!`);
                target.sendMessage(`§b§lTokens §8>> §fYour tokens have been set to §e${amount}§f!`);
            }
        }, 1);
        event.cancel = true;
    }

    if (msgParts[0] === "!prestige-set") {
        system.runTimeout(() => {
            if (!player.hasTag("Rank:§dOwner")) {
                player.sendMessage("§cYou are not allowed to use this command.");
                return;
            }
            
            const targetName = msgParts[1];
            const amount = parseInt(msgParts[2]);
            
            if (!targetName || isNaN(amount)) {
                player.sendMessage("§c§lPrestige §8>> §cUsage: !prestige-set <player> <amount>");
                return;
            }
            
            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§cPlayer not found!");
                return;
            }
            
            const target = targetPlayers[0];
            setPrestige(target, amount);
            
            player.sendMessage(`§d§lPrestige §8>> §fSet §b${targetName}§f's prestige to §d${amount}§f!`);
            target.sendMessage(`§d§lPrestige §8>> §fYour prestige has been set to §d${amount}§f!`);
        }, 1);
        event.cancel = true;
    }

    if (msgParts[0] === "!booster") {
        system.runTimeout(() => {
            if (!player.hasTag("admin")) {
                player.sendMessage("§cYou are not allowed to use this command.");
                return;
            }
            
            const targetName = msgParts[1];
            const boosterType = msgParts[2]?.toLowerCase();
            const hours = parseInt(msgParts[3]);
            
            if (!targetName || !boosterType || isNaN(hours)) {
                player.sendMessage("§c§lBooster §8>> §cUsage: !booster <player> <type> <hours>");
                return;
            }
            
            const targetPlayers = world.getPlayers({ name: targetName });
            if (targetPlayers.length === 0) {
                player.sendMessage("§cPlayer not found!");
                return;
            }
            
            const target = targetPlayers[0];
            const boosterTag = `booster:${boosterType}:${Date.now() + (hours * 3600000)}`;
            
            target.addTag(boosterTag);
            player.sendMessage(`§a§lBooster §8>> §fGave §b${boosterType}§f booster for §e${hours}h§f to §b${targetName}§f!`);
            target.sendMessage(`§a§lBooster §8>> §fYou received a §b${boosterType}§f booster for §e${hours}h§f from §b${player.name}§f!`);
        }, 1);
        event.cancel = true;
    }
});

world.beforeEvents.itemUse.subscribe(data => {
   let player = data.source
   let item = data.itemStack
   
   if (item.typeId === "planetoid:spawn") {
       system.run(() => {
                player.runCommand(`tp @s 0 11.5 74`);
                player.sendMessage("§a§lSpawn §8>> §rTeleported to spawn!");
                player.runCommand(`playsound mob.endermen.portal @s`);
       })
   }
   
   if (item.typeId === "planetoid:perks") {
       system.run(() => {
                player.runCommand(`tag @s add openmenu:perks`);
       })
   }
});

export { setPrestige };