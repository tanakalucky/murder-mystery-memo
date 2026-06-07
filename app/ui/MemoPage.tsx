import { Document } from "./document.tsx";
import { Memo } from "../assets/memo/Memo.tsx";

export function MemoPage() {
  return () => (
    <Document head={<MemoHead />}>
      <Memo />
    </Document>
  );
}

function MemoHead() {
  return () => (
    <>
      <meta name="color-scheme" content="light dark" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
      />
    </>
  );
}
