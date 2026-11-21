import { AlgorithmKey, Op } from "./types";

/**
 * Records every operation performed on the array of ids.
 * Comparisons only look at values, never at ids, so stability is not faked.
 */
export class Tracker {
    ops: Op[] = [];
    a: number[];

    constructor(ids: number[], private values: number[]) {
        this.a = ids.slice();
    }

    get n() {
        return this.a.length;
    }

    /** Sign of value(a[i]) - value(a[j]), recorded as one comparison. */
    cmp(i: number, j: number): number {
        this.ops.push({ t: "cmp", i, j });
        return Math.sign(this.values[this.a[i]] - this.values[this.a[j]]);
    }

    /** Compares two elements held outside the array, highlighting positions i and j. */
    cmpIds(idA: number, idB: number, i: number, j: number): number {
        this.ops.push({ t: "cmp", i, j });
        return Math.sign(this.values[idA] - this.values[idB]);
    }

    swap(i: number, j: number) {
        if (i === j) return;
        this.ops.push({ t: "swap", i, j });
        const tmp = this.a[i];
        this.a[i] = this.a[j];
        this.a[j] = tmp;
    }

    write(i: number, id: number) {
        this.ops.push({ t: "write", i, id, prev: this.a[i] });
        this.a[i] = id;
    }

    read(i: number): number {
        this.ops.push({ t: "read", i });
        return this.values[this.a[i]];
    }

    phase(label: string, lo: number, hi: number) {
        this.ops.push({ t: "phase", label, lo, hi });
    }
}

type Runner = (t: Tracker) => void;

const bubble: Runner = (t) => {
    const n = t.n;
    for (let i = 0; i < n - 1; i++) {
        t.phase(`Passe ${i + 1} sur ${n - 1}`, 0, n - 1 - i);
        for (let j = 0; j < n - 1 - i; j++) {
            if (t.cmp(j, j + 1) > 0) t.swap(j, j + 1);
        }
    }
};

const insertion: Runner = (t) => {
    const n = t.n;
    for (let i = 1; i < n; i++) {
        t.phase(`Insertion de l'élément ${i + 1} dans le préfixe trié`, 0, i);
        let j = i;
        while (j > 0 && t.cmp(j - 1, j) > 0) {
            t.swap(j - 1, j);
            j--;
        }
    }
};

const selection: Runner = (t) => {
    const n = t.n;
    for (let i = 0; i < n - 1; i++) {
        t.phase(`Recherche du minimum de a[${i}..${n - 1}]`, i, n - 1);
        let m = i;
        for (let j = i + 1; j < n; j++) {
            if (t.cmp(j, m) < 0) m = j;
        }
        t.swap(i, m);
    }
};

/** Gaps found experimentally by Marcin Ciura (2001). */
const CIURA = [701, 301, 132, 57, 23, 10, 4, 1];

const shell: Runner = (t) => {
    const n = t.n;
    let gaps = CIURA.filter((g) => g < n);
    if (gaps.length === 0) gaps = [1];
    for (const h of gaps) {
        t.phase(`h-tri avec h = ${h}`, 0, n - 1);
        for (let i = h; i < n; i++) {
            let j = i;
            while (j >= h && t.cmp(j - h, j) > 0) {
                t.swap(j - h, j);
                j -= h;
            }
        }
    }
};

const merge: Runner = (t) => {
    const rec = (lo: number, hi: number) => {
        if (hi <= lo) return;
        const mid = (lo + hi) >> 1;
        rec(lo, mid);
        rec(mid + 1, hi);
        t.phase(`Fusion de a[${lo}..${mid}] et a[${mid + 1}..${hi}]`, lo, hi);
        const aux = t.a.slice(lo, hi + 1);
        let i = lo;
        let j = mid + 1;
        for (let k = lo; k <= hi; k++) {
            if (i > mid) {
                t.write(k, aux[j - lo]);
                j++;
            } else if (j > hi) {
                t.write(k, aux[i - lo]);
                i++;
            } else if (t.cmpIds(aux[j - lo], aux[i - lo], i, j) < 0) {
                t.write(k, aux[j - lo]);
                j++;
            } else {
                // On a tie the left element goes first: this is what makes merge sort stable.
                t.write(k, aux[i - lo]);
                i++;
            }
        }
    };
    rec(0, t.n - 1);
};

const quick: Runner = (t) => {
    // Lomuto partition, pivot = last element of the subarray.
    const rec = (lo: number, hi: number) => {
        if (lo >= hi) return;
        t.phase(`Partition de a[${lo}..${hi}] autour du pivot a[${hi}]`, lo, hi);
        let i = lo;
        for (let j = lo; j < hi; j++) {
            if (t.cmp(j, hi) < 0) {
                t.swap(i, j);
                i++;
            }
        }
        t.swap(i, hi);
        rec(lo, i - 1);
        rec(i + 1, hi);
    };
    rec(0, t.n - 1);
};

const heap: Runner = (t) => {
    const n = t.n;
    const siftDown = (start: number, end: number) => {
        let root = start;
        while (2 * root + 1 <= end) {
            let child = 2 * root + 1;
            if (child + 1 <= end && t.cmp(child, child + 1) < 0) child++;
            if (t.cmp(root, child) < 0) {
                t.swap(root, child);
                root = child;
            } else {
                return;
            }
        }
    };
    t.phase("Construction du tas (méthode de Floyd)", 0, n - 1);
    for (let s = Math.floor(n / 2) - 1; s >= 0; s--) siftDown(s, n - 1);
    for (let end = n - 1; end > 0; end--) {
        t.phase(`Extraction du maximum, tas a[0..${end}]`, 0, end);
        t.swap(0, end);
        siftDown(0, end - 1);
    }
};

export const RADIX_BASE = 10;

const radix: Runner = (t) => {
    // LSD radix sort in base 10. No comparison between two elements is ever made.
    const n = t.n;
    let max = 0;
    for (let i = 0; i < n; i++) max = Math.max(max, t.read(i));
    let pass = 1;
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= RADIX_BASE, pass++) {
        t.phase(`Passe ${pass} : tri stable selon le chiffre des ${unitName(exp)}`, 0, n - 1);
        const count = new Array(RADIX_BASE).fill(0);
        const digits: number[] = [];
        for (let i = 0; i < n; i++) {
            const d = Math.floor(t.read(i) / exp) % RADIX_BASE;
            digits.push(d);
            count[d]++;
        }
        for (let d = 1; d < RADIX_BASE; d++) count[d] += count[d - 1];
        const out = new Array<number>(n);
        for (let i = n - 1; i >= 0; i--) out[--count[digits[i]]] = t.a[i];
        for (let i = 0; i < n; i++) t.write(i, out[i]);
    }
};

function unitName(exp: number): string {
    if (exp === 1) return "unités";
    if (exp === 10) return "dizaines";
    if (exp === 100) return "centaines";
    return `10^${Math.round(Math.log10(exp))}`;
}

const RUNNERS: Record<AlgorithmKey, Runner> = {
    bubble,
    insertion,
    selection,
    shell,
    merge,
    quick,
    heap,
    radix,
};

export interface RunResult {
    ops: Op[];
    final: number[];
}

export function runAlgorithm(key: AlgorithmKey, values: number[]): RunResult {
    const ids = values.map((_, i) => i);
    const t = new Tracker(ids, values);
    RUNNERS[key](t);
    return { ops: t.ops, final: t.a };
}
