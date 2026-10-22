import { Outlet, useNavigate } from "react-router";
import { useAuth, useSession } from "../../auth/AuthContext";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { TopBar } from "../../components/dashboard/TopBar";
import { useAnimatedPresence } from "../../lib/motion";

export function DashboardLayout() {
  const { signOut } = useAuth();
  const session = useSession();
  const navigate = useNavigate();
  // The mobile navigation drawer, which slides in and out.
  const menu = useAnimatedPresence();

  const handleSignOut = () => {
    signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-dashboard lg:flex">
      <Sidebar
        mobileOpen={menu.mounted}
        mobileClosing={menu.closing}
        onCloseMobile={menu.close}
        onSignOut={handleSignOut}
      />
      <div className="min-w-0 flex-1">
        <TopBar
          name={session.name}
          menuOpen={menu.isOpen}
          onOpenMenu={menu.open}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
