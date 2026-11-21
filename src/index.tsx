import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/stix-two-text/wght.css";
import "@fontsource-variable/stix-two-text/wght-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
