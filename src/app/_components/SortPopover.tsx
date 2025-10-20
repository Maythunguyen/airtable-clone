"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandGroup,
    CommandItem,
    CommandEmpty,
} from "~/components/ui/command";
import { ArrowUpDown } from "lucide-react";
import { cn } from "~/lib/utils";


type ColumnType = "TEXT" | "NUMBER";

export type UIColumn = { id: string; name: string; type: ColumnType };

export type SortState = {
    columnId: string;
    type: ColumnType;
    dir: "asc" | "desc";
};

type Props = {
    columns: UIColumn[];
    value: SortState | undefined;
    onChange: (next: SortState | undefined) => void;
    className?: string;
};

export default function SortPopover({ columns, value, onChange, className }: Props) {
    const [open, setOpen] = React.useState(false);

    const selectedCol = React.useMemo(
        () => columns.find((c) => c.id === value?.columnId),
        [columns, value?.columnId]
    );

    const dirChoices: Array<{ label: string; dir: "asc" | "desc" }> =
        (selectedCol?.type ?? "TEXT") === "NUMBER"
        ? [
            { label: "Increasing", dir: "asc" },
            { label: "Decreasing", dir: "desc" },
            ]
        : [
            { label: "A → Z", dir: "asc" },
            { label: "Z → A", dir: "desc" },
            ];

    function handlePickColumn(col: UIColumn) {
        onChange({ columnId: col.id, type: col.type, dir: "asc" });
    }

    function handlePickDir(dir: "asc" | "desc") {
        if (!selectedCol) return;
        onChange({ columnId: selectedCol.id, type: selectedCol.type, dir });
        setOpen(false);
    }

    function clearSort() {
        onChange(undefined);
        setOpen(false);
    }

    const triggerLabel =
        selectedCol && value
        ? `${selectedCol.name} • ${
            selectedCol.type === "NUMBER"
                ? value.dir === "asc"
                ? "Increasing"
                : "Decreasing"
                : value.dir === "asc"
                ? "A → Z"
                : "Z → A"
            }`
        : "Sort";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className={cn("h-9 gap-2 px-3", className)} aria-label="Sort">
                    <ArrowUpDown className="h-4 w-4 opacity-70" />
                    <span className="truncate">{triggerLabel}</span>
                    
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[320px] p-0" align="start">
                <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">Column</div>
                    <Command>
                        <CommandInput placeholder="Search column…" />
                        <CommandList>
                            <CommandEmpty>No columns found.</CommandEmpty>
                                <CommandGroup>
                                    {columns.map((c) => (
                                        <CommandItem key={c.id} value={c.name} onSelect={() => handlePickColumn(c)}>
                                            {c.name}
                                            {selectedCol?.id === c.id && <Check className="ml-auto h-4 w-4" />}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                        </CommandList>
                    </Command>

                <div className="border-t border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                    Direction
                </div>
                <div className="p-2">
                    <div className="grid grid-cols-1 gap-1">
                        {dirChoices.map((opt) => (
                            <Button
                                key={opt.dir}
                                variant={value?.dir === opt.dir ? "default" : "ghost"}
                                className="justify-start"
                                disabled={!selectedCol}
                                onClick={() => handlePickDir(opt.dir)}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t p-2">
                    <Button variant="ghost" size="sm" onClick={clearSort}>
                        <X className="mr-2 h-4 w-4" />
                        Clear sort
                    </Button>
                    <Button size="sm" onClick={() => setOpen(false)}>
                        Done
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
