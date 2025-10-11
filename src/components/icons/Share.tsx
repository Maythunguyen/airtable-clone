import React from "react";

export type ShareProps = {
    size?: number | string;
    className?: string;
    filled?: boolean;
    title?: string;
};

export default function Share({ size = 20, className = "", filled = false, title }: ShareProps) {
    const ariaLabel = title ?? (filled ? "share (filled)" : "share");
    const sz = typeof size === "number" ? `${size}px` : size;

    // This icon is an external-link / share style: a square with an arrow exiting the top-right corner.
    return (
        <svg
            width={sz}
            height={sz}
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke={filled ? "none" : "currentColor"}
            strokeWidth={filled ? 0 : 1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            role="img"
            aria-label={ariaLabel}
            xmlns="http://www.w3.org/2000/svg"
        >
            {title ? <title>{title}</title> : null}

            {/* Square (left/top area) */}
            <rect
                x="3"
                y="3"
                width="14"
                height="14"
                rx="2"
                fill={filled ? "currentColor" : "none"}
                stroke={filled ? "none" : "currentColor"}
            />

            {/* Arrow shaft (diagonal) */}
            <path
                d="M8 16 L16 8"
                stroke={filled ? "none" : "currentColor"}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Arrow head exiting top-right */}
            <path
                d="M16 8 H21 V13"
                stroke={filled ? "none" : "currentColor"}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}
