import { useState, useRef, useEffect, useId } from "react";
import { ChevronsUpDown, Check, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  emptyLabel?: string;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select or type custom...",
  className,
  id,
  name,
  disabled = false,
  emptyLabel = "No matching hardware found",
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  // Filter options based on typed input
  const query = value.trim().toLowerCase();
  const filteredOptions = query
    ? options.filter((opt) => opt.toLowerCase().includes(query))
    : options;

  const isExactMatch = options.some(
    (opt) => opt.toLowerCase() === value.trim().toLowerCase()
  );
  const showCustomOption = query.length > 0 && !isExactMatch;

  // Total navigable items count: filtered options + 1 (if custom option displayed)
  const totalItems = filteredOptions.length + (showCustomOption ? 1 : 0);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Keep highlighted index in view when navigating via arrow keys
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleSelectOption = (selectedVal: string) => {
    onChange(selectedVal);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
        return;
      }
    }

    if (isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % Math.max(totalItems, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev <= 0 ? Math.max(totalItems - 1, 0) : prev - 1
        );
      } else if (e.key === "Enter") {
        // Prevent form submission when picking from combobox
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < filteredOptions.length) {
            handleSelectOption(filteredOptions[highlightedIndex]);
          } else if (showCustomOption) {
            handleSelectOption(value.trim());
          }
        } else {
          setIsOpen(false);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-9 w-full rounded-md bg-zinc-950 px-3 pr-8 py-1 font-sans text-base md:text-sm text-zinc-100 placeholder:text-zinc-500",
            "ring-1 ring-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lime-400",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />

        <div className="absolute right-1 flex items-center gap-0.5">
          {value && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.preventDefault();
                onChange("");
                inputRef.current?.focus();
              }}
              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded-sm"
              aria-label="Clear value"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen((prev) => !prev);
              if (!isOpen) {
                inputRef.current?.focus();
              }
            }}
            className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors rounded-sm"
            aria-label="Toggle options"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800 shadow-2xl p-1 overflow-hidden"
          >
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              className="max-h-52 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {filteredOptions.length === 0 && !showCustomOption && (
                <li className="px-3 py-2 text-xs text-zinc-500 font-sans text-center">
                  {emptyLabel}
                </li>
              )}

              {filteredOptions.map((opt, idx) => {
                const isSelected =
                  opt.toLowerCase() === value.trim().toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      // Prevent blur before click registers
                      e.preventDefault();
                      handleSelectOption(opt);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-base md:text-sm font-sans cursor-pointer transition-colors",
                      isHighlighted
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800/80",
                      isSelected && "font-semibold text-lime-400"
                    )}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-lime-400 shrink-0 ml-2" />
                    )}
                  </li>
                );
              })}

              {showCustomOption && (
                <li
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectOption(value.trim());
                  }}
                  onMouseEnter={() =>
                    setHighlightedIndex(filteredOptions.length)
                  }
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-base md:text-sm font-sans cursor-pointer transition-colors border-t border-zinc-800/60 mt-1 pt-1.5",
                    highlightedIndex === filteredOptions.length
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Plus className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                    <span className="truncate">
                      Use custom: <strong className="text-zinc-200">&quot;{value.trim()}&quot;</strong>
                    </span>
                  </div>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
