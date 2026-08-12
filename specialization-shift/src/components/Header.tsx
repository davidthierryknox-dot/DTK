export function Header({ label, index, total }: { label: string; index: number; total: number }) {
  return (
    <div className="item-header">
      <span className="item-header__label">{label}</span>
      <span className="item-header__counter">
        {index} of {total}
      </span>
    </div>
  );
}
