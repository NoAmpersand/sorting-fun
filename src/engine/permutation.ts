/**
 * Turns an array of ids into a permutation of {0, ..., n-1}.
 * The target rank of an element is its position once the input is sorted
 * stably: by value, then by initial position (= id). With distinct values
 * this is the usual permutation; with duplicates the final permutation is the
 * identity exactly when the algorithm was stable.
 */
export function stableRanks(values: number[]): number[] {
    const order = values.map((_, id) => id).sort((x, y) => values[x] - values[y] || x - y);
    const rank = new Array<number>(values.length);
    order.forEach((id, r) => {
        rank[id] = r;
    });
    return rank;
}

/** sigma(i) = target rank of the element currently at position i. */
export function toPermutation(ids: number[], rank: number[]): number[] {
    return ids.map((id) => rank[id]);
}

/** Number of pairs i < j with p[i] > p[j]. O(n^2), fine for n <= 256. */
export function inversions(p: number[]): number {
    let count = 0;
    for (let i = 0; i < p.length; i++) {
        for (let j = i + 1; j < p.length; j++) {
            if (p[i] > p[j]) count++;
        }
    }
    return count;
}

/**
 * Cycle decomposition of i -> p[i]. Only meaningful when p is a bijection;
 * returns null otherwise (temporarily the case during a merge).
 */
export function cycles(p: number[]): number[][] | null {
    const n = p.length;
    const seen = new Array<boolean>(n).fill(false);
    const hit = new Array<boolean>(n).fill(false);
    for (const x of p) {
        if (x < 0 || x >= n || hit[x]) return null;
        hit[x] = true;
    }
    const result: number[][] = [];
    for (let s = 0; s < n; s++) {
        if (seen[s]) continue;
        const c: number[] = [];
        let x = s;
        while (!seen[x]) {
            seen[x] = true;
            c.push(x);
            x = p[x];
        }
        result.push(c);
    }
    return result;
}

/** Length of a longest strictly increasing subsequence (patience sorting). */
export function lisLength(p: number[]): number {
    const tails: number[] = [];
    for (const x of p) {
        let lo = 0;
        let hi = tails.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (tails[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = x;
    }
    return tails.length;
}

export function fixedPoints(p: number[]): number {
    return p.reduce((acc, x, i) => acc + (x === i ? 1 : 0), 0);
}

export interface PermutationStats {
    n: number;
    inversions: number;
    cycles: number[][] | null;
    cycleCount: number | null;
    fixedPoints: number;
    sign: 1 | -1 | null;
    lis: number;
}

export function permutationStats(p: number[]): PermutationStats {
    const cyc = cycles(p);
    const cycleCount = cyc ? cyc.length : null;
    return {
        n: p.length,
        inversions: inversions(p),
        cycles: cyc,
        cycleCount,
        fixedPoints: fixedPoints(p),
        sign: cycleCount === null ? null : (p.length - cycleCount) % 2 === 0 ? 1 : -1,
        lis: lisLength(p),
    };
}

/** log2(n!) computed as a sum, exact enough for n in the thousands. */
export function log2Factorial(n: number): number {
    let s = 0;
    for (let k = 2; k <= n; k++) s += Math.log2(k);
    return s;
}

/** log2(n! / prod m_v!) where m_v are the multiplicities of the values. */
export function log2Multinomial(values: number[]): number {
    const mult = new Map<number, number>();
    for (const v of values) mult.set(v, (mult.get(v) ?? 0) + 1);
    let s = log2Factorial(values.length);
    mult.forEach((m) => {
        s -= log2Factorial(m);
    });
    return s;
}

export function harmonic(n: number): number {
    let s = 0;
    for (let k = 1; k <= n; k++) s += 1 / k;
    return s;
}

/** Worst case of top-down merge sort: n ceil(log2 n) - 2^ceil(log2 n) + 1. */
export function mergeWorst(n: number): number {
    if (n <= 1) return 0;
    const k = Math.ceil(Math.log2(n));
    return n * k - 2 ** k + 1;
}

/** Expected comparisons of quicksort on a uniform random permutation: 2(n+1)H_n - 4n. */
export function quickAverage(n: number): number {
    if (n <= 1) return 0;
    return 2 * (n + 1) * harmonic(n) - 4 * n;
}

/** Formats a cycle decomposition, 1-indexed, omitting fixed points: (1 3 5)(2 4). */
export function formatCycles(cyc: number[][]): string {
    const nonTrivial = cyc.filter((c) => c.length > 1);
    if (nonTrivial.length === 0) return "id";
    return nonTrivial.map((c) => `(${c.map((x) => x + 1).join(" ")})`).join("");
}
