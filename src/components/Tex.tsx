import React from "react";

const SCRIPT = /(\^\{[^}]*\}|\^[^\s{}]|_\{[^}]*\}|_[A-Za-z0-9])/;
const LETTER = /[A-Za-zα-ωΑ-Ωℓ]/;

/**
 * Sets isolated letters in italic, as TeX does for variables, and leaves
 * words (log, ln, id, max…) upright: "n log₂ n" gives italic n, upright log.
 */
function italics(s: string, keyBase: string): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    let buf = "";
    let i = 0;
    while (i < s.length) {
        if (LETTER.test(s[i])) {
            let j = i;
            while (j < s.length && LETTER.test(s[j])) j++;
            const word = s.slice(i, j);
            if (word.length === 1) {
                if (buf) out.push(buf);
                buf = "";
                out.push(<i key={`${keyBase}-${i}`}>{word}</i>);
            } else {
                buf += word;
            }
            i = j;
        } else {
            buf += s[i];
            i++;
        }
    }
    if (buf) out.push(buf);
    return out;
}

function scripts(s: string): React.ReactNode[] {
    return s.split(SCRIPT).map((part, k) => {
        if (part.startsWith("^") && part.length > 1) {
            const body = part.startsWith("^{") ? part.slice(2, -1) : part.slice(1);
            return <sup key={k}>{italics(body, `s${k}`)}</sup>;
        }
        if (part.startsWith("_") && part.length > 1) {
            const body = part.startsWith("_{") ? part.slice(2, -1) : part.slice(1);
            return <sub key={k}>{italics(body, `b${k}`)}</sub>;
        }
        return <React.Fragment key={k}>{italics(part, `t${k}`)}</React.Fragment>;
    });
}

/** A formula: STIX Two, italic variables, ^x / ^{...} and _x / _{...} as scripts. */
export function M({ children, className = "" }: { children: string; className?: string }) {
    return <span className={`math ${className}`}>{scripts(children)}</span>;
}

/** Prose where $...$ segments are formulas. */
export function Tex({ children }: { children: string }) {
    const parts = children.split("$");
    return (
        <>
            {parts.map((p, i) => (i % 2 === 1 ? <M key={i}>{p}</M> : <React.Fragment key={i}>{p}</React.Fragment>))}
        </>
    );
}
