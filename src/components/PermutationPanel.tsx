import { formatCycles, PermutationStats } from "../engine/permutation";
import { Op } from "../engine/types";
import { M } from "./Tex";
import { Caption, fmt, Ink, Note, Section } from "./ui";

interface Props {
    num: number;
    figure: number;
    sigma: number[];
    stats: PermutationStats;
    initial: PermutationStats;
    lastAction: Op | null;
    done: boolean;
    hasDuplicates: boolean;
}

const sign = (s: 1 | -1 | null) => (s === null ? "?" : s === 1 ? "+1" : "−1");

export default function PermutationPanel({ num, figure, sigma, stats, initial, lastAction, done, hasDuplicates }: Props) {
    const n = sigma.length;
    const r = Math.max(0.36, (1.4 * (n + 1)) / 260);
    const hot = new Set<number>();
    if (lastAction && !done && lastAction.t !== "phase") {
        hot.add(lastAction.i);
        if (lastAction.t === "cmp" || lastAction.t === "swap") hot.add(lastAction.j);
    }
    const c = stats.cycleCount;
    const c0 = initial.cycleCount;
    const isIdentity = stats.fixedPoints === n;
    const pad = Math.max(1, n / 24);

    const rows: { name: string; f: string; v0: string; v: string }[] = [
        { name: "Inversions", f: "I(σ)", v0: fmt(initial.inversions), v: fmt(stats.inversions) },
        { name: "Cycles", f: "c(σ)", v0: c0 === null ? "?" : fmt(c0), v: c === null ? "?" : fmt(c) },
        { name: "Points fixes", f: "|Fix σ|", v0: fmt(initial.fixedPoints), v: fmt(stats.fixedPoints) },
        { name: "Signature", f: "ε(σ)", v0: sign(initial.sign), v: sign(stats.sign) },
        { name: "Plus longue sous-suite croissante", f: "ℓ(σ)", v0: fmt(initial.lis), v: fmt(stats.lis) },
    ];

    const aside = (
        <>
            <Note lead="Égalités">
                Avec des doublons, on départage deux valeurs égales par leur position initiale. Ainsi <M>σ</M> reste une permutation, et la permutation finale est l'identité si et seulement si le tri est stable.
            </Note>
            <Note lead="Signature">
                <M>{"ε(σ) = (−1)^{n − c(σ)}"}</M>. Chaque échange la change de signe : pour un algorithme qui ne fait que des échanges, la parité de leur nombre est donc fixée par l'entrée.
            </Note>
            {c === null && (
                <p className="text-verm">
                    En ce moment, le tableau contient des copies (fusion ou passe de radix) : ce n'est plus une bijection, et ses cycles ne sont pas définis.
                </p>
            )}
        </>
    );

    return (
        <Section num={num} title={<>La permutation <M>σ</M></>} aside={aside}>
            <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
                <figure>
                    <svg viewBox={`${-pad} ${-pad} ${n - 1 + 2 * pad} ${n - 1 + 2 * pad}`} className="aspect-square w-full" role="img" aria-label="Graphe de la permutation">
                        <line x1={-pad / 2} y1={n - 1 + pad / 2} x2={-pad / 2} y2={-pad / 2} stroke="rgb(var(--ink))" strokeWidth={n / 220 + 0.04} />
                        <line x1={-pad / 2} y1={n - 1 + pad / 2} x2={n - 1 + pad / 2} y2={n - 1 + pad / 2} stroke="rgb(var(--ink))" strokeWidth={n / 220 + 0.04} />
                        <line x1={0} y1={n - 1} x2={n - 1} y2={0} stroke="rgb(var(--ink) / 0.35)" strokeWidth={n / 300 + 0.03} strokeDasharray={`${n / 50 + 0.2} ${n / 50 + 0.2}`} />
                        {sigma.map((s, i) => {
                            const isHot = hot.has(i);
                            const fill = isHot ? "rgb(var(--red))" : done || s === i ? "rgb(var(--sea))" : "rgb(var(--ink))";
                            return <circle key={i} cx={i} cy={n - 1 - s} r={isHot ? r * 1.7 : r} fill={fill} />;
                        })}
                    </svg>
                    <div className="flex justify-between font-mono text-[10px] text-muted">
                        <span>0</span>
                        <span className="math text-[0.8rem] text-ink">
                            <i>i</i>
                        </span>
                        <span>{n - 1}</span>
                    </div>
                    <Caption n={figure}>
                        Le graphe <M>{"{(i, σ(i))}"}</M>, où <M>σ(i)</M> est le rang final de l'élément en position <M>i</M>. Trier, c'est amener tous les points sur la diagonale ; les points <Ink color="sea">vert d'eau</Ink> y sont déjà.
                    </Caption>
                </figure>

                <div className="min-w-0 space-y-6">
                    <table className="booktabs w-full text-[0.95rem]">
                        <thead>
                            <tr>
                                <th className="py-1.5 text-left">Statistique</th>
                                <th className="py-1.5 text-left" />
                                <th className="whitespace-nowrap py-1.5 pl-3 text-right">
                                    entrée <M>σ₀</M>
                                </th>
                                <th className="whitespace-nowrap py-1.5 pl-3 text-right">
                                    maintenant <M>σ</M>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.name}>
                                    <td className="py-1 pr-3">{row.name}</td>
                                    <td className="py-1 pr-3">
                                        <M>{row.f}</M>
                                    </td>
                                    <td className="py-1 text-right font-mono text-sm text-muted">{row.v0}</td>
                                    <td className={`py-1 text-right font-mono text-sm ${row.v !== row.v0 ? "text-verm" : ""}`}>{row.v}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div>
                        <p className="mb-2">
                            <span className="sc font-semibold">Trois distances à l'identité</span>, selon le mouvement permis.
                        </p>
                        <table className="booktabs w-full text-[0.95rem]">
                            <thead>
                                <tr>
                                    <th className="py-1.5 text-left">Distance</th>
                                    <th className="py-1.5 text-left">mouvement élémentaire</th>
                                    <th className="py-1.5 text-right">valeur</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-1 pr-3 italic">Kendall</td>
                                    <td className="py-1 pr-3">échanger deux voisins</td>
                                    <td className="py-1 text-right">
                                        <M>I(σ)</M> = <span className="font-mono text-sm">{fmt(stats.inversions)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1 pr-3 italic">Cayley</td>
                                    <td className="py-1 pr-3">échanger deux éléments quelconques</td>
                                    <td className="py-1 text-right">
                                        <M>n − c(σ)</M> = <span className="font-mono text-sm">{c === null ? "?" : fmt(n - c)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1 pr-3 italic">Ulam</td>
                                    <td className="py-1 pr-3">retirer un élément et le réinsérer</td>
                                    <td className="py-1 text-right">
                                        <M>n − ℓ(σ)</M> = <span className="font-mono text-sm">{fmt(n - stats.lis)}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {n <= 20 && stats.cycles && (
                        <p>
                            <span className="sc font-semibold">Cycles.</span> <M className="whitespace-normal">{`σ = ${formatCycles(stats.cycles)}`}</M>
                        </p>
                    )}

                    {hasDuplicates && (
                        <p className={`border-l-[3px] pl-3 ${done ? (isIdentity ? "border-sea" : "border-verm") : "border-ink/30"}`}>
                            {done ? (
                                isIdentity ? (
                                    <>
                                        <span className="sc font-semibold text-sea">Stable.</span> <M>σ = id</M> : les valeurs égales ont gardé leur ordre initial.
                                    </>
                                ) : (
                                    <>
                                        <span className="sc font-semibold text-verm">Non stable.</span> <M>σ ≠ id</M> alors que le tableau est trié : {fmt(n - stats.fixedPoints)} éléments égaux ont été permutés entre eux.
                                    </>
                                )
                            ) : (
                                <>
                                    <span className="sc font-semibold">Doublons.</span> À la fin, <M>σ = id</M> si et seulement si l'algorithme est stable.
                                </>
                            )}
                        </p>
                    )}
                </div>
            </div>
        </Section>
    );
}
