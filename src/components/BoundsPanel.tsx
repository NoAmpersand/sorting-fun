import { Marker, Prediction } from "../engine/catalog";
import { Counts } from "../engine/types";
import { M } from "./Tex";
import { Caption, fmt, Ink, Note, Section } from "./ui";

interface Props {
    num: number;
    figure: number;
    counts: Counts;
    predictions: Prediction[];
    markers: Marker[];
    done: boolean;
    comparisonBased: boolean;
    hasDuplicates: boolean;
    multisetBound: number;
}

const COUNTERS: { key: keyof Counts; label: string }[] = [
    { key: "cmp", label: "comparaisons" },
    { key: "swap", label: "échanges" },
    { key: "write", label: "écritures" },
    { key: "read", label: "lectures" },
];

function target(p: Prediction) {
    if (p.exact !== undefined) return <>= {fmt(p.exact)}</>;
    if (p.min !== undefined && p.max !== undefined && p.min > 0)
        return (
            <>
                ∈ [{fmt(p.min)}, {fmt(p.max)}]
            </>
        );
    if (p.max !== undefined) return <>≤ {fmt(p.max)}</>;
    return null;
}

function holds(p: Prediction, v: number) {
    if (p.exact !== undefined) return v === p.exact;
    return (p.min === undefined || v >= p.min) && (p.max === undefined || v <= p.max);
}

export default function BoundsPanel({ num, figure, counts, predictions, markers, done, comparisonBased, hasDuplicates, multisetBound }: Props) {
    const shown = COUNTERS.filter((c) => c.key !== "read" || !comparisonBased);
    const top = Math.max(counts.cmp, ...markers.map((m) => m.value));
    const decades = Math.max(2, Math.ceil(Math.log10(top * 1.05)));
    const x = (v: number) => (v <= 1 ? 0 : (Math.log10(v) / decades) * 100);
    const bound = markers.find((m) => m.kind === "bound");

    const aside = (
        <>
            <Note lead="Arbre de décision">
                Un tri par comparaisons qui distingue les <M>n!</M> ordres possibles est un arbre binaire à au moins <M>n!</M> feuilles, donc de hauteur au moins <M>⌈log₂ n!⌉</M>. La borne vaut aussi en moyenne.
            </Note>
            <Note lead="Stirling">
                <M>log₂ n! = n log₂ n − n log₂ e + O(log n)</M>, avec <M>log₂ e ≈ 1,443</M>.
            </Note>
            {hasDuplicates && (
                <Note lead="Doublons">
                    Si la valeur <M>v</M> apparaît <M>m_v</M> fois, seuls <M>n!/∏ m_v!</M> ordres sont distinguables : la borne descend à environ <span className="font-mono">{fmt(multisetBound)}</span>, à un terme <M>O(n)</M> près.
                </Note>
            )}
        </>
    );

    return (
        <Section num={num} title="Compter, puis comparer aux bornes" aside={aside}>
            <div className={`grid border-y border-ink/25 ${shown.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                {shown.map((c, k) => (
                    <div key={c.key} className={`min-w-0 py-3 pr-2 sm:pr-4 ${k > 0 ? "border-l border-ink/25 pl-2 sm:pl-4" : ""}`}>
                        <div className="font-mono text-[1.5rem] font-medium leading-none sm:text-[2.6rem]">{fmt(counts[c.key])}</div>
                        <div className="sc mt-1 text-muted">{c.label}</div>
                    </div>
                ))}
            </div>

            {predictions.length > 0 && (
                <div className="mt-6 space-y-2">
                    {predictions.map((p, k) => {
                        const v = counts[p.counter];
                        const ok = holds(p, v);
                        return (
                            <p key={p.label} className="leading-snug">
                                <span className="font-semibold">Prédiction {num}.{k + 1}.</span> <span className="italic">{p.label}</span>{" "}
                                <span className="font-mono text-sm">{target(p)}</span> <span className="text-muted">(<M>{p.why}</M>)</span>{" "}
                                {done ? (
                                    <span className={`font-mono text-sm ${ok ? "text-sea" : "text-verm"}`}>
                                        {ok ? "✓" : "✗"} mesuré {fmt(v)}
                                    </span>
                                ) : (
                                    <span className="font-mono text-sm text-muted">en cours : {fmt(v)}</span>
                                )}
                            </p>
                        );
                    })}
                </div>
            )}

            <figure className="mt-8">
                <div className="space-y-[7px]">
                    {[...markers, { label: "", value: counts.cmp, kind: "live" as const }]
                        .sort((a, b) => a.value - b.value || (a.kind === "live" ? 1 : -1))
                        .map((m) => {
                            const live = m.kind === "live";
                            return (
                                <div key={live ? "live" : m.label} className="grid grid-cols-[minmax(0,7.5rem)_1fr_3.2rem] sm:grid-cols-[minmax(0,11rem)_1fr_4.5rem] items-center gap-3 text-[0.9rem]">
                                    <span className={`truncate text-right ${live ? "font-semibold text-verm" : m.kind === "bound" ? "font-semibold" : ""}`}>
                                        {live ? "mesurées" : <M>{m.label}</M>}
                                    </span>
                                    <div className="relative h-3">
                                        <div className="absolute inset-x-0 top-1/2 h-px bg-ink/20" />
                                        {live ? (
                                            <>
                                                <div className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-verm" style={{ width: `${x(m.value)}%` }} />
                                                <div className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-verm" style={{ left: `${x(m.value)}%` }} />
                                            </>
                                        ) : (
                                            <div
                                                className={`absolute top-0 h-3 -translate-x-1/2 ${m.kind === "bound" ? "w-[3px] bg-ink" : m.kind === "algo" ? "w-[3px] bg-ochre" : "w-px bg-ink"}`}
                                                style={{ left: `${x(m.value)}%` }}
                                            />
                                        )}
                                    </div>
                                    <span className={`text-right font-mono text-sm ${live ? "text-verm" : "text-muted"}`}>{fmt(m.value)}</span>
                                </div>
                            );
                        })}
                </div>
                <div className="grid grid-cols-[minmax(0,7.5rem)_1fr_3.2rem] sm:grid-cols-[minmax(0,11rem)_1fr_4.5rem] gap-3">
                    <span />
                    <div className="relative mt-1 h-5 border-t border-ink">
                        {Array.from({ length: decades + 1 }, (_, d) => (
                            <span key={d} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${(d / decades) * 100}%` }}>
                                <span className="mx-auto block h-1.5 w-px bg-ink" />
                                <span className="math text-[0.75rem] text-muted">
                                    10<sup>{d}</sup>
                                </span>
                            </span>
                        ))}
                    </div>
                    <span />
                </div>
                <Caption n={figure}>
                    {comparisonBased ? (
                        <>
                            Nombre de comparaisons, en <Ink color="verm">vermillon</Ink>, sur une échelle logarithmique. Le trait épais marque la borne inférieure <M>⌈log₂ n!⌉</M>
                            {bound ? <> = {fmt(bound.value)}</> : null}
                            {markers.some((m) => m.kind === "algo") && (
                                <>
                                    , le trait <Ink color="ochre">ocre</Ink> la valeur propre à l'algorithme
                                </>
                            )}
                            .
                            {done && bound && counts.cmp > 0 && (
                                <>
                                    {" "}
                                    Ici <M>{`C / ⌈log₂ n!⌉ ≈ ${(counts.cmp / bound.value).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}`}</M>.
                                </>
                            )}
                        </>
                    ) : (
                        <>Le tri radix ne compare jamais deux éléments : l'argument de l'arbre de décision ne s'applique pas, et le compteur reste à 0.</>
                    )}
                </Caption>
            </figure>
        </Section>
    );
}
