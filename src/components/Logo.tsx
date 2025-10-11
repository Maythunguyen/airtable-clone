import React from 'react';
import Link from 'next/link';

const logoHref = "#";

const Logo = () => {
    return (
        <div>
            <Link
                href={logoHref}
                className="flex items-center gap-2 text-gray-900"
                aria-label="Airtable Clone Home"
            >
                <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                role="img"
                aria-hidden="true"
                >
                    <path d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5Z" fill="#111827" />
                    <path d="M3 9.75 12 14l9-4.25V18l-9 4-9-4V9.75Z" fill="#1F2937" />
                </svg>
				<span className="text-xl font-semibold tracking-tight">Airtable</span>
			</Link>
        </div>
    )
}

export default Logo;