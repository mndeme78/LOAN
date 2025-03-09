import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Notification } from "@/types";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  Bell,
  Mail,
  CreditCard,
  FileText,
  Settings,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      if (!user) return;

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data to match our types
      const transformedNotifications: Notification[] = data.map(
        (notification) => ({
          id: notification.id,
          userId: notification.user_id,
          title: notification.title,
          message: notification.message,
          read: notification.read || false,
          createdAt: notification.created_at,
          type: notification.type,
        }),
      );

      setNotifications(transformedNotifications);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", ids);

      if (updateError) throw updateError;

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          ids.includes(notification.id)
            ? { ...notification, read: true }
            : notification,
        ),
      );

      // Clear selection
      setSelectedNotifications([]);
    } catch (err: any) {
      console.error("Error marking notifications as read:", err);
      setError(err.message || "Failed to update notifications");
    }
  };

  const deleteNotifications = async (ids: string[]) => {
    try {
      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .in("id", ids);

      if (deleteError) throw deleteError;

      // Update local state
      setNotifications((prev) =>
        prev.filter((notification) => !ids.includes(notification.id)),
      );

      // Clear selection
      setSelectedNotifications([]);
    } catch (err: any) {
      console.error("Error deleting notifications:", err);
      setError(err.message || "Failed to delete notifications");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredIds = notifications
        .filter((notification) => {
          if (activeTab === "all") return true;
          if (activeTab === "unread") return !notification.read;
          return notification.type === activeTab;
        })
        .map((notification) => notification.id);
      setSelectedNotifications(filteredIds);
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications((prev) => [...prev, id]);
    } else {
      setSelectedNotifications((prev) =>
        prev.filter((notifId) => notifId !== id),
      );
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "loan":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case "account":
        return <Settings className="h-5 w-5 text-purple-500" />;
      case "system":
        return <Bell className="h-5 w-5 text-orange-500" />;
      default:
        return <Mail className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading notifications...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNotifications()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Your Notifications</CardTitle>
                <CardDescription>
                  Stay updated with your loan applications and account activity
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {selectedNotifications.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(selectedNotifications)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Read
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteNotifications(selectedNotifications)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="all"
              onValueChange={(value) => {
                setActiveTab(value);
                setSelectedNotifications([]);
              }}
            >
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="all">
                  All
                  <Badge className="ml-2 bg-gray-100 text-gray-800">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    {notifications.filter((n) => !n.read).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="loan">
                  Loans
                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                    {notifications.filter((n) => n.type === "loan").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="payment">
                  Payments
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    {notifications.filter((n) => n.type === "payment").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="account">
                  Account
                  <Badge className="ml-2 bg-purple-100 text-purple-800">
                    {notifications.filter((n) => n.type === "account").length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={
                      selectedNotifications.length ===
                        filteredNotifications.length &&
                      filteredNotifications.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <label
                    htmlFor="selectAll"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select All
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {filteredNotifications.length} notification
                  {filteredNotifications.length !== 1 ? "s" : ""}
                </p>
              </div>

              <TabsContent value="all" className="space-y-4">
                {renderNotificationList(filteredNotifications)}
              </TabsContent>
              <TabsContent value="unread" className="space-y-4">
                {renderNotificationList(filteredNotifications)}
              </TabsContent>
              <TabsContent value="loan" className="space-y-4">
                {renderNotificationList(filteredNotifications)}
              </TabsContent>
              <TabsContent value="payment" className="space-y-4">
                {renderNotificationList(filteredNotifications)}
              </TabsContent>
              <TabsContent value="account" className="space-y-4">
                {renderNotificationList(filteredNotifications)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );

  function renderNotificationList(notifications: Notification[]) {
    if (notifications.length === 0) {
      return (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
          <p className="mt-4 text-muted-foreground">
            No notifications to display
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`py-4 flex items-start ${!notification.read ? "bg-muted/30" : ""}`}
          >
            <div className="mr-4 mt-1">
              <Checkbox
                checked={selectedNotifications.includes(notification.id)}
                onCheckedChange={(checked) =>
                  handleSelectNotification(notification.id, checked as boolean)
                }
              />
            </div>
            <div className="mr-4">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium">{notification.title}</h4>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mt-1">{notification.message}</p>
              {!notification.read && (
                <Badge className="mt-2 bg-blue-100 text-blue-800">New</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
