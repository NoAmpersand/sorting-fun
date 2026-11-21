/**
 * Elementary operation recorded while an algorithm runs.
 * The displayed array holds element ids; values[id] is the value of an element.
 * Every operation can be undone, which makes the replay reversible.
 */
export type Op =
    | { t: "cmp"; i: number; j: number }
    | { t: "swap"; i: number; j: number }
    | { t: "write"; i: number; id: number; prev: number }
    | { t: "read"; i: number }
    | { t: "phase"; label: string; lo: number; hi: number };

export type DistributionKey = "random" | "nearly" | "reversed" | "organ" | "few";

export interface SortInput {
    /** Value of each element, indexed by id. Element id k starts at position k. */
    values: number[];
    /** True when at least two elements share a value. */
    hasDuplicates: boolean;
    distribution: DistributionKey;
    /** Changes on every generation, used to reset the replay. */
    seed: number;
}

export type AlgorithmKey =
    | "bubble"
    | "insertion"
    | "selection"
    | "shell"
    | "merge"
    | "quick"
    | "heap"
    | "radix";

export interface Counts {
    cmp: number;
    swap: number;
    write: number;
    read: number;
}
