import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/index.css";
import { ErrorBoundary } from "@/app/providers/ErrorBoundary";
import { MemoPage } from "@/pages/memo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MemoPage />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
