import { Document } from "./document.tsx";
import { TimeTable } from "../assets/timetable/TimeTable.tsx";
import { AppLayout } from "./AppLayout.tsx";

export function TimeTablePage() {
  return () => (
    <Document head={<TimeTableHead />}>
      <AppLayout activeRoute="timetable">
        <TimeTable />
      </AppLayout>
    </Document>
  );
}

function TimeTableHead() {
  return () => (
    <>
      <title>タイムテーブル | Murder Mystery Memo</title>
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
