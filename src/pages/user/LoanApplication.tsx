import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 500 && num <= 50000;
    },
    { message: "Amount must be between $500 and $50,000" },
  ),
  term: z.string(),
  purpose: z
    .string()
    .min(5, { message: "Please provide a purpose for the loan" })
    .max(500),
  employmentStatus: z.string(),
  monthlyIncome: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Please enter a valid monthly income" },
  ),
});

export default function LoanApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState([10000]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "10000",
      term: "12",
      purpose: "",
      employmentStatus: "full-time",
      monthlyIncome: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Calculate interest rate based on term and other factors (simplified)
      const interestRate =
        parseFloat(values.term) <= 12
          ? 5.99
          : parseFloat(values.term) <= 36
            ? 7.99
            : 9.99;

      // Insert loan application into database
      const { data, error: insertError } = await supabase.from("loans").insert([
        {
          user_id: user.id,
          amount: parseFloat(values.amount),
          term: parseInt(values.term),
          interest_rate: interestRate,
          status: "pending",
          purpose: values.purpose,
          employment_status: values.employmentStatus,
          monthly_income: parseFloat(values.monthlyIncome),
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(
        "Loan application submitted successfully! We will review your application shortly.",
      );
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit loan application");
      console.error("Error submitting loan application:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    form.setValue("amount", value[0].toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 500 && value <= 50000) {
      setSliderValue([value]);
    }
    form.setValue("amount", e.target.value);
  };

  // Calculate monthly payment (simplified)
  const calculateMonthlyPayment = () => {
    const amount = parseFloat(form.watch("amount") || "0");
    const term = parseInt(form.watch("term") || "12");
    const interestRate = term <= 12 ? 5.99 : term <= 36 ? 7.99 : 9.99;

    // Simple calculation (not accounting for compounding)
    const monthlyInterestRate = interestRate / 100 / 12;
    const payment =
      (amount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -term));

    return isNaN(payment) ? 0 : payment;
  };

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
          <h1 className="text-3xl font-bold tracking-tight">
            Apply for a Loan
          </h1>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Loan Application</CardTitle>
            <CardDescription>
              Fill out the form below to apply for a loan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Slider
                            min={500}
                            max={50000}
                            step={100}
                            value={sliderValue}
                            onValueChange={handleSliderChange}
                          />
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">$</span>
                            <Input
                              {...field}
                              onChange={handleAmountChange}
                              className="text-2xl font-bold"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select a loan amount between $500 and $50,000
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select loan term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="48">48 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Interest rates vary based on the loan term
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Purpose</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe why you need this loan"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="self-employed">
                            Self-employed
                          </SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="text-lg mr-2">$</span>
                          <Input placeholder="5000" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Loan Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Loan Amount:</span>
                        <span className="font-medium">
                          $
                          {parseFloat(
                            form.watch("amount") || "0",
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Term:</span>
                        <span className="font-medium">
                          {form.watch("term")} months
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest Rate:</span>
                        <span className="font-medium">
                          {parseInt(form.watch("term") || "12") <= 12
                            ? "5.99%"
                            : parseInt(form.watch("term") || "12") <= 36
                              ? "7.99%"
                              : "9.99%"}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-semibold">Monthly Payment:</span>
                        <span className="font-semibold">
                          ${calculateMonthlyPayment().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground text-center max-w-md">
              By submitting this application, you agree to our terms and
              conditions and authorize us to perform a credit check.
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
