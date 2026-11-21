import { AlgoInfo } from "../engine/catalog";
import { M, Tex } from "./Tex";
import { Note, Section } from "./ui";

export default function TheoryCard({ num, algo }: { num: number; algo: AlgoInfo }) {
    const props = [
        algo.stable ? "stable" : "non stable",
        algo.inPlace ? "en place" : "pas en place",
        algo.adaptive ? "adaptatif" : "non adaptatif",
        algo.comparisonBased ? "par comparaisons" : "sans comparaison",
    ];
    const aside = (
        <>
            <Note lead="Vocabulaire">
                Un tri est <i>stable</i> s'il préserve l'ordre des valeurs égales, <i>en place</i> s'il n'utilise que <M>O(1)</M> mémoire en plus des données (pile de récursion mise à part), <i>adaptatif</i> s'il va plus vite sur une entrée presque triée.
            </Note>
            <Note lead="Lectures">
                D. E. Knuth, <i>The Art of Computer Programming</i>, vol. 3, <i>Sorting and Searching</i>, 2<sup>e</sup> éd., 1998. R. Sedgewick et P. Flajolet, <i>An Introduction to the Analysis of Algorithms</i>, 2<sup>e</sup> éd., 2013.
            </Note>
        </>
    );

    return (
        <Section num={num} title={algo.name} aside={aside}>
            <p className="sc mb-4 text-muted">{props.join(" · ")}</p>
            <div className="max-w-[44rem] space-y-4 leading-relaxed">
                <p>
                    <span className="font-semibold">Principe.</span> <Tex>{algo.idea}</Tex>
                </p>
                <p>
                    <span className="font-semibold">Invariant.</span>{" "}
                    <span className="italic">
                        <Tex>{algo.invariant}</Tex>
                    </span>
                </p>
                {algo.recurrence && (
                    <div className="flex items-baseline gap-4 py-1">
                        <div className="min-w-0 flex-1 text-center">
                            <M className="whitespace-normal text-[1.08rem]">{algo.recurrence}</M>
                        </div>
                        <span className="text-muted">({num}.1)</span>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="booktabs w-full min-w-[30rem] text-[0.95rem]">
                        <thead>
                            <tr>
                                <th className="py-1.5 pr-3 text-left">Comparaisons</th>
                                <th className="py-1.5 pr-3 text-left">meilleur cas</th>
                                <th className="py-1.5 pr-3 text-left">en moyenne</th>
                                <th className="py-1.5 text-left">pire cas</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="align-top">
                                <td className="py-1.5 pr-3 text-muted">
                                    mémoire <M>{algo.memory}</M>
                                </td>
                                <td className="py-1.5 pr-3">
                                    <M className="whitespace-normal">{algo.complexity.best}</M>
                                </td>
                                <td className="py-1.5 pr-3">
                                    <M className="whitespace-normal">{algo.complexity.average}</M>
                                </td>
                                <td className="py-1.5">
                                    <M className="whitespace-normal">{algo.complexity.worst}</M>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="border-l-[3px] border-verm pl-4">
                    <p>
                        <span className="font-semibold">Théorème {num}.2</span> ({algo.theorem.title}).{" "}
                        <span className="italic">
                            <Tex>{algo.theorem.body}</Tex>
                        </span>
                    </p>
                </div>
            </div>
        </Section>
    );
}
