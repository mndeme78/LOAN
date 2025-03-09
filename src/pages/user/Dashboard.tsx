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
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Loan, Payment } from "@/types";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  PiggyBank,
  DollarSign,
  CreditCard,
} from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        // Fetch user's loans
        const { data: loansData, error: loansError } = await supabase
          .from("loans")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (loansError) throw loansError;

        // Fetch recent payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .in("loan_id", loansData.map((loan) => loan.id) || [])
          .order("payment_date", { ascending: false })
          .limit(5);

        if (paymentsError) throw paymentsError;

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

        const transformedPayments: Payment[] = paymentsData.map((payment) => ({
          id: payment.id,
          loanId: payment.loan_id,
          amount: payment.amount,
          paymentDate: payment.payment_date,
          status: payment.status,
          paymentMethod: payment.payment_method,
        }));

        setLoans(transformedLoans);
        setRecentPayments(transformedPayments);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button onClick={() => navigate("/loans/apply")}>
            Apply for Loan
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Loans
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loans.filter((loan) => loan.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                {loans.length} total loans in your account
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Borrowed
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {loans
                  .reduce((sum, loan) => sum + loan.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all your loans
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Payments
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {recentPayments
                  .reduce((sum, payment) => sum + payment.amount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Last {recentPayments.length} payments
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Loans</CardTitle>
              <CardDescription>
                Your most recent loan applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loans.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  You haven't applied for any loans yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {loans.slice(0, 5).map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div className="flex items-center">
                        {getStatusIcon(loan.status)}
                        <div className="ml-3">
                          <p className="text-sm font-medium">
                            ${loan.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(loan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize"
                          style={{
                            backgroundColor:
                              loan.status === "approved"
                                ? "rgba(0, 200, 0, 0.1)"
                                : loan.status === "pending"
                                  ? "rgba(255, 200, 0, 0.1)"
                                  : loan.status === "rejected"
                                    ? "rgba(255, 0, 0, 0.1)"
                                    : "rgba(100, 100, 100, 0.1)",
                            color:
                              loan.status === "approved"
                                ? "rgb(0, 150, 0)"
                                : loan.status === "pending"
                                  ? "rgb(200, 150, 0)"
                                  : loan.status === "rejected"
                                    ? "rgb(200, 0, 0)"
                                    : "rgb(100, 100, 100)",
                          }}
                        >
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {loans.length > 0 && (
                <Button
                  variant="link"
                  className="w-full mt-4"
                  onClick={() => navigate("/loans")}
                >
                  View all loans
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>Upcoming and recent payments</CardDescription>
            </CardHeader>
            <CardContent>
              {loans.filter((loan) => loan.status === "active").length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  You don't have any active loans with scheduled payments.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* This would normally be calculated based on loan terms */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Next payment</span>
                      <span className="font-medium">$245.00</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Due date</span>
                      <span>
                        {new Date(
                          Date.now() + 7 * 24 * 60 * 60 * 1000,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/payments")}
                  >
                    Make a Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
