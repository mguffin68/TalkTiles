interface Props {
  label: string;
  onClick: () => void;
}

export default function AddButtonTile({ label, onClick }: Props) {
  return (
    <button className="aac-tile aac-tile--add" onClick={onClick}>
      <span className="aac-tile__add-icon">+</span>
      <span className="aac-tile__label">{label}</span>
    </button>
  );
}
