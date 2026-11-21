import { ALGO_BY_KEY } from "../engine/catalog";
import { DISTRIBUTIONS } from "../engine/inputs";
import { AlgorithmKey, DistributionKey } from "../engine/types";
import { M } from "./Tex";

const GROUPS: { title: string; keys: AlgorithmKey[] }[] = [
    { title: "quadratiques", keys: ["bubble", "insertion", "selection"] },
    { title: "sous-quadratiques", keys: ["shell", "merge", "quick", "heap"] },
    { title: "sans comparaison", keys: ["radix"] },
];

interface Props {
    algo: AlgorithmKey;
    setAlgo: (a: AlgorithmKey) => void;
    n: number;
    setN: (n: number) => void;
    distribution: DistributionKey;
    setDistribution: (d: DistributionKey) => void;
    regenerate: () => void;
}

export const MIN_N = 4;
export const MAX_N = 256;

export default function Controls({ algo, setAlgo, n, setN, distribution, setDistribution, regenerate }: Props) {
    const dist = DISTRIBUTIONS.find((d) => d.key === distribution);
    let counter = 0;
    return (
        <nav className="grid gap-8 text-[0.95rem] sm:grid-cols-2 lg:grid-cols-1">
            <div>
                <h2 className="sc mb-2 border-b border-ink pb-1 font-semibold">Algorithme</h2>
                {GROUPS.map((g) => (
                    <div key={g.title} className="mt-2">
                        <div className="text-[0.8rem] italic text-muted">{g.title}</div>
                        <ol>
                            {g.keys.map((k) => {
                                counter++;
                                const active = k === algo;
                                return (
                                    <li key={k}>
                                        <button
                                            onClick={() => setAlgo(k)}
                                            aria-current={active}
                                            className={`group flex w-full items-baseline gap-2 py-[3px] text-left ${active ? "text-verm" : "hover:text-verm"}`}
                                        >
                                            <span className="w-5 shrink-0 font-mono text-xs text-muted group-hover:text-verm">{active ? "▸" : `${counter}.`}</span>
                                            <span className={active ? "font-semibold" : ""}>{ALGO_BY_KEY[k].name}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="sc mb-3 border-b border-ink pb-1 font-semibold">Entrée</h2>
                <label htmlFor="n" className="flex items-baseline justify-between">
                    <span>taille</span>
                    <M className="text-lg">{`n = ${n}`}</M>
                </label>
                <input id="n" type="range" min={MIN_N} max={MAX_N} value={n} onChange={(e) => setN(parseInt(e.target.value, 10))} className="ink w-full" />
                <ul className="mt-3" role="radiogroup" aria-label="Distribution de l'entrée">
                    {DISTRIBUTIONS.map((d) => {
                        const active = d.key === distribution;
                        return (
                            <li key={d.key}>
                                <button
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => setDistribution(d.key)}
                                    className={`flex w-full items-baseline gap-2 py-[3px] text-left ${active ? "text-verm" : "hover:text-verm"}`}
                                >
                                    <span className="w-5 shrink-0 text-center">{active ? "●" : "○"}</span>
                                    <span className={active ? "font-semibold" : ""}>{d.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
                {dist && <p className="mt-2 text-[0.82rem] italic leading-snug text-muted">{dist.hint}</p>}
                <button onClick={regenerate} className="mt-4 w-full border border-ink py-1.5 hover:bg-ink hover:text-paper">
                    <span className="sc">Tirer une nouvelle entrée</span>
                </button>
                <p className="mt-2 text-[0.78rem] leading-snug text-muted">
                    Changer d'algorithme garde la même entrée <M>σ₀</M>, pour comparer à armes égales.
                </p>
            </div>
        </nav>
    );
}
