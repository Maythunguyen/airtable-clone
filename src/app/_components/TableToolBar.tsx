"use client";

import * as React from "react";
import SearchPopover from "./SearchPopover";
import SortPopover, { type SortState, type UIColumn } from "./SortPopover";

type Props = {
    search: string;
    setSearch: (v: string) => void;
    columns: UIColumn[];
    sort: SortState | undefined;
    onSortChange: (next: SortState | undefined) => void;
};

export default function TableToolBar({
    search,
    setSearch,
    columns,
    sort,
    onSortChange,
}: Props) {
    return (
        <div className="flex items-center justify-between border-b bg-white px-3 py-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">Views</div>

            <div className="flex flex-row gap-3 items-center">
                <button className="hover:text-foreground">Hide fields</button>
                <button className="hover:text-foreground">Filter</button>
                <button className="hover:text-foreground">Group</button>

                <SortPopover columns={columns} value={sort} onChange={onSortChange} />
                <SearchPopover value={search} onChange={setSearch} />
            </div>
        </div>
    );
}
