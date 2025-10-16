
"use client";

import SearchPopover from "./SearchPopover";


export default function TableToolBar({
    search,
    setSearch,
}: { search: string; setSearch: (v: string) => void }) {
    return (
        <div className="flex items-center justify-between border-b bg-white px-3 py-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <button className="hover:text-foreground">Hide fields</button>
                <button className="hover:text-foreground">Filter</button>
                <button className="hover:text-foreground">Group</button>
                <button className="hover:text-foreground">Sort</button>
                <button className="hover:text-foreground">Color</button>
            </div>

        <SearchPopover value={search} onChange={setSearch} />
        </div>
    );
}
