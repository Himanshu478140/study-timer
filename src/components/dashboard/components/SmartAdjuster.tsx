import { Plus, Minus } from 'lucide-react';

interface SmartAdjusterProps {
  value: number;
  max: number;
  unit: string;
  hasError: boolean;
  onValueChange: (val: number) => void;
  onErrorTrigger: () => void;
}

export const SmartAdjuster = ({
  value,
  max,
  unit,
  hasError,
  onValueChange,
  onErrorTrigger
}: SmartAdjusterProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  const handleDecrement = () => {
    if (value > 1) {
      onValueChange(value - 1);
    } else {
      onErrorTrigger();
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onValueChange(value + 1);
    } else {
      onErrorTrigger();
    }
  };

  return (
    <div className={`smart-adjuster ${hasError ? 'error' : ''}`}>
      <div className="adjuster-fill" style={{ width: `${percentage}%` }} />
      
      <button
        type="button"
        className="adjuster-btn"
        onClick={handleDecrement}
      >
        <Minus size={16} />
      </button>

      <div className="adjuster-input-container">
        <input
          type="number"
          className="adjuster-input"
          value={value || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val > max) {
              onErrorTrigger();
              return;
            }
            if (!isNaN(val) && val >= 0) {
              onValueChange(val);
            } else if (e.target.value === '') {
              onValueChange(0);
            }
          }}
          onBlur={() => {
            if (!value || value < 1) onValueChange(1);
          }}
        />
        <span className="adjuster-unit">{unit}</span>
      </div>

      <button
        type="button"
        className="adjuster-btn"
        onClick={handleIncrement}
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
