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
      intro: "test",
      question: "How many sides does a hexagon have?",
      answer_type: "number",
      answer: "6",
      hints: [
        `The prefix **hexa-** comes from Greek and means *six*.

Compare with: *triangle* (3), *quadrilateral* (4), *pentagon* (5)…`,
      ],
    },
    {
      question: "What is the chemical symbol for water?",
      answer_type: "number",
      answer: "H2O",
      hints: [
        `Water is made of **two** hydrogen atoms and **one** oxygen atom.

- H = Hydrogen
- O = Oxygen`,
      ],
    },
    {
      question: "Who wrote the play 'Romeo and Juliet'?",
      answer_type: "number",
      answer: "Shakespeare",
      hints: [
        `This English playwright lived from **1564 to 1616**.

His first name was *William*, and he wrote at the **Globe Theatre** in London.
Both his first and last name are accepted.`,
      ],
    },
    {
      question: "What is 12 × 12?",
      answer_type: "number",
      answer: "144",
      hints: [
        `Break it down:
\`12 × 10 = 120\`
\`12 × 2  = 24\`
\`120 + 24 = ?\``,
      ],
    },
  ],
};
