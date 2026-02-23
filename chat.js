import { world, ChatSendBeforeEvent, system } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';

const COMMAND_PREFIX = "replace_me";

const messageCounts = new Map();
const SPAM_THRESHOLD = 5;
const COOLDOWN_PERIOD = 10000;

const nicknameCooldowns = new Map();
const NICKNAME_COOLDOWN = 60000;

const pendingForms = new Map();

// STAFF RANKS (orden de importancia - colores correctos del main.js)
const STAFF_RANKS = [
    { tag: "Rank:§dOwner", display: "§dOwner" },
    { tag: "Rank:§1Co-Owner", display: "§1Co-Owner" },
    { tag: "Rank:§9Dev", display: "§9Dev" },
    { tag: "Rank:§5Administrator", display: "§5Administrator" },
    { tag: "Rank:§2Moderator", display: "§2Moderator" },
    { tag: "Rank:§6Builder", display: "§6Builder" },
    { tag: "Rank:§aHelper", display: "§aHelper" }
];

// PAID RANKS (orden: VIP < VIP+ < RIPPER - tomados del main.js)
const PAID_RANKS = [
    { tag: "Rank:§l§cRipper", display: "§l§cRipper", priority: 3 },
    { tag: "Rank:§q§lV.I.P §r§a+", display: "§q§lV.I.P §r§a+", priority: 2 },
    { tag: "Rank:§2V.I.P", display: "§2V.I.P", priority: 1 }
];

function getMineLetter(mineScore) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (mineScore >= 0 && mineScore <= 25) {
        return letters[mineScore];
    }
    return "A";
}

// NUEVA FUNCION: Actualizar el nameTag visual del jugador
function updatePlayerNameTag(player) {
    const tags = player.getTags();
    let displayName = player.name;
    let nameColor = '§7';
    let nameBold = '';

    // Obtener el nickname si existe
    const chatNameTags = tags.filter(tag => tag.startsWith('chatName:'));
    if (chatNameTags.length > 0) {
        const latestChatName = chatNameTags[chatNameTags.length - 1];
        displayName = latestChatName.replace('chatName:', '');
    }

    // Obtener el color del nombre
    const nameColorTags = tags.filter(tag => tag.startsWith('nameColor:'));
    if (nameColorTags.length > 0) {
        const latestNameColor = nameColorTags[nameColorTags.length - 1];
        nameColor = latestNameColor.replace('nameColor:', '').replace(/§l/g, '');
    }

    // Verificar si tiene bold
    if (tags.includes('nameBold')) {
        nameBold = '§l';
    }

    // Establecer el nameTag visual
    player.nameTag = `${nameBold}${nameColor}${displayName}`;
}

// Ejecutar actualización cada tick para todos los jugadores
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        updatePlayerNameTag(player);
    }
}, 1);

function chatrank(data) {
    const sender = data.sender;
    const tags = sender.getTags();
    
    if (tags.includes('mute')) {
        sender.sendMessage("§cYou are muted and cannot send messages.");
        data.cancel = true;
        return;
    }

    // Verificar anti-spam (inmune si tiene spamSkip)
    const isSpamImmune = tags.includes('spamSkip');
    
    if (!isSpamImmune) {
        if (!messageCounts.has(sender)) {
            messageCounts.set(sender, { count: 1, lastMessageTime: Date.now() });
        } else {
            const messageInfo = messageCounts.get(sender);
            const currentTime = Date.now();
            if (currentTime - messageInfo.lastMessageTime > COOLDOWN_PERIOD) {
                messageInfo.count = 1;
                messageInfo.lastMessageTime = currentTime;
            } else {
                messageInfo.count++;
                messageInfo.lastMessageTime = currentTime;
                const isStaff = tags.includes('staff');
                if (!isStaff && messageInfo.count > SPAM_THRESHOLD) {
                    sender.sendMessage("§cPlease do not spam!");
                    data.cancel = true;
                    return;
                }
            }
            messageCounts.set(sender, messageInfo);
        }
    }
    
    if (data.message.startsWith(COMMAND_PREFIX)) {
        return;
    }
    
    if (data.message.startsWith("!")) {
        return;
    }
    
    // PRESTIGIO - obtener del tag
    let prestigeTag = tags.find(tag => tag.startsWith("Rank:§5") && !tag.includes("Administrator"));
    let prestigeDisplay = "";
    if (prestigeTag) {
        const prestige = prestigeTag.replace("Rank:§5", "");
        prestigeDisplay = `§l§5${prestige}`;
    }
    
    // MINA - obtener del scoreboard
    let mineDisplay = "";
    const mineObj = world.scoreboard.getObjective("mine");
    if (mineObj) {
        try {
            const mineScore = mineObj.getScore(sender) || 0;
            const mineLetter = getMineLetter(mineScore);
            mineDisplay = `§a${mineLetter}`;
        } catch {
            mineDisplay = "";
        }
    }
    
    // STAFF RANK (mostrar solo el primero/más alto que tenga)
    let staffDisplay = "";
    for (const staffRank of STAFF_RANKS) {
        if (tags.includes(staffRank.tag)) {
            staffDisplay = staffRank.display;
            break;
        }
    }
    
    // PAID RANK (mostrar solo el más alto que tenga)
    let paidDisplay = "";
    let highestPaidPriority = -1;
    let highestPaidDisplay = "";
    
    for (const paidRank of PAID_RANKS) {
        if (tags.includes(paidRank.tag) && paidRank.priority > highestPaidPriority) {
            highestPaidPriority = paidRank.priority;
            highestPaidDisplay = paidRank.display;
        }
    }
    
    if (highestPaidDisplay) {
        paidDisplay = highestPaidDisplay;
    }
    
    // MEMBER solo se muestra si NO tiene staff ni paid
    let memberDisplay = "";
    if (!staffDisplay && !paidDisplay) {
        memberDisplay = "§7Member";
    }
    
    // TAG PERSONALIZADA (custom tag) - Solo mostrar la activa
    let customTagDisplay = "";
    const displayTag = tags.find(tag => tag.startsWith("displayTag:"));
    if (displayTag) {
        const tagContent = displayTag.replace("displayTag:", "");
        customTagDisplay = `§r§8[§r${tagContent}§r§8] `;
    }
    
    // NOMBRE DEL JUGADOR
    let displayName = sender.nameTag;
    const allChatNameTags = tags.filter(tag => tag.startsWith('chatName:'));
    if (allChatNameTags.length > 0) {
        const latestChatName = allChatNameTags[allChatNameTags.length - 1];
        displayName = latestChatName.replace('chatName:', '').replace(/§./g, '');
        
        system.run(() => {
            for (let i = 0; i < allChatNameTags.length - 1; i++) {
                system.run(() => {
                    sender.removeTag(allChatNameTags[i]);
                });
            }
        });
    }
    
    let nameColor = '§7';
    const allNameColorTags = tags.filter(tag => tag.startsWith('nameColor:'));
    if (allNameColorTags.length > 0) {
        const latestNameColor = allNameColorTags[allNameColorTags.length - 1];
        nameColor = latestNameColor.replace('nameColor:', '').replace(/§l/g, '');
        
        system.run(() => {
            for (let i = 0; i < allNameColorTags.length - 1; i++) {
                system.run(() => {
                    sender.removeTag(allNameColorTags[i]);
                });
            }
        });
    }
    
    let nameBold = '';
    if (tags.includes('nameBold')) {
        nameBold = '§l';
    }
    
    let textColor = '§f';
    const allChatColorTags = tags.filter(tag => tag.startsWith('chatColor:'));
    if (allChatColorTags.length > 0) {
        const latestChatColor = allChatColorTags[allChatColorTags.length - 1];
        textColor = latestChatColor.replace('chatColor:', '').replace(/§l/g, '');
        
        system.run(() => {
            for (let i = 0; i < allChatColorTags.length - 1; i++) {
                system.run(() => {
                    sender.removeTag(allChatColorTags[i]);
                });
            }
        });
    }
    
    let chatBold = '';
    if (tags.includes('chatBold')) {
        chatBold = '§l';
    }
    
    // CONSTRUIR FORMATO: Prestige - Mine [Staff] [Paid] CustomTag Nombre: Mensaje
    let prefixParts = [];
    
    if (prestigeDisplay) {
        prefixParts.push(prestigeDisplay);
    }
    
    if (mineDisplay) {
        prefixParts.push(mineDisplay);
    }
    
    let prefix = prefixParts.length > 0 ? prefixParts.join(" §8- ") + " " : "";
    
    let staffPart = staffDisplay ? `§r§8[§r${staffDisplay}§r§8] ` : "";
    let paidPart = paidDisplay ? `§r§8[§r${paidDisplay}§r§8] ` : "";
    if (memberDisplay) paidPart = `§r§8[§r${memberDisplay}§r§8] `;
    
    let chatText = `${prefix}${staffPart}${paidPart}${customTagDisplay}${nameBold}${nameColor}${displayName}§r§8: §r${chatBold}${textColor}${data.message}`;
    
    world.sendMessage({ rawtext: [{ text: chatText }] });
    data.cancel = true;
}

async function showChatMenu(player) {
    const tags = player.getTags();
    const hasNickChanger = tags.includes('nickChanger');
    const hasNCChanger = tags.includes('ncChanger');
    const hasCCChanger = tags.includes('ccChanger');
    const customTags = tags.filter(tag => tag.startsWith("customTag:"));
    
    const form = new ActionFormData();
    form.title("§6Chat Customization");
    form.body("§7Select an option to customize your chat:");
    
    if (hasNickChanger) {
        form.button("§eNickname\n§fChange your display name", "textures/ui/icon_steve");
    } else {
        form.button("§8Nickname\n§7§o[LOCKED]", "textures/ui/icon_lock");
    }
    
    if (hasNCChanger) {
        form.button("§bName Color\n§fChange your name color", "textures/items/dye_powder_blue");
    } else {
        form.button("§8Name Color\n§7§o[LOCKED]", "textures/ui/icon_lock");
    }
    
    if (hasCCChanger) {
        form.button("§dChat Color\n§fChange your message color", "textures/items/dye_powder_purple");
    } else {
        form.button("§8Chat Color\n§7§o[LOCKED]", "textures/ui/icon_lock");
    }
    
    if (customTags.length > 0) {
        form.button("§6Custom Tag\n§fChoose your custom tag", "textures/items/name_tag");
    } else {
        form.button("§8Custom Tag\n§7§o[LOCKED]", "textures/ui/icon_lock");
    }
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    if (response.selection === 0) {
        if (hasNickChanger) {
            system.runTimeout(() => {
                showNicknameForm(player);
            }, 1);
        } else {
            player.sendMessage("§cYou need to purchase the §eNickname Changer§c perk to use this feature!");
        }
    } else if (response.selection === 1) {
        if (hasNCChanger) {
            system.runTimeout(() => {
                showNameColorForm(player);
            }, 1);
        } else {
            player.sendMessage("§cYou need to purchase the §bName Color Changer§c perk to use this feature!");
        }
    } else if (response.selection === 2) {
        if (hasCCChanger) {
            system.runTimeout(() => {
                showChatColorForm(player);
            }, 1);
        } else {
            player.sendMessage("§cYou need to purchase the §dChat Color Changer§c perk to use this feature!");
        }
    } else if (response.selection === 3) {
        if (customTags.length > 0) {
            system.runTimeout(() => {
                showCustomTagSelector(player);
            }, 1);
        } else {
            player.sendMessage("§cYou don't own any custom tags!");
        }
    }
}

async function showCustomTagSelector(player) {
    const tags = player.getTags();
    const customTags = tags.filter(tag => tag.startsWith("customTag:"));
    
    if (customTags.length === 0) {
        player.sendMessage("§cYou don't own any custom tags!");
        return;
    }
    
    const form = new ActionFormData();
    form.title("§6Custom Tags");
    form.body("§7Select a tag to display in chat:");
    
    // Opción para no mostrar tag - textura válida
    form.button("§8None\n§fDon't display a custom tag", "textures/ui/cancel");
    
    // Agregar las tags que posee
    for (const tag of customTags) {
        const tagContent = tag.replace("customTag:", "");
        form.button(`${tagContent}\n§fDisplay this tag`, "textures/items/name_tag");
    }
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    if (response.selection === 0) {
        // Solo remover displayTag, mantener customTag
        const oldDisplayTag = tags.find(tag => tag.startsWith("displayTag:"));
        if (oldDisplayTag) {
            system.run(() => {
                player.removeTag(oldDisplayTag);
            });
        }
        player.sendMessage("§a§lCustom Tag §7>> §rCustom tag display disabled!");
        return;
    }
    
    const selectedTag = customTags[response.selection - 1];
    const tagContent = selectedTag.replace("customTag:", "");
    
    // Remover displayTag anterior si existe
    const oldDisplayTag = tags.find(tag => tag.startsWith("displayTag:"));
    if (oldDisplayTag) {
        system.run(() => {
            player.removeTag(oldDisplayTag);
        });
    }
    
    // Agregar nuevo displayTag
    system.run(() => {
        player.addTag(`displayTag:${tagContent}`);
    });
    
    player.sendMessage(`§a§lCustom Tag §7>> §rNow displaying: ${tagContent}`);
}

async function showNicknameForm(player) {
    const currentTime = Date.now();
    const lastChange = nicknameCooldowns.get(player.id) || 0;
    const timeLeft = (NICKNAME_COOLDOWN - (currentTime - lastChange)) / 1000;
    
    if (timeLeft > 0) {
        player.sendMessage(`§cYou must wait §e${Math.ceil(timeLeft)}§c seconds before changing your nickname again!`);
        return;
    }
    
    const form = new ModalFormData();
    form.title("§eChange Nickname");
    form.textField("§7Enter your new nickname (max 12 characters)\n§7Leave empty to reset to real name:", "Nickname");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const nickname = response.formValues[0];
    
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith('chatName:')) {
            system.run(() => {
                player.removeTag(tag);
            });
        }
    }
    
    if (!nickname || nickname.trim() === "") {
        nicknameCooldowns.set(player.id, Date.now());
        player.sendMessage("§aYour nickname has been reset to: §e" + player.name);
        system.run(() => {
            updatePlayerNameTag(player);
        });
        return;
    }
    
    if (nickname.length > 12) {
        player.sendMessage("§cNickname cannot exceed 12 characters!");
        return;
    }
    
    system.run(() => {
        player.addTag(`chatName:${nickname}`);
    });
    nicknameCooldowns.set(player.id, Date.now());
    player.sendMessage(`§aYour nickname has been changed to: §e${nickname}`);
    
    system.run(() => {
        updatePlayerNameTag(player);
    });
}

async function showNameColorForm(player) {
    const form = new ActionFormData();
    form.title("§bName Color");
    form.body("§7Select Bold option:");
    form.button("§aNormal", "textures/items/paper");
    form.button("§eBold", "textures/items/book_normal");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const boldChoice = response.selection === 1;
    
    system.runTimeout(() => {
        showNameColorSelection(player, boldChoice);
    }, 1);
}

async function showNameColorSelection(player, boldChoice) {
    const form = new ModalFormData();
    form.title("§bName Color");
    form.dropdown("§7Select a color:", [
        "Black",
        "Dark Blue",
        "Dark Green",
        "Dark Aqua",
        "Dark Red",
        "Dark Purple",
        "Gold",
        "Gray",
        "Dark Gray",
        "Blue",
        "Green",
        "Aqua",
        "Red",
        "Light Purple",
        "Yellow",
        "White"
    ]);
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const colorIndex = response.formValues[0];
    
    const colorCodes = ["§0", "§1", "§2", "§3", "§4", "§5", "§6", "§7", "§8", "§9", "§a", "§b", "§c", "§d", "§e", "§f"];
    const colorNames = ["Black", "Dark Blue", "Dark Green", "Dark Aqua", "Dark Red", "Dark Purple", "Gold", "Gray", "Dark Gray", "Blue", "Green", "Aqua", "Red", "Light Purple", "Yellow", "White"];
    
    const selectedColor = colorCodes[colorIndex];
    
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith('nameColor:')) {
            system.run(() => {
                player.removeTag(tag);
            });
        }
    }
    
    if (boldChoice) {
        if (!player.getTags().includes('nameBold')) {
            system.run(() => {
                player.addTag('nameBold');
            });
        }
    } else {
        if (player.getTags().includes('nameBold')) {
            system.run(() => {
                player.removeTag('nameBold');
            });
        }
    }
    
    system.run(() => {
        player.addTag(`nameColor:${selectedColor}`);
    });
    player.sendMessage(`§aYour name color has been changed to: ${selectedColor}${boldChoice ? "§l" : ""}${colorNames[colorIndex]}`);
    
    system.run(() => {
        updatePlayerNameTag(player);
    });
}

async function showChatColorForm(player) {
    const form = new ActionFormData();
    form.title("§dChat Color");
    form.body("§7Select Bold option:");
    form.button("§aNormal", "textures/items/paper");
    form.button("§eBold", "textures/items/book_normal");
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const boldChoice = response.selection === 1;
    
    system.runTimeout(() => {
        showChatColorSelection(player, boldChoice);
    }, 1);
}

async function showChatColorSelection(player, boldChoice) {
    const form = new ModalFormData();
    form.title("§dChat Color");
    form.dropdown("§7Select a color:", [
        "Black",
        "Dark Blue",
        "Dark Green",
        "Dark Aqua",
        "Dark Red",
        "Dark Purple",
        "Gold",
        "Gray",
        "Dark Gray",
        "Blue",
        "Green",
        "Aqua",
        "Red",
        "Light Purple",
        "Yellow",
        "White"
    ]);
    
    const response = await form.show(player);
    
    if (response.canceled) return;
    
    const colorIndex = response.formValues[0];
    
    const colorCodes = ["§0", "§1", "§2", "§3", "§4", "§5", "§6", "§7", "§8", "§9", "§a", "§b", "§c", "§d", "§e", "§f"];
    const colorNames = ["Black", "Dark Blue", "Dark Green", "Dark Aqua", "Dark Red", "Dark Purple", "Gold", "Gray", "Dark Gray", "Blue", "Green", "Aqua", "Red", "Light Purple", "Yellow", "White"];
    
    const selectedColor = colorCodes[colorIndex];
    
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith('chatColor:')) {
            system.run(() => {
                player.removeTag(tag);
            });
        }
    }
    
    if (boldChoice) {
        if (!player.getTags().includes('chatBold')) {
            system.run(() => {
                player.addTag('chatBold');
            });
        }
    } else {
        if (player.getTags().includes('chatBold')) {
            system.run(() => {
                player.removeTag('chatBold');
            });
        }
    }
    
    system.run(() => {
        player.addTag(`chatColor:${selectedColor}`);
    });
    player.sendMessage(`§aYour chat color has been changed to: ${selectedColor}${boldChoice ? "§l" : ""}${colorNames[colorIndex]}`);
}

function tryShowForm(player) {
    if (pendingForms.has(player.id)) {
        return;
    }
    
    pendingForms.set(player.id, true);
    
    let attempts = 0;
    const maxAttempts = 20;
    
    const tryShow = () => {
        attempts++;
        
        try {
            showChatMenu(player).then(() => {
                pendingForms.delete(player.id);
            }).catch(() => {
                if (attempts < maxAttempts) {
                    system.runTimeout(tryShow, 5);
                } else {
                    pendingForms.delete(player.id);
                }
            });
        } catch (e) {
            if (attempts < maxAttempts) {
                system.runTimeout(tryShow, 5);
            } else {
                pendingForms.delete(player.id);
            }
        }
    };
    
    system.runTimeout(tryShow, 5);
}

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const msg = event.message;
    
    if (msg === "!chat") {
        event.cancel = true;
        tryShowForm(player);
        return;
    }
    
    chatrank(event);
});

export { chatrank };