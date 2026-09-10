import { ClearIcon, SpeakIcon } from "./icons";
import type { AacButton } from "../types";

interface Props {
  words: AacButton[];
  onRemoveWord: (index: number) => void;
  onSpeak: () => void;
  onClear: () => void;
}

export default function SentenceStrip({ words, onRemoveWord, onSpeak, onClear }: Props) {
  const isEmpty = words.length === 0;

  return (
    <div className="aac-sentence-strip">
      <div className="aac-sentence-strip__words">
        {isEmpty ? (
          <span className="aac-sentence-strip__placeholder">Tap words to build a sentence</span>
        ) : (
          words.map((word, index) => (
            <button
              key={`${word.id}-${index}`}
              type="button"
              className={`aac-sentence-strip__chip aac-tile--${word.category}`}
              onClick={() => onRemoveWord(index)}
              aria-label={`Remove ${word.label}`}
            >
              {word.label}
            </button>
          ))
        )}
      </div>
      <div className="aac-sentence-strip__actions">
        <button
          type="button"
          className="aac-nav-button aac-nav-button--icon-only"
          onClick={onClear}
          disabled={isEmpty}
          aria-label="Clear"
        >
          <ClearIcon className="aac-nav-button__icon" />
        </button>
        <button
          type="button"
          className="aac-nav-button aac-nav-button--primary aac-nav-button--icon-only"
          onClick={onSpeak}
          disabled={isEmpty}
          aria-label="Speak"
        >
          <SpeakIcon className="aac-nav-button__icon" />
        </button>
      </div>
    </div>
  );
}
