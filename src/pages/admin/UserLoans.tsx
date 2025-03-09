import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loan, Payment } from "@/types";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
  DollarSign,
  Clock,
  Calendar,
  CreditCard,
  Building,
  Smartphone,
  Eye,
  Edit,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
} from "lucide-react";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  phone?: string;
}

export default function UserLoans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // Transform profile data
      const transformedProfile: UserProfile = {
        id: profileData.id,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email || "",
        role: profileData.role,
        status: profileData.status,
        createdAt: profileData.created_at,
        phone: profileData.phone,
      };

      setUserProfile(transformedProfile);

      // Fetch user's loans
      const { data: loansData, error: loansError } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (loansError) throw loansError;

      // Transform loans data
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
        employmentStatus: loan.employment_status,
        monthlyIncome: loan.monthly_income,
      }));

      setLoans(transformedLoans);

      // Fetch user's payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Transform payments data
      const transformedPayments: Payment[] = paymentsData.map((payment) => ({
        id: payment.id,
        loanId: payment.loan_id,
        amount: payment.amount,
        paymentDate: payment.payment_date,
        status: payment.status,
        paymentMethod: payment.payment_method,
      }));

      setPayments(transformedPayments);
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.message || "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from("loans")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq("id", loanId);

      if (updateError) throw updateError;

      // Create notification for user
      await supabase.from("notifications").insert([
        {
          user_id: userId,
          title: "Loan Approved",
          message:
            "Your loan application has been approved! Funds will be disbursed shortly.",
          type: "loan",
          read: false,
        },
      ]);

      setSuccess("Loan approved successfully!");
      setTimeout(() => {
        setSuccess(null);
        fetchUserData();
      }, 2000);
    } catch (err: any) {
      console.error("Error approving loan:", err);
      setError(err.message || "Failed to approve loan");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLoan = async (loanId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from("loans")
        .update({
          status: "rejected",
        })
        .eq("id", loanId);

      if (updateError) throw updateError;

      // Create notification for user
      await supabase.from("notifications").insert([
        {
          user_id: userId,
          title: "Loan Application Rejected",
          message:
            "Unfortunately, your loan application has been rejected. Please contact support for more information.",
          type: "loan",
          read: false,
        },
      ]);

      setSuccess("Loan rejected successfully!");
      setTimeout(() => {
        setSuccess(null);
        fetchUserData();
      }, 2000);
    } catch (err: any) {
      console.error("Error rejecting loan:", err);
      setError(err.message || "Failed to reject loan");
    } finally {
      setLoading(false);
    }
  };

  const getLoanStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "bank":
        return <Building className="h-4 w-4 text-green-500" />;
      case "mobile":
        return <Smartphone className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateMonthlyPayment = (loan: Loan) => {
    const monthlyInterestRate = loan.interestRate / 100 / 12;
    const payment =
      (loan.amount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -loan.term));
    return isNaN(payment) ? 0 : payment;
  };

  const calculateTotalRepayment = (loan: Loan) => {
    const monthlyPayment = calculateMonthlyPayment(loan);
    return monthlyPayment * loan.term;
  };

  if (loading && !userProfile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading user data...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/users")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">User Loans</h1>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {userProfile && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.firstName}`}
                  />
                  <AvatarFallback>
                    {userProfile.firstName[0]}
                    {userProfile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>
                    {userProfile.firstName} {userProfile.lastName}
                  </CardTitle>
                  <CardDescription>
                    {userProfile.email} • {userProfile.phone || "No phone"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
                <CardDescription>
                  View and manage user's loan applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loans.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                    <p className="mt-4 text-muted-foreground">
                      No loan applications found
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Amount
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Purpose
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Status
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Date
                            </th>
                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                          {loans.map((loan) => (
                            <tr
                              key={loan.id}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              onClick={() => setSelectedLoan(loan)}
                            >
                              <td className="p-4 align-middle font-medium">
                                ${loan.amount.toLocaleString()}
                              </td>
                              <td className="p-4 align-middle">
                                {loan.purpose}
                              </td>
                              <td className="p-4 align-middle">
                                {getLoanStatusBadge(loan.status)}
                              </td>
                              <td className="p-4 align-middle">
                                {new Date(loan.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4 align-middle text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLoan(loan);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {loan.status === "pending" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApproveLoan(loan.id);
                                        }}
                                      >
                                        <ThumbsUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRejectLoan(loan.id);
                                        }}
                                      >
                                        <ThumbsDown className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  {(loan.status === "approved" ||
                                    loan.status === "active") && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  View user's payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                    <p className="mt-4 text-muted-foreground">
                      No payment history found
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Amount
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Method
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Status
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Date
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                              Loan ID
                            </th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                          {payments.map((payment) => {
                            const relatedLoan = loans.find(
                              (loan) => loan.id === payment.loanId,
                            );
                            return (
                              <tr
                                key={payment.id}
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              >
                                <td className="p-4 align-middle font-medium">
                                  ${payment.amount.toLocaleString()}
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex items-center">
                                    {getPaymentMethodIcon(
                                      payment.paymentMethod,
                                    )}
                                    <span className="ml-2">
                                      {payment.paymentMethod
                                        .charAt(0)
                                        .toUpperCase() +
                                        payment.paymentMethod.slice(1)}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  {getPaymentStatusBadge(payment.status)}
                                </td>
                                <td className="p-4 align-middle">
                                  {new Date(
                                    payment.paymentDate,
                                  ).toLocaleDateString()}
                                </td>
                                <td className="p-4 align-middle">
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto"
                                    onClick={() =>
                                      relatedLoan &&
                                      setSelectedLoan(relatedLoan)
                                    }
                                  >
                                    {payment.loanId.slice(0, 8)}...
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            {selectedLoan ? (
              <Card>
                <CardHeader>
                  <CardTitle>Loan Details</CardTitle>
                  <CardDescription>
                    Detailed information about the selected loan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        ${selectedLoan.amount.toLocaleString()}
                      </h3>
                      {getLoanStatusBadge(selectedLoan.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Purpose: {selectedLoan.purpose}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-medium">{selectedLoan.term} months</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">
                        {selectedLoan.interestRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Payment</p>
                      <p className="font-medium">
                        ${calculateMonthlyPayment(selectedLoan).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Repayment</p>
                      <p className="font-medium">
                        ${calculateTotalRepayment(selectedLoan).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Application Details</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Applied On</p>
                        <p>
                          {new Date(
                            selectedLoan.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedLoan.approvedAt && (
                        <div>
                          <p className="text-muted-foreground">Approved On</p>
                          <p>
                            {new Date(
                              selectedLoan.approvedAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Employment</p>
                        <p>
                          {selectedLoan.employmentStatus || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Income</p>
                        <p>
                          {selectedLoan.monthlyIncome
                            ? `$${selectedLoan.monthlyIncome.toLocaleString()}`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedLoan.status === "pending" && (
                    <div className="flex justify-between gap-2 pt-4">
                      <Button
                        variant="outline"
                        className="w-full text-green-500 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApproveLoan(selectedLoan.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve Loan
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRejectLoan(selectedLoan.id)}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Reject Loan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Loan Information</CardTitle>
                  <CardDescription>
                    Select a loan to view detailed information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium">No Loan Selected</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                      Click on a loan from the list to view its details
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
                <CardDescription>
                  Overview of user's loan activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Loans
                      </p>
                      <p className="text-2xl font-bold">{loans.length}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Active Loans
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          loans.filter(
                            (loan) =>
                              loan.status === "active" ||
                              loan.status === "approved",
                          ).length
                        }
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Borrowed
                      </p>
                      <p className="text-2xl font-bold">
                        $
                        {loans
                          .filter((loan) => loan.status !== "rejected")
                          .reduce((sum, loan) => sum + loan.amount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Total Payments
                      </p>
                      <p className="text-2xl font-bold">
                        $
                        {payments
                          .filter((payment) => payment.status === "completed")
                          .reduce((sum, payment) => sum + payment.amount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/admin/users/${userId}`)}
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      View User Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
