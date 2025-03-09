import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  HelpCircle,
  LogOut,
  User,
  Wallet,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const adminNavItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Loan Approval",
      path: "/admin/loans/approval",
      icon: <FileText className="h-5 w-5" />,
      badge: "12",
      badgeColor: "bg-red-100 text-red-800",
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
      badge: "5",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      name: "Admin Settings",
      path: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const userNavItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
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
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      name: "Payment History",
      path: "/payment-history",
      icon: <DollarSign className="h-5 w-5" />,
    },
  ];

  const accountItems = [
    {
      name: "Account Settings",
      path: "/account",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <Bell className="h-5 w-5" />,
      badge: "3",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      name: "Payment Methods",
      path: "/payment-methods",
      icon: <CreditCard className="h-5 w-5" />,
      subItems: [
        { name: "Card Payments", path: "/payment-methods/card" },
        { name: "Bank Transfers", path: "/payment-methods/bank" },
        { name: "M-Pesa", path: "/payment-methods/mpesa" },
        { name: "Airtel Money", path: "/payment-methods/airtel" },
        { name: "Tigo Pesa", path: "/payment-methods/tigo" },
        { name: "T-Pesa", path: "/payment-methods/tpesa" },
      ],
    },
    {
      name: "Help & Support",
      path: "/support",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  const mainNavItems = user?.role === "admin" ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border w-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-2 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Loan Manager</h2>
            <p className="text-sm text-muted-foreground">
              {user?.role === "admin" ? "Admin Portal" : "User Portal"}
            </p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="px-2 py-4">
          <div className="mb-4">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main Menu
            </h3>
            <ul className="mt-2 space-y-1">
              {mainNavItems.map((item) => (
                <li key={item.path}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-between group",
                      isActive(item.path) ? "bg-secondary" : "",
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </span>
                    {item.badge && (
                      <Badge className={item.badgeColor}>{item.badge}</Badge>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </h3>
            <ul className="mt-2 space-y-1">
              {accountItems.map((item) => (
                <li key={item.path} className="space-y-1">
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-between group",
                      isActive(item.path) ? "bg-secondary" : "",
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    <span className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </span>
                    {item.badge && (
                      <Badge className={item.badgeColor}>{item.badge}</Badge>
                    )}
                  </Button>
                  {item.subItems && (
                    <div className="pl-9 space-y-1 mt-1">
                      {item.subItems.map((subItem) => (
                        <Button
                          key={subItem.path}
                          variant={
                            isActive(subItem.path) ? "secondary" : "ghost"
                          }
                          size="sm"
                          className={cn(
                            "w-full justify-start text-sm",
                            isActive(subItem.path) ? "bg-secondary" : "",
                          )}
                          onClick={() => navigate(subItem.path)}
                        >
                          <span>{subItem.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Logout</span>
                </Button>
              </li>
            </ul>
          </div>
        </nav>
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || "user"}`}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/account")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
