import { Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router";
import { AnalyticsPageViews } from "../analytics";
import { VersionPicker } from "./components/VersionPicker";
import { defaultVersionId, getVersionById } from "../versions/registry";

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function VersionPage() {
  const { versionId } = useParams<{ versionId: string }>();
  const version = getVersionById(versionId ?? defaultVersionId);
  const VersionApp = version.component;

  return (
    <>
      <VersionPicker />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[var(--brand-frame)] text-[var(--brand-ink)]">
            Loading prototype…
          </div>
        }
      >
        <VersionApp />
      </Suspense>
    </>
  );
}

export default function PrototypeShell() {
  return (
    <BrowserRouter basename={routerBasename}>
      <AnalyticsPageViews />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/v/${defaultVersionId}`} replace />}
        />
        <Route path="/v/:versionId/*" element={<VersionPage />} />
        <Route
          path="*"
          element={<Navigate to={`/v/${defaultVersionId}`} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
