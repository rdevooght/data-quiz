const quizConfig = {
  title: "Nettoyer et analyser des données",

  questions: [
    {
      intro: `Téléchargez le fichier CSV et importez-le dans un tableur.`,
      question: "Combien de colonnes y a-t-il dans le tableau ?",
      answer_type: "number",
      answer: "20",
      hints: [
        `Le fichier est de type CSV (comma separated value),
ce qui veut dire que le fichier contient du texte et que chaque colonne est séparée par une virgule.
Vous pouvez l'ouvrir dans un éditeur de texte comme bloc-note pour en voir le contenu,
mais ce n'est pas pratique de travailler dans le fichier comme ça: il vaut mieux l'importer dans un tableur (LibreOffice, Google Sheets, Excel, ...).

Voici comment faire dans Google Sheets:
![Ouvrez le menu "Fichier", puis cliquez sur "Importer"](img/importer.png)

Puis allez sur l'onglet "Importer" et déposez-y le fichier CSV:
![Screenshot du menu d'importation](img/importer2.png)
Vous pouvez garder les options par défaut et cliquer sur "Importer les données".
`,
        `Vous pouvez compter les colonnes manuellement, mais il y a une manière plus efficace de le faire:

En cliquant sur le "1" à gauche de la première ligne, vous sélectionnez toute la première ligne.

En bas à droite s'affiche toujours un résumé des cases sélectionnées.
Comme ici les cases contiennent du texte, les tableur affichent en général le nombre de cases non-vides.

![Screenshot illustrant l'explication ci-dessus](img/nombre_colonnes.png)

C'est le nombre de colonnes de notre tableau !`,
      ],
    },
    {
      intro: `Maintenant que le tableau est importé, explorons un peu son contenu.

Les colonnes ont des noms dans des formats variés et pas toujours explicite, mais en regardant les premières lignes vous devriez en comprendre le sens.

Par exemple, la colonne "Zone de référence" contient des noms de pays, et la colonne "REF_AREA" contient l'abréviation internationale du pays (code ISO 3166-1).
`,
      question: `Combien de pays sont listés dans le tableau ?`,
      answer_type: "number",
      answer: "36",
      hints: [
        `Pour trouver le nombre de valeurs différentes dans une colonne, le plus simple est d'utiliser la fonction de filtre.

Pour activer les filtres, cliquez sur une case du tableau puis sur le symbole d'entonoir dans la barre d'outils:

![Screenshot illustrant l'explication ci-dessus](img/filtre.png)

Un symbole apparait dans la première case de chaque colonne.
Cliquez sur ce symbole dans la colonne que vous intéresse (Zone de référence ou REF_AREA).
Un menu apparait qui montre, entre autres, les valeurs uniques de cette colonne.

![Screenshot illustrant l'explication ci-dessus](img/nunique.png)
`,
      ],
    },
    {
      intro: `Continuons d'explorer le tableau.
La colonne "Objectif socio-économique" contient différentes catégories dans lesquelles sont classé les budgets R&D.
`,
      question: `Combien d'objectifs différents existent-ils ?`,
      answer_type: "number",
      answer: "14",
      error_hints: {
        15: "Il y a un piège, lisez la liste des valeurs différentes.",
      },
      hints: [
        `Si vous appliquez la même approche que pour la question précédente, vous verrez qu'il y a 15 valeurs différentes dans cette colonne.
Mais il y a une erreur dans les données... lisez la liste des valeurs différentes pour voir si vous la trouvez.

Corrigez l'erreur avant de passer à la question suivante.

*Un conseil*: Avant de modifier les données, il est utile de dupliquer la feuille pour conserver une copie des données d'origine.

![Pour dupliquer une feuille, cliquez sur la flèche à droite du nom de la feuille (en bas de l'écran), puis cliquez sur "Dupliquer".](img/copy_tab.gif)`,
        `Il y a deux éléments très semblables dans la liste des valeurs différentes : "Énergie" et "energie".
Vraissemblablement, il s'agit de la même catégorie, mais le tableur va les considérer comme des valeurs distinctes, ce qui mènerait sans doute à des problèmes.

Toutes les autres catégories sont capitalisées, alors gardons "Énergie" comme valeur correcte.
Utilisez la fonction de filtre sur la colonne "Objectif socio-économique" pour ne garder que la ligne contenant la valeur "energie", puis modifiez-la en "Énergie".

![Gif illustrant la modification de la valeur "energie" en "Énergie"](img/correct_energie.gif)
`,
      ],
    },
    {
      intro: `Regardons maintenant les colonnes suivantes:
- "TIME_PERIOD" contient des années
- "Valeur (monnaie nationale)" contient un montant exprimé dans la devise spécifiée par les colonnes "CURRENCY" et "Monnaie".

La structure des données est donc la suivante: chaque ligne correspond à un budget R&D pour un pays, un objectif socio-économique et une année donnée.

Il y a 36 pays, 14 objectifs socio-économiques et 10 années dans le tableau.
On devrait donc trouver 36x14x10 = 5040 lignes dans le tableau, mais il n'y en a que 4788.
Il doit donc manquer certaines données. C'est habituel pour ce genre de dataset, mais il faut être vigilant lors de l'analyse.
`,
      question: `Quel était le budget de la Belgique pour l'objectif "Santé" en 2020, exprimé en euros ?`,
      answer_type: "number",
      answer: "78418372",
      error_hints: {
        78: `78€ ? C'est un peu non ? Regardez la colonne "Multiplicateur d'unité"`,
      },
      hints: [
        `Vous pouvez filtrer sur plusieurs colonnes en même temps.
Appliquez un filtre sur "Zone de référence" pour ne garder que la Belgique, puis sur "Objectif socio-économique" pour ne garder que l'objectif "Santé", et enfin sur "TIME_PERIOD" pour ne garder que l'année 2020.

![Screenshot illustrant l'explication ci-dessus](img/filtre2.png)
`,
        `Remarquez la colonne "Multiplicateur d'unité": elle indique que les valeurs sont exprimées en millions.
Il faut donc multiplier les valeurs par 1 million pour obtenir la réponse correcte.`,
      ],
    },
    {
      intro: `Une bonne pratique face à un nouveau tableau est de lire les valeurs extrêmes:
cela donne une idée de la gamme des valeurs et peut aider à identifier des cas particuliers, voire des erreurs dans les données.

Remarquez qu'il y a 3 colonnes de "Valeur":
- **Valeur (monnaie nationale)**: le montant dans la monnaie du pays
- **Valeur (USD PPA courant)**: les dollars en parité de pouvoir d’achat (USD PPA) sont une unité qui ajuste les montants d’argent entre pays pour tenir compte des différences de prix. C'est utile pour comparer les budgets de différents pays entre eux.
- **Valeur (USD PPA constant)**: les dollars PPA constant sont ajustés pour tenir compte de l'inflation, et permettent ainsi de comparer les budgets à travers les années.`,
      question:
        "Quel pays avait le plus petit budget pour l'objectif 'Santé' en 2020 ?",
      answer_type: "text",
      answer: "Islande",
      error_hints: {
        lituanie: `Bien essayé, mais il y a sans doute un problème avec le formatage des valeurs... regardez l'indice #2`,
        estonie: `L'Estonie a bien la plus petite valeur exprimée en monnaie nationale, mais pour comparer les pays entre eux, il faut utiliser la valeur en USD PPA.`,
      },
      hints: [
        `Commencez par filtrer les colonnes "Objectif socio-économique" et "TIME_PERIOD" pour ne garder que les budget de Santé de 2020.

Ensuite, utilisez la fonction de tri pour ordonner les valeurs du plus petit au plus grand.
Le tri se fait en cliquant sur la même icone que pour le filtre, puis en sélectionnant "Trier de A à Z".

![Menu de tri dans Google Sheets](img/sort.png)

Quand vous triez une colonne d'un tableau, les autres colonnes sont également triées dans le même ordre, pour que les valeurs de chaque ligne restent liées.`,
        `Si le tri ne semble pas avoir fonctionné correctement, c'est sans doute que les valeurs de la colonne sont interprétées comme du texte plutôt que des nombres.

Le dataset original utilise un point (.) comme séparateur décimal, mais Google Sheets utilise des virgules (si votre ordinateur est en français).
Il faut donc remplacer les points par des virgules pour que les valeurs soient traitées comme des nombres et pas comme du texte.

Pour cela on peut utiliser la fonction "Remplacer" que l'on trouve en appuyant sur les touches CTRL+h, ou en cherchant "remplacer" dans la barre de recherche du menu:

![Screenshot de la barre de recherche du menu](img/menu_search.png)

Dans le menu qui apparait, entrez '.' dans le champ "Rechercher" et ',' dans le champ "Remplacer par". Cliquez ensuite sur "Remplacer tout".

![Screenshot de la fonction Remplacer](img/replace.png)

Si vous sélectionnez une plage de cellules avant d'ouvrir le menu de remplacement, seul les cellules sélectionnées seront modifiées.
Ce n'est pas nécessaire dans notre cas, car dans ce dataset les point n'apparaissent que comme séparateur décimal, il faut donc tous les remplacer.
        `,
      ],
    },
    {
      intro: `L'Islande avait donc le plus petit budget pour l'objectif 'Santé' en 2020.
Mais c'est un petit pays, ce n'est donc pas étonnant que sont budget soit faible.

Interessons-nous à la colonne "population" pour voir si cela peut expliquer la place de l'Islande dans le classement.`,
      question: "Quel pays avait la plus petite population en 2020 ?",
      answer_type: "text",
      answer: "islande",
      error_hints: {
        "pays-bas": `Les Pays-Bas n'aurait une population que de 174 415 personnes ? Je crois qu'il y a une erreur dans les données ! Regardez l'indice #1`,
      },
      hints: [
        `Si l'on trie les pays par population du plus petit au plus grand, ce sont les Pays-Bas qui arrivent en premier avec 174 415 personnes.
Pas besoin d'être un expert en géographie pour se rendre compte qu'il doit y avoir une erreur !

C'est l'occasion de croiser ces données avec d'autres sources.
Vous trouverez des valeurs un peu différentes en fonction de la source, mais une chose est claire : la population des Pays-Bas en 2020 est de l'ordre de 17 millions, pas 174 415.
On a une erreur d'un facteur 100. Heureusement, cette erreur ne semble concerner que les Pays-Bas en 2020.

Il y a une quinzaine de cases à corriger. Vous pouvez le faire une par une, mais il y a une manière plus rapide :
1. commencez par filtrer les données pour ne garder que les lignes à corriger: Pays-Bas en 2020 (mais tous les objectifs socio-économiques).
2. corrigez la valeur de la première ligne: remplacez 174 415 par 17 441 500.
3. cliquez sur le coin inférieur droit de la cellule et faites glisser pour sélectionner toutes les lignes à corriger, cela va copier la valeur de la première ligne dans toutes les autres.

![Gif illustrant les étapes 2 et 3 de la correction](img/copy_cell_value.gif)
`,
      ],
    },
    {
      intro: `Ca n'est pas très surprenant d'apprendre que c'est le pays le moins peuplé qui à le plus petit budget.
Il serait plus intéressant de comparer les pays par rapport à leur budget *par habitant*.

Cette donnée n'existe pas encore dans le tableau.
Pour répondre à cette question, essayez de créer une nouvelle colonne contenant le budget (en USD PPA constant) par habitant.`,
      question: `Quel pays avait le plus petit budget "Santé" *par habitant* en 2020 ?`,
      answer_type: "text",
      answer: "Turquie",
      error_hints: {
        suisse: `N'oubliez pas de filtrer sur l'année 2020`,
      },
      hints: [
        `Créez une nouvelle colonne pour y calculer le budget par habitant.
Pour insérer une colonne après la colonne "Valeur (USD PPA constant)", faites un clic droit sur la colonne et choisissez "Insérer une colonne à droite".
Donnez lui un nom explicite, par exemple "Valeur/hab (USD PPA constant)".

Ensuite, il faut remplir cette colonne à l'aide d'une formule.
Assurez-vous qu'il n'y a aucun filtre actif, puis allez dans la première cellule de la colonne pour taper la formule.
Les formules commencent toujours par un signe égal (=), et font référence aux autres cellules par la lettre de leur colonne suivie du numéro de ligne.

Dans notre cas, la valeur (USD PPA constant) est dans la colonne J, et la population dans la colonne U.
La formule serait donc =J2/U2*1000000 pour la première ligne (qui est la ligne 2, car la ligne 1 est l'en-tête).
On a multiplié le résultat par 1 million pour obtenir des dollars par habitant (rappelez-vous que les autres colonnes "Valeur" sont exprimées en millions).

Quand vous aurez saisi la formule, Google Sheets vous proposera de la remplir automatiquement pour toute la colonne en copiant la formule. Acceptez cette suggestion.

![Gif illustrant les instructions ci-dessus](img/valeur_par_hab.gif)
`,
      ],
    },
  ],
};
