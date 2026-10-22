import { useCallback, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth, useSession } from "../../auth/AuthContext";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { TopBar } from "../../components/dashboard/TopBar";

export function DashboardLayout() {
  const { signOut } = useAuth();
  const session = useSession();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleSignOut = () => {
    signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-dashboard lg:flex">
      <Sidebar
        mobileOpen={menuOpen}
        onCloseMobile={closeMenu}
        onSignOut={handleSignOut}
      />
      <div className="min-w-0 flex-1">
        <TopBar
          name={session.name}
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
