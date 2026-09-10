import type { WordCategory } from "../types";

// "folder" is deliberately excluded: a folder's category is fixed at
// creation (via the "Add folder" tile) and can't be changed to or from any
// of these, so it's never a dropdown choice.
export const CATEGORIES: { value: Exclude<WordCategory, "folder">; label: string }[] = [
  { value: "pronoun", label: "Pronoun (yellow)" },
  { value: "verb", label: "Verb (green)" },
  { value: "descriptor", label: "Descriptor (blue)" },
  { value: "social", label: "Social (pink)" },
  { value: "noun", label: "Noun (orange)" },
];
