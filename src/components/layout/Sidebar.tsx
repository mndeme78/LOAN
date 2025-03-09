import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  PiggyBank,
  DollarSign,
  ClipboardList,
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const adminNavItems = [
    { name: "Dashboard", path: "/admin", icon: <Home className="h-5 w-5" /> },
    {
      name: "Loan Approval",
      path: "/admin/loans/approval",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "User Management",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const userNavItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Apply for Loan",
      path: "/loans/apply",
      icon: <PiggyBank className="h-5 w-5" />,
    },
    {
      name: "My Loans",
      path: "/loans",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      name: "Make Payment",
      path: "/payments",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      name: "Account",
      path: "/account",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
  ];

  const navItems = user?.role === "admin" ? adminNavItems : userNavItems;

  return (
    <div className="flex flex-col h-full bg-card border-r border-border w-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold">Loan Manager</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.role === "admin" ? "Admin Portal" : "User Portal"}
        </p>
      </div>
      <ScrollArea className="flex-1">
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive(item.path) ? "bg-secondary" : "",
                  )}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
