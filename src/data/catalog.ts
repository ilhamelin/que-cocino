import { extraIngredients, extraRecipes } from './expandedCatalog';
export const ingredients = [
  { id: 'huevos', name: 'Huevos', emoji: '🥚' },
  { id: 'arroz', name: 'Arroz', emoji: '🍚' },
  { id: 'tomate', name: 'Tomate', emoji: '🍅' },
  { id: 'espinaca', name: 'Espinaca', emoji: '🥬' },
  { id: 'queso', name: 'Queso', emoji: '🧀' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
  { id: 'cebolla', name: 'Cebolla', emoji: '🧅' },
  { id: 'papa', name: 'Papa', emoji: '🥔' },
  { id: 'zanahoria', name: 'Zanahoria', emoji: '🥕' },
  { id: 'lentejas', name: 'Lentejas cocidas', emoji: '🫘' },
  { id: 'pan', name: 'Pan', emoji: '🍞' },
  { id: 'palta', name: 'Palta', emoji: '🥑' },
  { id: 'pollo', name: 'Pollo', emoji: '🍗' },
  { id: 'atun', name: 'Atún en conserva', emoji: '🐟' },
  { id: 'leche', name: 'Leche', emoji: '🥛' },
  { id: 'avena', name: 'Avena', emoji: '🌾' },
  { id: 'ajo', name: 'Ajo', emoji: '🧄' },
  { id: 'limon', name: 'Limón', emoji: '🍋' },
  { id: 'garbanzos', name: 'Garbanzos cocidos', emoji: '🫘' },
  { id: 'champiñones', name: 'Champiñones', emoji: '🍄' },
  ...extraIngredients,
] as const;

export type IngredientId = (typeof ingredients)[number]['id'];
export type Recipe = {
  id: string;
  name: string;
  emoji: string;
  minutes: number;
  servings: number;
  vegetarian: boolean;
  ingredients: { id: IngredientId; amount: string }[];
  basics: string;
  steps: string[];
};

export const recipes: Recipe[] = [
  ...extraRecipes,
  { id: 'avena-leche', name: 'Avena cremosa', emoji: '🥣', minutes: 10, servings: 2, vegetarian: true,
    ingredients: [{ id: 'avena', amount: '1 taza de avena' }, { id: 'leche', amount: '2 tazas de leche' }], basics: 'Agua si hace falta; canela opcional.',
    steps: ['Pon la avena y la leche en una olla.', 'Calienta a fuego bajo, revolviendo durante 5 a 8 minutos hasta espesar.', 'Ajusta la consistencia con agua o leche y sirve cuando se haya enfriado lo suficiente.'] },
  { id: 'ensalada-garbanzos', name: 'Ensalada de garbanzos y palta', emoji: '🥗', minutes: 10, servings: 2, vegetarian: true,
    ingredients: [{ id: 'garbanzos', amount: '2 tazas de garbanzos cocidos' }, { id: 'palta', amount: '1 palta' }, { id: 'tomate', amount: '2 tomates' }, { id: 'limon', amount: '½ limón' }], basics: 'Aceite y sal.',
    steps: ['Escurre los garbanzos ya cocidos; no uses garbanzos crudos.', 'Lava los tomates y córtalos junto con la palta.', 'Mezcla con los garbanzos, limón, aceite y sal.'] },
  { id: 'pasta-atun', name: 'Pasta con atún y tomate', emoji: '🍝', minutes: 20, servings: 2, vegetarian: false,
    ingredients: [{ id: 'pasta', amount: '180 g de pasta' }, { id: 'atun', amount: '1 lata de atún escurrido' }, { id: 'tomate', amount: '2 tomates' }, { id: 'ajo', amount: '1 diente de ajo' }], basics: 'Aceite, agua y sal.',
    steps: ['Cocina la pasta según el envase.', 'Lava y pica los tomates. Cocina el ajo picado con aceite y agrega el tomate hasta formar una salsa.', 'Añade el atún escurrido, calienta y mezcla con la pasta cocida.'] },
  { id: 'champiñones-huevo', name: 'Revuelto de champiñones', emoji: '🍳', minutes: 15, servings: 2, vegetarian: true,
    ingredients: [{ id: 'champiñones', amount: '200 g de champiñones' }, { id: 'huevos', amount: '4 huevos' }, { id: 'ajo', amount: '1 diente de ajo' }], basics: 'Aceite y sal.',
    steps: ['Limpia los champiñones y córtalos en láminas.', 'Saltéalos con el ajo picado y aceite hasta que estén cocidos.', 'Agrega los huevos batidos y revuelve a fuego bajo hasta que estén completamente cuajados.'] },
  { id: 'tortilla-espinaca', name: 'Tortilla de espinaca', emoji: '🍳', minutes: 15, servings: 2, vegetarian: true,
    ingredients: [{ id: 'huevos', amount: '4 huevos' }, { id: 'espinaca', amount: '2 tazas de espinaca' }, { id: 'queso', amount: '40 g de queso' }], basics: 'Aceite, sal y pimienta al gusto.',
    steps: ['Lava y corta la espinaca. Saltéala con un poco de aceite hasta que se ablande.', 'Bate los huevos y mezcla con la espinaca y el queso rallado.', 'Vierte en una sartén a fuego medio-bajo. Cocina por ambos lados hasta que el huevo esté completamente cuajado.'] },
  { id: 'arroz-tomate', name: 'Arroz con tomate y huevo', emoji: '🍛', minutes: 25, servings: 2, vegetarian: true,
    ingredients: [{ id: 'arroz', amount: '1 taza de arroz crudo' }, { id: 'tomate', amount: '2 tomates' }, { id: 'huevos', amount: '2 huevos' }], basics: 'Agua, aceite y sal.',
    steps: ['Cocina el arroz según las instrucciones de su envase.', 'Lava y pica los tomates. Saltéalos con aceite y sal durante unos minutos.', 'Cocina los huevos hasta que estén cuajados y sírvelos con el arroz y el tomate.'] },
  { id: 'pasta-tomate', name: 'Pasta con tomate y queso', emoji: '🍝', minutes: 20, servings: 2, vegetarian: true,
    ingredients: [{ id: 'pasta', amount: '180 g de pasta' }, { id: 'tomate', amount: '3 tomates' }, { id: 'queso', amount: '40 g de queso' }], basics: 'Agua, aceite, sal y pimienta.',
    steps: ['Cocina la pasta según las instrucciones del envase.', 'Lava y pica los tomates. Cocínalos con aceite, sal y pimienta hasta formar una salsa.', 'Escurre la pasta, mezcla con la salsa y sirve con queso rallado.'] },
  { id: 'tostadas-palta', name: 'Tostadas con palta y tomate', emoji: '🥑', minutes: 10, servings: 2, vegetarian: true,
    ingredients: [{ id: 'pan', amount: '4 rebanadas de pan' }, { id: 'palta', amount: '1 palta' }, { id: 'tomate', amount: '1 tomate' }], basics: 'Sal y pimienta al gusto.',
    steps: ['Tuesta las rebanadas de pan.', 'Muele la palta con un tenedor y sazona.', 'Lava y corta el tomate. Reparte la palta sobre las tostadas y agrega el tomate.'] },
  { id: 'ensalada-lentejas', name: 'Ensalada de lentejas', emoji: '🥗', minutes: 15, servings: 2, vegetarian: true,
    ingredients: [{ id: 'lentejas', amount: '2 tazas de lentejas cocidas' }, { id: 'tomate', amount: '2 tomates' }, { id: 'cebolla', amount: '½ cebolla' }, { id: 'zanahoria', amount: '1 zanahoria' }], basics: 'Aceite, sal y vinagre al gusto.',
    steps: ['Escurre las lentejas ya cocidas. Esta receta no utiliza lentejas crudas.', 'Lava las verduras. Pica el tomate y la cebolla y ralla la zanahoria.', 'Mezcla todo y aliña con aceite, vinagre y sal.'] },
  { id: 'papas-huevo', name: 'Papas salteadas con huevo', emoji: '🥔', minutes: 30, servings: 2, vegetarian: true,
    ingredients: [{ id: 'papa', amount: '3 papas medianas' }, { id: 'huevos', amount: '2 huevos' }, { id: 'cebolla', amount: '½ cebolla' }], basics: 'Agua, aceite, sal y pimienta.',
    steps: ['Lava, pela y corta las papas en cubos. Hiérvelas hasta que estén tiernas y escurre.', 'Pica y saltea la cebolla. Agrega las papas y dora unos minutos.', 'Cocina los huevos en otra sartén hasta que cuajen y sirve con las papas.'] },
  { id: 'arroz-verduras', name: 'Arroz con verduras', emoji: '🍚', minutes: 25, servings: 2, vegetarian: true,
    ingredients: [{ id: 'arroz', amount: '1 taza de arroz crudo' }, { id: 'zanahoria', amount: '1 zanahoria' }, { id: 'espinaca', amount: '2 tazas de espinaca' }, { id: 'cebolla', amount: '½ cebolla' }], basics: 'Agua, aceite y sal.',
    steps: ['Cocina el arroz según las instrucciones del envase.', 'Lava las verduras, pica la cebolla y corta la zanahoria en cubos pequeños.', 'Saltéalas hasta que estén tiernas. Añade la espinaca y, cuando se ablande, mezcla con el arroz.'] },
  { id: 'sandwich-queso', name: 'Sándwich de tomate y queso', emoji: '🥪', minutes: 10, servings: 2, vegetarian: true,
    ingredients: [{ id: 'pan', amount: '4 rebanadas de pan' }, { id: 'tomate', amount: '1 tomate' }, { id: 'queso', amount: '80 g de queso' }], basics: 'Sal al gusto.',
    steps: ['Lava y corta el tomate en láminas.', 'Reparte el queso y el tomate entre dos rebanadas y cubre con las restantes.', 'Calienta en una sartén a fuego bajo por ambos lados hasta que el queso se derrita.'] },
];

export function ingredientById(id: IngredientId) {
  return ingredients.find(item => item.id === id)!;
}
