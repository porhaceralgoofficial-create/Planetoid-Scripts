import { world, system } from "@minecraft/server";

const objectives = [
  "efficiency",
  "blocks",
  "fort",
  "tok",
  "key",
  "xppic",
  "time",
  "lvl",
  "lvlp",
  "balance",
  "balance_k",
  "balance_m",
  "balance_b",
  "balance_t",
  "balance_q",
  "balance_qi",
  "balance_sx",
  "balance_sp",
  "balance_oc",
  "balance_no",
  "prestige",
  "hours",
  "min",
  "mine"
];

for (const obj of objectives) {
  try { world.scoreboard.addObjective(obj, obj); } catch {}
}

// ORDEN DE PRIORIDAD: VIP < VIP+ < Ripper < Helper < Builder < Mod < Admin < Dev < Co-Owner < Owner
const RANK_PRIORITY = [
    { tag: "Rank:§dOwner", display: "§dOwner", priority: 10 },
    { tag: "Rank:§1Co-Owner", display: "§1Co-Owner", priority: 9 },
    { tag: "Rank:§9Dev", display: "§9Dev", priority: 8 },
    { tag: "Rank:§5Administrator", display: "§5Administrator", priority: 7 },
    { tag: "Rank:§2Moderator", display: "§2Moderator", priority: 6 },
    { tag: "Rank:§6Builder", display: "§6Builder", priority: 5 },
    { tag: "Rank:§aHelper", display: "§aHelper", priority: 4 },
    { tag: "Rank:§l§cRipper", display: "§l§cRipper", priority: 3 },
    { tag: "Rank:§q§lV.I.P §r§a+", display: "§q§lV.I.P §r§a+", priority: 2 },
    { tag: "Rank:§2V.I.P", display: "§2V.I.P", priority: 1 }
];

function getHighestRank(player) {
    const tags = player.getTags();
    let highestRank = null;
    let highestPriority = -1;
    
    for (const rankInfo of RANK_PRIORITY) {
        if (tags.includes(rankInfo.tag) && rankInfo.priority > highestPriority) {
            highestPriority = rankInfo.priority;
            highestRank = rankInfo.display;
        }
    }
    
    return highestRank || "§7Member";
}

function getBalance(player) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("currMoney:")) {
      const moneyStr = tag.replace("currMoney:", "");
      const amount = parseFloat(moneyStr);
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  return 0;
}

function setBalanceTag(player, amount) {
  system.run(() => {
    const tags = player.getTags();
    for (const tag of tags) {
      if (tag.startsWith("currMoney:")) {
        player.removeTag(tag);
      }
    }
    player.addTag(`currMoney:${amount}`);
  });
}

function getTokens(player) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("currTokens:")) {
      const tokensStr = tag.replace("currTokens:", "");
      const amount = parseFloat(tokensStr);
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  return 0;
}

function setTokensTag(player, amount) {
  system.run(() => {
    const tags = player.getTags();
    for (const tag of tags) {
      if (tag.startsWith("currTokens:")) {
        player.removeTag(tag);
      }
    }
    player.addTag(`currTokens:${amount}`);
  });
}

function getPrestige(player) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("currPrestige:")) {
      const prestigeStr = tag.replace("currPrestige:", "");
      const amount = parseFloat(prestigeStr);
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  return 0;
}

function setPrestigeTag(player, amount) {
  system.run(() => {
    const tags = player.getTags();
    for (const tag of tags) {
      if (tag.startsWith("currPrestige:")) {
        player.removeTag(tag);
      }
    }
    player.addTag(`currPrestige:${amount}`);
  });
}

function getMultiSell(player) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("multiSell:")) {
      const multiStr = tag.replace("multiSell:", "");
      const amount = parseFloat(multiStr);
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  return 1;
}

function setMultiSellTag(player, amount) {
  system.run(() => {
    const tags = player.getTags();
    for (const tag of tags) {
      if (tag.startsWith("multiSell:")) {
        player.removeTag(tag);
      }
    }
    player.addTag(`multiSell:${amount}`);
  });
}

function getMultiBlock(player) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("multiBlock:")) {
      const multiStr = tag.replace("multiBlock:", "");
      const amount = parseFloat(multiStr);
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  return 1;
}

function setMultiBlockTag(player, amount) {
  system.run(() => {
    const tags = player.getTags();
    for (const tag of tags) {
      if (tag.startsWith("multiBlock:")) {
        player.removeTag(tag);
      }
    }
    player.addTag(`multiBlock:${amount}`);
  });
}

export function addMoney(player, amount) {
  const current = getBalance(player);
  setBalanceTag(player, current + amount);
}

export function removeMoney(player, amount) {
  const current = getBalance(player);
  const newBalance = Math.max(0, current - amount);
  setBalanceTag(player, newBalance);
  return current >= amount;
}

export function setBalance(player, amount) {
  setBalanceTag(player, Math.max(0, amount));
}

export function addTokens(player, amount) {
  const current = getTokens(player);
  setTokensTag(player, current + amount);
}

export function removeTokens(player, amount) {
  const current = getTokens(player);
  const newTokens = Math.max(0, current - amount);
  setTokensTag(player, newTokens);
  return current >= amount;
}

export function setTokens(player, amount) {
  setTokensTag(player, Math.max(0, amount));
}

export function addPrestige(player, amount) {
  const current = getPrestige(player);
  const newAmount = Math.min(current + amount, 1e31);
  setPrestigeTag(player, newAmount);
}

export function removePrestige(player, amount) {
  const current = getPrestige(player);
  const newPrestige = Math.max(0, current - amount);
  setPrestigeTag(player, newPrestige);
  return current >= amount;
}

export function setPrestige(player, amount) {
  const capped = Math.min(Math.max(0, amount), 1e31);
  setPrestigeTag(player, capped);
}

export function addMultiSell(player, amount) {
  const current = getMultiSell(player);
  setMultiSellTag(player, Math.max(1, current + amount));
}

export function setMultiSell(player, amount) {
  setMultiSellTag(player, Math.max(1, amount));
}

export function addMultiBlock(player, amount) {
  const current = getMultiBlock(player);
  setMultiBlockTag(player, Math.max(1, current + amount));
}

export function setMultiBlock(player, amount) {
  setMultiBlockTag(player, Math.max(1, amount));
}

export { getBalance, getTokens, getPrestige, getMultiSell, getMultiBlock };

function getBackpackValue(player) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("currBackpack:")) {
      const backpackStr = tag.replace("currBackpack:", "");
      const amount = parseFloat(backpackStr);
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  return 0;
}

function setBackpackValue(player, amount) {
  system.run(() => {
    const tags = player.getTags();
    for (const tag of tags) {
      if (tag.startsWith("currBackpack:")) {
        player.removeTag(tag);
      }
    }
    player.addTag(`currBackpack:${amount}`);
  });
}

function getBackpackMaxValue(player) {
  const tags = player.getTags();
  for (const tag of tags) {
    if (tag.startsWith("currBackpackMax:")) {
      const backpackStr = tag.replace("currBackpackMax:", "");
      const amount = parseFloat(backpackStr);
      if (!isNaN(amount)) {
        return amount;
      }
    }
  }
  return 100;
}

function setBackpackMaxValue(player, amount) {
  system.run(() => {
    const tags = player.getTags();
    for (const tag of tags) {
      if (tag.startsWith("currBackpackMax:")) {
        player.removeTag(tag);
      }
    }
    player.addTag(`currBackpackMax:${amount}`);
  });
}

function addBackpackValue(player, amount) {
  const current = getBackpackValue(player);
  setBackpackValue(player, current + amount);
}

function removeBackpackValue(player, amount) {
  const current = getBackpackValue(player);
  const newBackpack = Math.max(0, current - amount);
  setBackpackValue(player, newBackpack);
  return current >= amount;
}

function addBackpackMaxValue(player, amount) {
  const current = getBackpackMaxValue(player);
  setBackpackMaxValue(player, current + amount);
}

export { getBackpackValue, setBackpackValue, getBackpackMaxValue, setBackpackMaxValue, addBackpackValue, removeBackpackValue, addBackpackMaxValue };

export function formatBackpack(amount) {
  if (amount === 0) return "0";
  
  const suffixes = [
    { value: 1e99, suffix: "Tg" },
    { value: 1e96, suffix: "Dtg" },
    { value: 1e93, suffix: "Utg" },
    { value: 1e90, suffix: "Vg" },
    { value: 1e87, suffix: "Uvg" },
    { value: 1e84, suffix: "Dvg" },
    { value: 1e81, suffix: "Tvg" },
    { value: 1e78, suffix: "Qavg" },
    { value: 1e75, suffix: "Qivg" },
    { value: 1e72, suffix: "Sxvg" },
    { value: 1e69, suffix: "Spvg" },
    { value: 1e66, suffix: "Ocvg" },
    { value: 1e63, suffix: "Nvg" },
    { value: 1e60, suffix: "Ud" },
    { value: 1e57, suffix: "Dd" },
    { value: 1e54, suffix: "Td" },
    { value: 1e51, suffix: "Qad" },
    { value: 1e48, suffix: "Qid" },
    { value: 1e45, suffix: "Sxd" },
    { value: 1e42, suffix: "Spd" },
    { value: 1e39, suffix: "Ocd" },
    { value: 1e36, suffix: "Nd" },
    { value: 1e33, suffix: "Dc" },
    { value: 1e30, suffix: "No" },
    { value: 1e27, suffix: "Oc" },
    { value: 1e24, suffix: "Sp" },
    { value: 1e21, suffix: "Sx" },
    { value: 1e18, suffix: "Qi" },
    { value: 1e15, suffix: "Q" },
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" }
  ];

  for (const { value, suffix } of suffixes) {
    if (amount >= value) {
      const formatted = (amount / value).toFixed(2);
      return `${formatted}${suffix}`;
    }
  }

  return Math.floor(amount).toString();
}

export function formatMoney(amount) {
  if (amount === 0) return "0";
  
  const suffixes = [
    { value: 1e99, suffix: "Tg" },
    { value: 1e96, suffix: "Dtg" },
    { value: 1e93, suffix: "Utg" },
    { value: 1e90, suffix: "Vg" },
    { value: 1e87, suffix: "Uvg" },
    { value: 1e84, suffix: "Dvg" },
    { value: 1e81, suffix: "Tvg" },
    { value: 1e78, suffix: "Qavg" },
    { value: 1e75, suffix: "Qivg" },
    { value: 1e72, suffix: "Sxvg" },
    { value: 1e69, suffix: "Spvg" },
    { value: 1e66, suffix: "Ocvg" },
    { value: 1e63, suffix: "Nvg" },
    { value: 1e60, suffix: "Ud" },
    { value: 1e57, suffix: "Dd" },
    { value: 1e54, suffix: "Td" },
    { value: 1e51, suffix: "Qad" },
    { value: 1e48, suffix: "Qid" },
    { value: 1e45, suffix: "Sxd" },
    { value: 1e42, suffix: "Spd" },
    { value: 1e39, suffix: "Ocd" },
    { value: 1e36, suffix: "Nd" },
    { value: 1e33, suffix: "Dc" },
    { value: 1e30, suffix: "No" },
    { value: 1e27, suffix: "Oc" },
    { value: 1e24, suffix: "Sp" },
    { value: 1e21, suffix: "Sx" },
    { value: 1e18, suffix: "Qi" },
    { value: 1e15, suffix: "Q" },
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" }
  ];

  for (const { value, suffix } of suffixes) {
    if (amount >= value) {
      const formatted = (amount / value).toFixed(2);
      return `${formatted}${suffix}`;
    }
  }

  return Math.floor(amount).toString();
}

export function formatTokens(amount) {
  if (amount === 0) return "0";
  
  const suffixes = [
    { value: 1e99, suffix: "Tg" },
    { value: 1e96, suffix: "Dtg" },
    { value: 1e93, suffix: "Utg" },
    { value: 1e90, suffix: "Vg" },
    { value: 1e87, suffix: "Uvg" },
    { value: 1e84, suffix: "Dvg" },
    { value: 1e81, suffix: "Tvg" },
    { value: 1e78, suffix: "Qavg" },
    { value: 1e75, suffix: "Qivg" },
    { value: 1e72, suffix: "Sxvg" },
    { value: 1e69, suffix: "Spvg" },
    { value: 1e66, suffix: "Ocvg" },
    { value: 1e63, suffix: "Nvg" },
    { value: 1e60, suffix: "Ud" },
    { value: 1e57, suffix: "Dd" },
    { value: 1e54, suffix: "Td" },
    { value: 1e51, suffix: "Qad" },
    { value: 1e48, suffix: "Qid" },
    { value: 1e45, suffix: "Sxd" },
    { value: 1e42, suffix: "Spd" },
    { value: 1e39, suffix: "Ocd" },
    { value: 1e36, suffix: "Nd" },
    { value: 1e33, suffix: "Dc" },
    { value: 1e30, suffix: "No" },
    { value: 1e27, suffix: "Oc" },
    { value: 1e24, suffix: "Sp" },
    { value: 1e21, suffix: "Sx" },
    { value: 1e18, suffix: "Qi" },
    { value: 1e15, suffix: "Q" },
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" }
  ];

  for (const { value, suffix } of suffixes) {
    if (amount >= value) {
      const formatted = (amount / value).toFixed(2);
      return `${formatted}${suffix}`;
    }
  }

  return Math.floor(amount).toString();
}

export function formatPrestige(amount) {
  if (amount === 0) return "0";
  
  const suffixes = [
    { value: 1e30, suffix: "No" },
    { value: 1e27, suffix: "Oc" },
    { value: 1e24, suffix: "Sp" },
    { value: 1e21, suffix: "Sx" },
    { value: 1e18, suffix: "Qi" },
    { value: 1e15, suffix: "Q" },
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" }
  ];

  for (const { value, suffix } of suffixes) {
    if (amount >= value) {
      const formatted = (amount / value).toFixed(2);
      return `${formatted}${suffix}`;
    }
  }

  return Math.floor(amount).toString();
}

function parseMoneyAmount(input) {
  let amount = 0;
  const inputLower = input.toLowerCase();

  if (inputLower.endsWith("tg")) {
    amount = parseFloat(inputLower) * 1e99;
  } else if (inputLower.endsWith("dtg")) {
    amount = parseFloat(inputLower) * 1e96;
  } else if (inputLower.endsWith("utg")) {
    amount = parseFloat(inputLower) * 1e93;
  } else if (inputLower.endsWith("vg")) {
    amount = parseFloat(inputLower) * 1e90;
  } else if (inputLower.endsWith("uvg")) {
    amount = parseFloat(inputLower) * 1e87;
  } else if (inputLower.endsWith("dvg")) {
    amount = parseFloat(inputLower) * 1e84;
  } else if (inputLower.endsWith("tvg")) {
    amount = parseFloat(inputLower) * 1e81;
  } else if (inputLower.endsWith("qavg")) {
    amount = parseFloat(inputLower) * 1e78;
  } else if (inputLower.endsWith("qivg")) {
    amount = parseFloat(inputLower) * 1e75;
  } else if (inputLower.endsWith("sxvg")) {
    amount = parseFloat(inputLower) * 1e72;
  } else if (inputLower.endsWith("spvg")) {
    amount = parseFloat(inputLower) * 1e69;
  } else if (inputLower.endsWith("ocvg")) {
    amount = parseFloat(inputLower) * 1e66;
  } else if (inputLower.endsWith("nvg")) {
    amount = parseFloat(inputLower) * 1e63;
  } else if (inputLower.endsWith("ud")) {
    amount = parseFloat(inputLower) * 1e60;
  } else if (inputLower.endsWith("dd")) {
    amount = parseFloat(inputLower) * 1e57;
  } else if (inputLower.endsWith("td")) {
    amount = parseFloat(inputLower) * 1e54;
  } else if (inputLower.endsWith("qad")) {
    amount = parseFloat(inputLower) * 1e51;
  } else if (inputLower.endsWith("qid")) {
    amount = parseFloat(inputLower) * 1e48;
  } else if (inputLower.endsWith("sxd")) {
    amount = parseFloat(inputLower) * 1e45;
  } else if (inputLower.endsWith("spd")) {
    amount = parseFloat(inputLower) * 1e42;
  } else if (inputLower.endsWith("ocd")) {
    amount = parseFloat(inputLower) * 1e39;
  } else if (inputLower.endsWith("nd")) {
    amount = parseFloat(inputLower) * 1e36;
  } else if (inputLower.endsWith("dc")) {
    amount = parseFloat(inputLower) * 1e33;
  } else if (inputLower.endsWith("no")) {
    amount = parseFloat(inputLower) * 1e30;
  } else if (inputLower.endsWith("oc")) {
    amount = parseFloat(inputLower) * 1e27;
  } else if (inputLower.endsWith("sp")) {
    amount = parseFloat(inputLower) * 1e24;
  } else if (inputLower.endsWith("sx")) {
    amount = parseFloat(inputLower) * 1e21;
  } else if (inputLower.endsWith("qi")) {
    amount = parseFloat(inputLower) * 1e18;
  } else if (inputLower.endsWith("q")) {
    amount = parseFloat(inputLower) * 1e15;
  } else if (inputLower.endsWith("t")) {
    amount = parseFloat(inputLower) * 1e12;
  } else if (inputLower.endsWith("b")) {
    amount = parseFloat(inputLower) * 1e9;
  } else if (inputLower.endsWith("m")) {
    amount = parseFloat(inputLower) * 1e6;
  } else if (inputLower.endsWith("k")) {
    amount = parseFloat(inputLower) * 1e3;
  } else {
    amount = parseFloat(inputLower);
  }

  return amount;
}

function getMineLetter(mineScore) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (mineScore >= 0 && mineScore <= 25) {
    return letters[mineScore];
  }
  return "A";
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const tags = player.getTags();
    let hasCurrMoney = false;
    let hasCurrPrestige = false;
    let hasCurrTokens = false;
    let hasMultiSell = false;
    let hasMultiBlock = false;
    
    for (const tag of tags) {
      if (tag.startsWith("currMoney:")) {
        hasCurrMoney = true;
      }
      if (tag.startsWith("currPrestige:")) {
        hasCurrPrestige = true;
      }
      if (tag.startsWith("currTokens:")) {
        hasCurrTokens = true;
      }
      if (tag.startsWith("multiSell:")) {
        hasMultiSell = true;
      }
      if (tag.startsWith("multiBlock:")) {
        hasMultiBlock = true;
      }
    }
    
    if (!hasCurrMoney) {
      player.addTag("currMoney:0");
    }
    if (!hasCurrPrestige) {
      player.addTag("currPrestige:0");
    }
    if (!hasCurrTokens) {
      player.addTag("currTokens:0");
    }
    if (!hasMultiSell) {
      player.addTag("multiSell:1");
    }
    if (!hasMultiBlock) {
      player.addTag("multiBlock:1");
    }
  }
}, 20);

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const tags = player.getTags();
    
    for (const tag of tags) {
      if (tag.startsWith("getMoney:")) {
        const moneyStr = tag.replace("getMoney:", "");
        const amount = parseMoneyAmount(moneyStr);
        if (!isNaN(amount) && amount > 0) {
          addMoney(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }
      
      if (tag.startsWith("revMoney:")) {
        const moneyStr = tag.replace("revMoney:", "");
        const amount = parseMoneyAmount(moneyStr);
        if (!isNaN(amount) && amount > 0) {
          removeMoney(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }
      
      if (tag.startsWith("setMoney:")) {
        const moneyStr = tag.replace("setMoney:", "");
        const amount = parseMoneyAmount(moneyStr);
        if (!isNaN(amount) && amount >= 0) {
          setBalance(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }

      if (tag.startsWith("getTokens:")) {
        const tokensStr = tag.replace("getTokens:", "");
        const amount = parseMoneyAmount(tokensStr);
        if (!isNaN(amount) && amount > 0) {
          addTokens(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }
      
      if (tag.startsWith("revTokens:")) {
        const tokensStr = tag.replace("revTokens:", "");
        const amount = parseMoneyAmount(tokensStr);
        if (!isNaN(amount) && amount > 0) {
          removeTokens(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }
      
      if (tag.startsWith("setTokens:")) {
        const tokensStr = tag.replace("setTokens:", "");
        const amount = parseMoneyAmount(tokensStr);
        if (!isNaN(amount) && amount >= 0) {
          setTokens(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }

      if (tag.startsWith("getPrestige:")) {
        const prestigeStr = tag.replace("getPrestige:", "");
        const amount = parseMoneyAmount(prestigeStr);
        if (!isNaN(amount) && amount > 0) {
          addPrestige(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }
      
      if (tag.startsWith("revPrestige:")) {
        const prestigeStr = tag.replace("revPrestige:", "");
        const amount = parseMoneyAmount(prestigeStr);
        if (!isNaN(amount) && amount > 0) {
          removePrestige(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }
      
      if (tag.startsWith("setPrestige:")) {
        const prestigeStr = tag.replace("setPrestige:", "");
        const amount = parseMoneyAmount(prestigeStr);
        if (!isNaN(amount) && amount >= 0) {
          setPrestige(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }

      if (tag.startsWith("getMultiS:")) {
        const multiStr = tag.replace("getMultiS:", "");
        const amount = parseFloat(multiStr);
        if (!isNaN(amount)) {
          addMultiSell(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }

      if (tag.startsWith("setMultiS:")) {
        const multiStr = tag.replace("setMultiS:", "");
        const amount = parseFloat(multiStr);
        if (!isNaN(amount) && amount >= 1) {
          setMultiSell(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }

      if (tag.startsWith("getMultiB:")) {
        const multiStr = tag.replace("getMultiB:", "");
        const amount = parseFloat(multiStr);
        if (!isNaN(amount)) {
          addMultiBlock(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }

      if (tag.startsWith("setMultiB:")) {
        const multiStr = tag.replace("setMultiB:", "");
        const amount = parseFloat(multiStr);
        if (!isNaN(amount) && amount >= 1) {
          setMultiBlock(player, amount);
        }
        system.run(() => {
          player.removeTag(tag);
        });
      }
    }
  }
}, 20);

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const hoursObj = world.scoreboard.getObjective("hours");
    const minObj = world.scoreboard.getObjective("min");
    const mineObj = world.scoreboard.getObjective("mine");

    const balance = getBalance(player);
    const tokens = getTokens(player);
    const prestige = getPrestige(player);
    const formattedBalance = formatMoney(balance);
    const formattedTokens = formatTokens(tokens);
    const formattedPrestige = formatPrestige(prestige);
    
    let hours = 0;
    let minutes = 0;
    let mineScore = 0;

    if (hoursObj) {
      try { hours = hoursObj.getScore(player) || 0; } catch { hours = 0; }
    }
    if (minObj) {
      try { minutes = minObj.getScore(player) || 0; } catch { minutes = 0; }
    }
    if (mineObj) {
      try { mineScore = mineObj.getScore(player) || 0; } catch { mineScore = 0; }
    }

    const mineLetter = getMineLetter(mineScore);
    const playerRank = getHighestRank(player);

    player.onScreenDisplay.setTitle(
      `§r\n   §l§cPlanetoid Prisons       §r\n\n§4 Stats\n§l§c |§r §7User: §f${player.name}\n§l§c |§r §7Mine: §f${mineLetter}\n§l§c |§r §7Rank: ${playerRank}\n§l§c |§r §7Balance: $§f${formattedBalance}\n§l§c |§r §7Tokens: §f${formattedTokens}\n§l§c |§r §7Prestige: §f${formattedPrestige}\n§l§c |§r §7Time Played: §f${hours}hs, ${minutes}m\n\n §4Socials\n  §cRealm Code\n   §fXXXXXXX\n  §cDiscord Code\n   §fmSbwwaSVeb\n `,
      {
        fadeInDuration: 0,
        fadeOutDuration: 0,
        stayDuration: 80,
        subtitle: ""
      }
    );
  }
}, 40);

export { getHighestRank };