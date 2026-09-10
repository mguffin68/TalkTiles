export const HOME_BOARD_ID = "home";

export const seedBoards = [
  { id: "home", title: "Home" },
  { id: "food", title: "Food" },
  { id: "people", title: "People" },
  { id: "feelings", title: "Feelings" },
  { id: "activities", title: "Activities" },
];

export const seedButtons = [
  // home
  { id: "i", boardId: "home", label: "I", category: "pronoun" },
  { id: "you", boardId: "home", label: "you", category: "pronoun" },
  { id: "it", boardId: "home", label: "it", category: "pronoun" },
  { id: "want", boardId: "home", label: "want", category: "verb" },
  { id: "go", boardId: "home", label: "go", category: "verb" },
  { id: "like", boardId: "home", label: "like", category: "verb" },
  { id: "help", boardId: "home", label: "help", category: "verb" },
  { id: "stop", boardId: "home", label: "stop", category: "verb" },
  { id: "more", boardId: "home", label: "more", category: "descriptor" },
  { id: "good", boardId: "home", label: "good", category: "descriptor" },
  { id: "bad", boardId: "home", label: "bad", category: "descriptor" },
  { id: "yes", boardId: "home", label: "yes", category: "social" },
  { id: "no", boardId: "home", label: "no", category: "social" },
  { id: "please", boardId: "home", label: "please", category: "social" },
  { id: "thank-you", boardId: "home", label: "thank you", category: "social" },
  { id: "all-done", boardId: "home", label: "all done", category: "social" },
  { id: "folder-food", boardId: "home", label: "Food", category: "folder", target: "food" },
  { id: "folder-people", boardId: "home", label: "People", category: "folder", target: "people" },
  { id: "folder-feelings", boardId: "home", label: "Feelings", category: "folder", target: "feelings" },
  { id: "folder-activities", boardId: "home", label: "Activities", category: "folder", target: "activities" },

  // food
  { id: "apple", boardId: "food", label: "apple", category: "noun" },
  { id: "banana", boardId: "food", label: "banana", category: "noun" },
  { id: "cracker", boardId: "food", label: "cracker", category: "noun" },
  { id: "cookie", boardId: "food", label: "cookie", category: "noun" },
  { id: "pizza", boardId: "food", label: "pizza", category: "noun" },
  { id: "cheese", boardId: "food", label: "cheese", category: "noun" },
  { id: "water", boardId: "food", label: "water", category: "noun" },
  { id: "milk", boardId: "food", label: "milk", category: "noun" },
  { id: "juice", boardId: "food", label: "juice", category: "noun" },
  { id: "snack", boardId: "food", label: "snack", category: "noun" },
  { id: "eat", boardId: "food", label: "eat", category: "verb" },
  { id: "drink", boardId: "food", label: "drink", category: "verb" },

  // people
  { id: "mom", boardId: "people", label: "Mom", category: "noun" },
  { id: "dad", boardId: "people", label: "Dad", category: "noun" },
  { id: "friend", boardId: "people", label: "friend", category: "noun" },
  { id: "teacher", boardId: "people", label: "teacher", category: "noun" },
  { id: "sister", boardId: "people", label: "sister", category: "noun" },
  { id: "brother", boardId: "people", label: "brother", category: "noun" },

  // feelings
  { id: "happy", boardId: "feelings", label: "happy", category: "descriptor" },
  { id: "sad", boardId: "feelings", label: "sad", category: "descriptor" },
  { id: "mad", boardId: "feelings", label: "mad", category: "descriptor" },
  { id: "scared", boardId: "feelings", label: "scared", category: "descriptor" },
  { id: "tired", boardId: "feelings", label: "tired", category: "descriptor" },
  { id: "sick", boardId: "feelings", label: "sick", category: "descriptor" },
  { id: "excited", boardId: "feelings", label: "excited", category: "descriptor" },
  { id: "hurt", boardId: "feelings", label: "hurt", category: "descriptor" },

  // activities
  { id: "play", boardId: "activities", label: "play", category: "verb" },
  { id: "read", boardId: "activities", label: "read", category: "verb" },
  { id: "watch-tv", boardId: "activities", label: "watch TV", category: "verb" },
  { id: "outside", boardId: "activities", label: "outside", category: "noun" },
  { id: "swim", boardId: "activities", label: "swim", category: "verb" },
  { id: "draw", boardId: "activities", label: "draw", category: "verb" },
  { id: "music", boardId: "activities", label: "music", category: "noun" },
  { id: "game", boardId: "activities", label: "game", category: "noun" },
];
