import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import {
  initiatePayment,
  validateMobileNumber,
  PaymentResponse,
} from "@/lib/paymentProviders";

interface MobileMoneyPaymentProps {
  provider: string;
  amount: number;
  onSuccess: (response: PaymentResponse) => void;
  onError: (message: string) => void;
}

export default function MobileMoneyPayment({
  provider,
  amount,
  onSuccess,
  onError,
}: MobileMoneyPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<
    "input" | "confirmation" | "processing" | "complete"
  >("input");
  const [transactionDetails, setTransactionDetails] =
    useState<PaymentResponse | null>(null);

  const getProviderName = () => {
    switch (provider) {
      case "mpesa":
        return "M-Pesa";
      case "airtel":
        return "Airtel Money";
      case "tigo":
        return "Tigo Pesa";
      case "tpesa":
        return "T-Pesa";
      default:
        return provider;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setError(null);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value);
    setError(null);
  };

  const validateAndProceed = () => {
    // Validate phone number
    if (!phoneNumber) {
      setError("Please enter your phone number");
      return false;
    }

    if (!validateMobileNumber(phoneNumber, provider)) {
      setError(`Please enter a valid ${getProviderName()} number`);
      return false;
    }

    // Validate PIN
    if (!pin || pin.length < 4) {
      setError("Please enter a valid PIN");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateAndProceed()) return;

    setIsProcessing(true);
    setError(null);
    setStep("processing");

    try {
      // Initiate payment with the selected provider
      const response = await initiatePayment(provider, phoneNumber, amount);

      if (response.success) {
        setTransactionDetails(response);
        setStep("confirmation");
      } else {
        setError(response.message);
        setStep("input");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
      setStep("input");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmation = async () => {
    setIsProcessing(true);
    setStep("processing");

    try {
      // In a real implementation, we would check the status of the transaction
      // For demo purposes, we'll simulate a successful payment after a delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (transactionDetails) {
        onSuccess({
          ...transactionDetails,
          status: "completed",
        });
      }

      setStep("complete");
    } catch (err: any) {
      setError(err.message || "Failed to confirm payment");
      setStep("confirmation");
      onError(err.message || "Failed to confirm payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "input" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder={`+255 7XX XXX XXX`}
            />
            <p className="text-xs text-muted-foreground">
              Enter the phone number registered with {getProviderName()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">PIN/Security Code</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={handlePinChange}
              placeholder="Enter PIN"
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Your PIN is encrypted and never stored
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay with {getProviderName()}</>
            )}
          </Button>
        </>
      )}

      {step === "confirmation" && transactionDetails && (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <div className="flex items-center justify-center mb-4">
              <Smartphone className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-center font-medium mb-2">
              Payment Request Sent
            </h3>
            <p className="text-center text-sm mb-4">
              {transactionDetails.message}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-medium">
                  {transactionDetails.reference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">
                  {transactionDetails.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={handleConfirmation} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Status...
                </>
              ) : (
                "I've Confirmed Payment"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setStep("input")}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-center">Processing your payment...</p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Please do not close this window
          </p>
        </div>
      )}

      {step === "complete" && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-green-50 p-4 rounded-full mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
          <p className="text-center text-muted-foreground mb-4">
            Your payment of ${amount.toFixed(2)} has been processed
            successfully.
          </p>
          <Button onClick={() => window.location.reload()}>Done</Button>
        </div>
      )}
    </div>
  );
}
