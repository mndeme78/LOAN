import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, QrCode } from "lucide-react";

interface QRCodePaymentProps {
  amount: number;
  reference: string;
  provider: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function QRCodePayment({
  amount,
  reference,
  provider,
  onSuccess,
  onError,
}: QRCodePaymentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Generate QR code
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, we would call an API to generate a QR code
        // For demo purposes, we'll use a placeholder QR code
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate a QR code URL using a public API
        const qrData = `${provider.toUpperCase()}:PAY:${reference}:${amount}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

        setQrCodeUrl(qrUrl);
      } catch (err: any) {
        setError(err.message || "Failed to generate QR code");
        onError(err.message || "Failed to generate QR code");
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [amount, reference, provider, onError]);

  const checkPaymentStatus = async () => {
    try {
      setIsChecking(true);
      // In a real implementation, we would check the payment status with an API
      // For demo purposes, we'll simulate a successful payment after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to check payment status");
      onError(err.message || "Failed to check payment status");
    } finally {
      setIsChecking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-center">Generating QR code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-md shadow-sm">
        {qrCodeUrl && (
          <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48" />
        )}
      </div>

      <div className="text-center space-y-1">
        <p className="font-medium">Scan with your {provider} app</p>
        <p className="text-sm text-muted-foreground">
          Amount: ${amount.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground">Reference: {reference}</p>
      </div>

      <div className="flex flex-col w-full space-y-2">
        <Button onClick={checkPaymentStatus} disabled={isChecking}>
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Payment Status...
            </>
          ) : (
            "I've Completed Payment"
          )}
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
