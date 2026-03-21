import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ErrorBoundary } from "@/app/providers/ErrorBoundary";

import { Routes } from "./routes";

const rootElement = document.getElementById("root");
if (rootElement === null) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Routes />
    </ErrorBoundary>
  </StrictMode>,
);
