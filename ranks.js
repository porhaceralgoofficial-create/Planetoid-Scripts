import { world, system } from "@minecraft/server";
import { getPrestige, formatPrestige } from "./sidebar.js";

const ROMAN_NUMERALS = {
    1: "I", 2: "II", 3: "III", 4: "IV", 5: "V",
    6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X",
    20: "XX", 30: "XXX", 40: "XL", 50: "L",
    60: "LX", 70: "LXX", 80: "LXXX", 90: "XC",
    100: "C", 200: "CC", 300: "CCC", 400: "CD", 500: "D"
};

function getMineLetter(mineScore) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (mineScore >= 0 && mineScore <= 25) {
        return letters[mineScore];
    }
    return "A";
}

function numberToRoman(num) {
    if (num <= 0) return "p0";
    
    let roman = "";
    const values = [
        { value: 500, numeral: "D" },
        { value: 400, numeral: "CD" },
        { value: 100, numeral: "C" },
        { value: 90, numeral: "XC" },
        { value: 50, numeral: "L" },
        { value: 40, numeral: "XL" },
        { value: 10, numeral: "X" },
        { value: 9, numeral: "IX" },
        { value: 5, numeral: "V" },
        { value: 4, numeral: "IV" },
        { value: 1, numeral: "I" }
    ];
    
    for (const { value, numeral } of values) {
        while (num >= value) {
            roman += numeral;
            num -= value;
        }
    }
    
    // Si queda un resto, agregar "p" + el número
    if (num > 0) {
        roman += `p${num}`;
    }
    
    return roman || "p0";
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const mineObj = world.scoreboard.getObjective("mine");
        
        let mineScore = 0;
        
        if (mineObj) {
            try { mineScore = mineObj.getScore(player) || 0; } catch { mineScore = 0; }
        }
        
        const mineLetter = getMineLetter(mineScore);
        const newMineTag = `Rank:��a${mineLetter}`;
        
        const tags = player.getTags();
        for (const tag of tags) {
            if (tag.startsWith("Rank:§a") && tag !== newMineTag) {
                system.run(() => {
                    player.removeTag(tag);
                });
            }
        }
        
        if (!tags.includes(newMineTag)) {
            system.run(() => {
                player.addTag(newMineTag);
            });
        }
        
        const prestige = getPrestige(player);
        const prestigeFormatted = prestige === 0 ? "0" : numberToRoman(prestige);
        const newPrestigeTag = `Rank:§5${prestigeFormatted}`;
        
        const tagsUpdated = player.getTags();
        for (const tag of tagsUpdated) {
            if (tag.startsWith("Rank:§5") && tag !== newPrestigeTag) {
                system.run(() => {
                    player.removeTag(tag);
                });
            }
        }
        
        if (!tagsUpdated.includes(newPrestigeTag)) {
            system.run(() => {
                player.addTag(newPrestigeTag);
            });
        }
    }
}, 20);