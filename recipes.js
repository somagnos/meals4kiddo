// Seed recipe bank for a 20-month-old toddler.
// Portions are rough guides for that age (~1/4 to 1/2 cup per component).
const SEED_RECIPES = [
  // ---- Breakfast ----
  { id: "b1", category: "breakfast", name: "Oatmeal with mashed banana", ingredients: "Rolled oats, whole milk (or formula), mashed banana, pinch of cinnamon", portion: "1/2 cup cooked oats + 1/4 banana" },
  { id: "b2", category: "breakfast", name: "Scrambled eggs with toast strips", ingredients: "1 egg, butter, soft whole-wheat toast cut into strips", portion: "1 egg + 1 slice toast" },
  { id: "b3", category: "breakfast", name: "Greek yogurt with soft fruit", ingredients: "Plain whole-milk yogurt, diced soft peach or berries", portion: "1/2 cup yogurt + 1/4 cup fruit" },
  { id: "b4", category: "breakfast", name: "Mini pancakes with yogurt dip", ingredients: "Flour, egg, milk, banana, side of plain yogurt", portion: "2-3 small pancakes" },
  { id: "b5", category: "breakfast", name: "Congee with shredded chicken", ingredients: "Rice, water/stock, shredded chicken, scallion (finely chopped)", portion: "1/2 cup" },
  { id: "b6", category: "breakfast", name: "Avocado toast fingers", ingredients: "Mashed avocado, soft whole-wheat bread, squeeze of lime", portion: "1 slice, cut into fingers" },
  { id: "b7", category: "breakfast", name: "French toast strips", ingredients: "Bread, egg, milk, cinnamon, butter for pan", portion: "1 slice worth, cut into strips" },
  { id: "b8", category: "breakfast", name: "Steamed egg custard (chawanmushi style)", ingredients: "Egg, warm water/stock, pinch of salt", portion: "1/2 cup" },

  // ---- Lunch ----
  { id: "l1", category: "lunch", name: "Soft rice with steamed fish and veg", ingredients: "White fish (deboned), steamed rice, mashed carrot or pumpkin", portion: "1/4 cup fish + 1/2 cup rice + 1/4 cup veg" },
  { id: "l2", category: "lunch", name: "Chicken and vegetable soup with noodles", ingredients: "Shredded chicken, soft noodles, diced carrot, celery, mild broth", portion: "3/4 cup" },
  { id: "l3", category: "lunch", name: "Mini meatballs with mashed potato", ingredients: "Ground chicken/beef meatballs (soft), mashed potato, steamed peas", portion: "2-3 small meatballs + 1/3 cup mash" },
  { id: "l4", category: "lunch", name: "Tofu and vegetable rice bowl", ingredients: "Soft tofu cubes, steamed rice, finely chopped spinach or bok choy", portion: "1/4 cup tofu + 1/2 cup rice + 1/4 cup veg" },
  { id: "l5", category: "lunch", name: "Pasta with tomato and hidden veg sauce", ingredients: "Small pasta shapes, tomato sauce blended with carrot/zucchini, parmesan", portion: "1/2 cup" },
  { id: "l6", category: "lunch", name: "Salmon and sweet potato mash", ingredients: "Flaked cooked salmon (deboned), mashed sweet potato, steamed broccoli florets (soft)", portion: "1/4 cup salmon + 1/3 cup mash" },
  { id: "l7", category: "lunch", name: "Egg fried rice (soft, mild)", ingredients: "Rice, scrambled egg pieces, finely diced carrot and peas, low-sodium soy dash", portion: "1/2 cup" },
  { id: "l8", category: "lunch", name: "Chicken congee with pumpkin", ingredients: "Rice, shredded chicken, mashed pumpkin", portion: "3/4 cup" },
  { id: "l9", category: "lunch", name: "Soft dumplings (steamed) with broth", ingredients: "Steamed chicken/veg dumplings cut small, mild broth for dipping", portion: "3-4 small dumplings" },
  { id: "l10", category: "lunch", name: "Beef and vegetable stew (soft-cooked)", ingredients: "Slow-cooked ground/minced beef, carrot, potato, peas", portion: "1/2 cup" },

  // ---- Dinner ----
  { id: "d1", category: "dinner", name: "Steamed fish with rice and greens", ingredients: "White fish (deboned), steamed rice, soft cooked bok choy", portion: "1/4 cup fish + 1/2 cup rice + 1/4 cup greens" },
  { id: "d2", category: "dinner", name: "Chicken and rice porridge", ingredients: "Shredded chicken, rice, finely chopped carrot", portion: "3/4 cup" },
  { id: "d3", category: "dinner", name: "Mini beef meatballs with soft veg", ingredients: "Ground beef meatballs, steamed zucchini and carrot sticks (soft)", portion: "2-3 meatballs + 1/3 cup veg" },
  { id: "d4", category: "dinner", name: "Tofu and egg custard with rice", ingredients: "Soft tofu, steamed egg, rice", portion: "1/2 cup" },
  { id: "d5", category: "dinner", name: "Pasta with soft chicken bolognese", ingredients: "Small pasta, ground chicken in mild tomato sauce, grated zucchini", portion: "1/2 cup" },
  { id: "d6", category: "dinner", name: "Salmon rice balls (onigiri style, soft)", ingredients: "Flaked salmon (deboned) mixed into soft rice balls", portion: "2 small rice balls" },
  { id: "d7", category: "dinner", name: "Vegetable and lentil dal with rice", ingredients: "Red lentils, mild spices (no chili), carrot, rice", portion: "1/2 cup dal + 1/3 cup rice" },
  { id: "d8", category: "dinner", name: "Shepherd's pie (mini, soft)", ingredients: "Ground beef/chicken, mixed veg, mashed potato topping", portion: "1/2 cup" },
  { id: "d9", category: "dinner", name: "Chicken and pumpkin congee", ingredients: "Rice, shredded chicken, mashed pumpkin", portion: "3/4 cup" },
  { id: "d10", category: "dinner", name: "Soft omelette strips with rice and veg", ingredients: "Egg, finely diced vegetables, rice", portion: "1 small omelette + 1/3 cup rice" },

  // ---- Snacks ----
  { id: "s1", category: "snack", name: "Sliced banana with yogurt dip", ingredients: "Banana, plain yogurt", portion: "1/2 banana + 2 tbsp yogurt" },
  { id: "s2", category: "snack", name: "Steamed apple/pear slices", ingredients: "Apple or pear, steamed until soft, cinnamon", portion: "1/4 cup" },
  { id: "s3", category: "snack", name: "Cheese cubes and soft crackers", ingredients: "Mild cheese, soft whole-grain crackers", portion: "2-3 small cubes + 2 crackers" },
  { id: "s4", category: "snack", name: "Steamed corn kernels", ingredients: "Corn, butter", portion: "1/4 cup" },
  { id: "s5", category: "snack", name: "Avocado and cucumber sticks", ingredients: "Ripe avocado, soft cucumber sticks (skin removed)", portion: "1/4 avocado + few sticks" },
  { id: "s6", category: "snack", name: "Mini muffin (banana/carrot, low sugar)", ingredients: "Flour, banana or grated carrot, egg, minimal sugar", portion: "1 mini muffin" },
  { id: "s7", category: "snack", name: "Steamed sweet potato fingers", ingredients: "Sweet potato, cut into soft finger shapes", portion: "1/4 cup" },
  { id: "s8", category: "snack", name: "Soft fruit and yogurt smoothie (cup)", ingredients: "Banana, berries, plain yogurt or milk", portion: "1/2 cup" },
];

const MEAL_SLOTS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snack", label: "Snack" },
  { key: "dinner", label: "Dinner" },
];
