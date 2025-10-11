import React from "react";

export type StarProps = {
    size?: number | string;
    className?: string;
    filled?: boolean;
    title?: string;
};

export default function Star({ size = 20, className = "", filled = false, title }: StarProps) {
    const ariaLabel = title ?? (filled ? "filled star" : "star");
    const sz = typeof size === "number" ? `${size}px` : size;

    return (
        <svg
        width={sz}
        height={sz}
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        role="img"
        aria-label={ariaLabel}
        xmlns="http://www.w3.org/2000/svg"
        >
        {title ? <title>{title}</title> : null}
        <path
            d="M12 3.25l2.59 5.245 5.77.837-4.18 4.076.986 5.746L12 17.77 6.834 19.154l.986-5.746L3.64 9.332l5.77-.837L12 3.25z"
            fill={filled ? "currentColor" : "none"}
        />
        {!filled ? (
            <path
            d="M12 3.25l2.59 5.245 5.77.837-4.18 4.076.986 5.746L12 17.77 6.834 19.154l.986-5.746L3.64 9.332l5.77-.837L12 3.25z"
            fill="none"
            />
        ) : null}
        </svg>
    );
}
