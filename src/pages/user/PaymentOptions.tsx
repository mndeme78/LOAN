import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileMoneyPayment from "@/components/payment/MobileMoneyPayment";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loan, Payment } from "@/types";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Calendar,
} from "lucide-react";

export default function PaymentOptions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    routingNumber: "",
    accountName: "",
    bankName: "",
  });
  const [mobileDetails, setMobileDetails] = useState({
    phoneNumber: "",
    provider: "other",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (!user) return;

      // Fetch user's active loans
      const { data: loansData, error: loansError } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "approved"])
        .order("created_at", { ascending: false });

      if (loansError) throw loansError;

      // Fetch recent payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false })
        .limit(10);

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
      setPayments(transformedPayments);

      // Set default selected loan if available
      if (transformedLoans.length > 0) {
        setSelectedLoanId(transformedLoans[0].id);
        // Set default payment amount to monthly payment
        const loan = transformedLoans[0];
        const monthlyPayment = calculateMonthlyPayment(loan);
        setPaymentAmount(monthlyPayment.toFixed(2));
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyPayment = (loan: Loan) => {
    const monthlyInterestRate = loan.interestRate / 100 / 12;
    const payment =
      (loan.amount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -loan.term));
    return isNaN(payment) ? 0 : payment;
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMobileDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePaymentDetails = () => {
    if (!selectedLoanId) {
      setError("Please select a loan");
      return false;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError("Please enter a valid payment amount");
      return false;
    }

    if (paymentMethod === "card") {
      if (
        !cardDetails.cardNumber ||
        !cardDetails.cardName ||
        !cardDetails.expiryDate ||
        !cardDetails.cvv
      ) {
        setError("Please fill in all card details");
        return false;
      }
    } else if (paymentMethod === "bank") {
      if (
        !bankDetails.accountNumber ||
        !bankDetails.routingNumber ||
        !bankDetails.accountName ||
        !bankDetails.bankName
      ) {
        setError("Please fill in all bank details");
        return false;
      }
    } else if (paymentMethod === "mobile") {
      if (!mobileDetails.phoneNumber || !mobileDetails.provider) {
        setError("Please fill in all mobile payment details");
        return false;
      }
    }

    return true;
  };

  const handleSubmitPayment = async () => {
    if (!validatePaymentDetails()) return;
    if (!user) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real application, you would process the payment through a payment gateway here
      // For this demo, we'll simulate a successful payment

      // Insert payment record into database
      const { data, error: insertError } = await supabase
        .from("payments")
        .insert([
          {
            loan_id: selectedLoanId,
            user_id: user.id,
            amount: parseFloat(paymentAmount),
            payment_date: new Date().toISOString(),
            status: "completed", // In a real app, this might be 'pending' until confirmed
            payment_method: paymentMethod,
            payment_details:
              paymentMethod === "card"
                ? { last4: cardDetails.cardNumber.slice(-4) }
                : paymentMethod === "bank"
                  ? { account_last4: bankDetails.accountNumber.slice(-4) }
                  : { phone: mobileDetails.phoneNumber },
          },
        ]);

      if (insertError) throw insertError;

      // Create a notification for the payment
      await supabase.from("notifications").insert([
        {
          user_id: user.id,
          title: "Payment Successful",
          message: `Your payment of $${paymentAmount} has been processed successfully.`,
          type: "payment",
          read: false,
        },
      ]);

      setSuccess(
        `Payment of $${paymentAmount} processed successfully! A receipt has been sent to your email.`,
      );

      // Reset form
      if (paymentMethod === "card") {
        setCardDetails({
          cardNumber: "",
          cardName: "",
          expiryDate: "",
          cvv: "",
        });
      } else if (paymentMethod === "bank") {
        setBankDetails({
          accountNumber: "",
          routingNumber: "",
          accountName: "",
          bankName: "",
        });
      } else if (paymentMethod === "mobile") {
        setMobileDetails({
          phoneNumber: "",
          provider: "other",
        });
      }

      // Refresh data after a short delay
      setTimeout(() => {
        fetchData();
      }, 2000);
    } catch (err: any) {
      console.error("Error processing payment:", err);
      setError(err.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
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
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading payment options...</span>
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
            onClick={() => navigate("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Make a Payment</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Select a loan and enter payment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanSelect">Select Loan</Label>
                    <Select
                      value={selectedLoanId}
                      onValueChange={setSelectedLoanId}
                    >
                      <SelectTrigger id="loanSelect">
                        <SelectValue placeholder="Select a loan" />
                      </SelectTrigger>
                      <SelectContent>
                        {loans.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No active loans
                          </SelectItem>
                        ) : (
                          loans.map((loan) => (
                            <SelectItem key={loan.id} value={loan.id}>
                              ${loan.amount.toLocaleString()} - {loan.purpose}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount</Label>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">$</span>
                      <Input
                        id="paymentAmount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="1"
                      />
                    </div>
                    {selectedLoanId && (
                      <p className="text-xs text-muted-foreground">
                        Monthly payment: $
                        {calculateMonthlyPayment(
                          loans.find((loan) => loan.id === selectedLoanId)!,
                        ).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Tabs
                      defaultValue="card"
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="card">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Credit Card
                        </TabsTrigger>
                        <TabsTrigger value="bank">
                          <Building className="h-4 w-4 mr-2" />
                          Bank Transfer
                        </TabsTrigger>
                        <TabsTrigger value="mobile">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Mobile Payment
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="card" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              value={cardDetails.cardNumber}
                              onChange={handleCardInputChange}
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input
                              id="cardName"
                              name="cardName"
                              value={cardDetails.cardName}
                              onChange={handleCardInputChange}
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              name="expiryDate"
                              value={cardDetails.expiryDate}
                              onChange={handleCardInputChange}
                              placeholder="MM/YY"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              name="cvv"
                              value={cardDetails.cvv}
                              onChange={handleCardInputChange}
                              placeholder="123"
                              type="password"
                              maxLength={4}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="bank" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="accountNumber">
                              Account Number
                            </Label>
                            <Input
                              id="accountNumber"
                              name="accountNumber"
                              value={bankDetails.accountNumber}
                              onChange={handleBankInputChange}
                              placeholder="123456789"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="routingNumber">
                              Routing Number
                            </Label>
                            <Input
                              id="routingNumber"
                              name="routingNumber"
                              value={bankDetails.routingNumber}
                              onChange={handleBankInputChange}
                              placeholder="987654321"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountName">Account Name</Label>
                            <Input
                              id="accountName"
                              name="accountName"
                              value={bankDetails.accountName}
                              onChange={handleBankInputChange}
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name</Label>
                            <Input
                              id="bankName"
                              name="bankName"
                              value={bankDetails.bankName}
                              onChange={handleBankInputChange}
                              placeholder="Bank of America"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="mobile" className="space-y-4 mt-4">
                        {success ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="bg-green-50 p-4 rounded-full mb-4">
                              <CheckCircle2 className="h-12 w-12 text-green-500" />
                            </div>
                            <h3 className="text-xl font-medium mb-2">
                              Payment Successful!
                            </h3>
                            <p className="text-center text-muted-foreground mb-4">
                              Your payment of ${paymentAmount} has been
                              processed successfully.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="provider">Payment Provider</Label>
                              <Select
                                value={mobileDetails.provider}
                                onValueChange={(value) =>
                                  setMobileDetails((prev) => ({
                                    ...prev,
                                    provider: value,
                                  }))
                                }
                              >
                                <SelectTrigger id="provider">
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                                  <SelectItem value="airtel">
                                    Airtel Money
                                  </SelectItem>
                                  <SelectItem value="tigo">
                                    Tigo Pesa
                                  </SelectItem>
                                  <SelectItem value="tpesa">T-Pesa</SelectItem>
                                  <SelectItem value="apple">
                                    Apple Pay
                                  </SelectItem>
                                  <SelectItem value="google">
                                    Google Pay
                                  </SelectItem>
                                  <SelectItem value="paypal">PayPal</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {["mpesa", "airtel", "tigo", "tpesa"].includes(
                              mobileDetails.provider,
                            ) ? (
                              <MobileMoneyPayment
                                provider={mobileDetails.provider}
                                amount={parseFloat(paymentAmount) || 0}
                                onSuccess={(response) => {
                                  setSuccess(
                                    `Payment of $${paymentAmount} processed successfully via ${response.status === "completed" ? "mobile money" : "pending mobile money transaction"}!`,
                                  );
                                  setTimeout(() => {
                                    fetchData();
                                  }, 2000);
                                }}
                                onError={(message) => setError(message)}
                              />
                            ) : (
                              <div className="space-y-2">
                                <Label htmlFor="phoneNumber">
                                  Phone Number
                                </Label>
                                <Input
                                  id="phoneNumber"
                                  name="phoneNumber"
                                  value={mobileDetails.phoneNumber}
                                  onChange={handleMobileInputChange}
                                  placeholder="+255 7XX XXX XXX"
                                />
                                <div className="space-y-2 mt-2">
                                  <Label htmlFor="mobilePin">
                                    PIN/Security Code
                                  </Label>
                                  <Input
                                    id="mobilePin"
                                    type="password"
                                    placeholder="Enter PIN"
                                    maxLength={6}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Your PIN is encrypted and never stored
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Your payment information is secure and encrypted
                </p>
                <Button
                  onClick={handleSubmitPayment}
                  disabled={
                    isProcessing ||
                    loans.length === 0 ||
                    (paymentMethod === "mobile" &&
                      ["mpesa", "airtel", "tigo", "tpesa"].includes(
                        mobileDetails.provider,
                      ))
                  }
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Make Payment"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your recent payments</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">
                    No payment history available
                  </p>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => {
                      const loan = loans.find(
                        (loan) => loan.id === payment.loanId,
                      );
                      return (
                        <div
                          key={payment.id}
                          className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                ${payment.amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  payment.paymentDate,
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {loan
                                  ? `Loan: $${loan.amount.toLocaleString()}`
                                  : "Loan details unavailable"}
                              </p>
                            </div>
                          </div>
                          <div>{getPaymentStatusBadge(payment.status)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/payment-history")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Full History
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Saved payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="card1">
                  <div className="flex items-center space-x-2 space-y-0 mb-4">
                    <RadioGroupItem value="card1" id="card1" />
                    <Label
                      htmlFor="card1"
                      className="flex items-center cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">
                          Visa ending in 4242
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires 12/25
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-y-0 mb-4">
                    <RadioGroupItem value="bank1" id="bank1" />
                    <Label
                      htmlFor="bank1"
                      className="flex items-center cursor-pointer"
                    >
                      <Building className="h-4 w-4 mr-2 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Chase Bank</p>
                        <p className="text-xs text-muted-foreground">
                          Account ending in 6789
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-y-0">
                    <RadioGroupItem value="mobile1" id="mobile1" />
                    <Label
                      htmlFor="mobile1"
                      className="flex items-center cursor-pointer"
                    >
                      <Smartphone className="h-4 w-4 mr-2 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium">M-Pesa</p>
                        <p className="text-xs text-muted-foreground">
                          +255 712 345 678
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/payment-methods")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Payment Methods
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
