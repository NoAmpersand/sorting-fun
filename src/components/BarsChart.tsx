import { Op } from "../engine/types";

interface Props {
    array: number[];
    values: number[];
    sigma: number[];
    lastAction: Op | null;
    phase: Extract<Op, { t: "phase" }> | null;
    done: boolean;
    animate: number;
}

export default function BarsChart({ array, values, sigma, lastAction, phase, done, animate }: Props) {
    const n = array.length;
    const max = Math.max(...values);
    const gap = n <= 48 ? 0.28 : n <= 128 ? 0.18 : 0.1; // fraction of a slot left empty
    const cmp = new Set<number>();
    const move = new Set<number>();
    if (lastAction && !done) {
        if (lastAction.t === "cmp") [lastAction.i, lastAction.j].forEach((x) => cmp.add(x));
        if (lastAction.t === "swap") [lastAction.i, lastAction.j].forEach((x) => move.add(x));
        if (lastAction.t === "write") move.add(lastAction.i);
        if (lastAction.t === "read") cmp.add(lastAction.i);
    }
    const transition = animate > 0 ? `height ${animate}ms ease-out` : "none";
    const tickEvery = n <= 16 ? 1 : n <= 40 ? 5 : n <= 100 ? 10 : n <= 200 ? 25 : 50;

    return (
        <div>
            <div className="relative h-72 sm:h-80" style={{ paddingTop: n <= 24 ? 22 : 8 }}>
                <div className="relative h-full">
                    {phase && !done && (
                        <div className="hatch absolute bottom-0 top-0" style={{ left: `${(phase.lo / n) * 100}%`, width: `${((phase.hi - phase.lo + 1) / n) * 100}%` }} />
                    )}
                    {array.map((id, i) => {
                        const v = values[id];
                        let color = "rgb(var(--bar))";
                        if (move.has(i)) color = "rgb(var(--red))";
                        else if (cmp.has(i)) color = "rgb(var(--ochre))";
                        else if (done || sigma[i] === i) color = "rgb(var(--sea))";
                        return (
                            <div
                                key={i}
                                className="absolute bottom-0"
                                style={{
                                    left: `${((i + gap / 2) / n) * 100}%`,
                                    width: `${((1 - gap) / n) * 100}%`,
                                    height: `max(2px, ${(v / max) * 100}%)`,
                                    background: color,
                                    transition,
                                }}
                            >
                                {n <= 24 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[11px] text-muted">{v}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Baseline and index ticks, like an axis in a printed figure. */}
            <div className="relative h-6 border-t-[1.5px] border-ink">
                {array.map((_, i) =>
                    i % tickEvery === 0 ? (
                        <span key={i} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${((i + 0.5) / n) * 100}%` }}>
                            <span className="mx-auto block h-1.5 w-px bg-ink" />
                            <span className="font-mono text-[10px] text-muted">{i}</span>
                        </span>
                    ) : null
                )}
            </div>
        </div>
    );
}
