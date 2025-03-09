import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loan, User } from "@/types";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingLoans: 0,
    totalUsers: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all loans
        const { data: loansData, error: loansError } = await supabase
          .from("loans")
          .select("*")
          .order("created_at", { ascending: false });

        if (loansError) throw loansError;

        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (usersError) throw usersError;

        // Transform data to match our types
        const transformedLoans: Loan[] = loansData.map((loan) => ({
          id: loan.id,
          userId: loan.user_id,
          amount: loan.amount,
          term: loan.term,
          interestRate: loan.interest_rate,
          status: loan.status,
          purpose: loan.purpose,
          createdAt: loan.created_at,
          approvedAt: loan.approved_at,
          approvedBy: loan.approved_by,
        }));

        const transformedUsers: User[] = usersData.map((userData) => ({
          id: userData.id,
          email: userData.email || "",
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          createdAt: userData.created_at,
          status: userData.status,
        }));

        setLoans(transformedLoans);
        setUsers(transformedUsers);

        // Calculate stats
        setStats({
          totalLoans: transformedLoans.length,
          pendingLoans: transformedLoans.filter(
            (loan) => loan.status === "pending",
          ).length,
          totalUsers: transformedUsers.length,
          totalAmount: transformedLoans.reduce(
            (sum, loan) => sum + loan.amount,
            0,
          ),
        });
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading dashboard...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <Button onClick={() => navigate("/admin/loans/approval")}>
            Review Loan Applications
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter((u) => u.status === "active").length} active users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLoans}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingLoans} pending approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Across all loans</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Approval Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loans.length > 0
                  ? Math.round(
                      (loans.filter((loan) => loan.status === "approved")
                        .length /
                        loans.length) *
                        100,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {loans.filter((loan) => loan.status === "approved").length}{" "}
                approved loans
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Loan Applications</CardTitle>
              <CardDescription>
                Latest loan applications requiring review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loans.filter((loan) => loan.status === "pending").length ===
              0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No pending loan applications to review.
                </p>
              ) : (
                <div className="space-y-4">
                  {loans
                    .filter((loan) => loan.status === "pending")
                    .slice(0, 5)
                    .map((loan) => {
                      const loanUser = users.find((u) => u.id === loan.userId);
                      return (
                        <div
                          key={loan.id}
                          className="flex items-center justify-between border-b pb-2 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {loanUser
                                ? `${loanUser.firstName} ${loanUser.lastName}`
                                : "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${loan.amount.toLocaleString()} -{" "}
                              {new Date(loan.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/admin/loans/approval/${loan.id}`)
                            }
                          >
                            Review
                          </Button>
                        </div>
                      );
                    })}
                </div>
              )}
              {loans.filter((loan) => loan.status === "pending").length > 0 && (
                <Button
                  variant="link"
                  className="w-full mt-4"
                  onClick={() => navigate("/admin/loans/approval")}
                >
                  View all pending applications
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No users registered yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize"
                        style={{
                          backgroundColor:
                            user.status === "active"
                              ? "rgba(0, 200, 0, 0.1)"
                              : user.status === "pending"
                                ? "rgba(255, 200, 0, 0.1)"
                                : user.status === "suspended"
                                  ? "rgba(255, 0, 0, 0.1)"
                                  : "rgba(100, 100, 100, 0.1)",
                          color:
                            user.status === "active"
                              ? "rgb(0, 150, 0)"
                              : user.status === "pending"
                                ? "rgb(200, 150, 0)"
                                : user.status === "suspended"
                                  ? "rgb(200, 0, 0)"
                                  : "rgb(100, 100, 100)",
                        }}
                      >
                        {user.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {users.length > 0 && (
                <Button
                  variant="link"
                  className="w-full mt-4"
                  onClick={() => navigate("/admin/users")}
                >
                  View all users
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
