import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loan } from "@/types";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
} from "lucide-react";

export default function MyLoans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        if (!user) return;

        const { data, error: loansError } = await supabase
          .from("loans")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (loansError) throw loansError;

        // Transform data to match our types
        const transformedLoans: Loan[] = data.map((loan) => ({
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

        setLoans(transformedLoans);
      } catch (err: any) {
        console.error("Error fetching loans:", err);
        setError(err.message || "Failed to load loans");
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
      case "defaulted":
        return <Ban className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
      case "completed":
        return {
          bg: "rgba(0, 200, 0, 0.1)",
          text: "rgb(0, 150, 0)",
        };
      case "pending":
        return {
          bg: "rgba(255, 200, 0, 0.1)",
          text: "rgb(200, 150, 0)",
        };
      case "rejected":
      case "defaulted":
        return {
          bg: "rgba(255, 0, 0, 0.1)",
          text: "rgb(200, 0, 0)",
        };
      default:
        return {
          bg: "rgba(100, 100, 100, 0.1)",
          text: "rgb(100, 100, 100)",
        };
    }
  };

  // Calculate monthly payment (simplified)
  const calculateMonthlyPayment = (loan: Loan) => {
    const monthlyInterestRate = loan.interestRate / 100 / 12;
    const payment =
      (loan.amount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -loan.term));
    return isNaN(payment) ? 0 : payment;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading loans...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">My Loans</h1>
          <Button onClick={() => navigate("/loans/apply")}>
            Apply for New Loan
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-lg text-center mb-4">
                You don't have any loans yet.
              </p>
              <Button onClick={() => navigate("/loans/apply")}>
                Apply for Your First Loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All Loans ({loans.length})</TabsTrigger>
              <TabsTrigger value="active">
                Active (
                {loans.filter((loan) => loan.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending (
                {loans.filter((loan) => loan.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed (
                {
                  loans.filter((loan) =>
                    ["completed", "rejected", "defaulted"].includes(
                      loan.status,
                    ),
                  ).length
                }
                )
              </TabsTrigger>
            </TabsList>

            {["all", "active", "pending", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {loans
                  .filter((loan) => {
                    if (tab === "all") return true;
                    if (tab === "active")
                      return (
                        loan.status === "active" || loan.status === "approved"
                      );
                    if (tab === "pending") return loan.status === "pending";
                    if (tab === "completed")
                      return ["completed", "rejected", "defaulted"].includes(
                        loan.status,
                      );
                    return false;
                  })
                  .map((loan) => {
                    const statusColor = getStatusColor(loan.status);
                    return (
                      <Card key={loan.id} className="overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl">
                                ${loan.amount.toLocaleString()}
                              </CardTitle>
                              <CardDescription>
                                Applied on{" "}
                                {new Date(loan.createdAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <span
                              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                              style={{
                                backgroundColor: statusColor.bg,
                                color: statusColor.text,
                              }}
                            >
                              {getStatusIcon(loan.status)}
                              <span className="ml-1">{loan.status}</span>
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Term
                              </p>
                              <p className="font-medium">{loan.term} months</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Interest Rate
                              </p>
                              <p className="font-medium">
                                {loan.interestRate}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Monthly Payment
                              </p>
                              <p className="font-medium">
                                ${calculateMonthlyPayment(loan).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Total Repayment
                              </p>
                              <p className="font-medium">
                                $
                                {(
                                  calculateMonthlyPayment(loan) * loan.term
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">
                              Purpose
                            </p>
                            <p className="text-sm mt-1">{loan.purpose}</p>
                          </div>

                          {loan.status === "active" && (
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="outline"
                                className="mr-2"
                                onClick={() => navigate(`/loans/${loan.id}`)}
                              >
                                View Details
                              </Button>
                              <Button onClick={() => navigate("/payments")}>
                                Make Payment
                              </Button>
                            </div>
                          )}

                          {loan.status === "pending" && (
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="outline"
                                onClick={() => navigate(`/loans/${loan.id}`)}
                              >
                                View Application
                              </Button>
                            </div>
                          )}

                          {(loan.status === "approved" ||
                            loan.status === "rejected") && (
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="outline"
                                onClick={() => navigate(`/loans/${loan.id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {loans.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={() => navigate("/payments")}>
              View Payment History
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
