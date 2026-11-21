import { useCallback, useEffect, useMemo, useState } from "react";
import BarsChart from "./components/BarsChart";
import BoundsPanel from "./components/BoundsPanel";
import CompareTable from "./components/CompareTable";
import Controls from "./components/Controls";
import PermutationPanel from "./components/PermutationPanel";
import Player from "./components/Player";
import { M } from "./components/Tex";
import TheoryCard from "./components/TheoryCard";
import ThemeToggle from "./components/ThemeToggle";
import { Caption, Ink, Note, Section } from "./components/ui";
import { ALGO_BY_KEY, markers, predictions } from "./engine/catalog";
import { DISTRIBUTIONS, generateInput } from "./engine/inputs";
import { log2Factorial, log2Multinomial, permutationStats, stableRanks, toPermutation } from "./engine/permutation";
import { countsAt } from "./engine/replay";
import { AlgorithmKey, DistributionKey } from "./engine/types";
import { useReplay } from "./hooks/useReplay";

export default function App() {
    const [algo, setAlgo] = useState<AlgorithmKey>("quick");
    const [n, setN] = useState(32);
    const [distribution, setDistribution] = useState<DistributionKey>("random");
    const [input, setInput] = useState(() => generateInput(32, "random"));

    const regenerate = useCallback(() => setInput(generateInput(n, distribution)), [n, distribution]);
    useEffect(() => {
        setInput(generateInput(n, distribution));
    }, [n, distribution]);

    const replay = useReplay(input, algo);
    const info = ALGO_BY_KEY[algo];

    const rank = useMemo(() => stableRanks(input.values), [input]);
    const initial = useMemo(() => permutationStats(toPermutation(input.values.map((_, i) => i), rank)), [input, rank]);
    // replay.pos changes on every step; the array itself is mutated in place by the replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const sigma = useMemo(() => toPermutation(replay.array, rank), [replay.array, replay.pos, replay.run, rank]);
    const stats = useMemo(() => permutationStats(sigma), [sigma]);

    const len = input.values.length;
    const ctx = useMemo(() => ({ n: len, initial, hasDuplicates: input.hasDuplicates, maxValue: Math.max(...input.values) }), [len, initial, input]);
    const lowerBound = useMemo(() => log2Factorial(len), [len]);
    const multisetBound = useMemo(() => log2Multinomial(input.values), [input]);
    const preds = useMemo(() => predictions(algo, ctx), [algo, ctx]);
    const marks = useMemo(() => markers(algo, ctx, lowerBound), [algo, ctx, lowerBound]);
    const counts = countsAt(replay.timeline, replay.pos);

    const { setPlaying, playing, step, seek } = replay;
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA") return;
            if (e.key === " ") {
                e.preventDefault();
                setPlaying(!playing);
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                step(1);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                step(-1);
            } else if (e.key === "Home") {
                seek(0);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [setPlaying, playing, step, seek]);

    const animate = replay.speed <= 40 ? Math.min(220, Math.round(700 / replay.speed)) : 0;
    const distLabel = DISTRIBUTIONS.find((d) => d.key === input.distribution)?.label.toLowerCase() ?? "";

    return (
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
            {/* Masthead: double rule, title set in regular weight, abstract below. */}
            <header className="pt-6">
                <div className="border-t-[3px] border-ink" />
                <div className="mt-[3px] border-t border-ink" />
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2 text-[0.85rem]">
                    <span className="sc text-muted">Combinatoire des algorithmes de tri</span>
                    <span className="flex items-baseline gap-5">
                        <a className="ink-link sc" href="https://github.com/NoAmpersand/sorting-fun" target="_blank" rel="noreferrer">
                            code source
                        </a>
                        <ThemeToggle />
                    </span>
                </div>
                <div className="border-t border-ink/40" />
                <div className="grid gap-x-12 gap-y-4 pb-10 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end">
                    <h1 className="text-[2.6rem] font-normal leading-[1.08] sm:text-[3.4rem]">
                        Trier, c'est composer
                        <br />
                        des transpositions
                    </h1>
                    <p className="text-[0.95rem] leading-relaxed text-ink/85 [hyphens:auto]" lang="fr">
                        <span className="sc font-semibold text-ink">Résumé.</span> Un tableau de <M>n</M> valeurs est une permutation <M>σ</M> du groupe symétrique <M>S_n</M>, et un algorithme de tri trace un chemin de <M>σ</M> vers l'identité. On suit ce chemin pas à pas, on compte chaque opération, et on vérifie en direct ce que la théorie prédit : inversions, cycles, borne de l'arbre de décision.
                    </p>
                </div>
            </header>

            <div className="grid gap-x-12 gap-y-10 pb-16 lg:grid-cols-[12.5rem_minmax(0,1fr)]">
                <aside className="lg:sticky lg:top-6 lg:self-start">
                    <Controls algo={algo} setAlgo={setAlgo} n={n} setN={setN} distribution={distribution} setDistribution={setDistribution} regenerate={regenerate} />
                </aside>

                <main className="min-w-0 space-y-14">
                    <Section
                        num={1}
                        title="Exécution"
                        aside={
                            <>
                                <Note lead="Étape">{replay.done ? "Terminé." : replay.phase ? <span className="text-ink">{replay.phase.label}.</span> : "En attente de lecture."}</Note>
                                <Note lead="Clavier">
                                    <kbd>Espace</kbd> lecture ou pause, <kbd>←</kbd> <kbd>→</kbd> pas à pas, <kbd>Origine</kbd> retour au début.
                                </Note>
                                <Note lead="Retour arrière">Chaque opération enregistrée est réversible : on peut remonter l'exécution aussi bien que l'avancer.</Note>
                            </>
                        }
                    >
                        <figure>
                            <BarsChart array={replay.array} values={input.values} sigma={sigma} lastAction={replay.lastAction} phase={replay.phase} done={replay.done} animate={animate} />
                            <Caption n={1}>
                                {info.name} sur une entrée « {distLabel} » de taille <M>{`n = ${len}`}</M>. En <Ink color="ochre">ocre</Ink> les éléments comparés, en <Ink color="verm">vermillon</Ink> ceux qui bougent, en <Ink color="sea">vert d'eau</Ink> ceux qui sont déjà à leur place finale. Les hachures couvrent le sous-tableau en cours.
                            </Caption>
                        </figure>
                        <Player replay={replay} />
                    </Section>

                    <BoundsPanel
                        num={2}
                        figure={2}
                        counts={counts}
                        predictions={preds}
                        markers={marks}
                        done={replay.done}
                        comparisonBased={info.comparisonBased}
                        hasDuplicates={input.hasDuplicates}
                        multisetBound={multisetBound}
                    />

                    <PermutationPanel num={3} figure={3} sigma={sigma} stats={stats} initial={initial} lastAction={replay.lastAction} done={replay.done} hasDuplicates={input.hasDuplicates} />

                    <TheoryCard num={4} algo={info} />

                    <CompareTable num={5} input={input} algo={algo} setAlgo={setAlgo} bound={Math.ceil(lowerBound)} />
                </main>
            </div>

            <footer className="border-t border-ink py-4 text-[0.8rem] text-muted">
                Composé en STIX Two Text et IBM Plex Mono.
            </footer>
        </div>
    );
}
