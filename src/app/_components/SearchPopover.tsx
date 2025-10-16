// src/app/_components/SearchPopover.tsx
"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

type Props = {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
};

export default function SearchPopover({
    value,
    onChange,
    placeholder = "Find in view",
    className,
}: Props) {
    const [open, setOpen] = React.useState(false);
    const [local, setLocal] = React.useState(value);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // keep local in sync if parent clears it
    React.useEffect(() => setLocal(value), [value]);

    // debounce -> call parent
    React.useEffect(() => {
        const t = setTimeout(() => onChange(local.trim()), 250);
        return () => clearTimeout(t);
    }, [local, onChange]);

    // autofocus when opened
    React.useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 10);
    }, [open]);

    const handleClose = () => {
        setLocal("");
        onChange("");
        setOpen(false);
    }

  return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                variant="ghost"
                size="icon"
                className={className}
                aria-label="Search"
                title="Search"
                >
                    <Search className="h-4 w-4" />
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" sideOffset={8} className="w-[320px] p-0">
                <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={local}
                        onChange={(e) => setLocal(e.target.value)}
                        placeholder={placeholder}
                        className="border-0 shadow-none focus-visible:ring-0"
                        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                        aria-label="Find in view"
                    />
                    {local && (
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        aria-label="Clear"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="px-3 py-3 text-sm text-muted-foreground">
                    Use advanced search options in the <br/>search extension.
                </div>
            </PopoverContent>
        </Popover>
    );
}
