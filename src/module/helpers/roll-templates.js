export function getStrongestKey(obj) {
  let strongestKey = null;
  let strongestValue = -Infinity;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key].value;
      if (value > strongestValue) {
        strongestKey = key;
        strongestValue = value;
      }
    }
  }
  return strongestKey;
}

export function getDefaultRollTemplate() {
  return `
  <h1>[[i.name]]</h1>
  <p>[[i.description]]</p>`;
}

export function getWeaponRollTemplate(strongestProf, strongestAttr) {
  return `
  <h1>[[i.name]]</h1>
  <blockquote>
  <p>5AP, [[i.weaponType]], [[i.range]], [[i.damageType]]</p>
  </blockquote>
  <p>[[s.skill(${strongestProf}, ${strongestAttr})]]</p>
  <p>[[fh('gw')]]</p>
  <p>[[i.description]]</p>`;
}

export function getManeuverRollTemplate(strongestProf, strongestAttr) {
  return `
  <h1>[[i.name]]</h1>
  <blockquote>
  <p>6AP, Sword, [[i.range]], Slashing</p>
  </blockquote>
  <p>[[s.skill(${strongestProf}, ${strongestAttr})]]</p>
  <p>[[fh('gw')]]</p>
  <p>[[i.description]]</p>`;
}

export function getArmorRollTemplate() {
  return `
  <h1>[[i.name]]</h1>
  <p>[[fh('+d')]]</p>
  <p>[[i.description]]</p>`;
}

export function getSpellRollTemplate(strongestProf, strongestAttr) {
  return `
  <h1>[[i.name]]</h1>
  <blockquote>
  <p>Lv[[i.castedSpellLevel]], [[i.castingTime]], [[i.range]], [[i.spellDuration]], [[i.damageType]]</p>
  </blockquote>
  <p>[[s.skill(${strongestProf}, ${strongestAttr})]]</p>
  <p>[[fh('gw')]]</p>
  <p>[[i.description]]</p>`;
}
