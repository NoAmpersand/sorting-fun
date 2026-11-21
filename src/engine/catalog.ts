import { AlgorithmKey, Counts } from "./types";
import { PermutationStats, mergeWorst, quickAverage } from "./permutation";
import { RADIX_BASE } from "./algorithms";

/**
 * Text fields use a light markup: segments between $...$ are rendered in a
 * math font. Keep formulas in Unicode (no LaTeX), the site has no TeX engine.
 */
export interface AlgoInfo {
    key: AlgorithmKey;
    name: string;
    idea: string;
    invariant: string;
    recurrence?: string;
    complexity: { best: string; average: string; worst: string };
    memory: string;
    stable: boolean;
    inPlace: boolean;
    adaptive: boolean;
    comparisonBased: boolean;
    theorem: { title: string; body: string };
}

export interface Context {
    n: number;
    initial: PermutationStats;
    hasDuplicates: boolean;
    maxValue: number;
}

export interface Prediction {
    label: string;
    counter: keyof Counts;
    /** Exact value, or a closed interval the final count must fall into. */
    exact?: number;
    min?: number;
    max?: number;
    why: string;
}

export interface Marker {
    label: string;
    value: number;
    kind: "bound" | "algo" | "reference";
}

export const ALGORITHMS: AlgoInfo[] = [
    {
        key: "bubble",
        name: "Tri à bulles",
        idea: "On parcourt le tableau en échangeant chaque paire de voisins mal ordonnés. Le maximum « remonte » jusqu'au bout à chaque passe.",
        invariant: "Après la passe $k$, les $k$ plus grandes valeurs occupent leurs places finales.",
        complexity: { best: "n(n − 1)/2", average: "n(n − 1)/2", worst: "n(n − 1)/2" },
        memory: "O(1)",
        stable: true,
        inPlace: true,
        adaptive: false,
        comparisonBased: true,
        theorem: {
            title: "Échanges = inversions",
            body: "Échanger deux voisins mal ordonnés supprime exactement une inversion et n'en crée aucune. Le nombre d'échanges vaut donc $I(σ)$, la distance de Kendall entre $σ$ et l'identité. Pour une permutation uniforme, son espérance est $n(n − 1)/4$.",
        },
    },
    {
        key: "insertion",
        name: "Tri par insertion",
        idea: "On insère chaque nouvel élément dans le préfixe déjà trié, en le faisant reculer tant que son voisin de gauche est plus grand.",
        invariant: "Avant l'étape $i$, le préfixe $a[0..i − 1]$ est trié (mais pas forcément à sa place finale).",
        complexity: { best: "n − 1", average: "≈ n²/4", worst: "n(n − 1)/2" },
        memory: "O(1)",
        stable: true,
        inPlace: true,
        adaptive: true,
        comparisonBased: true,
        theorem: {
            title: "Un tri en O(n + I)",
            body: "Chaque échange entre voisins retire une inversion, donc il y en a exactement $I(σ)$, et chaque insertion se termine par au plus une comparaison perdante : $I(σ) ≤ C ≤ I(σ) + n − 1$. Sur une entrée presque triée, $I(σ)$ est petit et le tri devient quasi linéaire.",
        },
    },
    {
        key: "selection",
        name: "Tri par sélection",
        idea: "On cherche le minimum de la partie non triée et on l'échange avec le premier élément de cette partie.",
        invariant: "Avant l'étape $i$, $a[0..i − 1]$ contient les $i$ plus petites valeurs, triées et à leur place finale.",
        complexity: { best: "n(n − 1)/2", average: "n(n − 1)/2", worst: "n(n − 1)/2" },
        memory: "O(1)",
        stable: false,
        inPlace: true,
        adaptive: false,
        comparisonBased: true,
        theorem: {
            title: "Échanges = n − c(σ)",
            body: "Chaque échange non trivial place un élément sur sa position finale, ce qui détache un point fixe de son cycle : le nombre de cycles augmente de 1. Il faut donc exactement $n − c(σ)$ échanges, la distance de Cayley, qui est le minimum possible de transpositions. Comme $c(σ)$ vaut $H_n ≈ ln n$ en moyenne, on fait environ $n − ln n$ échanges.",
        },
    },
    {
        key: "shell",
        name: "Tri de Shell",
        idea: "Un tri par insertion sur des sous-suites espacées de $h$, avec $h$ décroissant jusqu'à 1. Les grands écarts déplacent vite les éléments très mal placés.",
        invariant: "Après la passe d'écart $h$, le tableau est $h$-trié. Un tableau $h$-trié reste $h$-trié après un $k$-tri.",
        complexity: { best: "≈ n log n", average: "inconnue", worst: "inconnue (écarts de Ciura)" },
        memory: "O(1)",
        stable: false,
        inPlace: true,
        adaptive: true,
        comparisonBased: true,
        theorem: {
            title: "Un problème ouvert",
            body: "La complexité dépend de la suite d'écarts. Avec les écarts $2^p 3^q$ de Pratt, on obtient $Θ(n log² n)$ ; avec $4^k + 3·2^{k−1} + 1$ de Sedgewick, $O(n^{4/3})$. Les écarts 1, 4, 10, 23, 57, 132, 301, 701 utilisés ici ont été trouvés expérimentalement par Ciura (2001), et leur complexité asymptotique reste inconnue.",
        },
    },
    {
        key: "merge",
        name: "Tri fusion",
        idea: "On coupe le tableau en deux moitiés, on les trie récursivement, puis on les fusionne en un seul parcours.",
        invariant: "Chaque appel récursif rend son sous-tableau trié ; une fusion de tailles $p$ et $q$ coûte au plus $p + q − 1$ comparaisons.",
        recurrence: "C(n) = C(⌈n/2⌉) + C(⌊n/2⌋) + n − 1 au pire",
        complexity: { best: "≈ (n/2) log₂ n", average: "≈ n log₂ n − 1,26 n", worst: "n⌈log₂ n⌉ − 2^{⌈log₂ n⌉} + 1" },
        memory: "O(n)",
        stable: true,
        inPlace: false,
        adaptive: false,
        comparisonBased: true,
        theorem: {
            title: "Presque optimal",
            body: "La récurrence se résout exactement : $W(n) = n⌈log₂ n⌉ − 2^{⌈log₂ n⌉} + 1$. Par Stirling, $log₂ n! = n log₂ n − n log₂ e + O(log n)$ avec $log₂ e ≈ 1,443$. Le pire cas du tri fusion ne dépasse donc la borne optimale que d'environ $0,44 n$ à $0,53 n$ comparaisons.",
        },
    },
    {
        key: "quick",
        name: "Tri rapide",
        idea: "On choisit un pivot (ici le dernier élément), on place à sa gauche tout ce qui est plus petit (partition de Lomuto), puis on trie récursivement les deux côtés.",
        invariant: "Après une partition, le pivot est à sa place finale, tout ce qui est à sa gauche lui est inférieur et le reste lui est supérieur ou égal.",
        recurrence: "C(n) = n − 1 + (2/n) Σ C(k) en moyenne",
        complexity: { best: "≈ n log₂ n", average: "2(n + 1)Hₙ − 4n ≈ 1,39 n log₂ n", worst: "n(n − 1)/2" },
        memory: "O(log n) en moyenne",
        stable: false,
        inPlace: true,
        adaptive: false,
        comparisonBased: true,
        theorem: {
            title: "La probabilité 2/(j − i + 1)",
            body: "Les éléments de rangs $i < j$ sont comparés si et seulement si l'un des deux est le premier pivot choisi parmi les rangs $i, …, j$, ce qui arrive avec probabilité $2/(j − i + 1)$. En sommant sur toutes les paires, $E[C] = 2(n + 1)H_n − 4n ∼ 2n ln n$. Sur une entrée déjà triée ou inversée, ce pivot est toujours extrême et on retombe à $n(n − 1)/2$.",
        },
    },
    {
        key: "heap",
        name: "Tri par tas",
        idea: "On organise le tableau en tas max, un arbre binaire presque complet où chaque parent domine ses enfants, puis on extrait le maximum $n − 1$ fois.",
        invariant: "$a[0..m]$ est un tas max (les enfants de $i$ sont en $2i + 1$ et $2i + 2$) et $a[m + 1..n − 1]$ contient les plus grandes valeurs, triées.",
        complexity: { best: "≈ n log₂ n", average: "≈ 2n log₂ n", worst: "≤ 2n log₂ n + 2n" },
        memory: "O(1)",
        stable: false,
        inPlace: true,
        adaptive: false,
        comparisonBased: true,
        theorem: {
            title: "Construire un tas en temps linéaire",
            body: "La méthode de Floyd fait descendre chaque nœud depuis le bas. Un nœud de hauteur $h$ coûte au plus $2h$ comparaisons, et il y a au plus $n/2^{h+1}$ tels nœuds : le total est majoré par $n Σ h/2^h = 2n$. Toute la difficulté est dans les $n − 1$ extractions.",
        },
    },
    {
        key: "radix",
        name: "Tri radix",
        idea: `On trie les nombres chiffre par chiffre, des unités vers les chiffres de poids fort, avec un tri par comptage stable en base ${RADIX_BASE}.`,
        invariant: "Après la passe $k$, le tableau est trié selon ses $k$ derniers chiffres. C'est la stabilité de chaque passe qui le garantit.",
        complexity: { best: "0", average: "0", worst: "0" },
        memory: "O(n + b)",
        stable: true,
        inPlace: false,
        adaptive: false,
        comparisonBased: false,
        theorem: {
            title: "Sous la borne log₂ n!",
            body: "La borne $⌈log₂ n!⌉$ vaut pour les algorithmes qui n'accèdent aux données que par des comparaisons : leur exécution est un arbre de décision binaire à au moins $n!$ feuilles. Le tri radix lit les chiffres eux-mêmes et ne compare jamais deux éléments. Il fait $Θ(d(n + b))$ opérations, où $d$ est le nombre de chiffres et $b$ la base.",
        },
    },
];

export const ALGO_BY_KEY = Object.fromEntries(ALGORITHMS.map((a) => [a.key, a])) as Record<AlgorithmKey, AlgoInfo>;

/** Exact number of writes of top-down merge sort: every merge writes its whole range. */
function mergeWrites(n: number): number {
    if (n <= 1) return 0;
    return mergeWrites(Math.ceil(n / 2)) + mergeWrites(Math.floor(n / 2)) + n;
}

/** Exact minimum comparisons of top-down merge sort (each merge costs at least the smaller half). */
function mergeBest(n: number): number {
    if (n <= 1) return 0;
    return mergeBest(Math.ceil(n / 2)) + mergeBest(Math.floor(n / 2)) + Math.floor(n / 2);
}

/** Upper bound for heapsort as implemented: 2n for Floyd, then 2 floor(log2 m) per extraction. */
function heapUpper(n: number): number {
    let s = 2 * n;
    for (let m = 1; m < n; m++) s += 2 * Math.floor(Math.log2(m));
    return s;
}

function digitCount(max: number): number {
    let d = 0;
    for (let x = max; x > 0; x = Math.floor(x / RADIX_BASE)) d++;
    return d;
}

export function predictions(key: AlgorithmKey, ctx: Context): Prediction[] {
    const { n, initial, hasDuplicates } = ctx;
    const pairs = (n * (n - 1)) / 2;
    const I = initial.inversions;
    switch (key) {
        case "bubble":
            return [
                { label: "Comparaisons", counter: "cmp", exact: pairs, why: "n(n − 1)/2" },
                { label: "Échanges", counter: "swap", exact: I, why: "I(σ₀), inversions de l'entrée" },
            ];
        case "insertion":
            return [
                { label: "Échanges", counter: "swap", exact: I, why: "I(σ₀), inversions de l'entrée" },
                { label: "Comparaisons", counter: "cmp", min: I, max: I + n - 1, why: "I(σ₀) ≤ C ≤ I(σ₀) + n − 1" },
            ];
        case "selection": {
            const list: Prediction[] = [{ label: "Comparaisons", counter: "cmp", exact: pairs, why: "n(n − 1)/2" }];
            if (!hasDuplicates && initial.cycleCount !== null) {
                list.push({
                    label: "Échanges",
                    counter: "swap",
                    exact: n - initial.cycleCount,
                    why: "n − c(σ₀), distance de Cayley",
                });
            }
            return list;
        }
        case "merge":
            return [
                { label: "Comparaisons", counter: "cmp", min: mergeBest(n), max: mergeWorst(n), why: "entre le meilleur et le pire cas exacts" },
                { label: "Écritures", counter: "write", exact: mergeWrites(n), why: "Σ des tailles des fusions" },
            ];
        case "heap":
            return [{ label: "Comparaisons", counter: "cmp", min: 0, max: heapUpper(n), why: "2n + Σ 2⌊log₂ m⌋" }];
        case "radix": {
            const d = digitCount(ctx.maxValue);
            return [
                { label: "Comparaisons", counter: "cmp", exact: 0, why: "aucune comparaison entre éléments" },
                { label: "Écritures", counter: "write", exact: d * n, why: `d · n avec d = ${d} chiffre${d > 1 ? "s" : ""}` },
            ];
        }
        default:
            return [];
    }
}

export function markers(key: AlgorithmKey, ctx: Context, lowerBound: number): Marker[] {
    const { n } = ctx;
    const list: Marker[] = [
        { label: "n − 1", value: n - 1, kind: "reference" },
        { label: "⌈log₂ n!⌉", value: Math.ceil(lowerBound), kind: "bound" },
        { label: "n log₂ n", value: n * Math.log2(n), kind: "reference" },
        { label: "n(n − 1)/2", value: (n * (n - 1)) / 2, kind: "reference" },
    ];
    if (key === "quick") list.push({ label: "E[C] = 2(n + 1)Hₙ − 4n", value: quickAverage(n), kind: "algo" });
    if (key === "merge") list.push({ label: "W(n), pire cas", value: mergeWorst(n), kind: "algo" });
    if (key === "heap") list.push({ label: "majorant 2n + Σ 2⌊log₂ m⌋", value: heapUpper(n), kind: "algo" });
    return list.sort((x, y) => x.value - y.value);
}
