import {Predicate} from './lang';

export function countMatches<T>(array, match) {
    let count = 0;
    for (const elem of array) {
        if (match(elem)) {
            count += 1;
        }
    }
    return count;
}
