import React from "react";
import { Replay } from "../hooks/useReplay";
import { Op } from "../engine/types";
import { fmt } from "./ui";

const MAX_SPEED = 5000;
const toSpeed = (s: number) => Math.max(1, Math.round(10 ** ((s / 100) * Math.log10(MAX_SPEED))));
const toSlider = (v: number) => (Math.log10(Math.max(1, v)) / Math.log10(MAX_SPEED)) * 100;

function describe(op: Op | null, done: boolean): React.ReactNode {
    if (done) return "Le tableau est trié.";
    if (!op) return "Prêt.";
    const a = (k: number) => (
        <span className="math">
            <i>a</i>[{k}]
        </span>
    );
    switch (op.t) {
        case "cmp":
            return <>Comparaison de {a(op.i)} et {a(op.j)}</>;
        case "swap":
            return <>Échange {a(op.i)} ↔ {a(op.j)}</>;
        case "write":
            return <>Écriture dans {a(op.i)}</>;
        case "read":
            return <>Lecture du chiffre de {a(op.i)}</>;
        default:
            return "";
    }
}

function Cmd({ onClick, label, children, disabled = false, strong = false }: { onClick: () => void; label: string; children: React.ReactNode; disabled?: boolean; strong?: boolean }) {
    return (
        <button
            onClick={onClick}
            title={label}
            aria-label={label}
            disabled={disabled}
            className={`h-9 border-r border-ink/40 px-3 text-[0.95rem] transition-colors last:border-r-0 enabled:hover:bg-ink enabled:hover:text-paper disabled:text-ink/30 ${
                strong ? "min-w-[6.5rem] font-semibold" : "font-mono"
            }`}
        >
            {children}
        </button>
    );
}

export default function Player({ replay }: { replay: Replay }) {
    const { pos, total, playing, setPlaying, seek, step, speed, setSpeed, lastAction, done } = replay;
    return (
        <div className="mt-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="inline-flex border border-ink">
                    <Cmd onClick={() => seek(0)} label="Début (touche Origine)" disabled={pos === 0}>
                        ⇤
                    </Cmd>
                    <Cmd onClick={() => step(-1)} label="Pas en arrière (←)" disabled={pos === 0}>
                        ←
                    </Cmd>
                    <Cmd onClick={() => setPlaying(!playing)} label="Lecture ou pause (Espace)" strong>
                        <span className="sc text-[1.05rem]">{playing ? "Pause" : done ? "Rejouer" : "Lecture"}</span>
                    </Cmd>
                    <Cmd onClick={() => step(1)} label="Pas en avant (→)" disabled={done}>
                        →
                    </Cmd>
                    <Cmd onClick={() => seek(total)} label="Fin" disabled={done}>
                        ⇥
                    </Cmd>
                </div>
                <div className="min-w-[12rem] flex-1 italic text-ink/85">{describe(lastAction, done)}</div>
                <label className="flex items-center gap-3">
                    <span className="sc text-muted">vitesse</span>
                    <input type="range" min={0} max={100} step={0.5} value={toSlider(speed)} onChange={(e) => setSpeed(toSpeed(parseFloat(e.target.value)))} className="ink w-32" />
                    <span className="w-24 font-mono text-sm">{fmt(speed)} op/s</span>
                </label>
            </div>
            <div className="mt-3 flex items-center gap-4">
                <input type="range" min={0} max={total} value={pos} onChange={(e) => seek(parseInt(e.target.value, 10))} className="ink w-full" aria-label="Position dans l'exécution" />
                <span className="shrink-0 font-mono text-sm">
                    {fmt(pos)}
                    <span className="text-muted"> / {fmt(total)}</span>
                </span>
            </div>
        </div>
    );
}
