import { Outlet, NavLink } from "react-router-dom"
import { LayoutDashboard, Cpu, History, BarChart2, Activity } from "lucide-react"

const nav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/predict", icon: Cpu, label: "Predict" },
  { to: "/history", icon: History, label: "History" },
  { to: "/performance", icon: BarChart2, label: "Model Performance" },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 bg-surface border-r border-border flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-accent" />
            <span className="text-sm font-semibold text-text tracking-tight">
              CI/CD Monitor
            </span>
          </div>
          <p className="text-xs text-muted mt-1">Anomaly Detection System</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-surface2 text-text"
                    : "text-muted hover:text-text hover:bg-surface2"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-muted">Dissertation Project</p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-bg">
        <Outlet />
      </main>
    </div>
  )
}