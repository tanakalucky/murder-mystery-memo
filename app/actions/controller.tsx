import { createController } from "remix/router";

import { assetServer } from "../assets.ts";
import { routes } from "../routes.ts";
import { HomePage } from "../ui/HomePage.tsx";
import { MemoPage } from "../ui/MemoPage.tsx";
import { TimeTablePage } from "../ui/TimeTablePage.tsx";

export default createController(routes, {
  actions: {
    async assets(context) {
      return (
        (await assetServer.fetch(context.request)) ??
        new Response("Not Found", { status: 404 })
      );
    },
    home(context) {
      return context.render(<HomePage />);
    },
    memo(context) {
      return context.render(<MemoPage />);
    },
    timetable(context) {
      return context.render(<TimeTablePage />);
    },
  },
});
