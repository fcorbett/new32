import { useState } from "react";
import { BrowserRouter } from "react-router";
import { AnalyticsPageViews } from "../analytics";
import V5App from "../versions/v5-multipage/App";
import {
  createHeadBag,
  HeadProvider,
} from "../versions/v5-multipage/components/HeadContext";

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function ProductionApp() {
  const [head] = useState(() => createHeadBag());

  return (
    <HeadProvider head={head}>
      <BrowserRouter basename={routerBasename}>
        <AnalyticsPageViews />
        <V5App />
      </BrowserRouter>
    </HeadProvider>
  );
}
