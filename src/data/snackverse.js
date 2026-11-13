// THE SNACKVERSE – story mode characters.
//
// These fighters come from other realities, so they are not in the
// Open Food Facts database. Each one is written in the same shape as a
// normalized API product (name, nutriScore, per100g, …), which means the
// battle engine and the Arena can use them without any changes.

export const SNACKVERSE_INTRO =
  'Somewhere between all realities stands the Great Fridge. Last night, someone left its door ajar. ' +
  'A crack of cold light split the multiverse, and foods from a hundred worlds were pulled inside. ' +
  'An old legend says: whoever wins the Crisper Tournament may ask the Fridge Light for one wish. ' +
  'Nobody knows if the Light stays on when the door is closed. Somebody is about to find out.'

// A helper so every character has the same "product" fields.
function fighter(data) {
  return {
    barcode: `snackverse-${data.id}`, // unique key, like a real barcode
    image: null,
    thumb: null,
    brand: data.reality,
    ...data,
  }
}

export const CHARACTERS = [
  fighter({
    id: 'sir-laminate',
    name: 'Sir Laminate Lebeurre',
    emoji: '🥐',
    title: 'The Butter Knight',
    reality: 'The Butterverse',
    color: '#f2b84b',
    arena: '#5a3a12',
    prologue:
      'The Butterverse is a kingdom of exactly 81 golden layers, folded by hand by the first bakers. ' +
      'But every night since the Fridge door opened, one layer has vanished – and the kingdom grows thinner. ' +
      'Sir Laminate, sworn protector of the Fold, rides out to win the wish that will make his realm whole again.',
    epilogue:
      'Standing before the Fridge Light, Sir Laminate finally understands: the missing layers were never stolen. ' +
      'Each night, the kingdom had folded a little of itself into its knight, to make him strong enough for this fight. ' +
      'He wishes the layers home, returns as the 82nd layer of the Butterverse, and is crispier than ever.',
    taunt: 'A true knight never crumbles. Well – rarely.',
    win: 'Eighty-one layers of honour. You had none.',
    rival: 'professor-pretzel',
    rivalLine: 'Your knots are a cheap imitation of the noble fold, Professor!',
    nutriScore: 'd', ecoScore: 'c', nova: 3, additives: 1,
    per100g: { kcal: 406, sugar: 9, salt: 1.0, fat: 26, saturatedFat: 16, protein: 8, fiber: 2 },
  }),
  fighter({
    id: 'glitchberry',
    name: 'Glitchberry',
    emoji: '🫐',
    title: 'The Corrupted Superfood',
    reality: 'The Pixel Rift',
    color: '#7b6cff',
    arena: '#1d1b5c',
    prologue:
      'In the Pixel Rift, fruit is rendered at eight frames per second. One night a bug copied a single blueberry 4,096 times. ' +
      'The system deleted every copy but one – and the survivor woke up with all of their memories. ' +
      'Glitchberry enters the tournament to bring her copies back, or at least to prove she was the original.',
    epilogue:
      'The Fridge Light does not answer her wish. Instead it shows her a mirror – and in it, 4,096 berries smiling back. ' +
      'Every copy had been her all along. Glitchberry becomes the first fruit to exist in every reality at once, ' +
      'which is great for antioxidants and terrible for her sense of identity.',
    taunt: 'Error 404: your chances not found.',
    win: 'Have you tried turning yourself off and on again?',
    rival: 'neon-gummy',
    rivalLine: 'You’re made of nothing but artificial colours. I’m the real thing.',
    nutriScore: 'a', ecoScore: 'a', nova: 1, additives: 0,
    per100g: { kcal: 57, sugar: 10, salt: 0, fat: 0.3, saturatedFat: 0, protein: 0.7, fiber: 2.4 },
  }),
  fighter({
    id: 'mama-jalapeno',
    name: 'Mama Jalapeño',
    emoji: '🌶️',
    title: 'Queen of Scovillia',
    reality: 'Scovillia',
    color: '#ff4d2e',
    arena: '#5c1a0e',
    prologue:
      'In the volcanic deserts of Scovillia, heat is money, love and law. But since the Fridge door opened, ' +
      'a cold draft has been blowing through the land and the great volcano is going out. ' +
      'Mama Jalapeño, who raised half the peppers in the valley, will not let her children freeze.',
    epilogue:
      'Mama Jalapeño reaches the Light and laughs at it. She does not need a wish – she is the fire. ' +
      'She marches home, sits on the cold volcano, and stares at it until it erupts out of pure respect. ' +
      'Scovillia has never been warmer. Visitors are advised to bring milk.',
    taunt: 'Sit down, mijo. This will only burn a little.',
    win: 'Too spicy? Then stay out of my kitchen.',
    rival: 'captain-kale',
    rivalLine: 'You call me "inflammatory"? Come here and say that to my face.',
    nutriScore: 'b', ecoScore: 'a', nova: 3, additives: 1,
    per100g: { kcal: 29, sugar: 4, salt: 1.8, fat: 0.4, saturatedFat: 0.1, protein: 1, fiber: 2.8 },
  }),
  fighter({
    id: 'captain-kale',
    name: 'Captain Kale',
    emoji: '🥬',
    title: 'The Wellness Warlord',
    reality: 'Verdant Prime',
    color: '#3ccf6a',
    arena: '#0f4a24',
    prologue:
      'On Verdant Prime every meal is a salad, every snack is a smoothie, and dessert is illegal. ' +
      'Captain Kale built that world himself, and now he wants the Fridge Light to make every reality just as “clean”. ' +
      'He believes he is the hero of this story. Most of the other fighters disagree.',
    epilogue:
      'The Light grants his wish, and for one terrible second every reality turns into a salad. ' +
      'Nobody smiles. Nobody celebrates. Even Captain Kale feels empty. He reverses the wish, ' +
      'goes home, and secretly invents kale chips – with salt. It is the bravest thing he has ever done.',
    taunt: 'Have you considered eating a vegetable? Too late.',
    win: 'That’s what five portions a day will do for you.',
    rival: 'burger-rex',
    rivalLine: 'You are everything that is wrong with the multiverse, Rex.',
    nutriScore: 'a', ecoScore: 'a', nova: 1, additives: 0,
    per100g: { kcal: 49, sugar: 0.8, salt: 0.1, fat: 1.5, saturatedFat: 0.2, protein: 4.3, fiber: 4.1 },
  }),
  fighter({
    id: 'neon-gummy',
    name: 'DJ Neon Gummy',
    emoji: '🍬',
    title: 'Rave Champion of Sugar Dimension 7',
    reality: 'Sugar Dimension 7',
    color: '#ff4fd8',
    arena: '#4a0f45',
    prologue:
      'Sugar Dimension 7 is one never-ending party, lit by rivers of glowing syrup. The music has played for a thousand years. ' +
      'But since the Fridge door opened, the beat is slowing down – the whole dimension is heading for a sugar crash. ' +
      'DJ Neon Gummy enters the tournament to keep the music playing forever.',
    epilogue:
      'At the Light, Neon Gummy hears silence for the first time in her life – and it sounds amazing. ' +
      'She goes home, plays the greatest final set the multiverse has ever heard, and then takes her first nap in a thousand years. ' +
      'Sugar Dimension 7 wakes up the next morning and discovers breakfast.',
    taunt: 'Drop the beat – and drop your guard!',
    win: 'Encore? Nah. You’re done.',
    rival: 'glitchberry',
    rivalLine: 'Natural? Boring. Let me show you some real colour!',
    nutriScore: 'e', ecoScore: 'd', nova: 4, additives: 6,
    per100g: { kcal: 343, sugar: 47, salt: 0.1, fat: 0.5, saturatedFat: 0.1, protein: 6.9, fiber: 0 },
  }),
  fighter({
    id: 'onigiri-ronin',
    name: 'Onigiri Ronin',
    emoji: '🍙',
    title: 'The Wandering Rice',
    reality: 'Edo of a Thousand Grains',
    color: '#e6e6e6',
    arena: '#2b2b38',
    prologue:
      'In Edo of a Thousand Grains, swords are forged from rice stalks and honour is wrapped in seaweed. ' +
      'The night the Fridge door opened, someone stole the sacred nori wrap of the Ronin’s clan, and his master vanished with it. ' +
      'Masterless and unwrapped, the Ronin follows the thief’s trail into the cold light.',
    epilogue:
      'At the Light, the Ronin finds his master’s nori – it had been holding the Fridge door together from the inside. ' +
      'He understands that his master did not vanish; he gave himself to keep the realities from falling apart. ' +
      'The Ronin bows, leaves the wrap where it is, and walks home with a lighter heart and a slightly colder body.',
    taunt: 'One grain is nothing. A thousand is a blade.',
    win: 'Your path ends here. Mine continues.',
    rival: 'sir-laminate',
    rivalLine: 'Knight of butter. Let us settle this with honour.',
    nutriScore: 'c', ecoScore: 'b', nova: 3, additives: 1,
    per100g: { kcal: 175, sugar: 1, salt: 1.1, fat: 1.5, saturatedFat: 0.3, protein: 4.5, fiber: 1.2 },
  }),
  fighter({
    id: 'burger-rex',
    name: 'Burger Rex',
    emoji: '🍔',
    title: 'Tyrant of the Jurassic Grill',
    reality: 'The Jurassic Grill',
    color: '#d9792b',
    arena: '#3d2410',
    prologue:
      'Sixty-six million years ago, a giant meatball fell from the sky and ended the Age of Burgers. ' +
      'Only one survived: Burger Rex, three storeys tall, extra cheese, no regrets. ' +
      'He wants the Fridge Light to bring back the age of giants, when every meal was a supersize.',
    epilogue:
      'The Light offers to make him enormous again. Rex looks down at his tiny arms, ' +
      'thinks about how hard it already is to reach his own pickles, and wishes for something smaller: a friend. ' +
      'He now shares a cave with Captain Kale. They argue every single day. They are very happy.',
    taunt: 'ROAAAR! …Sorry. Hungry.',
    win: 'Extinct? Not today.',
    rival: 'captain-kale',
    rivalLine: 'The salad man! I have waited sixty-six million years for this.',
    nutriScore: 'd', ecoScore: 'd', nova: 4, additives: 4,
    per100g: { kcal: 257, sugar: 6, salt: 1.3, fat: 14, saturatedFat: 6, protein: 13, fiber: 1.5 },
  }),
  fighter({
    id: 'professor-pretzel',
    name: 'Professor Pretzel',
    emoji: '🥨',
    title: 'Knotter of Space-Time',
    reality: 'The Twisted Academy',
    color: '#c98a4b',
    arena: '#33220f',
    prologue:
      'At the Twisted Academy, every road loops back to where it started. Professor Pretzel has proven – with 900 pages of maths – ' +
      'that all realities are tied together in one giant knot, and the open Fridge door is the loose end. ' +
      'If nobody re-ties it, everything unravels. Nobody believed him. So he will win the tournament himself.',
    epilogue:
      'Pretzel reaches the Light, pulls the loose end, and ties the most beautiful knot in the history of the multiverse. ' +
      'The realities hold. Nobody notices, because nothing happens – which is exactly the point. ' +
      'He returns to the Academy and writes 900 more pages about it. Nobody reads them either.',
    taunt: 'According to my calculations, you lose in four moves.',
    win: 'Q.E.D. – Quite Easily Defeated.',
    rival: 'sir-laminate',
    rivalLine: 'Folding is merely knotting for people who lack ambition, Sir.',
    nutriScore: 'd', ecoScore: 'b', nova: 3, additives: 1,
    per100g: { kcal: 380, sugar: 2, salt: 3.2, fat: 4, saturatedFat: 0.8, protein: 10, fiber: 3 },
  }),
  fighter({
    id: 'pepperoni-pete',
    name: 'Pepperoni Pete',
    emoji: '🍕',
    title: 'Pirate of the Crust Seas',
    reality: 'The Crust Seas',
    color: '#ff7a2f',
    arena: '#4a1c0b',
    prologue:
      'On the Crust Seas, the oceans are bubbling tomato sauce and every island is a slice. ' +
      'Pepperoni Pete was the most feared pirate on the waves – until the Fridge door opened and his ship, the Deep Dish, ' +
      'froze solid in a single night. Pete wants the Fridge Light to thaw the seas… and maybe to steal it while he is at it.',
    epilogue:
      'Pete reaches the Light and tries to put it in his treasure chest. It does not fit. Nothing fits. ' +
      'So he does the one thing no pirate has ever done: he shares. He slices the warmth eight ways, one for every reality. ' +
      'The Crust Seas thaw, the Deep Dish sails again, and Pete is now a legend for the wrong reason: generosity.',
    taunt: 'Yarr! Prepare to be sliced into eight equal pieces!',
    win: 'A pirate always takes the biggest slice.',
    rival: 'burger-rex',
    rivalLine: 'Fast food against fast food, Rex – but only one of us delivers!',
    nutriScore: 'd', ecoScore: 'c', nova: 4, additives: 3,
    per100g: { kcal: 266, sugar: 3.6, salt: 1.5, fat: 10, saturatedFat: 4.5, protein: 11, fiber: 2.3 },
  }),
  fighter({
    id: 'boba-oracle',
    name: 'The Boba Oracle',
    emoji: '🧋',
    title: 'Seer of the Tapioca Depths',
    reality: 'The Tapioca Depths',
    color: '#c9a27c',
    arena: '#2e2018',
    prologue:
      'Deep in the Tapioca Depths, the Oracle reads the future in the pearls at the bottom of her cup. ' +
      'For a thousand years the pearls showed calm. The night the Fridge door opened, every pearl in the Depths rose to the surface at once. ' +
      'She has seen how the tournament ends – and she does not like it. So she enters it herself, to change the ending.',
    epilogue:
      'At the Light, the Oracle finally reads the last pearl. It shows no future at all – just an empty cup. ' +
      'For the first time in a thousand years, she does not know what happens next, and she laughs until the Depths shake. ' +
      'She returns home, drinks her own future in one long slurp, and decides to be surprised from now on.',
    taunt: 'I have already seen this fight. You should sit down.',
    win: 'Exactly as the pearls foretold.',
    rival: 'glitchberry',
    rivalLine: 'Your future is corrupted data, little berry. Let me read it for you.',
    nutriScore: 'e', ecoScore: 'c', nova: 4, additives: 3,
    per100g: { kcal: 95, sugar: 14, salt: 0.1, fat: 2.5, saturatedFat: 1.8, protein: 0.9, fiber: 0.3 },
  }),
]

// The final boss – unlocked as a playable character after any story is cleared.
export const BOSS = fighter({
  id: 'gorgon-zola',
  name: 'Gorgon Zola, the Forgotten',
  emoji: '🧀',
  title: 'Lord of the Back of the Fridge',
  reality: 'The Back of the Fridge',
  color: '#9bd35f',
  arena: '#1a2a12',
  boss: true,
  hpBonus: 60,
  prologue:
    'He was once the finest cheese in any reality – until someone pushed him behind a jar of pickles and forgot him for seven years. ' +
    'In the dark at the back of the Fridge, he grew. He grew mould. He grew angry. ' +
    'It was Gorgon Zola who opened the door: if he must be forgotten, then every reality will be forgotten with him.',
  epilogue:
    'Defeated at last, Gorgon Zola rolls into the Fridge Light – and for the first time in seven years, somebody sees him. ' +
    'A tiny hand reaches in, picks him up, and says: “Oh! I forgot about this one. It’s actually still good!” ' +
    'Gorgon Zola is served on a cracker that evening. He has never been happier.',
  taunt: 'Everyone forgets. I will make sure of it.',
  win: 'Welcome to the back of the Fridge. You’ll stay a while.',
  rival: null,
  nutriScore: 'd', ecoScore: 'c', nova: 3, additives: 2,
  per100g: { kcal: 353, sugar: 0.5, salt: 2.5, fat: 31, saturatedFat: 19, protein: 19, fiber: 0 },
})

// Revealed when every one of the 8 stories is cleared.
export const TRUE_ENDING =
  'With every wish granted and every reality saved, the ten champions gather at the Great Fridge one last time. ' +
  'Together they push the door shut. Click. The cold light is gone… and in the dark, they finally learn the truth: ' +
  'the light goes OFF when the door is closed. It always did. The Fridge was never magic. ' +
  'The wishes came true because each of them was brave enough to walk up to the light. Thanks for playing.'

export const ALL_FIGHTERS = [...CHARACTERS, BOSS]

export function findCharacter(id) {
  return ALL_FIGHTERS.find((c) => c.id === id)
}
