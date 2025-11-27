// src/main.jsx 또는 src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { RoleProvider } from "./context/RoleContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <RoleProvider>
    <App />
  </RoleProvider>
);
