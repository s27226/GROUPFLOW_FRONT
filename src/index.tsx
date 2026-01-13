import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/App.css";
import App from "./App";
import axios from "axios";

// Initialize i18n before rendering the app
import "./i18n";

// Configure axios globally to send cookies with all requests
axios.defaults.withCredentials = true;

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
