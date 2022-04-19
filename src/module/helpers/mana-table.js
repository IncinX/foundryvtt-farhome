export function getSpellPowerToManaTable() {
  let spellPowerToManaTable = [0, 3, 7, 12, 19, 27, 36, 48];

  for (let i = 8; i <= 30; i++) {
    spellPowerToManaTable.push(spellPowerToManaTable[i - 1] + 12);
  }

  return spellPowerToManaTable;
}
