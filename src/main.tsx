import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "same-runtime";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
   throw new Error("Failed to find root element");
}

createRoot(rootElement).render(
   <HashRouter>
      <App />
   </HashRouter>,
);
