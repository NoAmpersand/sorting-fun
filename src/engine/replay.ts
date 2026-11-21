import { Counts, Op } from "./types";

export function applyOp(a: number[], op: Op) {
    if (op.t === "swap") {
        const tmp = a[op.i];
        a[op.i] = a[op.j];
        a[op.j] = tmp;
    } else if (op.t === "write") {
        a[op.i] = op.id;
    }
}

export function undoOp(a: number[], op: Op) {
    if (op.t === "swap") {
        applyOp(a, op);
    } else if (op.t === "write") {
        a[op.i] = op.prev;
    }
}

/**
 * Prefix sums over the operation list, so that the counters at any position
 * of the replay are read in O(1), forwards or backwards.
 */
export interface Timeline {
    cmp: Int32Array;
    swap: Int32Array;
    write: Int32Array;
    read: Int32Array;
    /** Index of the last phase operation among the first k operations, or -1. */
    phase: Int32Array;
}

export function buildTimeline(ops: Op[]): Timeline {
    const len = ops.length + 1;
    const tl: Timeline = {
        cmp: new Int32Array(len),
        swap: new Int32Array(len),
        write: new Int32Array(len),
        read: new Int32Array(len),
        phase: new Int32Array(len),
    };
    tl.phase[0] = -1;
    ops.forEach((op, k) => {
        tl.cmp[k + 1] = tl.cmp[k] + (op.t === "cmp" ? 1 : 0);
        tl.swap[k + 1] = tl.swap[k] + (op.t === "swap" ? 1 : 0);
        tl.write[k + 1] = tl.write[k] + (op.t === "write" ? 1 : 0);
        tl.read[k + 1] = tl.read[k] + (op.t === "read" ? 1 : 0);
        tl.phase[k + 1] = op.t === "phase" ? k : tl.phase[k];
    });
    return tl;
}

export function countsAt(tl: Timeline, k: number): Counts {
    return { cmp: tl.cmp[k], swap: tl.swap[k], write: tl.write[k], read: tl.read[k] };
}
