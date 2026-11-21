import { runAlgorithm } from "./algorithms";
import { ALGORITHMS, predictions } from "./catalog";
import { generateInput, DISTRIBUTIONS } from "./inputs";
import { permutationStats, stableRanks, toPermutation, inversions, cycles, lisLength, mergeWorst } from "./permutation";
import { applyOp, buildTimeline, countsAt, undoOp } from "./replay";
import { Counts } from "./types";

const SIZES = [2, 3, 5, 8, 17, 32, 64, 100, 128, 200, 256];

function check(n: number, dist: (typeof DISTRIBUTIONS)[number]["key"]) {
    const input = generateInput(n, dist);
    const rank = stableRanks(input.values);
    const ids = input.values.map((_, i) => i);
    const initial = permutationStats(toPermutation(ids, rank));
    const ctx = { n, initial, hasDuplicates: input.hasDuplicates, maxValue: Math.max(...input.values) };

    for (const algo of ALGORITHMS) {
        const { ops, final } = runAlgorithm(algo.key, input.values);
        const sortedValues = final.map((id) => input.values[id]);
        for (let i = 1; i < n; i++) expect(sortedValues[i - 1]).toBeLessThanOrEqual(sortedValues[i]);
        expect([...final].sort((x, y) => x - y)).toEqual(ids);

        // Stable algorithms end on the identity permutation, even with duplicates.
        const sigma = toPermutation(final, rank);
        if (algo.stable) expect(sigma).toEqual(ids);

        // Replay forwards then backwards.
        const a = ids.slice();
        ops.forEach((op) => applyOp(a, op));
        expect(a).toEqual(final);
        for (let k = ops.length - 1; k >= 0; k--) undoOp(a, ops[k]);
        expect(a).toEqual(ids);

        const tl = buildTimeline(ops);
        const counts: Counts = countsAt(tl, ops.length);
        for (const p of predictions(algo.key, ctx)) {
            const got = counts[p.counter];
            if (p.exact !== undefined) expect([algo.key, p.label, got]).toEqual([algo.key, p.label, p.exact]);
            if (p.min !== undefined) expect(got).toBeGreaterThanOrEqual(p.min);
            if (p.max !== undefined) expect(got).toBeLessThanOrEqual(p.max);
        }
    }
}

describe("algorithms and predictions", () => {
    for (const d of DISTRIBUTIONS) {
        test(`distribution ${d.key}`, () => {
            for (const n of SIZES) for (let rep = 0; rep < 4; rep++) check(n, d.key);
        });
    }
});

describe("permutation helpers", () => {
    test("small cases", () => {
        expect(inversions([2, 0, 1])).toBe(2);
        expect(cycles([1, 2, 0])).toEqual([[0, 1, 2]]);
        expect(cycles([0, 0, 1])).toBeNull();
        expect(lisLength([3, 0, 1, 4, 2, 5])).toBe(4);
        expect(mergeWorst(8)).toBe(17);
    });

    test("merge sort reaches its worst case formula", () => {
        // Worst inputs exist for every n; check the bound is tight for n = 2^k on a known worst input.
        const worst = [0, 4, 2, 6, 1, 5, 3, 7].map((x) => x + 1);
        const { ops } = runAlgorithm("merge", worst);
        expect(ops.filter((o) => o.t === "cmp").length).toBe(mergeWorst(8));
    });
});
