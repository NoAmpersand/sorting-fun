import { useMemo } from "react";
import { runAlgorithm } from "../engine/algorithms";
import { ALGORITHMS } from "../engine/catalog";
import { buildTimeline, countsAt } from "../engine/replay";
import { AlgorithmKey, SortInput } from "../engine/types";
import { M } from "./Tex";
import { fmt, Note, Section } from "./ui";

export default function CompareTable({ num, input, algo, setAlgo, bound }: { num: number; input: SortInput; algo: AlgorithmKey; setAlgo: (a: AlgorithmKey) => void; bound: number }) {
    const rows = useMemo(
        () =>
            ALGORITHMS.map((a) => {
                const { ops } = runAlgorithm(a.key, input.values);
                const tl = buildTimeline(ops);
                return { info: a, counts: countsAt(tl, ops.length) };
            }).sort((x, y) => x.counts.cmp - y.counts.cmp),
        [input]
    );
    const aside = (
        <Note lead="Lecture">
            Une ligne par algorithme, triée par nombre de comparaisons. Un clic sur une ligne sélectionne l'algorithme. Un rapport proche de 1 signifie que l'algorithme est presque optimal sur cette entrée.
        </Note>
    );
    return (
        <Section num={num} title={<>Les huit algorithmes sur la même entrée <M>σ₀</M></>} aside={aside}>
            <div className="overflow-x-auto">
                <table className="booktabs w-full whitespace-nowrap text-[0.95rem]">
                    <thead>
                        <tr>
                            <th className="w-5 py-1.5" />
                            <th className="py-1.5 pr-4 text-left">Algorithme</th>
                            <th className="py-1.5 pr-4 text-right">comparaisons</th>
                            <th className="py-1.5 pr-4 text-right">
                                <M>{"C / ⌈log₂ n!⌉"}</M>
                            </th>
                            <th className="py-1.5 pr-4 text-right">échanges</th>
                            <th className="py-1.5 text-right">écritures</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({ info, counts }) => {
                            const active = info.key === algo;
                            return (
                                <tr key={info.key} onClick={() => setAlgo(info.key)} className={`cursor-pointer ${active ? "text-verm" : "hover:bg-paper2"}`}>
                                    <td className="py-1 font-mono text-xs">{active ? "▸" : ""}</td>
                                    <td className={`py-1 pr-4 ${active ? "font-semibold" : ""}`}>{info.name}</td>
                                    <td className="py-1 pr-4 text-right font-mono text-sm">{fmt(counts.cmp)}</td>
                                    <td className="py-1 pr-4 text-right font-mono text-sm">{bound > 0 ? (counts.cmp / bound).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0"}</td>
                                    <td className="py-1 pr-4 text-right font-mono text-sm">{fmt(counts.swap)}</td>
                                    <td className="py-1 text-right font-mono text-sm">{fmt(counts.write)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Section>
    );
}
