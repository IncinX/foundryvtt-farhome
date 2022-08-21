import {DefaultSimpleParser} from '../parser';
import {DicePool, dicePoolMonoid} from './dice';

// #todo Add support for bonus dice like bcs1, bcs2, bs1, bs2 (which interprets bonus as b, dice type letter and number to add... even bw1 should work... 'c' is special as a meaning crit)

function letterToRolls(letter, occurrences) {
    if (letter === 'h') {
        return new DicePool(occurrences, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    } else if (letter === 's') {
        return new DicePool(0, occurrences, 0, 0, 0, 0, 0, 0, 0, 0);
    } else if (letter === 'e') {
        return new DicePool(0, 0, occurrences, 0, 0, 0, 0, 0, 0, 0);
    } else if (letter === 'n') {
        return new DicePool(0, 0, 0, occurrences, 0, 0, 0, 0, 0, 0);
    } else if (letter === 'b') {
        return new DicePool(0, 0, 0, 0, occurrences, 0, 0, 0, 0, 0);
    } else if (letter === 't') {
        return new DicePool(0, 0, 0, 0, 0, occurrences, 0, 0, 0, 0);
    } else if (letter === '+') {
        return new DicePool(0, 0, 0, 0, 0, 0, occurrences, 0, 0, 0);
    } else if (letter === 'd') {
        return new DicePool(0, 0, 0, 0, 0, 0, 0, occurrences, 0, 0);
    } else if (letter === 'g') {
        return new DicePool(0, 0, 0, 0, 0, 0, 0, 0, occurrences, 0);
    } else if (letter === 'w') {
        return new DicePool(0, 0, 0, 0, 0, 0, 0, 0, 0, occurrences);
    } else {
        throw new Error(`Unknown letter ${letter}`);
    }
}

export class SimpleParser extends DefaultSimpleParser {
    constructor() {
        super(
            'hsenbt+dgw',
            letterToRolls,
            dicePoolMonoid,
            ['hero', 'superior', 'enhanced', 'normal', 'bad', 'terrible', 'superior defense', 'defense', 'guaranteed wound', 'wound'],
        );
    }
}
