"use client"
import * as React from "react"
import { cn } from "@/shared/utils/cn"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange"> {
  options: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ options, value, defaultValue, onChange, className, "aria-label": ariaLabel, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value ?? defaultValue ?? options[0]?.value ?? "");

    React.useEffect(() => {
      if (value !== undefined) setInternalValue(value);
    }, [value]);

    const selectedOption = options.find(o => o.value === internalValue) || options[0];

    const handleSelect = (val: string) => {
      setInternalValue(val);
      setIsOpen(false);
      if (onChange) {
        onChange(val);
      }
    };

    return (
      <div 
        className={cn("relative w-full", className)} 
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsOpen(false);
          }
        }}
      >
        <button
          ref={ref}
          type="button"
          aria-label={ariaLabel || "Select an option"}
          role="combobox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer flex h-10 w-full items-center justify-between rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm ring-offset-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2 text-neutral-100"
          {...props}
        >
          <span>{selectedOption?.label}</span>
          <ChevronDown size={16} className="opacity-50" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-700 bg-neutral-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((opt) => (
              <div
                key={opt.value}
                role="option"
                aria-selected={internalValue === opt.value}
                tabIndex={0}
                className={cn(
                  "relative cursor-pointer select-none py-2 px-3 hover:bg-neutral-700 text-neutral-200 transition-colors outline-none focus:bg-neutral-700",
                  internalValue === opt.value ? "bg-neutral-700 text-white font-medium" : ""
                )}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSelect(opt.value);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
