import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes } from "react-router";
import { RequireAuth } from "./auth/RequireAuth";
import { ComingSoonPage } from "./pages/dashboard/ComingSoonPage";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { OverviewPage } from "./pages/dashboard/OverviewPage";
import { SpendingPage } from "./pages/dashboard/SpendingPage";
import { TransactionsPage } from "./pages/dashboard/TransactionsPage";
import { LandingPage } from "./pages/LandingPage";

function App() {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route index element={<LandingPage />} />
      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="spending" element={<SpendingPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route
          path="goals"
          element={<ComingSoonPage title={t("dashboard.nav.goals")} />}
        />
        <Route
          path="profile"
          element={<ComingSoonPage title={t("dashboard.nav.profile")} />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
