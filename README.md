## Tri & permutations

Un visualiseur d'algorithmes de tri pensé pour les matheux : un tableau à trier est une permutation σ, et chaque algorithme trace un chemin de σ vers l'identité dans le groupe symétrique Sₙ.

- **8 algorithmes** : bulles, insertion, sélection, Shell (écarts de Ciura), fusion, rapide (Lomuto), tas, radix LSD.
- **Lecture rejouable** : pause, pas à pas en avant et en arrière, curseur de position, vitesse réglable pendant l'exécution.
- **Comptage exact** des comparaisons, échanges, écritures et lectures, comparé à ⌈log₂ n!⌉, n log₂ n, n(n − 1)/2 et aux formules propres à chaque algo.
- **Prédictions vérifiées** : par exemple, les échanges du tri à bulles valent I(σ₀), ceux du tri par sélection n − c(σ₀).
- **La permutation en direct** : diagramme (i, σ(i)), inversions, cycles, signature, plus longue sous-suite croissante, distances de Kendall, Cayley et Ulam.
- **Stabilité visible** : avec des doublons, σ final est l'identité si et seulement si le tri est stable.
- Fiche par algorithme (invariant, récurrence, complexités, un théorème) et thème clair ou sombre.

Projet d'origine : [RemiSaurel/sorting-algorithms](https://github.com/RemiSaurel/sorting-algorithms).

### Lancer le projet

```bash
npm install
npm start        # serveur de développement
npm test         # tests des algorithmes et des prédictions
npm run deploy   # publication sur GitHub Pages
```
