import type { ReactNode } from "react";

export function SingleChoiceList({
  options,
  value,
  onChange,
  renderOption,
}: {
  options: { key: string; label: string }[];
  value: string | undefined;
  onChange: (key: string) => void;
  renderOption?: (option: { key: string; label: string }) => ReactNode;
}) {
  return (
    <div className="option-list" role="radiogroup">
      {options.map((option) => {
        const checked = value === option.key;
        return (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={checked}
            className="option-row"
            onClick={() => onChange(option.key)}
          >
            <span className="option-control option-control--radio">
              {checked && <span className="option-control__fill" />}
            </span>
            <span>{renderOption ? renderOption(option) : option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function MultiSelectList({
  options,
  value,
  onToggle,
}: {
  options: { key: string; label: string }[];
  value: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="option-list">
      {options.map((option) => {
        const checked = value.includes(option.key);
        return (
          <button
            key={option.key}
            type="button"
            role="checkbox"
            aria-checked={checked}
            className="option-row"
            onClick={() => onToggle(option.key)}
          >
            <span className="option-control option-control--checkbox">
              {checked && <span className="option-control__fill" style={{ borderRadius: 2 }} />}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function LikertList({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  const options = [
    { value: 0, label: "Strongly disagree" },
    { value: 1, label: "Disagree" },
    { value: 2, label: "Neither" },
    { value: 3, label: "Agree" },
    { value: 4, label: "Strongly agree" },
  ];
  return (
    <div className="option-list" role="radiogroup">
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            className="option-row"
            onClick={() => onChange(option.value)}
          >
            <span className="option-control option-control--radio">
              {checked && <span className="option-control__fill" />}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
