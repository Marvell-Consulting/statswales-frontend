/* eslint-disable @typescript-eslint/naming-convention */

// Special thanks ChatGPT...  The GovUK pagination algorithm
export function generateSequenceForNumber(highlight: number, end: number): (string | number)[] {
    const sequence: (string | number)[] = [];

    // Validate input
    if (highlight < 1 || highlight > end) {
        throw new Error(`Highlighted number must be between 1 and ${end}.`);
    }

    if (end - 1 < 3) {
        sequence.push(
            ...Array.from({ length: end - 1 + 1 }, (_, index) => 1 + index).map((num) =>
                num === highlight ? num : num
            )
        );
        return sequence;
    }

    // Case 1: Highlight is within the first 3 pages
    if (highlight <= 3) {
        sequence.push(...Array.from({ length: 3 }, (_, index) => 1 + index));
        sequence[highlight - 1] = highlight; // Highlight the specific number
        if (end > 4) {
            sequence.push('...');
            sequence.push(end);
        }
        return sequence;
    }

    // Case 2: Highlight is near or at the last 3 pages
    if (highlight >= end - 2) {
        if (end - 3 > 1) {
            sequence.push(1, '...');
        }
        for (let i = end - 3; i <= end; i++) {
            if (i === highlight) {
                sequence.push(i);
            } else {
                sequence.push(i);
            }
        }
        return sequence;
    }

    // Case 3: General case
    if (highlight - 2 > 1) {
        sequence.push(1, '...');
        sequence.push(highlight - 1);
    } else {
        sequence.push(...Array.from({ length: highlight - 1 }, (_, index) => index + 1));
    }

    sequence.push(highlight); // Highlight the number

    if (highlight + 1 < end) {
        sequence.push(highlight + 1, '...', end);
    } else {
        sequence.push(...Array.from({ length: end - highlight }, (_, index) => highlight + 1 + index));
    }

    return sequence;
}
