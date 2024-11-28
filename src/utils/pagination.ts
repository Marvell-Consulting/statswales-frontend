// Special thanks ChatGPT...  The GovUK pagination algorithm
export function generateSequenceForNumber(highlight: number, end: number): (string | number)[] {
    const sequence: (string | number)[] = [];

    // Validate input
    if (highlight > end) {
        throw new Error(`Highlighted number must be between 1 and ${end}.`);
    }

    // Numbers before the highlighted number
    if (highlight - 1 > 1) {
        sequence.push(1, '...');
        sequence.push(highlight - 1);
    } else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        sequence.push(...Array.from({ length: highlight - 1 }, (_, index) => index + 1));
    }

    // Highlighted number
    sequence.push(highlight);

    // Numbers after the highlighted number
    if (highlight + 1 < end) {
        sequence.push(highlight + 1);
        sequence.push('...', end);
    } else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        sequence.push(...Array.from({ length: end - highlight }, (_, index) => highlight + 1 + index));
    }

    return sequence;
}
