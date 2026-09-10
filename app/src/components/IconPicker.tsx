import { useEffect, useRef, useState } from "react";
import { searchIcons, uploadPhoto } from "../api";
import type { IconSearchResult } from "../types";

export interface IconValue {
  iconId: number | null;
  iconUpload: string | null;
}

interface Props {
  value: IconValue;
  onChange: (value: IconValue) => void;
}

export default function IconPicker({ value, onChange }: Props) {
  const [tab, setTab] = useState<"library" | "photo">(value.iconUpload ? "photo" : "library");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IconSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      searchIcons(query)
        .then((r) => {
          if (!cancelled) setResults(r);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { filename } = await uploadPhoto(file);
      onChange({ iconId: null, iconUpload: filename });
    } catch {
      setUploadError("Could not upload that photo. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const hasIcon = value.iconId !== null || value.iconUpload !== null;
  const previewSrc = value.iconUpload
    ? `/uploads/${value.iconUpload}`
    : value.iconId
      ? `/icons/${value.iconId}.png`
      : null;

  return (
    <div className="aac-icon-picker">
      <div className="aac-icon-picker__current">
        {previewSrc ? (
          <img className="aac-icon-picker__preview" src={previewSrc} alt="Selected icon" />
        ) : (
          <div className="aac-icon-picker__preview aac-icon-picker__preview--empty">
            no icon
          </div>
        )}
        {hasIcon && (
          <button
            type="button"
            className="aac-modal-button"
            onClick={() => onChange({ iconId: null, iconUpload: null })}
          >
            Remove icon
          </button>
        )}
      </div>

      <div className="aac-icon-picker__tabs">
        <button
          type="button"
          className={`aac-icon-picker__tab${tab === "library" ? " aac-icon-picker__tab--active" : ""}`}
          onClick={() => setTab("library")}
        >
          Icon Library
        </button>
        <button
          type="button"
          className={`aac-icon-picker__tab${tab === "photo" ? " aac-icon-picker__tab--active" : ""}`}
          onClick={() => setTab("photo")}
        >
          Upload Photo
        </button>
      </div>

      {tab === "library" && (
        <>
          <input
            type="text"
            placeholder="Search icons (e.g. apple, ball, happy)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {searching && <p className="aac-icon-picker__status">Searching...</p>}

          {results.length > 0 && (
            <div className="aac-icon-picker__results">
              {results.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  className={`aac-icon-picker__result${r.id === value.iconId ? " aac-icon-picker__result--selected" : ""}`}
                  title={r.keyword}
                  onClick={() => onChange({ iconId: r.id, iconUpload: null })}
                >
                  <img src={`/icons/${r.id}.png`} alt={r.keyword} loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {!searching && query.trim() && results.length === 0 && (
            <p className="aac-icon-picker__status">No icons found for "{query}"</p>
          )}
        </>
      )}

      {tab === "photo" && (
        <div className="aac-icon-picker__upload">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelected}
            disabled={uploading}
          />
          {uploading && <p className="aac-icon-picker__status">Uploading...</p>}
          {uploadError && <p className="aac-error">{uploadError}</p>}
        </div>
      )}
    </div>
  );
}
