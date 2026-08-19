# MPP L1 — Dossier de conception

> **Statut :** document de référence produit / data / math / architecture  
> **Version :** 1.0  
> **Date :** 19 août 2026  
> **Cible de déploiement :** Vercel  
> **Stack cible :** Next.js App Router + TypeScript + PostgreSQL/Supabase  
> **Objectif :** produire, pour chaque match de Ligue 1 disponible dans MPP, trois scores recommandés — **Leader**, **Équilibré**, **Challenger** — puis adapter la recommandation au contexte du joueur.

---

## 0. Résumé exécutif

Le produit est une application web légère permettant de transformer des informations de marché — principalement les cotes 1X2, Over/Under, BTTS et éventuellement Score Exact — en une distribution probabiliste de scores de football, puis d'optimiser un choix de score pour le système de points de **Mon Petit Prono (MPP)**.

Le principe s'inspire de l'architecture publique décrite par **Score Parfait** : dévigoration des cotes, modèle de scores Poisson/Dixon–Coles, estimation du comportement du peloton MPP, calcul de gain attendu, puis extraction de trois politiques de décision [S1][S2]. L'adaptation Ligue 1 ne doit toutefois **pas** réutiliser les paramètres ou templates Coupe du monde tels quels. Ils doivent être réestimés sur des données Ligue 1 avec une validation temporelle stricte.

### Décision structurante

La première version sera un **monolithe TypeScript** :

```text
Navigateur
    |
    v
Next.js App Router
    |
    +-- UI React / Server Components
    +-- Route Handlers
    +-- moteur mathématique TypeScript pur
    +-- tâches planifiées / imports
    |
    v
Supabase PostgreSQL
```

Aucun microservice et aucun service Python ne sont requis en V1. Les calculs sont de petite dimension : matrices de scores, sommes, optimisations de 2 à 3 paramètres et softmax. Ils peuvent être implémentés et testés en TypeScript. Cette décision réduit fortement le coût d'exploitation et rend le déploiement Vercel immédiat.

### Ordre de construction recommandé

1. **Socle projet + base de données**
2. **Moteur probabiliste indépendant de MPP**
3. **Import manuel de cotes et matchs**
4. **Interface journée + fiche match**
5. **Moteur de points MPP versionné**
6. **Estimation du peloton**
7. **Leader / Équilibré / Challenger**
8. **Backtest walk-forward**
9. **Automatisation des données**
10. **Race Engine et personnalisation classement**

Le produit ne devra jamais afficher une précision fictive : si les données du peloton sont absentes, la part MPP sera clairement marquée comme **estimée** et accompagnée d'un niveau de confiance.

---

# 1. Vision produit

## 1.1 Problème

Un joueur MPP doit choisir un score exact. Le score le plus probable n'est pas nécessairement le score le plus intéressant dans un jeu où :

- la bonne issue du match rapporte des points ;
- un score exact apporte un bonus ;
- ce bonus dépend de la rareté du score parmi les joueurs ayant trouvé la bonne issue ;
- le joueur peut vouloir maximiser soit ses points moyens, soit ses chances de conserver une avance, soit sa capacité à remonter.

Il existe donc trois problèmes distincts :

1. **Football :** quelle est la probabilité réelle de chaque score ?
2. **Peloton :** quelle proportion des joueurs MPP va choisir chaque score ?
3. **Décision :** quel score maximise l'objectif du joueur ?

Le produit doit séparer ces trois couches.

## 1.2 Proposition de valeur

Pour chaque match :

```text
PSG — Lens
────────────────────────────────────
Leader       2-0      P = 16.8 %
Équilibré    3-0      EV = 34.2 pts
Challenger   3-1      P = 8.1 %, rareté forte

Recommandation contextuelle : 3-0
Confiance modèle : élevée
Confiance peloton : moyenne
Dernière mise à jour : H-1
```

Le joueur doit pouvoir comprendre **pourquoi** un score est proposé :

- probabilité du score ;
- probabilité 1X2 ;
- buts attendus ;
- estimation du peloton ;
- bonus de rareté attendu ;
- espérance de points ;
- coût en variance par rapport au score modal.

## 1.3 Utilisateurs cibles

### Persona A — joueur simple

Veut une recommandation rapide pour chaque match.

### Persona B — joueur analytique

Veut inspecter probabilités, matrice des scores et hypothèses.

### Persona C — joueur de ligue privée

Veut une stratégie liée à son rang et à son écart au leader.

### Persona D — administrateur / analyste

Veut importer les cotes, recalculer les modèles, suivre les versions et faire des backtests.

---

# 2. Périmètre

## 2.1 V1 — obligatoire

- calendrier Ligue 1 ;
- import manuel ou CSV des cotes ;
- probabilités 1X2 dévigorées ;
- estimation de `lambda_home` et `lambda_away` ;
- matrice Poisson ;
- correction Dixon–Coles ;
- distribution de scores ;
- moteur de points MPP configurable ;
- modèle de peloton simple ;
- Leader ;
- Équilibré ;
- Challenger ;
- page journée ;
- fiche match ;
- page admin minimale ;
- journal immuable des prédictions ;
- tests unitaires mathématiques ;
- backtest walk-forward minimal ;
- déploiement Vercel.

## 2.2 V1.5 — souhaitable

- snapshots J-1 / H-6 / H-1 ;
- ingestion automatique d'un fournisseur de cotes ;
- score de confiance ;
- historique de performance ;
- comparaison à plusieurs baselines ;
- import des observations réelles du peloton MPP ;
- recalibration automatique de `alpha`.

## 2.3 V2

- templates/régimes Ligue 1 appris ;
- modèle de forces offensives/défensives des clubs ;
- recalibration de `rho` ;
- estimation multi-bookmakers ;
- dashboard calibration ;
- authentification ;
- saisie du classement privé.

## 2.4 V3

- Race Engine Monte Carlo ;
- simulation des adversaires ;
- optimisation de probabilité de gagner une ligue ;
- recommandations personnalisées par joueur ;
- modèle de peloton hiérarchique par type de club / journée / contexte.

## 2.5 Hors périmètre initial

- paris en argent réel ;
- portefeuille de mises ;
- automatisation de comptes MPP ;
- contournement d'API privée ou de protections anti-bot ;
- scrapping agressif ;
- microservices ;
- Kubernetes ;
- modèles de deep learning ;
- LLM dans le moteur de décision ;
- application native iOS/Android.

---

# 3. Sources et héritage méthodologique

Score Parfait décrit publiquement un pipeline de cinq étapes : cotes de bookmakers, distribution des scores, analyse du peloton MPP, trois stratégies et apprentissage continu [S1]. Le site indique notamment l'utilisation d'une méthode POWER de dévigoration, d'un modèle Poisson corrigé Dixon–Coles, de quatre templates Coupe du monde et d'une calibration de paramètres de peloton [S1].

Le présent projet conserve les idées transférables :

- marché comme ancre probabiliste ;
- dévigoration ;
- distribution de score ;
- Dixon–Coles ;
- modèle explicite du peloton ;
- optimisation par gain attendu ;
- variantes Leader / Équilibré / Challenger.

Il modifie les éléments non transférables :

- pas de réutilisation directe des templates Coupe du monde ;
- pas de réutilisation directe de `alpha = 1.5` ;
- pas de réutilisation automatique de `w_tpl = 0.4` ;
- pas de calibration rétrospective évaluée sur les mêmes matchs ;
- adaptation au format long d'une saison de Ligue 1.

Dixon et Coles ont publié en 1997 un modèle dynamique de scores de football basé sur une régression Poisson et une correction spécifique des faibles scores [S5].

---

# 4. Principes de conception

## P1 — Probabilités avant recommandations

Les fonctions `Leader`, `Balanced`, `Challenger` ne doivent jamais contenir de logique football. Elles consomment une distribution déjà calculée.

## P2 — Toute donnée est horodatée

Une cote sans timestamp n'est pas une donnée de backtest fiable.

## P3 — Pas de fuite temporelle

Une prédiction au temps `t` ne peut utiliser que des informations connues avant `t`.

## P4 — Moteur déterministe

À entrées identiques + version de modèle identique, sortie identique.

## P5 — Prédictions immuables

Une prédiction enregistrée n'est jamais modifiée. Une nouvelle information crée une nouvelle version/snapshot.

## P6 — Configuration versionnée des règles MPP

Le système de points peut changer. Les seuils ne doivent jamais être hardcodés au milieu du code métier.

## P7 — Complexité gagnée par validation

Aucun template, variable xG, modèle d'équipe ou feature supplémentaire n'entre en production sans test d'ablation hors échantillon.

## P8 — Données MPP réelles > proxy

Lorsque des observations MPP fiables existent, elles remplacent progressivement le proxy de peloton.

## P9 — Incertitude visible

Une recommandation issue de données incomplètes doit le signaler.

## P10 — Vercel-first

Le projet est conçu pour fonctionner dans un environnement serverless sans processus permanent.

---

# 5. Notation mathématique

Pour un match `m` :

- `H` : équipe domicile ;
- `A` : équipe extérieure ;
- `X` : nombre de buts de H ;
- `Y` : nombre de buts de A ;
- `s = (i,j)` : score exact `i-j` ;
- `lambda_H` : buts attendus de H ;
- `lambda_A` : buts attendus de A ;
- `rho` : paramètre Dixon–Coles ;
- `P_s` : probabilité modèle du score `s` ;
- `q_s` : part estimée du peloton qui joue le score `s` ;
- `c_s` : part conditionnelle du score parmi les joueurs ayant choisi la bonne issue ;
- `G_s` : points MPP obtenus si `s` se réalise et a été pronostiqué ;
- `EV_s` : espérance de points associée au choix de `s`.

On définit la fonction d'issue :

```text
outcome(i,j) =
    HOME si i > j
    DRAW si i = j
    AWAY si i < j
```

---

# 6. Couche marché

## 6.1 Données supportées

Le modèle accepte les marchés suivants :

```ts
type MarketSnapshot = {
  matchId: string
  capturedAt: string

  oneXTwo: {
    home: number
    draw: number
    away: number
  }

  totals?: Array<{
    line: number // ex 2.5
    over: number
    under: number
  }>

  btts?: {
    yes: number
    no: number
  }

  asianHandicap?: Array<{
    line: number
    home: number
    away: number
  }>

  exactScores?: Array<{
    homeGoals: number
    awayGoals: number
    odds: number
  }>
}
```

Toutes les cotes sont décimales.

## 6.2 Probabilités implicites brutes

Pour une cote `o_i` :

```math
q_i = 1 / o_i
```

La somme :

```math
Q = sum_i q_i
```

est généralement supérieure à 1.

`Q - 1` représente l'overround brut.

## 6.3 Dévigoration proportionnelle — baseline

La méthode la plus simple :

```math
p_i = q_i / sum_j q_j
```

Elle doit être conservée comme baseline de comparaison.

## 6.4 Dévigoration POWER — méthode principale

Conformément à la méthode décrite par Score Parfait [S1], on cherche un exposant `k > 0` tel que :

```math
sum_i q_i^k = 1
```

puis :

```math
p_i = q_i^k
```

Le paramètre `k` est résolu numériquement par bissection.

Pseudo-code :

```ts
function devigPower(odds: number[]): number[] {
  const q = odds.map((o) => 1 / o)

  const f = (k: number) => q.reduce((sum, qi) => sum + Math.pow(qi, k), 0) - 1

  const k = bisect(f, 0.01, 10, 1e-12)

  return q.map((qi) => Math.pow(qi, k))
}
```

### Invariants

```text
0 < p_i < 1
abs(sum(p_i) - 1) < 1e-10
```

### Tests obligatoires

- marché parfaitement fair => `k ≈ 1` ;
- ordre des favoris conservé ;
- somme = 1 ;
- aucune probabilité négative ;
- résultat déterministe.

## 6.5 Sensibilité de dévigoration

Le backtest doit comparer au moins :

1. proportionnelle ;
2. POWER.

Une méthode supplémentaire, par exemple Shin, peut être ajoutée plus tard uniquement si elle améliore la calibration.

---

# 7. Modèle de score : Poisson

## 7.1 Hypothèse de base

```math
X ~ Poisson(lambda_H)
Y ~ Poisson(lambda_A)
```

Sous indépendance :

```math
P(X=i) = exp(-lambda_H) lambda_H^i / i!
P(Y=j) = exp(-lambda_A) lambda_A^j / j!
```

et :

```math
P_0(i,j)
= P(X=i) P(Y=j)
```

soit :

```math
P_0(i,j)
= exp(-(lambda_H + lambda_A))
  * lambda_H^i / i!
  * lambda_A^j / j!
```

## 7.2 Probabilités dérivées

### 1X2

```math
P(H) = sum_{i>j} P(i,j)
P(D) = sum_{i=j} P(i,j)
P(A) = sum_{i<j} P(i,j)
```

### Over 2.5

```math
P(O2.5) = sum_{i+j >= 3} P(i,j)
```

### Under 2.5

```math
P(U2.5) = sum_{i+j <= 2} P(i,j)
```

### BTTS

```math
P(BTTS) = 1 - P(X=0) - P(Y=0) + P(X=0,Y=0)
```

---

# 8. Correction Dixon–Coles

Le modèle indépendant de Poisson est corrigé sur quatre faibles scores selon Dixon–Coles [S5].

On définit :

```math
tau(i,j) =
    1 - lambda_H lambda_A rho   si i=0, j=0
    1 + lambda_H rho            si i=0, j=1
    1 + lambda_A rho            si i=1, j=0
    1 - rho                     si i=1, j=1
    1                           sinon
```

Puis :

```math
P_DC(i,j) = tau(i,j) * P_0(i,j)
```

La matrice est normalisée après application de la correction.

## 8.1 Contraintes sur `rho`

Toutes les valeurs de `tau` doivent rester strictement positives.

Donc :

```math
1 - lambda_H lambda_A rho > 0
1 + lambda_H rho > 0
1 + lambda_A rho > 0
1 - rho > 0
```

L'optimiseur devra imposer des bornes conservatrices, par exemple :

```text
rho ∈ [-0.30, 0.30]
```

puis rejeter toute combinaison qui produit `tau <= 0`.

## 8.2 V1

`rho` sera :

- fixé à une valeur calibrée sur historique Ligue 1 si cet historique est disponible ;
- sinon initialisé à `0`, c'est-à-dire Poisson pur ;
- jamais copié d'une compétition différente sans validation.

## 8.3 V2

`rho` est réestimé par fenêtre temporelle avec régularisation.

---

# 9. Taille de la grille de scores

L'interface peut afficher une matrice `0-0` à `9-9`, mais le calcul interne ne doit pas jeter silencieusement la masse au-delà de 9 buts.

## Choix

Calculer jusqu'à :

```text
G = max(12, valeur telle que masse de queue < 1e-10)
```

Les probabilités 1X2, Over/Under et BTTS sont calculées sur cette grille étendue.

La UI présente seulement `0..9`.

Les recommandations peuvent être limitées à `0..9` en V1.

## Contrôle

```math
tail_mass = 1 - sum_{i=0}^G sum_{j=0}^G P(i,j)
```

Exigence :

```text
tail_mass < 1e-8
```

---

# 10. Inférence de `lambda_H`, `lambda_A` et `rho`

## 10.1 Motivation

Les cotes 1X2 donnent une information sur l'asymétrie du match. Les marchés de total de buts donnent une information supplémentaire sur le niveau de buts attendu.

L'utilisation simultanée de plusieurs marchés permet d'obtenir un couple `(lambda_H, lambda_A)` plus stable.

## 10.2 V1 recommandée

Paramètres à optimiser :

```text
theta = (lambda_H, lambda_A)
```

`rho` est fixé.

Bornes :

```text
lambda_H ∈ [0.05, 6.0]
lambda_A ∈ [0.05, 6.0]
```

## 10.3 Fonction objectif

Pour chaque marché `r`, on dispose :

- `p_market_r` : probabilité dévigorée ;
- `p_model_r(theta)` : probabilité induite par la matrice de score.

On minimise :

```math
J(theta)
= sum_r w_r
  [logit(p_model_r(theta)) - logit(p_market_r)]^2
+ lambda_reg R(theta)
```

avec :

```math
logit(p) = log(p / (1-p))
```

et :

```math
R(theta)
= ((lambda_H + lambda_A) - mu_goals_prior)^2
```

uniquement lorsqu'un prior est nécessaire.

### Pourquoi travailler en logit ?

Une erreur absolue de 2 points n'a pas le même sens autour de 50 % et autour de 2 %. Le logit rend l'optimisation plus sensible aux écarts relatifs dans les queues.

## 10.4 Poids de marché par défaut

Valeurs initiales proposées :

```text
1X2 Home             1.00
1X2 Draw             1.00
1X2 Away             1.00
Over 2.5             0.80
Under 2.5            0.80
BTTS Yes             0.50
BTTS No              0.50
Asian Handicap       0.60
```

Ces poids ne sont pas considérés comme vérité scientifique. Ils font partie des hyperparamètres à tester.

## 10.5 Optimiseur

Pour éviter une dépendance numérique lourde :

1. grille grossière ;
2. sélection des meilleurs candidats ;
3. Nelder–Mead borné ou coordinate descent interne ;
4. arrêt lorsque `delta J < 1e-10`.

Dimension faible => coût négligeable.

## 10.6 Cas dégradés

### 1X2 uniquement

On peut estimer `(lambda_H, lambda_A)`, mais on ajoute un flag :

```text
model_confidence = MEDIUM
```

### 1X2 + total

```text
model_confidence = HIGH
```

### cotes incohérentes

Si l'optimisation ne reproduit pas suffisamment les marchés :

```text
market_fit_status = DEGRADED
```

et aucune recommandation ne doit être présentée comme haute confiance.

---

# 11. Marché Score Exact

## 11.1 Cas idéal

Si le fournisseur expose un marché Score Exact suffisamment complet avec un outcome `Autre score`, on peut dévigorer directement ce marché.

## 11.2 Cas incomplet

Ne jamais appliquer une dévigoration naïve à seulement dix scores cotés si le bookmaker en cote davantage : l'overround n'est alors pas observable correctement.

Dans ce cas, les cotes Score Exact servent de **contraintes secondaires**.

## 11.3 Fusion proposée V2

Soit :

- `P_DC` la distribution structurelle ;
- `P_SE` la distribution Score Exact dévigorée.

Une combinaison possible est le log-pooling :

```math
P_final(s)
∝ P_DC(s)^(1-w)
  * P_SE(s)^w
```

avec `w` validé hors échantillon.

V1 n'en a pas besoin.

---

# 12. Modèle dynamique des clubs — V2

Un modèle historique de Ligue 1 peut écrire :

```math
log(lambda_H)
= mu + h + attack_H(t) - defense_A(t)

log(lambda_A)
= mu + attack_A(t) - defense_H(t)
```

où :

- `mu` : niveau moyen de buts ;
- `h` : avantage domicile ;
- `attack_k` : force offensive ;
- `defense_k` : force défensive.

## 12.1 Pondération temporelle

Dixon–Coles utilise une idée de pondération temporelle afin que les matchs récents aient davantage d'importance.

On peut définir :

```math
w_age = exp(-xi * age_days)
```

## 12.2 Utilisation recommandée

Ce modèle ne remplace pas le marché.

Il sert de :

- prior ;
- contrôle de cohérence ;
- fallback en l'absence temporaire de certaines cotes.

---

# 13. Régimes / templates Ligue 1 — V2

Score Parfait utilise des templates Coupe du monde `crush`, `fav`, `tight`, `draw` [S1].

Ils ne sont pas copiés.

## 13.1 Régimes candidats

```text
CRUSH
FAVORITE
TIGHT
DRAW
OPEN
LOW_SCORING
```

## 13.2 Vecteur de contexte

```math
z_m = [
  P(H),
  P(D),
  P(A),
  expected_total_goals,
  P(BTTS),
  favorite_margin
]
```

## 13.3 Mélange

```math
P_L1(s|z)
= (1 - w_tpl) P_DC(s)
+ w_tpl sum_c pi_c(z) T_c(s)
```

où :

- `T_c` : distribution empirique du régime ;
- `pi_c(z)` : poids de similarité ;
- `w_tpl` : hyperparamètre.

## 13.4 Gate de production

Le module n'est activé que si :

```text
LogLoss(V2) < LogLoss(V1)
ET
RPS(V2) < RPS(V1)
sur un jeu walk-forward hors échantillon.
```

---

# 14. Modèle du peloton MPP

## 14.1 Pourquoi il est séparé

Le modèle football répond :

> « Quelle est la probabilité que le match finisse 2-1 ? »

Le modèle peloton répond :

> « Quelle part des joueurs va pronostiquer 2-1 ? »

Ce ne sont pas les mêmes probabilités.

## 14.2 Baseline sans donnée MPP

En absence d'observations :

```math
q_s ∝ P_s^alpha
```

donc :

```math
q_s =
P_s^alpha / sum_u P_u^alpha
```

- `alpha = 1` : peloton proportionnel au modèle ;
- `alpha > 1` : concentration accrue sur les scores populaires ;
- `alpha < 1` : dispersion accrue.

`alpha` n'est jamais supposé égal à celui d'une Coupe du monde.

## 14.3 Modèle enrichi

Avec données réelles :

```math
q_s =
softmax(
  alpha log(P_s + epsilon)
  + beta^T f_s
)
```

où `f_s` peut contenir :

```text
is_home_win
is_draw
is_away_win
is_1_0
is_2_0
is_2_1
is_1_1
total_goals
goal_difference
favorite_score
favorite_popularity
club_home_popularity
club_away_popularity
is_big_club
matchday
weekend_prime_time
```

Les effets club doivent être régularisés.

## 14.4 Part conditionnelle

Les règles de rareté publiées pour le Mondial 2026 sont exprimées parmi les joueurs ayant trouvé la bonne issue [S9].

Pour un score `s` :

```math
c_s =
q_s /
sum_{u : outcome(u) = outcome(s)} q_u
```

C'est `c_s`, et non nécessairement `q_s`, qui alimente la fonction de rareté.

## 14.5 Niveau de confiance du peloton

```text
NONE
LOW
MEDIUM
HIGH
```

Exemple :

```text
NONE   aucun snapshot réel
LOW    moins de 20 matchs observés
MEDIUM 20 à 100 matchs
HIGH   >100 matchs + calibration correcte
```

Les seuils exacts seront ajustés après observation.

---

# 15. Règles MPP

## 15.1 Principe

Le moteur de points doit être un module pur :

```ts
type MppRules = {
  version: string
  validFrom: string
  validTo?: string

  resultPoints: ResultPointRule

  rarityTiers: Array<{
    minShareInclusive: number
    maxShareExclusive: number
    bonus: number
    label: string
  }>
}
```

## 15.2 Bonus de rareté documenté pour le Mondial 2026

À titre de référence, la LFP publiait pour MPP Mondial 2026 [S9] :

```text
share conditionnelle > 30 %      +20
20 % à 30 %                      +30
5 % à 20 %                       +50
0,5 % à 5 %                      +70
< 0,5 %                         +100
```

**Important :** ces seuils ne doivent pas être supposés identiques pour la Ligue 1 2026-2027. Ils servent uniquement d'exemple de configuration jusqu'à vérification des règles Ligue 1.

## 15.3 Points de résultat

Le système doit accepter :

```ts
function resultPoints(
  predictedOutcome: Outcome,
  officialMppQuoteOrPoints: number,
): number
```

Si les points officiels MPP ne sont pas récupérables automatiquement, ils peuvent être importés avec chaque match.

---

# 16. Espérance de points

Soit `s` le score pronostiqué.

Si `s` se réalise exactement, on reçoit :

```math
G_exact(s)
= R_outcome(s) + B(c_s)
```

où :

- `R_outcome` = points de la bonne issue ;
- `B` = bonus score exact/rareté.

La composante de points reçue lorsqu'on trouve uniquement l'issue dépend du barème MPP réel et doit être intégrée explicitement.

## 16.1 Formule générale

Pour un pronostic `s`, tous les scores réels `u` sont considérés :

```math
EV(s)
= sum_u P_u * Points(prediction=s, actual=u)
```

Cette formule est préférable à :

```math
P_s * gain_si_exact
```

car elle tient aussi compte des points obtenus lorsque l'issue est correcte mais le score exact ne l'est pas.

Pseudo-code :

```ts
function expectedPoints(
  prediction: Score,
  actualDistribution: ScoreProbability[],
  rules: MppRules,
  crowd: CrowdDistribution,
): number {
  return actualDistribution.reduce((ev, actual) => {
    return (
      ev +
      actual.probability *
        rulesEngine.points({
          predictedScore: prediction,
          actualScore: actual.score,
          crowd,
        })
    )
  }, 0)
}
```

C'est la fonction officielle à utiliser en production.

---

# 17. Politique Leader

Définition :

```math
s_L = argmax_s P_s
```

Objectif :

- maximiser la probabilité du score exact ;
- réduire la variance ;
- servir de choix défensif.

Tie-break :

1. EV supérieur ;
2. part peloton inférieure ;
3. total de buts inférieur ;
4. ordre lexicographique stable.

Les tie-breaks rendent le moteur déterministe.

---

# 18. Politique Équilibré

Définition :

```math
s_E = argmax_s EV(s)
```

C'est le choix par défaut.

Il maximise l'espérance de points selon :

- distribution football ;
- règles MPP ;
- distribution du peloton.

### Exigence

Si le modèle de peloton a un niveau de confiance `NONE`, afficher :

```text
Équilibré — estimation provisoire
```

---

# 19. Politique Challenger

Le Challenger ne doit pas simplement sélectionner le score ayant le plus gros bonus.

## 19.1 Edge de popularité

On définit :

```math
edge_s =
log((P_s + epsilon) / (q_s + epsilon))
```

Un score possède un edge positif s'il est plus probable selon le modèle qu'il n'est populaire dans le peloton.

## 19.2 Ensemble admissible

```math
C = {
  s :
  P_s >= P_min
  et
  EV_s >= eta * EV_balanced
}
```

Valeurs initiales proposées :

```text
P_min = 0.025
eta = 0.60
```

## 19.3 Utilité Challenger

```math
U_C(s)
= z(EV_s)
+ gamma z(edge_s)
+ delta z(B(c_s))
```

où `z()` est une standardisation au sein du match.

Valeurs initiales :

```text
gamma = 0.8
delta = 0.4
```

Elles sont des hyperparamètres à calibrer.

## 19.4 Contraintes

Le Challenger ne peut jamais proposer un score avec :

```text
P_s < 1 %
```

par défaut.

Une feature expérimentale pourra autoriser des modes très agressifs plus tard.

---

# 20. Score de confiance

Chaque prédiction reçoit :

```ts
type Confidence = {
  market: number
  modelFit: number
  crowd: number
  freshness: number
  overall: number
}
```

Chaque dimension est dans `[0,1]`.

## 20.1 Fraîcheur

Exemple :

```math
freshness =
exp(-age_hours / tau)
```

avec `tau = 12`.

## 20.2 Fit marché

```math
fit =
exp(-J(theta) / scale)
```

## 20.3 Overall

V1 :

```math
overall
= 0.40 market
+ 0.30 modelFit
+ 0.20 crowd
+ 0.10 freshness
```

La UI convertit :

```text
>= 0.80  Élevée
>= 0.60  Moyenne
<  0.60  Faible
```

---

# 21. Race Engine

## 21.1 Objectif

Les stratégies statiques ne tiennent pas compte du nombre de matchs restants.

Le Race Engine répond :

> « Étant donné ma situation actuelle, laquelle des trois politiques dois-je utiliser ? »

## 21.2 État

```ts
type LeagueState = {
  playerRank: number
  playerPoints: number
  leaderPoints: number
  nextOpponentPoints?: number
  participants: number
  matchesRemaining: number
  matchesTotal: number
}
```

On définit :

```math
gap = leaderPoints - playerPoints
progress = 1 - matchesRemaining / matchesTotal
```

## 21.3 V1 heuristique

```math
urgency =
sigmoid(
  a * gap / max(matchesRemaining,1)
  + b * progress
  + c * rankPercentile
)
```

Puis :

```text
urgency < 0.33       Leader ou Équilibré
0.33 <= u < 0.66     Équilibré
u >= 0.66            Challenger sur certains matchs
```

La politique exacte peut limiter le nombre de Challenger par journée.

## 21.4 V3 Monte Carlo

On simule :

1. scores réels de chaque match ;
2. choix des adversaires selon le modèle peloton ;
3. points MPP ;
4. classement final.

Pour chaque action candidate :

```math
P_win(s)
= Pr(finir premier | état courant, choisir s)
```

Le choix optimal devient :

```math
s* = argmax_s P_win(s)
```

C'est le véritable objectif si le joueur veut gagner une ligue plutôt que maximiser ses points moyens.

---

# 22. Architecture applicative

## 22.1 Vue générale

```text
                              +----------------------+
                              |  fournisseur de cotes|
                              +----------+-----------+
                                         |
                                         v
+-----------+       HTTPS       +--------+---------+
| navigateur+------------------>| Next.js / Vercel |
+-----------+                   +--------+---------+
                                         |
                 +-----------------------+----------------------+
                 |                       |                      |
                 v                       v                      v
          React UI / RSC          Route Handlers        Cron / Imports
                                         |
                                         v
                                +--------+---------+
                                | moteur TypeScript |
                                +--------+---------+
                                         |
                                         v
                                +--------+---------+
                                | Supabase/Postgres|
                                +------------------+
```

## 22.2 Pourquoi Next.js App Router

Les Route Handlers permettent de définir les endpoints HTTP directement sous `app/.../route.ts` [S6]. Vercel déploie les routes sous `app/api/` comme fonctions [S7].

Avantages :

- un seul dépôt ;
- un seul build ;
- Server Components pour la lecture ;
- endpoints pour imports/calculs ;
- déploiement natif Vercel ;
- bonne ergonomie TypeScript.

## 22.3 Pourquoi Supabase

Supabase fournit un PostgreSQL complet ainsi que les briques d'authentification et de sécurité RLS si nécessaires [S10][S11].

V1 utilise principalement :

```text
PostgreSQL
Supabase JS
migrations SQL
```

Realtime et Auth ne sont ajoutés que lorsque le besoin existe.

---

# 23. Arborescence du dépôt

```text
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── journee/
│   │   └── [round]/
│   │       └── page.tsx
│   ├── match/
│   │   └── [matchId]/
│   │       └── page.tsx
│   ├── classement/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── imports/
│   │   └── backtest/
│   └── api/
│       ├── matches/
│       │   └── route.ts
│       ├── predictions/
│       │   └── route.ts
│       ├── calculate/
│       │   └── route.ts
│       ├── admin/
│       │   ├── import-odds/
│       │   │   └── route.ts
│       │   └── recalculate/
│       │       └── route.ts
│       └── cron/
│           └── update/
│               └── route.ts
│
├── components/
│   ├── match-card.tsx
│   ├── score-pick.tsx
│   ├── score-matrix.tsx
│   ├── confidence-badge.tsx
│   └── market-summary.tsx
│
├── lib/
│   ├── model/
│   │   ├── types.ts
│   │   ├── factorial.ts
│   │   ├── poisson.ts
│   │   ├── dixon-coles.ts
│   │   ├── score-grid.ts
│   │   ├── devig-power.ts
│   │   ├── market-projection.ts
│   │   ├── optimizer.ts
│   │   ├── crowd-model.ts
│   │   ├── mpp-rules.ts
│   │   ├── expected-value.ts
│   │   ├── leader.ts
│   │   ├── balanced.ts
│   │   ├── challenger.ts
│   │   ├── confidence.ts
│   │   └── race-engine.ts
│   │
│   ├── data/
│   │   ├── supabase-server.ts
│   │   ├── repositories/
│   │   └── providers/
│   │       ├── odds-provider.ts
│   │       ├── manual-provider.ts
│   │       └── csv-provider.ts
│   │
│   ├── validation/
│   │   └── schemas.ts
│   │
│   └── observability/
│       └── logger.ts
│
├── scripts/
│   ├── seed.ts
│   ├── import-history.ts
│   ├── backtest.ts
│   └── calibrate.ts
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── e2e/
│   └── match-flow.spec.ts
│
├── docs/
│   └── adr/
│
├── vercel.json
├── package.json
├── tsconfig.json
└── README.md
```

---

# 24. Dépendances recommandées

## Production

```text
next
react
react-dom
typescript
@supabase/supabase-js
zod
```

UI :

```text
tailwindcss
```

Optionnel :

```text
date-fns
```

## Tests

```text
vitest
@testing-library/react
playwright
```

## Règle

Éviter les dépendances mathématiques si le calcul est court et facilement testable.

---

# 25. Modèle de données

## 25.1 `teams`

```sql
create table teams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
```

## 25.2 `seasons`

```sql
create table seasons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  competition text not null default 'L1',
  starts_at date not null,
  ends_at date not null
);
```

## 25.3 `matches`

```sql
create table matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id),
  external_id text,
  round integer not null,
  kickoff_at timestamptz not null,
  home_team_id uuid not null references teams(id),
  away_team_id uuid not null references teams(id),

  status text not null default 'SCHEDULED',

  home_goals integer,
  away_goals integer,

  created_at timestamptz not null default now(),

  unique(season_id, round, home_team_id, away_team_id)
);
```

## 25.4 `odds_snapshots`

```sql
create table odds_snapshots (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id),
  provider text not null,
  bookmaker text,
  captured_at timestamptz not null,
  market_payload jsonb not null,
  content_hash text not null,
  created_at timestamptz not null default now(),

  unique(match_id, provider, captured_at, content_hash)
);

create index odds_snapshots_match_time_idx
on odds_snapshots(match_id, captured_at desc);
```

## 25.5 `mpp_snapshots`

```sql
create table mpp_snapshots (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id),
  captured_at timestamptz not null,
  source text not null,

  outcome_home_share numeric,
  outcome_draw_share numeric,
  outcome_away_share numeric,

  score_shares jsonb not null,
  confidence text not null,

  created_at timestamptz not null default now()
);
```

Format `score_shares` :

```json
{
  "0-0": 0.052,
  "1-0": 0.141,
  "1-1": 0.134,
  "2-0": 0.113,
  "2-1": 0.119
}
```

## 25.6 `mpp_rule_sets`

```sql
create table mpp_rule_sets (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  valid_from timestamptz not null,
  valid_to timestamptz,
  config jsonb not null,
  created_at timestamptz not null default now()
);
```

## 25.7 `model_versions`

```sql
create table model_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  git_sha text,
  config jsonb not null,
  trained_until timestamptz,
  created_at timestamptz not null default now()
);
```

## 25.8 `predictions`

```sql
create table predictions (
  id uuid primary key default gen_random_uuid(),

  match_id uuid not null references matches(id),
  odds_snapshot_id uuid not null references odds_snapshots(id),
  mpp_snapshot_id uuid references mpp_snapshots(id),
  mpp_rule_set_id uuid not null references mpp_rule_sets(id),
  model_version_id uuid not null references model_versions(id),

  calculated_at timestamptz not null,
  cutoff_at timestamptz not null,

  lambda_home numeric not null,
  lambda_away numeric not null,
  rho numeric not null,

  market_fit_loss numeric not null,
  confidence jsonb not null,

  score_probabilities jsonb not null,
  crowd_probabilities jsonb,
  expected_points jsonb not null,

  leader_score text not null,
  balanced_score text not null,
  challenger_score text not null,

  created_at timestamptz not null default now()
);

create index predictions_match_calc_idx
on predictions(match_id, calculated_at desc);
```

**Aucun `update` fonctionnel sur cette table en production.**

## 25.9 `private_league_states`

```sql
create table private_league_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  captured_at timestamptz not null,
  player_rank integer not null,
  player_points integer not null,
  leader_points integer not null,
  participants integer not null,
  matches_remaining integer not null,
  matches_total integer not null
);
```

## 25.10 `backtest_runs`

```sql
create table backtest_runs (
  id uuid primary key default gen_random_uuid(),
  model_version text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  config jsonb not null,
  metrics jsonb,
  status text not null
);
```

---

# 26. Relations

```text
season
  |
  +-- matches
       |
       +-- odds_snapshots
       +-- mpp_snapshots
       +-- predictions
       |      |
       |      +-- model_version
       |      +-- mpp_rule_set
       |
       +-- result
```

---

# 27. API interne

## GET `/api/matches?round=4`

Réponse :

```json
{
  "round": 4,
  "matches": [
    {
      "id": "uuid",
      "kickoffAt": "2026-09-12T19:00:00+02:00",
      "home": { "name": "Paris SG" },
      "away": { "name": "Lens" },
      "prediction": {
        "leader": "2-0",
        "balanced": "3-0",
        "challenger": "3-1",
        "confidence": 0.82
      }
    }
  ]
}
```

## GET `/api/predictions?matchId=...`

Renvoie le dernier snapshot antérieur au cutoff courant.

## POST `/api/calculate`

Admin uniquement.

Entrée :

```json
{
  "matchId": "uuid",
  "oddsSnapshotId": "uuid"
}
```

Sortie :

```json
{
  "predictionId": "uuid",
  "lambdaHome": 2.31,
  "lambdaAway": 0.82,
  "rho": -0.07,
  "leader": "2-0",
  "balanced": "3-0",
  "challenger": "3-1"
}
```

## POST `/api/admin/import-odds`

Accepte :

```text
application/json
text/csv
```

## POST `/api/admin/recalculate`

Recalcule les matchs futurs avec le dernier snapshot valide.

---

# 28. Contrats TypeScript du moteur

```ts
export type Score = {
  home: number
  away: number
}

export type ScoreProbability = {
  score: Score
  probability: number
}

export type ModelInput = {
  fairMarkets: FairMarkets
  rho: number
  crowd?: CrowdDistribution
  rules: MppRules
}

export type MatchPrediction = {
  lambdaHome: number
  lambdaAway: number
  rho: number

  probabilities: ScoreProbability[]
  crowd: CrowdDistribution

  leader: StrategyPick
  balanced: StrategyPick
  challenger: StrategyPick

  confidence: Confidence
}

export type StrategyPick = {
  score: Score
  probability: number
  expectedPoints: number
  crowdShare: number
  conditionalCrowdShare: number
  rarityBonus: number
}
```

---

# 29. Pipeline de calcul

```text
RAW ODDS
   |
   v
validate input
   |
   v
DEVIG
   |
   +--> fair 1X2
   +--> fair totals
   +--> fair BTTS
   |
   v
FIT LAMBDAS
   |
   v
POISSON GRID
   |
   v
DIXON-COLES
   |
   v
market consistency check
   |
   v
FOOTBALL SCORE DISTRIBUTION
   |
   +-------------------+
   |                   |
   v                   v
CROWD MODEL       MPP RULE SET
   |                   |
   +---------+---------+
             |
             v
       POINTS MATRIX
             |
             v
     EXPECTED POINTS
             |
      +------+------+
      |      |      |
      v      v      v
   Leader Balanced Challenger
             |
             v
        Race Engine
             |
             v
        persisted snapshot
```

---

# 30. Pseudo-code principal

```ts
export function calculatePrediction(input: CalculationInput): MatchPrediction {
  const fairMarkets = devigAll(input.marketSnapshot)

  const fit = fitGoalModel({
    markets: fairMarkets,
    fixedRho: input.modelConfig.rho,
  })

  const grid = buildDixonColesGrid({
    lambdaHome: fit.lambdaHome,
    lambdaAway: fit.lambdaAway,
    rho: input.modelConfig.rho,
  })

  const crowd = input.observedCrowd
    ? calibrateObservedCrowd(input.observedCrowd)
    : estimateCrowd({
        grid,
        alpha: input.modelConfig.crowdAlpha,
      })

  const points = computeExpectedPointsMatrix({
    football: grid,
    crowd,
    rules: input.rules,
  })

  const leader = chooseLeader(grid, points, crowd)
  const balanced = chooseBalanced(grid, points, crowd)
  const challenger = chooseChallenger(grid, points, crowd)

  const confidence = computeConfidence({
    input,
    fit,
    crowd,
  })

  return {
    lambdaHome: fit.lambdaHome,
    lambdaAway: fit.lambdaAway,
    rho: input.modelConfig.rho,
    probabilities: grid,
    crowd,
    leader,
    balanced,
    challenger,
    confidence,
  }
}
```

---

# 31. UI / UX

## 31.1 Page d'accueil

Contient :

- journée courante ;
- matchs chronologiques ;
- 3 picks ;
- recommendation principale ;
- niveau de confiance ;
- timestamp.

## 31.2 Carte match

```text
PARIS SG                        LENS
Samedi 21:05

Marché fair
1  67 %      N  20 %      2  13 %

Buts attendus
2.31                     0.82

▲ Leader
2 - 0
16.8 %

★ Équilibré
3 - 0
EV 34.2
RECOMMANDÉ

◆ Challenger
3 - 1
P 8.1 %
peloton estimé 3.7 %

Confiance : élevée
Mis à jour il y a 47 min
```

## 31.3 Fiche match

Sections :

1. résumé ;
2. probabilités de marché ;
3. trois stratégies ;
4. matrice de score ;
5. popularité estimée MPP ;
6. expected points ;
7. explication ;
8. historique des snapshots.

## 31.4 Admin

V1 :

```text
[Importer matchs]
[Importer cotes]
[Calculer]
[Voir erreurs]
[Backtest]
```

Pas de CMS.

---

# 32. Observabilité

Vercel fournit des logs de runtime pour les fonctions [S12].

Chaque calcul produit un log JSON :

```json
{
  "event": "prediction.calculated",
  "matchId": "...",
  "predictionId": "...",
  "modelVersion": "1.0.0",
  "oddsSnapshot": "...",
  "fitLoss": 0.0032,
  "durationMs": 17
}
```

Erreurs structurées :

```json
{
  "event": "prediction.failed",
  "matchId": "...",
  "reason": "MARKET_INCONSISTENT"
}
```

## Métriques à suivre

```text
calculation_duration_ms
market_fit_loss
prediction_count
failed_prediction_count
stale_snapshot_count
missing_market_count
crowd_model_confidence
```

---

# 33. Cron et automatisation

Vercel permet de déclencher des fonctions via Cron [S8].

À la date de ce dossier, le plan Hobby limite les cron jobs à une fréquence minimale d'une fois par jour avec une précision horaire, alors que Pro autorise une fréquence à la minute [S13].

## Implication

Pour une V1 gratuite :

- import manuel ;
- ou un cron quotidien.

Pour des snapshots H-6/H-1 automatiques :

- Vercel Pro ;
- ou ordonnanceur externe ;
- ou fournisseur qui pousse les changements.

## Endpoint

```text
GET /api/cron/update
```

Protégé avec :

```text
CRON_SECRET
```

Pipeline :

```text
load upcoming matches
  -> fetch provider
  -> store raw snapshot
  -> hash/dedupe
  -> calculate prediction
  -> persist immutable prediction
```

---

# 34. Sécurité

## 34.1 Secrets

Variables Vercel :

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
ODDS_PROVIDER_API_KEY
ADMIN_SECRET
```

La `SERVICE_ROLE_KEY` n'est jamais exposée au navigateur.

## 34.2 Row Level Security

Si des données utilisateur sont ajoutées, activer RLS sur toutes les tables utilisateur [S11].

## 34.3 Admin V1

Option la plus simple :

- Basic admin gate côté serveur ;
- secret dans variable d'environnement ;
- aucune route admin publique non protégée.

V2 : Supabase Auth.

## 34.4 Validation

Tout payload externe passe par Zod.

## 34.5 Rate limiting

Les routes de calcul ne sont pas accessibles anonymement.

---

# 35. Légalité et données tierces

Le projet ne doit pas dépendre d'un accès non autorisé à MPP.

Pour les données MPP :

1. import manuel depuis une source officielle ;
2. export autorisé ;
3. intégration partenaire ;
4. saisie opérateur.

Pour les cotes :

- fournisseur disposant d'une API ou licence appropriée ;
- conserver `provider`, `bookmaker`, `captured_at`.

Le nom et les logos de clubs/compétitions peuvent être soumis à des droits. V1 doit éviter d'utiliser des assets non licenciés si le produit devient public/commercial.

---

# 36. Tests mathématiques

## 36.1 Poisson

### Somme marginale

```text
sum P(X=i) ≈ 1
```

### Monotonie raisonnable

Pour `lambda < 1`, le mode doit rester proche de 0 ou 1.

## 36.2 Dixon–Coles

- `rho = 0` => même distribution que Poisson ;
- seules quatre cases sont repondérées avant normalisation ;
- toutes les probabilités sont positives ;
- somme finale = 1.

## 36.3 Dévigoration

- somme = 1 ;
- pas de NaN ;
- convergence ;
- ordre stable.

## 36.4 Projection marchés

Une grille ajustée doit reproduire les probabilités fair dans la tolérance :

```text
abs(P_model_home - P_market_home) < 0.02
abs(P_model_draw - P_market_draw) < 0.02
abs(P_model_away - P_market_away) < 0.02
```

Tolérance cible à réduire selon les marchés disponibles.

## 36.5 EV

Sur un barème synthétique vérifiable manuellement, l'EV calculé doit être égal au calcul analytique.

## 36.6 Stratégies

- Leader = max `P_s` ;
- Balanced = max `EV_s` ;
- Challenger respecte `P_min` ;
- aucun choix hors grille.

---

# 37. Tests d'intégration

Scénario :

```text
Given un match
And un snapshot de cotes
When POST /api/calculate
Then une prediction est créée
And score probabilities sum to 1
And 3 strategies exist
And prediction points to the exact odds snapshot
And second calculation creates a new prediction, not an update
```

---

# 38. Tests E2E

Playwright :

```text
1. ouvrir /journee/1
2. voir les matchs
3. ouvrir un match
4. vérifier les 3 stratégies
5. ouvrir matrice
6. vérifier timestamp et confiance
```

Admin :

```text
1. importer CSV
2. obtenir confirmation
3. lancer calcul
4. voir nouvelle prédiction
```

---

# 39. Backtest scientifique

## 39.1 Règle principale

Pour le match `m_t`, le modèle est entraîné uniquement sur :

```math
D_train = {m : kickoff_m < cutoff_t}
```

## 39.2 Walk-forward

```text
train jusqu'à J5  -> predict J6
train jusqu'à J6  -> predict J7
train jusqu'à J7  -> predict J8
...
```

## 39.3 Snapshot

Le backtest utilise le snapshot correspondant à la politique de production :

```text
H-1
```

et non la closing line si celle-ci est postérieure au cutoff.

## 39.4 Baselines

### B0 — score modal Poisson

```text
argmax P_s
```

### B1 — 1-0 favori

Heuristique populaire.

### B2 — score modal marché

Si cotes Score Exact disponibles.

### B3 — crowd modal

Score le plus choisi.

### B4 — random weighted

Tirage selon `P_s`.

## 39.5 Métriques football

### Log loss Score Exact

```math
LL = -1/N sum_m log(P_m(s_actual))
```

### Brier 1X2

```math
BS =
1/N sum_m sum_o (p_{m,o} - y_{m,o})^2
```

### Ranked Probability Score

À utiliser sur des distributions ordinales ou projections pertinentes.

### Calibration

Buckets :

```text
0-5 %
5-10 %
10-15 %
...
```

Comparer fréquence prédite et observée.

## 39.6 Métriques MPP

```text
points moyens / match
points médians
écart type
P10 / P90
points cumulés
gain vs baseline
% journées gagnées vs baseline
```

Avec Race Engine :

```text
probabilité simulée de finir 1er
rang final moyen
```

---

# 40. Tests d'ablation

Exécuter :

```text
M0  Poisson + devig proportionnel
M1  Poisson + POWER
M2  + Dixon-Coles
M3  + O/U
M4  + BTTS
M5  + crowd proxy
M6  + crowd calibrated
M7  + templates L1
M8  + team prior
```

Une couche reste uniquement si elle apporte un gain hors échantillon.

---

# 41. Calibration des hyperparamètres

Hyperparamètres :

```text
rho
alpha
P_min
eta
gamma
delta
market weights
template weight
time decay xi
```

## 41.1 Split

Jamais de K-fold aléatoire.

Utiliser :

```text
rolling origin validation
```

## 41.2 Fonction objectif

Pour paramètres football :

```text
min log loss / Brier
```

Pour paramètres peloton :

```text
min multinomial log loss
```

Pour politique MPP :

```text
max expected / realized MPP points
```

Attention : le dernier objectif doit être évalué sur une période distincte de celle servant à ajuster les paramètres.

---

# 42. Gestion de version du modèle

Exemple :

```json
{
  "version": "mpp-l1-1.3.0",
  "gitSha": "a31d...",
  "trainedUntil": "2026-09-21T23:59:59Z",
  "config": {
    "devig": "POWER",
    "rho": -0.08,
    "crowdAlpha": 1.34,
    "challenger": {
      "pMin": 0.025,
      "eta": 0.6,
      "gamma": 0.8,
      "delta": 0.4
    }
  }
}
```

---

# 43. Gestion des données historiques

## 43.1 Matchs

Minimum recommandé :

```text
5 saisons
```

Idéal :

```text
8 à 10 saisons
```

Mais donner un poids plus faible aux saisons anciennes.

## 43.2 Promus

Prior hiérarchique :

```math
attack_promoted ~ Normal(mu_promoted_attack, sigma_attack)
defense_promoted ~ Normal(mu_promoted_defense, sigma_defense)
```

En V1, les cotes de marché rendent ce module non indispensable.

---

# 44. Fraîcheur des données

Catégories :

```text
FRESH        < 2 h
ACCEPTABLE   2 h à 8 h
STALE        8 h à 24 h
EXPIRED      > 24 h
```

À adapter au jour du match.

À moins de 6 heures du kickoff, une cote datant de plus de 6 heures doit déclencher un avertissement.

---

# 45. Stratégie de cache

Pages publiques :

- Server Components ;
- cache faible ou revalidation après nouveau snapshot.

Après insertion d'une prédiction :

```ts
revalidatePath(`/match/${matchId}`)
revalidatePath(`/journee/${round}`)
```

Next.js fournit `revalidatePath` dans l'App Router [S14].

---

# 46. Performance

Le calcul d'une grille `13 x 13` est trivial.

Budget cible par match :

```text
devig              < 1 ms
optimisation       < 50 ms
score grid          < 2 ms
EV                   < 5 ms
strategies           < 2 ms
DB                  < 100 ms
```

Objectif endpoint :

```text
p95 < 500 ms
```

Même un calcul de 9 matchs doit rester confortable dans une fonction Vercel.

---

# 47. Accessibilité

Minimum :

- contraste AA ;
- navigation clavier ;
- libellés textuels pour les badges ;
- ne jamais encoder Leader/Équilibré/Challenger uniquement par couleur ;
- tableau de scores lisible en mobile.

---

# 48. Environnements

```text
local
preview
production
```

Chaque PR Vercel crée une preview.

Bases :

```text
local Supabase / projet dev
production Supabase
```

Ne jamais exécuter un backtest destructif sur production.

---

# 49. CI

Pipeline GitHub recommandé :

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Puis Vercel preview.

Avant merge :

```text
all checks green
```

---

# 50. Definition of Ready

Une story est Ready si :

- objectif clair ;
- données d'entrée connues ;
- critères d'acceptation écrits ;
- dépendances identifiées ;
- maquette ou contrat API si nécessaire ;
- aucune décision métier critique non résolue.

---

# 51. Definition of Done

Une story est Done si :

- code mergé ;
- TypeScript strict ;
- tests correspondants ;
- erreurs gérées ;
- logs utiles ;
- documentation mise à jour ;
- aucun secret dans Git ;
- preview Vercel validée ;
- critères d'acceptation satisfaits.

Pour une modification mathématique :

- test de non-régression ;
- comparaison métrique avant/après ;
- version modèle incrémentée.

---

# 52. Backlog agile

Échelle de points :

```text
1  trivial
2  petit
3  standard
5  moyen
8  important
13 à découper
```

Priorités :

```text
P0 indispensable
P1 important
P2 amélioration
P3 expérimental
```

---

## EPIC E0 — Initialisation et qualité

### E0-S1 — Bootstrap Next.js

**Priorité :** P0  
**Points :** 2

Créer une application Next.js App Router avec TypeScript strict et Tailwind.

**Acceptation**

- `npm run dev` fonctionne ;
- TypeScript strict actif ;
- lint actif ;
- page d'accueil visible ;
- build production réussi.

### E0-S2 — Configuration Vitest

**P0 — 2 pts**

**Acceptation**

- `npm test` ;
- couverture possible ;
- premier test vert.

### E0-S3 — Configuration Playwright

**P1 — 2 pts**

**Acceptation**

- test smoke de page d'accueil ;
- exécution locale et CI.

### E0-S4 — CI GitHub

**P0 — 3 pts**

**Acceptation**

- lint ;
- typecheck ;
- tests ;
- build ;
- blocage merge en cas d'échec.

### E0-S5 — Déploiement Vercel preview

**P0 — 2 pts**

**Acceptation**

- repo connecté ;
- preview par PR ;
- production sur branche principale.

---

## EPIC E1 — Base de données

### E1-S1 — Projet Supabase

**P0 — 2 pts**

Créer le projet et variables d'environnement.

### E1-S2 — Migrations `teams`, `seasons`, `matches`

**P0 — 3 pts**

**Acceptation**

- migrations rejouables ;
- FK ;
- index ;
- seed de 18 clubs.

### E1-S3 — `odds_snapshots`

**P0 — 3 pts**

**Acceptation**

- timestamp obligatoire ;
- JSON brut conservé ;
- déduplication par hash.

### E1-S4 — `model_versions`

**P0 — 2 pts**

### E1-S5 — `predictions`

**P0 — 5 pts**

**Acceptation**

- prédiction immuable ;
- référence au snapshot ;
- stockage grille ;
- index.

### E1-S6 — `mpp_rule_sets`

**P0 — 2 pts**

### E1-S7 — `mpp_snapshots`

**P1 — 3 pts**

### E1-S8 — repositories TypeScript

**P0 — 5 pts**

Créer interfaces :

```ts
MatchRepository
OddsRepository
PredictionRepository
RuleSetRepository
```

---

## EPIC E2 — Moteur mathématique football

### E2-S1 — Factorielle et PMF Poisson

**P0 — 2 pts**

**Acceptation**

- tests valeurs connues ;
- support lambda jusqu'à 6 ;
- aucune instabilité.

### E2-S2 — Grille Poisson

**P0 — 3 pts**

**Acceptation**

- somme > `1 - 1e-8` ;
- calcul 1X2 ;
- calcul total.

### E2-S3 — Dixon–Coles

**P0 — 3 pts**

**Acceptation**

- `rho=0` reproduit Poisson ;
- contraintes de positivité ;
- normalisation.

### E2-S4 — Dévigoration proportionnelle

**P0 — 2 pts**

### E2-S5 — Dévigoration POWER

**P0 — 3 pts**

**Acceptation**

- bissection robuste ;
- somme 1 ;
- tests sur marchés synthétiques.

### E2-S6 — Projections 1X2 / O-U / BTTS

**P0 — 3 pts**

### E2-S7 — Optimiseur `(lambda_H, lambda_A)`

**P0 — 8 pts**

**Acceptation**

- bornes ;
- convergence ;
- déterministe ;
- reproduit marchés synthétiques à tolérance.

### E2-S8 — Score de fit

**P1 — 2 pts**

### E2-S9 — API pure `fitMarket()`

**P0 — 3 pts**

Entrée marché, sortie :

```ts
{
  ;(lambdaHome, lambdaAway, loss, diagnostics)
}
```

---

## EPIC E3 — Import manuel

### E3-S1 — Schema Zod de cotes

**P0 — 2 pts**

### E3-S2 — Import JSON

**P0 — 3 pts**

### E3-S3 — Import CSV

**P1 — 3 pts**

CSV :

```text
match_id,captured_at,home,draw,away,over25,under25,btts_yes,btts_no
```

### E3-S4 — UI admin import

**P1 — 5 pts**

### E3-S5 — Déduplication snapshots

**P0 — 3 pts**

---

## EPIC E4 — Calcul et persistance

### E4-S1 — `calculatePrediction()`

**P0 — 5 pts**

### E4-S2 — Route `/api/calculate`

**P0 — 3 pts**

### E4-S3 — Persistance immuable

**P0 — 3 pts**

### E4-S4 — Version du modèle

**P0 — 3 pts**

### E4-S5 — Recalcul batch journée

**P1 — 5 pts**

---

## EPIC E5 — Règles MPP et points

### E5-S1 — Modèle `MppRules`

**P0 — 3 pts**

### E5-S2 — Moteur issue correcte

**P0 — 3 pts**

### E5-S3 — Bonus de rareté configurable

**P0 — 3 pts**

### E5-S4 — Calcul part conditionnelle

**P0 — 2 pts**

### E5-S5 — Matrice de points

**P0 — 5 pts**

Pour chaque score prédit / score réel.

### E5-S6 — EV complet

**P0 — 5 pts**

Tester contre un exemple manuel.

### E5-S7 — Import/version règles Ligue 1

**P0 — 3 pts**

Bloqué jusqu'à confirmation des règles officielles en vigueur.

---

## EPIC E6 — Peloton

### E6-S1 — Proxy `P^alpha`

**P0 — 3 pts**

### E6-S2 — Calibration d'alpha

**P1 — 5 pts**

Minimiser log loss des shares observées.

### E6-S3 — Import snapshot MPP

**P1 — 3 pts**

### E6-S4 — Softmax enrichi

**P2 — 8 pts**

### E6-S5 — Features score

**P2 — 5 pts**

### E6-S6 — Score de confiance crowd

**P1 — 3 pts**

---

## EPIC E7 — Stratégies

### E7-S1 — Leader

**P0 — 2 pts**

### E7-S2 — Équilibré

**P0 — 2 pts**

### E7-S3 — Edge peloton

**P0 — 2 pts**

### E7-S4 — Challenger

**P0 — 5 pts**

### E7-S5 — Tie-break déterministe

**P0 — 2 pts**

### E7-S6 — Tests de stratégie synthétiques

**P0 — 3 pts**

---

## EPIC E8 — Interface

### E8-S1 — Page journée

**P0 — 5 pts**

### E8-S2 — Match card

**P0 — 5 pts**

### E8-S3 — Fiche match

**P0 — 8 pts**

### E8-S4 — Matrice des scores

**P1 — 5 pts**

### E8-S5 — Distribution peloton

**P1 — 3 pts**

### E8-S6 — Explication des picks

**P1 — 5 pts**

### E8-S7 — Mobile responsive

**P0 — 5 pts**

### E8-S8 — Accessibilité AA

**P1 — 3 pts**

---

## EPIC E9 — Backtest

### E9-S1 — Runner historique

**P0 — 8 pts**

### E9-S2 — Walk-forward

**P0 — 5 pts**

### E9-S3 — Baselines

**P0 — 5 pts**

### E9-S4 — Log loss / Brier

**P0 — 3 pts**

### E9-S5 — métriques MPP

**P0 — 5 pts**

### E9-S6 — rapport JSON/CSV

**P1 — 3 pts**

### E9-S7 — tests d'ablation

**P1 — 5 pts**

---

## EPIC E10 — Automatisation

### E10-S1 — interface OddsProvider

**P1 — 3 pts**

```ts
interface OddsProvider {
  getUpcomingMatches(): Promise<ProviderMatch[]>
  getOdds(match: ProviderMatch): Promise<MarketSnapshot>
}
```

### E10-S2 — premier provider API

**P1 — 8 pts**

Dépend du fournisseur choisi.

### E10-S3 — cron update

**P1 — 5 pts**

### E10-S4 — sécurité CRON_SECRET

**P0 — 2 pts**

### E10-S5 — gestion retries/idempotence

**P1 — 5 pts**

### E10-S6 — alerte données stale

**P1 — 3 pts**

---

## EPIC E11 — Calibration Ligue 1

### E11-S1 — import historique

**P1 — 5 pts**

### E11-S2 — estimation `rho`

**P1 — 5 pts**

### E11-S3 — time decay

**P2 — 5 pts**

### E11-S4 — modèle force clubs

**P2 — 8 pts**

### E11-S5 — promus

**P2 — 3 pts**

---

## EPIC E12 — Templates Ligue 1

### E12-S1 — features de régime

**P2 — 5 pts**

### E12-S2 — clustering/règles de régime

**P2 — 8 pts**

### E12-S3 — matrices empiriques

**P2 — 5 pts**

### E12-S4 — blend

**P2 — 5 pts**

### E12-S5 — ablation gate

**P0 si E12 activé — 3 pts**

---

## EPIC E13 — Race Engine

### E13-S1 — saisie classement

**P2 — 3 pts**

### E13-S2 — heuristique urgence

**P2 — 5 pts**

### E13-S3 — recommandation mode

**P2 — 3 pts**

### E13-S4 — simulation adversaires

**P3 — 8 pts**

### E13-S5 — Monte Carlo classement

**P3 — 13 pts à découper**

### E13-S6 — maximisation P(finir 1er)

**P3 — 8 pts**

---

## EPIC E14 — Auth et personnalisation

### E14-S1 — Supabase Auth

**P2 — 5 pts**

### E14-S2 — profil utilisateur

**P2 — 3 pts**

### E14-S3 — ligue privée

**P2 — 5 pts**

### E14-S4 — sauvegarde des picks

**P2 — 3 pts**

---

## EPIC E15 — Production hardening

### E15-S1 — logs structurés

**P1 — 3 pts**

### E15-S2 — error boundaries

**P1 — 3 pts**

### E15-S3 — monitoring données stale

**P1 — 3 pts**

### E15-S4 — audit secrets

**P0 — 2 pts**

### E15-S5 — indexes SQL

**P1 — 2 pts**

### E15-S6 — budget performance

**P1 — 3 pts**

### E15-S7 — sauvegardes DB

**P1 — 2 pts**

---

# 53. Roadmap par incréments

## Sprint 0 — Fondation

Stories :

```text
E0-S1
E0-S2
E0-S4
E0-S5
E1-S1
E1-S2
```

**Livrable :** application vide déployée + DB.

## Sprint 1 — Math core

```text
E2-S1
E2-S2
E2-S3
E2-S4
E2-S5
E2-S6
```

**Livrable :** produire une matrice à partir de lambdas connus.

## Sprint 2 — Fit marché

```text
E2-S7
E2-S8
E2-S9
E3-S1
E3-S2
```

**Livrable :** cotes => lambdas => distribution.

## Sprint 3 — Predictions persistées

```text
E1-S3
E1-S4
E1-S5
E4-S1
E4-S2
E4-S3
E4-S4
```

**Livrable :** calcul reproductible et historisé.

## Sprint 4 — MPP engine

```text
E1-S6
E5-S1
E5-S2
E5-S3
E5-S4
E5-S5
E5-S6
E6-S1
```

**Livrable :** EV de chaque score.

## Sprint 5 — 3 stratégies

```text
E7-S1
E7-S2
E7-S3
E7-S4
E7-S5
E7-S6
```

**Livrable :** Leader / Équilibré / Challenger.

## Sprint 6 — UI utilisable

```text
E8-S1
E8-S2
E8-S3
E8-S7
```

**Livrable :** MVP utilisable manuellement.

### **MILESTONE MVP**

À ce point, le produit est utile même sans provider automatique.

## Sprint 7 — Backtest

```text
E9-S1
E9-S2
E9-S3
E9-S4
E9-S5
```

**Livrable :** preuve quantitative.

## Sprint 8 — Peloton réel

```text
E1-S7
E6-S2
E6-S3
E6-S6
E5-S7
```

## Sprint 9 — Automation

```text
E10-S1
E10-S2
E10-S3
E10-S4
E10-S5
```

## Sprint 10+ — modèles avancés

```text
E11
E12
E13
E14
```

---

# 54. Chemin critique

```text
Bootstrap
  ->
DB
  ->
Poisson/DC
  ->
Devig
  ->
Fit lambdas
  ->
Import cotes
  ->
Prediction persistence
  ->
MPP rules
  ->
EV
  ->
3 strategies
  ->
UI
  ->
Backtest
  ->
Crowd calibration
  ->
Automation
```

Ne pas commencer Race Engine avant que le modèle Balanced ne soit validé.

---

# 55. Critères de sortie MVP

Le MVP est considéré prêt si :

- [ ] application Vercel production ;
- [ ] une journée de Ligue 1 peut être importée ;
- [ ] les cotes peuvent être importées ;
- [ ] chaque match produit une distribution ;
- [ ] la somme des probabilités vaut 1 ;
- [ ] Leader est calculé ;
- [ ] Équilibré est calculé ;
- [ ] Challenger est calculé ;
- [ ] la règle MPP est versionnée ;
- [ ] un niveau de confiance est affiché ;
- [ ] chaque prediction possède un timestamp ;
- [ ] aucune prediction existante n'est réécrite ;
- [ ] tests mathématiques verts ;
- [ ] build et E2E verts ;
- [ ] une page journée fonctionne sur mobile ;
- [ ] une fiche match explique le choix.

---

# 56. Critères de passage « modèle validé »

Au moins une période walk-forward suffisante doit montrer :

- calibration acceptable ;
- pas de régression significative contre Poisson baseline ;
- EV calculé correctement ;
- gain contre baselines MPP ;
- avantage non concentré sur 1 ou 2 matchs extrêmes ;
- résultats reproductibles depuis des snapshots archivés.

---

# 57. Risques

| ID  | Risque                                    | Impact | Probabilité | Mitigation                                     |
| --- | ----------------------------------------- | -----: | ----------: | ---------------------------------------------- |
| R1  | accès insuffisant aux shares MPP          |   fort |        fort | proxy + imports manuels + confiance            |
| R2  | règles MPP changent                       |   fort |       moyen | ruleset versionné                              |
| R3  | fournisseur de cotes coûteux              |  moyen |        fort | interface provider + CSV fallback              |
| R4  | overfit templates                         |   fort |        fort | ablation walk-forward                          |
| R5  | données historiques sans timestamp        |   fort |       moyen | ne pas les utiliser pour closing-line backtest |
| R6  | cotes tardives périmées                   |  moyen |        fort | freshness + snapshots                          |
| R7  | promus mal calibrés                       |  moyen |       moyen | marché comme ancre                             |
| R8  | utilisateurs interprètent comme certitude |  moyen |       moyen | probabilités + confiance + disclaimers         |
| R9  | chron Vercel Hobby insuffisant            |  moyen |        fort | Pro ou scheduler externe                       |
| R10 | API tierce indisponible                   |  moyen |       moyen | cache snapshots + manual fallback              |

---

# 58. ADR — Architecture Decision Records

## ADR-001 — Monolithe TypeScript

**Décision :** Next.js + TypeScript pour UI et moteur.

**Pourquoi :**

- petite charge calculatoire ;
- déploiement Vercel ;
- moins de complexité ;
- même types front/back ;
- tests plus simples.

**Rejeté :** FastAPI/Python séparé en V1.

**Réévaluation :** si calibration ou simulation devient trop lourde.

## ADR-002 — PostgreSQL/Supabase

**Pourquoi :**

- snapshots relationnels ;
- JSONB pour matrices ;
- historique ;
- SQL utile pour backtests ;
- intégration simple.

## ADR-003 — Marché comme ancre

**Pourquoi :**

- information actualisée ;
- réduit la dépendance à un modèle d'équipes fragile ;
- capte blessures/compositions via mouvements de cote.

## ADR-004 — Pas de templates en V1

**Pourquoi :**

- complexité supplémentaire ;
- risque d'overfit ;
- aucun template Ligue 1 validé au démarrage.

## ADR-005 — Predictions immuables

**Pourquoi :**

- audit ;
- backtest ;
- reproductibilité ;
- impossibilité de réécrire l'historique.

---

# 59. Exemple de configuration

```json
{
  "modelVersion": "mpp-l1-1.0.0",
  "grid": {
    "displayMaxGoals": 9,
    "computeMinMaxGoals": 12,
    "tailTolerance": 1e-10
  },
  "devig": {
    "method": "POWER"
  },
  "goalModel": {
    "rho": 0.0,
    "lambdaMin": 0.05,
    "lambdaMax": 6.0
  },
  "marketWeights": {
    "home": 1.0,
    "draw": 1.0,
    "away": 1.0,
    "over25": 0.8,
    "under25": 0.8,
    "bttsYes": 0.5,
    "bttsNo": 0.5
  },
  "crowd": {
    "alpha": 1.0,
    "mode": "PROXY"
  },
  "challenger": {
    "pMin": 0.025,
    "evRatioMin": 0.6,
    "edgeWeight": 0.8,
    "rarityWeight": 0.4
  }
}
```

Cette configuration est une **initialisation**, pas une calibration finale.

---

# 60. Exemple de test métier complet

Entrée fictive :

```json
{
  "home": "PSG",
  "away": "Lens",
  "odds": {
    "home": 1.42,
    "draw": 5.1,
    "away": 7.8,
    "over25": 1.55,
    "under25": 2.45
  }
}
```

Le test ne doit pas vérifier des scores arbitraires codés en dur.

Il doit vérifier :

```text
1. fair probs sum = 1
2. lambdaHome > lambdaAway
3. P(Home) > P(Draw) > P(Away) si cohérent avec le marché
4. distribution sum = 1
5. Leader appartient à argmax(P)
6. Balanced appartient à argmax(EV)
7. Challenger respecte contraintes
8. snapshot persisted
```

---

# 61. Questions de données à résoudre avant automatisation

## Fournisseur de cotes

À décider :

- coût ;
- couverture Ligue 1 ;
- historique ;
- timestamp ;
- score exact ;
- limites API ;
- droit d'archivage.

## MPP

À déterminer :

- source officielle exploitable ;
- disponibilité avant match ;
- disponibilité après match ;
- format de rareté ;
- éventuelle API publique/partenaire.

Le produit doit fonctionner sans dépendre de réponses à ces questions grâce au fallback import manuel.

---

# 62. Politique de données manquantes

| Donnée absente   | Comportement                                     |
| ---------------- | ------------------------------------------------ |
| 1X2              | pas de calcul                                    |
| O/U              | calcul 1X2-only, confiance réduite               |
| BTTS             | aucune pénalité forte                            |
| crowd réel       | proxy crowd                                      |
| règles MPP       | bloquer EV officiel, afficher seulement football |
| snapshot récent  | afficher stale                                   |
| rho calibré      | rho=0                                            |
| historique clubs | aucune incidence V1                              |

---

# 63. États de prediction

```text
DRAFT
VALID
DEGRADED
STALE
SUPERSEDED
```

`SUPERSEDED` ne signifie pas modifié : un nouveau snapshot plus récent existe.

---

# 64. Format d'explication utilisateur

Ne jamais afficher :

> « Le modèle sait que 3-0 va arriver. »

Afficher :

> « 3-0 est moins probable que 2-0, mais son bonus de rareté estimé compense la baisse de probabilité et lui donne l'espérance de points la plus élevée. »

Pour Challenger :

> « 3-1 est plus risqué. Il est retenu parce qu'il reste plausible tout en étant nettement moins joué que sa probabilité estimée. »

---

# 65. Séparation science / produit

## Science

```text
probabilités
calibration
backtest
ablation
incertitude
```

## Produit

```text
recommandation
affichage
classement
mode
fraîcheur
```

Aucune décision UI ne doit modifier la distribution scientifique.

---

# 66. Plan de validation initial

## Étape A

Construire 100 matchs synthétiques à partir de lambdas connus.

Objectif :

```text
fitGoalModel retrouve les lambdas.
```

## Étape B

Importer une saison historique.

Objectif :

```text
Poisson/DC fonctionne sans MPP.
```

## Étape C

Ajouter snapshots historiques de cotes.

Objectif :

```text
mesurer calibration marché -> score.
```

## Étape D

Ajouter observations MPP.

Objectif :

```text
calibrer crowd.
```

## Étape E

Comparer stratégies.

Objectif :

```text
Balanced > baselines en points hors échantillon.
```

---

# 67. Première release exploitable

La première release ne cherche pas à être « intelligente » partout.

Elle doit exceller sur une boucle simple :

```text
je colle les cotes
    ->
je clique Calculer
    ->
je vois 3 scores
    ->
je peux lire pourquoi
    ->
la prediction reste archivée
```

Si cette boucle est fiable, toutes les fonctions avancées peuvent être construites ensuite.

---

# 68. Commandes projet prévues

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run test:e2e

npm run db:migrate
npm run db:seed

npm run import:history
npm run backtest
npm run calibrate
```

---

# 69. Convention de versions

Application :

```text
SemVer
```

Modèle :

```text
mpp-l1-MAJOR.MINOR.PATCH
```

- MAJOR : changement de famille de modèle ;
- MINOR : nouvel input / feature validée ;
- PATCH : bug sans changement conceptuel.

---

# 70. Références

**[S1] Score Parfait — Méthode**  
https://scoreparfait.fr/methode.html  
Pipeline, POWER, Poisson/Dixon–Coles, templates, calibration, peloton.

**[S2] Score Parfait — Stratégie**  
https://scoreparfait.fr/strategie.html  
Leader, Équilibré, Challenger et logique de décision.

**[S3] Score Parfait — FAQ**  
https://scoreparfait.fr/faq.html

**[S4] Score Parfait — Glossaire**  
https://scoreparfait.fr/glossaire.html

**[S5] Dixon, M. J. & Coles, S. G. (1997)**  
_Modelling Association Football Scores and Inefficiencies in the Football Betting Market._  
Journal of the Royal Statistical Society: Series C, 46(2), 265–280.  
https://doi.org/10.1111/1467-9876.00065

**[S6] Next.js — Route Handlers**  
https://nextjs.org/docs/app/getting-started/route-handlers

**[S7] Vercel — Functions API Reference**  
https://vercel.com/docs/functions/functions-api-reference

**[S8] Vercel — Cron Jobs**  
https://vercel.com/docs/cron-jobs

**[S9] Ligue 1 / LFP — MPP Mondial 2026 : règles de rareté**  
https://ligue1.com/fr/articles/l1_article_5224-mpp-mondial-tout-savoir-sur-les-regles-26

**[S10] Supabase — Next.js Quickstart**  
https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

**[S11] Supabase — Row Level Security**  
https://supabase.com/docs/guides/database/postgres/row-level-security

**[S12] Vercel — Runtime Logs**  
https://vercel.com/docs/logs/runtime

**[S13] Vercel — Cron Usage & Pricing**  
https://vercel.com/docs/cron-jobs/usage-and-pricing

**[S14] Next.js — revalidatePath**  
https://nextjs.org/docs/app/api-reference/functions/revalidatePath

---

# 71. Décision finale de lancement

## Architecture retenue

```text
Next.js App Router
TypeScript strict
Tailwind
Supabase/PostgreSQL
Vercel
Vitest
Playwright
```

## Modèle V1 retenu

```text
Odds
-> POWER devig
-> fit lambda_home / lambda_away
-> Poisson
-> Dixon-Coles
-> crowd proxy/calibré
-> MPP rules
-> Expected Points
-> Leader / Balanced / Challenger
```

## Règle de développement

**Construire et prouver le noyau simple avant d'ajouter de la sophistication.**

Le premier objectif n'est pas de produire le modèle le plus complexe possible. Il est de disposer d'un moteur :

- reproductible ;
- auditable ;
- testable ;
- déployable en quelques minutes ;
- mesurable sur des données hors échantillon ;
- améliorable sans casser l'architecture.

C'est ce socle qui permettra ensuite d'ajouter les données Ligue 1, les templates, les comportements réels du peloton et le Race Engine sans transformer le projet en prototype impossible à maintenir.
