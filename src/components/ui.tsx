import React from "react";

/**
 * A numbered section, laid out like a paper: number and title on a hairline,
 * main text on the left, margin notes on the right on wide screens.
 */
export function Section({ num, title, aside, children, id }: { num: number; title: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode; id?: string }) {
    return (
        <section id={id} className="border-t border-ink/70 pt-4">
            <h2 className="mb-6 flex items-baseline gap-4">
                <span className="font-mono text-sm text-verm">§&#8239;{num}</span>
                <span className="text-[1.6rem] font-medium leading-none">{title}</span>
            </h2>
            <div className="grid gap-x-10 gap-y-6 xl:grid-cols-[minmax(0,1fr)_15.5rem]">
                <div className="min-w-0">{children}</div>
                {aside && <aside className="space-y-4 border-l border-ink/25 pl-4 text-[0.82rem] leading-snug text-muted xl:border-l xl:pl-5">{aside}</aside>}
            </div>
        </section>
    );
}

/** "Figure n." caption, set below a figure. */
export function Caption({ n, children }: { n: number; children: React.ReactNode }) {
    return (
        <p className="mt-3 text-[0.88rem] leading-snug text-ink/80">
            <span className="sc font-semibold text-ink">Figure {n}.</span> {children}
        </p>
    );
}

/** Margin note with a small-caps lead. */
export function Note({ lead, children }: { lead: string; children: React.ReactNode }) {
    return (
        <p>
            <span className="sc text-ink">{lead}.</span> {children}
        </p>
    );
}

export const fmt = (x: number) => Math.round(x).toLocaleString("fr-FR");

/** Colored word used in captions instead of swatches. */
export function Ink({ color, children }: { color: "verm" | "sea" | "ochre"; children: React.ReactNode }) {
    const cls = color === "verm" ? "text-verm" : color === "sea" ? "text-sea" : "text-ochre";
    return <span className={`font-semibold ${cls}`}>{children}</span>;
}
