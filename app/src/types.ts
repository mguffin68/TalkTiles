export type WordCategory =
  | "pronoun"
  | "verb"
  | "descriptor"
  | "social"
  | "noun"
  | "folder";

export interface AacButton {
  id: string;
  boardId: string;
  label: string;
  speak?: string; // text to speak, defaults to label
  category: WordCategory;
  /** board id to navigate to, only for category "folder" */
  target?: string;
  /** ARASAAC pictogram id */
  iconId?: number;
  /** filename of an uploaded custom photo, mutually exclusive with iconId */
  iconUpload?: string;
}

export interface IconSearchResult {
  id: number;
  keyword: string;
}

export interface AacBoard {
  id: string;
  title: string;
  buttons: AacButton[];
}

export interface BoardSummary {
  id: string;
  title: string;
}
