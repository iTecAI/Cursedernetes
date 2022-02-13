import { useEffect, useState } from "react";

export default function ThemeProvider(props = { theme: "main", children: [] }) {
    const [theme, setTheme] = useState({});
    useEffect(
        function () {
            fetch("/api/theme/" + (props.theme || "main")).then((d) =>
                d.json().then(setTheme)
            );
        },
        [props.theme]
    );
    return (
        <div style={theme} className="theme-provider">
            {props.children}
        </div>
    );
}
