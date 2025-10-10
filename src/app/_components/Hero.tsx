import Link from "next/link";
import { FiShuffle } from "react-icons/fi";

export interface HeroProps {
    headline?: string;
    suggestionText?: string;
    onNewSuggestion?: () => void;
    buildHref?: string;
}

export default function Hero({
    headline = "From idea to app in an instant\nBuild with AI that means business",
    suggestionText = "Design a task manager app for our operations team to assign and monitor projects across the org",
    onNewSuggestion,
    buildHref = "#",
}: HeroProps) {
    return (
        <section className="relative overflow-hidden bg-[#F7F8F1]">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
                {/* headline */}
                <h1 className="mx-auto max-w-5xl text-center text-4xl text-text-primary font-normal leading-[1.05] tracking-tight md:text-6xl">
                    {headline.split("\n").map((line, i) => (
                        <span key={i} className="block">
                        {line}
                        </span>
                    ))}
                </h1>

                {/* card */}
                <div className="mx-auto mt-10 max-w-4xl rounded-[28px] bg-white/100 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.08)] md:mt-12 md:p-8">
                    <p className="text-xl leading-8 text-text-primary md:text-2xl md:leading-9 font-normal">
                        {suggestionText}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                        {/* New Suggestion */}
                        <button
                        type="button"
                        onClick={onNewSuggestion}
                        className="inline-flex items-center gap-3 rounded-[36px] border border-gray-200 bg-white px-5 py-3 text-base font-semibold text-text-primary shadow-sm transition hover:border-gray-300"
                        >
                        {/* shuffle icon */}
                            <FiShuffle className="h-5 w-5" />
                            <span>New Suggestion</span>
                        </button>

                        {/* Build it now */}
                        <Link
                        href={buildHref}
                        className="inline-flex items-center gap-3 rounded-[36px] bg-[#0E1111] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:brightness-110"
                        >
                        {/* tiny spinner/star icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                            d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            fill="none"
                            />
                        </svg>
                        <span>Build it now</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
