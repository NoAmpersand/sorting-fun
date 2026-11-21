import { useEffect, useState } from "react";

const KEY = "theme";

export default function ThemeToggle() {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#212e29" : "#f6f1e6");
        try {
            localStorage.setItem(KEY, dark ? "dark" : "light");
        } catch {
            // Storage can be unavailable (private mode, sandbox): the toggle still works for this visit.
        }
    }, [dark]);
    return (
        <button onClick={() => setDark(!dark)} className="ink-link sc underline decoration-1 underline-offset-4 hover:text-verm" title="Changer de support">
            {dark ? "papier" : "tableau noir"}
        </button>
    );
}
