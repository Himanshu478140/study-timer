interface FontItem {
  id: string;
  name: string;
  class: string;
}

interface FontSelectorProps {
  fonts: readonly FontItem[] | FontItem[];
  selectedFontId: string;
  sampleText?: string;
  onSelect: (id: string) => void;
}

export const FontSelector = ({
  fonts,
  selectedFontId,
  sampleText = '9:24',
  onSelect
}: FontSelectorProps) => {
  return (
    <div className="font-grid">
      {fonts.map((f) => (
        <div
          key={f.id}
          className={`font-preview-card ${selectedFontId === f.id ? 'active' : ''}`}
          onClick={() => onSelect(f.id)}
        >
          <div className={`font-sample ${f.class}`}>{sampleText}</div>
          <span className="font-name">{f.name}</span>
        </div>
      ))}
    </div>
  );
};
