import { world, system } from "@minecraft/server";
import { addMultiSell, addMultiBlock, getMultiSell, getMultiBlock } from "./sidebar.js";

function getTokenFinderMultiplier(player) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("multiTokenFinder:")) {
            const multiStr = tag.replace("multiTokenFinder:", "");
            const amount = parseFloat(multiStr);
            if (!isNaN(amount)) {
                return amount;
            }
        }
    }
    return 1;
}

function setTokenFinderMultiplier(player, amount) {
    const tags = player.getTags();
    for (const tag of tags) {
        if (tag.startsWith("multiTokenFinder:")) {
            player.removeTag(tag);
        }
    }
    player.addTag(`multiTokenFinder:${amount}`);
}

world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const msg = event.message.toLowerCase();

    if (msg === "!upgrades") {
        system.runTimeout(() => {
            const multiSell = getMultiSell(player);
            const multiBlock = getMultiBlock(player);
            const multiTokenFinder = getTokenFinderMultiplier(player);
            
            player.sendMessage(`§6|--------------------------------|`);
            player.sendMessage(`§6| §l§eYour Multipliers`);
            player.sendMessage(`§6|`);
            player.sendMessage(`§6| §7Sell Multiplier: §e${multiSell.toFixed(2)}x`);
            player.sendMessage(`§6| §7Block Multiplier: §a${multiBlock.toFixed(2)}x`);
            player.sendMessage(`§6| §7Token Finder Multiplier: §6${multiTokenFinder.toFixed(2)}x`);
            player.sendMessage(`§6|--------------------------------|`);
        }, 1);
        event.cancel = true;
    }
});

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const tags = player.getTags();
        
        for (const tag of tags) {
            if (tag.startsWith("upgradeSell:")) {
                const multiStr = tag.replace("upgradeSell:", "");
                const amount = parseFloat(multiStr);
                if (!isNaN(amount) && amount > 0) {
                    addMultiSell(player, amount);
                    player.sendMessage(`§a§lUpgrade §7>> §aAdded §e${amount.toFixed(2)}x §ato your sell multiplier!`);
                }
                player.removeTag(tag);
            }

            if (tag.startsWith("upgradeBlock:")) {
                const multiStr = tag.replace("upgradeBlock:", "");
                const amount = parseFloat(multiStr);
                if (!isNaN(amount) && amount > 0) {
                    addMultiBlock(player, amount);
                    player.sendMessage(`§a§lUpgrade §7>> §aAdded §e${amount.toFixed(2)}x §ato your block multiplier!`);
                }
                player.removeTag(tag);
            }

            if (tag.startsWith("upgradeTokenFinder:")) {
                const multiStr = tag.replace("upgradeTokenFinder:", "");
                const amount = parseFloat(multiStr);
                if (!isNaN(amount) && amount > 0) {
                    const current = getTokenFinderMultiplier(player);
                    setTokenFinderMultiplier(player, current + amount);
                    player.sendMessage(`§a§lUpgrade §7>> §aAdded §e${amount.toFixed(2)}x §ato your Token Finder chance!`);
                }
                player.removeTag(tag);
            }

            if (tag.startsWith("setTokenFinderMulti:")) {
                const multiStr = tag.replace("setTokenFinderMulti:", "");
                const amount = parseFloat(multiStr);
                if (!isNaN(amount) && amount >= 1) {
                    setTokenFinderMultiplier(player, amount);
                    player.sendMessage(`§a§lUpgrade §7>> §aSet your Token Finder multiplier to §e${amount.toFixed(2)}x§a!`);
                }
                player.removeTag(tag);
            }
        }
    }
}, 1);