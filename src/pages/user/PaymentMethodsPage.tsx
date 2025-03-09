import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PaymentMethodCard from "@/components/payment/PaymentMethodCard";
import QRCodePayment from "@/components/payment/QRCodePayment";
import {
  CreditCard,
  Building,
  Smartphone,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
} from "lucide-react";

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();
  const [activeTab, setActiveTab] = useState(
    type === "card"
      ? "cards"
      : type === "bank"
        ? "banks"
        : type === "mpesa" ||
            type === "airtel" ||
            type === "tigo" ||
            type === "tpesa"
          ? "mobile"
          : "cards",
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(
    type === "mpesa"
      ? "mpesa"
      : type === "airtel"
        ? "airtel"
        : type === "tigo"
          ? "tigo"
          : type === "tpesa"
            ? "tpesa"
            : null,
  );

  // Sample saved payment methods
  const savedMethods = {
    cards: [
      {
        id: "card1",
        name: "Visa ending in 4242",
        expires: "12/25",
        default: true,
      },
      {
        id: "card2",
        name: "Mastercard ending in 5555",
        expires: "09/24",
        default: false,
      },
    ],
    banks: [
      {
        id: "bank1",
        name: "Chase Bank",
        accountNumber: "****6789",
        default: true,
      },
      {
        id: "bank2",
        name: "Bank of America",
        accountNumber: "****1234",
        default: false,
      },
    ],
    mobile: [
      {
        id: "mpesa1",
        name: "M-Pesa",
        number: "+255 712 345 678",
        default: true,
      },
      {
        id: "airtel1",
        name: "Airtel Money",
        number: "+255 786 123 456",
        default: false,
      },
      {
        id: "tigo1",
        name: "Tigo Pesa",
        number: "+255 713 987 654",
        default: false,
      },
    ],
  };

  const handleSetDefault = (id: string, type: "cards" | "banks" | "mobile") => {
    // In a real app, this would update the database
    setSuccess(`Payment method set as default`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDelete = (id: string, type: "cards" | "banks" | "mobile") => {
    // In a real app, this would update the database
    setSuccess(`Payment method deleted successfully`);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <Button onClick={() => navigate("/payments")}>Make a Payment</Button>
        </div>

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs
          defaultValue="cards"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="cards">
              <CreditCard className="h-4 w-4 mr-2" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="banks">
              <Building className="h-4 w-4 mr-2" />
              Bank Accounts
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile Money
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Credit & Debit Cards</CardTitle>
                <CardDescription>
                  Manage your saved cards for quick payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedMethods.cards.map((card) => (
                    <PaymentMethodCard
                      key={card.id}
                      id={card.id}
                      type="card"
                      name={card.name}
                      details={`Expires ${card.expires}`}
                      isDefault={card.default}
                      onSetDefault={(id) => handleSetDefault(id, "cards")}
                      onEdit={(id) => console.log("Edit", id)}
                      onDelete={(id) => handleDelete(id, "cards")}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Card
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="banks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bank Accounts</CardTitle>
                <CardDescription>
                  Manage your linked bank accounts for transfers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedMethods.banks.map((bank) => (
                    <PaymentMethodCard
                      key={bank.id}
                      id={bank.id}
                      type="bank"
                      name={bank.name}
                      details={`Account ${bank.accountNumber}`}
                      isDefault={bank.default}
                      onSetDefault={(id) => handleSetDefault(id, "banks")}
                      onEdit={(id) => console.log("Edit", id)}
                      onDelete={(id) => handleDelete(id, "banks")}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Bank Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Money</CardTitle>
                <CardDescription>
                  Manage your mobile money accounts for payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showQRCode && selectedProvider ? (
                  <QRCodePayment
                    amount={100} // Example amount
                    reference={`REF-${Math.floor(Math.random() * 1000000)}`}
                    provider={selectedProvider}
                    onSuccess={() => {
                      setSuccess("Payment method added successfully!");
                      setShowQRCode(false);
                      setTimeout(() => setSuccess(null), 3000);
                    }}
                    onError={(message) => {
                      setSuccess(null);
                      setShowQRCode(false);
                    }}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {savedMethods.mobile.map((mobile) => (
                        <PaymentMethodCard
                          key={mobile.id}
                          id={mobile.id}
                          type="mobile"
                          name={mobile.name}
                          details={mobile.number}
                          isDefault={mobile.default}
                          onSetDefault={(id) => handleSetDefault(id, "mobile")}
                          onEdit={(id) => console.log("Edit", id)}
                          onDelete={(id) => handleDelete(id, "mobile")}
                          onSelect={(id) => {
                            const method = savedMethods.mobile.find(
                              (m) => m.id === id,
                            );
                            if (method) {
                              setSelectedProvider(
                                method.name.toLowerCase().replace(" ", ""),
                              );
                              setShowQRCode(true);
                            }
                          }}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <Button
                        variant="outline"
                        className="p-6 h-auto flex flex-col items-center justify-center space-y-2"
                        onClick={() => {
                          setSelectedProvider("mpesa");
                          setShowQRCode(true);
                        }}
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-green-600" />
                        </div>
                        <span>M-Pesa</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="p-6 h-auto flex flex-col items-center justify-center space-y-2"
                        onClick={() => {
                          setSelectedProvider("airtel");
                          setShowQRCode(true);
                        }}
                      >
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-red-600" />
                        </div>
                        <span>Airtel Money</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="p-6 h-auto flex flex-col items-center justify-center space-y-2"
                        onClick={() => {
                          setSelectedProvider("tigo");
                          setShowQRCode(true);
                        }}
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-blue-600" />
                        </div>
                        <span>Tigo Pesa</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="p-6 h-auto flex flex-col items-center justify-center space-y-2"
                        onClick={() => {
                          setSelectedProvider("tpesa");
                          setShowQRCode(true);
                        }}
                      >
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Smartphone className="h-6 w-6 text-purple-600" />
                        </div>
                        <span>T-Pesa</span>
                      </Button>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        Add New Mobile Money Account
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mobileProvider">Provider</Label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">Select provider</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="airtel">Airtel Money</option>
                            <option value="tigo">Tigo Pesa</option>
                            <option value="tpesa">T-Pesa</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mobileNumber">Phone Number</Label>
                          <Input
                            id="mobileNumber"
                            placeholder="+255 7XX XXX XXX"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-2">
                        <Label htmlFor="mobilePin">PIN/Security Code</Label>
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
                      <Button className="w-full md:w-auto mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Mobile Money Account
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
