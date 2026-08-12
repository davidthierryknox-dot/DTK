import { SECTION_INTRO_COPY } from "../data/reportCopy";
import type { Section } from "../lib/types";

export function Header({ section, index, total }: { section: Section; index: number; total: number }) {
  return (
    <div className="item-header">
      <span className="item-header__label">{SECTION_INTRO_COPY[section].title}</span>
      <span className="item-header__counter">
        {index} of {total}
      </span>
    </div>
  );
}
