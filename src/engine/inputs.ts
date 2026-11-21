import { DistributionKey, SortInput } from "./types";

export const DISTRIBUTIONS: { key: DistributionKey; label: string; hint: string }[] = [
    { key: "random", label: "Aléatoire", hint: "Permutation uniforme de {1, …, n} (Fisher–Yates)." },
    { key: "nearly", label: "Presque triée", hint: "L'identité après quelques transpositions entre voisins proches." },
    { key: "reversed", label: "Inversée", hint: "n, n − 1, …, 1 : le maximum d'inversions, n(n − 1)/2." },
    { key: "organ", label: "Tuyaux d'orgue", hint: "Croissante puis décroissante." },
    { key: "few", label: "Peu de valeurs", hint: "Environ √n valeurs distinctes : les doublons révèlent la stabilité." },
];

function shuffle(a: number[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function generateInput(n: number, distribution: DistributionKey): SortInput {
    const range = Array.from({ length: n }, (_, i) => i + 1);
    let values: number[];
    switch (distribution) {
        case "nearly": {
            values = range;
            const swaps = Math.max(1, Math.round(n / 12));
            for (let s = 0; s < swaps; s++) {
                const i = Math.floor(Math.random() * n);
                const j = Math.min(n - 1, i + 1 + Math.floor(Math.random() * 3));
                [values[i], values[j]] = [values[j], values[i]];
            }
            break;
        }
        case "reversed":
            values = range.reverse();
            break;
        case "organ": {
            const half = Math.ceil(n / 2);
            const up = Array.from({ length: half }, (_, i) => 2 * i + 1);
            const down = Array.from({ length: n - half }, (_, i) => 2 * (n - half - i));
            values = [...up, ...down];
            break;
        }
        case "few": {
            const k = Math.max(2, Math.round(Math.sqrt(n)));
            values = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * k));
            break;
        }
        default:
            values = shuffle(range);
    }
    const hasDuplicates = new Set(values).size < values.length;
    return { values, hasDuplicates, distribution, seed: Math.random() };
}
