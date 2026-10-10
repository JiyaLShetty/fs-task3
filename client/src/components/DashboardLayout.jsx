import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Webhook,
  Loader,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/endpoints", label: "Endpoints", icon: Webhook },
  { to: "/events", label: "Events", icon: Loader },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-app text-fg">
      <aside
        className={`shrink-0 flex md:flex-col items-center md:items-stretch gap-2 p-4 border-b md:border-b-0 md:border-r border-line bg-side md:transition-[width] md:duration-300 md:overflow-hidden ${
          open ? "md:w-60" : "md:w-18"
        }`}
      >
        {/* Header: logo + collapse button (desktop only) */}
        <div
          className={`hidden md:flex items-center mb-4 ${
            open ? "justify-between" : "justify-center"
          }`}
        >
          {open && (
            <h1 className="text-lg font-bold tracking-tight px-3 py-2 whitespace-nowrap">
              Hookshot
            </h1>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close sidebar" : "Open sidebar"}
            title={open ? "Close sidebar" : "Open sidebar"}
            className="p-2.5 rounded-lg text-muted hover:text-fg hover:bg-hover transition-colors"
          >
            {open ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        <nav className="flex md:flex-col gap-2 flex-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={open ? undefined : label}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 rounded-lg text-sm border transition-colors ${
                  open ? "px-4" : "md:justify-center md:px-0 px-4"
                } ${
                  isActive
                    ? "bg-pink-600/10 border-pink-600/30 text-accent"
                    : "border-transparent text-muted hover:text-fg hover:bg-hover"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className={open ? "" : "md:hidden"}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Desktop footer */}
        <div className="hidden md:block border-t border-line pt-4">
          {open && (
            <>
              <p className="px-3 text-sm font-medium truncate">
                {user?.username}
              </p>
              <p className="px-3 text-xs text-subtle truncate mb-2">
                {user?.email}
              </p>
            </>
          )}

          {open ? (
            <ThemeToggle withLabel />
          ) : (
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          )}

          <button
            onClick={handleLogout}
            title={open ? undefined : "Logout"}
            aria-label="Logout"
            className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm text-muted hover:text-bad hover:bg-hover transition-colors ${
              open ? "px-4" : "justify-center"
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            {open && "Logout"}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="p-2.5 text-muted"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
