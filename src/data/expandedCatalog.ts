import type { Recipe } from './catalog';
export const extraIngredients = [
  {
    "id": "pimenton",
    "name": "Pimentón",
    "emoji": "🫑"
  },
  {
    "id": "pepino",
    "name": "Pepino",
    "emoji": "🥒"
  },
  {
    "id": "zapallo-italiano",
    "name": "Zapallo italiano",
    "emoji": "🥒"
  },
  {
    "id": "brocoli",
    "name": "Brócoli",
    "emoji": "🥦"
  },
  {
    "id": "coliflor",
    "name": "Coliflor",
    "emoji": "🥦"
  },
  {
    "id": "choclo",
    "name": "Choclo",
    "emoji": "🌽"
  },
  {
    "id": "harina",
    "name": "Harina",
    "emoji": "🌾"
  },
  {
    "id": "yogur",
    "name": "Yogur natural",
    "emoji": "🥛"
  },
  {
    "id": "manzana",
    "name": "Manzana",
    "emoji": "🍎"
  },
  {
    "id": "platano",
    "name": "Plátano",
    "emoji": "🍌"
  },
  {
    "id": "naranja",
    "name": "Naranja",
    "emoji": "🍊"
  },
  {
    "id": "mantequilla",
    "name": "Mantequilla",
    "emoji": "🧈"
  },
  {
    "id": "miel",
    "name": "Miel",
    "emoji": "🍯"
  },
  {
    "id": "porotos",
    "name": "Porotos cocidos",
    "emoji": "🫘"
  },
  {
    "id": "lechuga",
    "name": "Lechuga",
    "emoji": "🥬"
  },
  {
    "id": "repollo",
    "name": "Repollo",
    "emoji": "🥬"
  },
  {
    "id": "betarraga",
    "name": "Betarraga cocida",
    "emoji": "🥗"
  },
  {
    "id": "quinoa",
    "name": "Quinoa",
    "emoji": "🌾"
  },
  {
    "id": "aceitunas",
    "name": "Aceitunas",
    "emoji": "🫒"
  },
  {
    "id": "nueces",
    "name": "Nueces",
    "emoji": "🥜"
  }
] as const;
export const extraRecipes: Recipe[] = [
  {
    "id": "ensalada-pepino",
    "name": "Ensalada de pepino y yogur",
    "emoji": "🥒",
    "minutes": 10,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "pepino",
        "amount": "1 pepino"
      },
      {
        "id": "yogur",
        "amount": "125 g de yogur natural"
      },
      {
        "id": "limon",
        "amount": "0,5 limón"
      }
    ],
    "basics": "Sal; pimienta opcional.",
    "steps": [
      "Lava y corta el pepino en láminas.",
      "Mezcla el yogur con jugo de limón y sal.",
      "Combina con el pepino y sirve."
    ]
  },
  {
    "id": "quinoa-verduras",
    "name": "Quinoa con verduras",
    "emoji": "🥣",
    "minutes": 30,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "quinoa",
        "amount": "1 taza de quinoa"
      },
      {
        "id": "pimenton",
        "amount": "1 pimentón"
      },
      {
        "id": "zanahoria",
        "amount": "1 zanahoria"
      },
      {
        "id": "cebolla",
        "amount": "0,5 cebolla"
      }
    ],
    "basics": "Agua, aceite y sal al gusto.",
    "steps": [
      "Lava la quinoa y cocínala según el envase.",
      "Lava y pica las verduras; saltéalas hasta que estén tiernas.",
      "Mezcla las verduras con la quinoa cocida y sazona."
    ]
  },
  {
    "id": "crema-coliflor",
    "name": "Crema de coliflor",
    "emoji": "🥣",
    "minutes": 30,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "coliflor",
        "amount": "300 g de coliflor"
      },
      {
        "id": "papa",
        "amount": "1 papa"
      },
      {
        "id": "leche",
        "amount": "1 taza de leche"
      }
    ],
    "basics": "Agua, aceite y sal al gusto.",
    "steps": [
      "Lava la coliflor y pela la papa; corta ambas.",
      "Cocina en agua hasta que estén tiernas y reserva parte del líquido.",
      "Deja templar antes de triturar; agrega leche, ajusta textura con líquido y vuelve a calentar sin quemar."
    ]
  },
  {
    "id": "brocoli-ajo",
    "name": "Brócoli salteado al ajo",
    "emoji": "🥦",
    "minutes": 15,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "brocoli",
        "amount": "300 g de brócoli"
      },
      {
        "id": "ajo",
        "amount": "2 dientes de ajo"
      },
      {
        "id": "limon",
        "amount": "0,5 limón"
      }
    ],
    "basics": "Agua, aceite y sal al gusto.",
    "steps": [
      "Lava y corta el brócoli en floretes.",
      "Cocínalo al vapor hasta que esté tierno.",
      "Saltea brevemente con aceite y ajo picado; agrega limón al servir."
    ]
  },
  {
    "id": "ensalada-porotos",
    "name": "Ensalada de porotos y choclo",
    "emoji": "🥗",
    "minutes": 15,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "porotos",
        "amount": "2 tazas de porotos cocidos"
      },
      {
        "id": "choclo",
        "amount": "1 taza de choclo cocido"
      },
      {
        "id": "tomate",
        "amount": "1 tomate"
      },
      {
        "id": "cebolla",
        "amount": "0,5 cebolla"
      }
    ],
    "basics": "Aceite, sal y vinagre opcional.",
    "steps": [
      "Escurre los porotos ya cocidos y cocina el choclo si corresponde.",
      "Lava y corta el tomate; pica la cebolla.",
      "Mezcla los ingredientes y aliña con aceite y sal."
    ]
  },
  {
    "id": "tostadas-huevo",
    "name": "Tostadas con huevo y palta",
    "emoji": "🥑",
    "minutes": 15,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "pan",
        "amount": "4 rebanadas de pan"
      },
      {
        "id": "huevos",
        "amount": "2 huevos"
      },
      {
        "id": "palta",
        "amount": "1 palta"
      }
    ],
    "basics": "Aceite y sal.",
    "steps": [
      "Tuesta el pan y muele la palta.",
      "Cocina los huevos hasta que estén completamente cuajados.",
      "Reparte la palta y los huevos sobre las tostadas."
    ]
  },
  {
    "id": "avena-manzana",
    "name": "Avena con manzana y nueces",
    "emoji": "🥣",
    "minutes": 15,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "avena",
        "amount": "1 taza de avena"
      },
      {
        "id": "leche",
        "amount": "2 tazas de leche"
      },
      {
        "id": "manzana",
        "amount": "1 manzana"
      },
      {
        "id": "nueces",
        "amount": "30 g de nueces"
      }
    ],
    "basics": "Canela opcional.",
    "steps": [
      "Lava y corta la manzana en cubos.",
      "Cocina la avena y la manzana con la leche a fuego bajo, revolviendo.",
      "Cuando espese, deja templar y agrega nueces picadas."
    ]
  },
  {
    "id": "yogur-fruta",
    "name": "Yogur con plátano y avena",
    "emoji": "🍌",
    "minutes": 5,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "yogur",
        "amount": "250 g de yogur natural"
      },
      {
        "id": "platano",
        "amount": "1 plátano"
      },
      {
        "id": "avena",
        "amount": "4 cucharadas de avena"
      }
    ],
    "basics": "Sin básicos adicionales.",
    "steps": [
      "Pela y corta el plátano.",
      "Reparte yogur, plátano y avena entre dos recipientes.",
      "Mezcla y sirve; utiliza avena apta para consumir sin cocción según el envase."
    ]
  },
  {
    "id": "panqueques-platano",
    "name": "Panqueques de plátano",
    "emoji": "🥞",
    "minutes": 20,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "platano",
        "amount": "1 plátano"
      },
      {
        "id": "huevos",
        "amount": "2 huevos"
      },
      {
        "id": "harina",
        "amount": "4 cucharadas de harina"
      }
    ],
    "basics": "Aceite para la sartén.",
    "steps": [
      "Muele el plátano y mezcla con huevos y harina.",
      "Calienta una sartén antiadherente con un poco de aceite.",
      "Cocina porciones pequeñas por ambos lados hasta que el centro esté cocido."
    ]
  },
  {
    "id": "ensalada-repollo",
    "name": "Ensalada de repollo y zanahoria",
    "emoji": "🥗",
    "minutes": 15,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "repollo",
        "amount": "200 g de repollo"
      },
      {
        "id": "zanahoria",
        "amount": "1 zanahoria"
      },
      {
        "id": "yogur",
        "amount": "125 g de yogur natural"
      },
      {
        "id": "limon",
        "amount": "0,5 limón"
      }
    ],
    "basics": "Sal.",
    "steps": [
      "Lava las verduras; corta fino el repollo y ralla la zanahoria.",
      "Mezcla el yogur con limón y sal.",
      "Combina las verduras con el aliño."
    ]
  },
  {
    "id": "pasta-brocoli",
    "name": "Pasta con brócoli y queso",
    "emoji": "🍝",
    "minutes": 25,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "pasta",
        "amount": "180 g de pasta"
      },
      {
        "id": "brocoli",
        "amount": "200 g de brócoli"
      },
      {
        "id": "queso",
        "amount": "60 g de queso"
      },
      {
        "id": "ajo",
        "amount": "1 diente de ajo"
      }
    ],
    "basics": "Agua, aceite y sal al gusto.",
    "steps": [
      "Cocina la pasta según el envase.",
      "Lava el brócoli y cocínalo hasta que esté tierno; saltea con el ajo.",
      "Mezcla con la pasta cocida y termina con queso rallado."
    ]
  },
  {
    "id": "zapallo-huevo",
    "name": "Zapallo italiano con huevo",
    "emoji": "🍳",
    "minutes": 20,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "zapallo-italiano",
        "amount": "1 zapallo italiano"
      },
      {
        "id": "huevos",
        "amount": "3 huevos"
      },
      {
        "id": "cebolla",
        "amount": "0,5 cebolla"
      }
    ],
    "basics": "Aceite y sal.",
    "steps": [
      "Lava y corta el zapallo; pica la cebolla.",
      "Saltéalos con aceite hasta que estén tiernos.",
      "Añade huevos batidos y revuelve hasta que estén completamente cuajados."
    ]
  },
  {
    "id": "ensalada-betarraga",
    "name": "Ensalada de betarraga y naranja",
    "emoji": "🥗",
    "minutes": 10,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "betarraga",
        "amount": "2 betarragas cocidas"
      },
      {
        "id": "naranja",
        "amount": "1 naranja"
      },
      {
        "id": "nueces",
        "amount": "30 g de nueces"
      }
    ],
    "basics": "Aceite y sal opcional.",
    "steps": [
      "Corta las betarragas ya cocidas.",
      "Pela la naranja y retira semillas; separa gajos.",
      "Mezcla con nueces picadas y un poco de aceite."
    ]
  },
  {
    "id": "arroz-choclo",
    "name": "Arroz con choclo y pimentón",
    "emoji": "🍚",
    "minutes": 25,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "arroz",
        "amount": "1 taza de arroz"
      },
      {
        "id": "choclo",
        "amount": "1 taza de choclo"
      },
      {
        "id": "pimenton",
        "amount": "1 pimentón"
      }
    ],
    "basics": "Agua, aceite y sal al gusto.",
    "steps": [
      "Cocina el arroz según el envase.",
      "Lava y pica el pimentón; saltea y agrega el choclo hasta que esté cocido.",
      "Mezcla las verduras con el arroz y ajusta sazón."
    ]
  },
  {
    "id": "ensalada-quinoa",
    "name": "Ensalada de quinoa y aceitunas",
    "emoji": "🥗",
    "minutes": 30,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "quinoa",
        "amount": "1 taza de quinoa"
      },
      {
        "id": "pepino",
        "amount": "1 pepino"
      },
      {
        "id": "tomate",
        "amount": "1 tomate"
      },
      {
        "id": "aceitunas",
        "amount": "50 g de aceitunas"
      }
    ],
    "basics": "Aceite, sal y limón opcional.",
    "steps": [
      "Lava y cocina la quinoa según el envase; deja enfriar.",
      "Lava y corta pepino y tomate; retira los carozos de las aceitunas.",
      "Mezcla con quinoa y aliña."
    ]
  },
  {
    "id": "hummus-simple",
    "name": "Puré de garbanzos al limón",
    "emoji": "🫘",
    "minutes": 10,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "garbanzos",
        "amount": "2 tazas de garbanzos cocidos"
      },
      {
        "id": "limon",
        "amount": "1 limón"
      },
      {
        "id": "ajo",
        "amount": "1 diente de ajo"
      }
    ],
    "basics": "Agua, aceite y sal al gusto.",
    "steps": [
      "Escurre los garbanzos ya cocidos.",
      "Tritura con ajo, jugo de limón y un poco de aceite.",
      "Añade agua de a poco hasta obtener una textura cremosa."
    ]
  },
  {
    "id": "ensalada-lechuga",
    "name": "Ensalada de lechuga y palta",
    "emoji": "🥬",
    "minutes": 10,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "lechuga",
        "amount": "4 hojas de lechuga"
      },
      {
        "id": "palta",
        "amount": "1 palta"
      },
      {
        "id": "tomate",
        "amount": "1 tomate"
      },
      {
        "id": "limon",
        "amount": "0,5 limón"
      }
    ],
    "basics": "Aceite y sal.",
    "steps": [
      "Lava cuidadosamente la lechuga y el tomate.",
      "Corta la palta y el tomate; trocea las hojas.",
      "Mezcla y aliña con limón y sal."
    ]
  },
  {
    "id": "papas-queso",
    "name": "Papas gratinadas con queso",
    "emoji": "🥔",
    "minutes": 40,
    "servings": 2,
    "vegetarian": true,
    "ingredients": [
      {
        "id": "papa",
        "amount": "3 papas"
      },
      {
        "id": "leche",
        "amount": "1 taza de leche"
      },
      {
        "id": "queso",
        "amount": "80 g de queso"
      },
      {
        "id": "mantequilla",
        "amount": "20 g de mantequilla"
      }
    ],
    "basics": "Agua y sal.",
    "steps": [
      "Lava, pela y cocina las papas en agua hasta que estén tiernas.",
      "Corta en rodajas y pon en una fuente apta para horno con leche y mantequilla.",
      "Cubre con queso y gratina en horno precalentado a 180 °C hasta dorar; manipula la fuente con protección."
    ]
  }
];
