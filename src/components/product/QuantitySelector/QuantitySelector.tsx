import './QuantitySelector.css';

interface QuantitySelectorProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    value,
    onChange,
    min = 1,
    max = 99,
    disabled = false,
}) => {
    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue)) {
            if (newValue < min) {
                onChange(min);
            } else if (newValue > max) {
                onChange(max);
            } else {
                onChange(newValue);
            }
        }
    };

    const handleBlur = () => {
        if (isNaN(value) || value < min) {
            onChange(min);
        }
    };

    return (
        <div className={`quantity-selector ${disabled ? 'disabled' : ''}`}>
            <button
                type="button"
                className="quantity-btn decrement"
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                aria-label="Decrease quantity"
            >
                -
            </button>
            <input
                type="number"
                className="quantity-input"
                value={value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min={min}
                max={max}
                disabled={disabled}
                aria-label="Quantity"
            />
            <button
                type="button"
                className="quantity-btn increment"
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>
    );
};

export default QuantitySelector;
