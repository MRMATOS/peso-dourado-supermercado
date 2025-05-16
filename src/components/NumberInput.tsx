
import React, { useState, useEffect, forwardRef, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  decimalPlaces?: number;
  allowNegative?: boolean;
  prefix?: string;
  suffix?: string;
  clearOnFocus?: boolean;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      decimalPlaces = 2,
      allowNegative = false,
      prefix,
      suffix,
      clearOnFocus = false,
      className,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    // Format the number to string with Brazilian decimal separator
    const formatValueToDisplay = (val: number): string => {
      if (isNaN(val)) return '';

      // Round to specified decimal places
      const rounded = Number(val.toFixed(decimalPlaces));
      
      // Convert to string with Brazilian format (comma as decimal separator)
      return rounded.toLocaleString('pt-BR', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
    };

    // Convert Brazilian format string to number
    const parseDisplayValue = (val: string): number => {
      if (!val) return 0;
      
      // Remove any non-numeric chars except comma and minus sign
      const cleaned = val.replace(/[^\d,-]/g, '')
        .replace(/,/g, '.'); // Replace comma with dot for parseFloat
      
      return parseFloat(cleaned) || 0;
    };

    // Update displayed value when the actual value changes
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatValueToDisplay(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value;
      
      // Allow empty string, digits, commas, and potentially negative sign
      const regex = allowNegative ? /^-?\d*,?\d*$/ : /^\d*,?\d*$/;
      
      if (inputVal === '' || regex.test(inputVal)) {
        setDisplayValue(inputVal);
        const numericValue = parseDisplayValue(inputVal);
        onChange(numericValue);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) props.onFocus(e);
      
      if (clearOnFocus) {
        setDisplayValue('');
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (props.onBlur) props.onBlur(e);
      
      // Format the value when input loses focus
      setDisplayValue(formatValueToDisplay(value));
    };

    return (
      <div className={cn("relative", className)}>
        {prefix && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            prefix && "pl-8",
            suffix && "pr-8",
            "text-right",
            className
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
