"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface SkillTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export default function SkillTagInput({
  tags,
  onChange,
  maxTags = 20,
  placeholder = "e.g. Python, UI Design…",
}: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const cleaned = raw.trim().replace(/,+$/, "").trim();
    if (!cleaned || tags.includes(cleaned) || tags.length >= maxTags) return;
    onChange([...tags, cleaned]);
    setInputValue("");
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  function handleBlur() {
    if (inputValue.trim()) addTag(inputValue);
  }

  function handleChange(value: string) {
    if (value.endsWith(",")) {
      addTag(value);
    } else {
      setInputValue(value);
    }
  }

  return (
    <div
      className="skill-tag-input"
      onClick={() => inputRef.current?.focus()}
      role="group"
      aria-label="Skills tag input"
    >
      {tags.map((tag, i) => (
        <span key={tag} className="skill-chip">
          {tag}
          <button
            type="button"
            className="skill-chip__remove"
            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      {tags.length < maxTags && (
        <input
          ref={inputRef}
          type="text"
          className="skill-tag-input__field"
          value={inputValue}
          placeholder={tags.length === 0 ? placeholder : ""}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          aria-label="Add skill"
          id="skills-input"
        />
      )}
    </div>
  );
}
