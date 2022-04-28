export function getSpellPowerToMaxManaTable() {
  const spellPowerToManaTable = [0, 3, 7, 12, 19, 27, 36, 48];

  for (let i = 8; i <= 30; i++) {
    spellPowerToManaTable.push(spellPowerToManaTable[i - 1] + 12);
  }

  return spellPowerToManaTable;
}

export function convertSpellLevelToManaCost(spellLevel) {
  const spellLevelToManaCost = [0, 1, 2, 3, 4, 6, 8, 10, 13, 16, 20];

  return spellLevelToManaCost[spellLevel];
}
