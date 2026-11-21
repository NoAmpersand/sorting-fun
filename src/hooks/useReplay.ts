import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { runAlgorithm, RunResult } from "../engine/algorithms";
import { applyOp, buildTimeline, undoOp } from "../engine/replay";
import { AlgorithmKey, Op, SortInput } from "../engine/types";

export interface Replay {
    run: RunResult;
    pos: number;
    total: number;
    array: number[];
    /** Most recent operation that touched the array (phases are skipped). */
    lastAction: Op | null;
    phase: Extract<Op, { t: "phase" }> | null;
    timeline: ReturnType<typeof buildTimeline>;
    playing: boolean;
    setPlaying: (p: boolean) => void;
    speed: number;
    setSpeed: (s: number) => void;
    seek: (k: number) => void;
    step: (dir: 1 | -1) => void;
    done: boolean;
}

export function useReplay(input: SortInput, algo: AlgorithmKey): Replay {
    const run = useMemo(() => runAlgorithm(algo, input.values), [algo, input]);
    const timeline = useMemo(() => buildTimeline(run.ops), [run]);

    const arrRef = useRef<number[]>([]);
    const posRef = useRef(0);
    const runRef = useRef<RunResult | null>(null);
    if (runRef.current !== run) {
        // Synchronous reset, idempotent, so it is safe under StrictMode double rendering.
        runRef.current = run;
        arrRef.current = input.values.map((_, i) => i);
        posRef.current = 0;
    }

    const [, rerender] = useReducer((x: number) => x + 1, 0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(25);
    const speedRef = useRef(speed);
    speedRef.current = speed;

    const seek = useCallback(
        (target: number) => {
            const ops = run.ops;
            const k = Math.max(0, Math.min(ops.length, Math.round(target)));
            const a = arrRef.current;
            while (posRef.current < k) applyOp(a, ops[posRef.current++]);
            while (posRef.current > k) undoOp(a, ops[--posRef.current]);
            rerender();
        },
        [run]
    );

    const step = useCallback(
        (dir: 1 | -1) => {
            const ops = run.ops;
            let k = posRef.current;
            if (dir === 1) {
                // Skip phase markers so that one step always shows a visible change.
                while (k < ops.length && ops[k].t === "phase") k++;
                k = Math.min(ops.length, k + 1);
            } else {
                k = Math.max(0, k - 1);
                while (k > 0 && ops[k - 1].t === "phase") k--;
            }
            seek(k);
        },
        [run, seek]
    );

    useEffect(() => {
        setPlaying(false);
    }, [run]);

    useEffect(() => {
        if (!playing) return;
        if (posRef.current >= run.ops.length) seek(0);
        let raf = 0;
        let last = performance.now();
        let acc = 0;
        const tick = (now: number) => {
            acc += ((now - last) / 1000) * speedRef.current;
            last = now;
            const n = Math.floor(acc);
            if (n > 0) {
                acc -= n;
                seek(posRef.current + n);
            }
            if (posRef.current >= run.ops.length) {
                setPlaying(false);
                return;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [playing, run, seek]);

    const pos = posRef.current;
    let lastAction: Op | null = null;
    for (let k = pos - 1; k >= 0 && k >= pos - 3; k--) {
        if (run.ops[k].t !== "phase") {
            lastAction = run.ops[k];
            break;
        }
    }
    const phaseIndex = timeline.phase[pos];
    const phase = phaseIndex >= 0 ? (run.ops[phaseIndex] as Extract<Op, { t: "phase" }>) : null;

    return {
        run,
        pos,
        total: run.ops.length,
        array: arrRef.current,
        lastAction,
        phase,
        timeline,
        playing,
        setPlaying,
        speed,
        setSpeed,
        seek,
        step,
        done: pos === run.ops.length,
    };
}
