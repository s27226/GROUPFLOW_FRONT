import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/App.css";
import App from "./App";
import axios from "axios";

// Configure axios globally to send cookies with all requests
axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
