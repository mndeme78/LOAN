// Payment provider integration library

// Mobile Money Provider Interfaces
interface MobileMoneyProvider {
  name: string;
  code: string;
  logo: string;
  countryCode: string;
  numberFormat: string;
  validateNumber: (number: string) => boolean;
  initiatePayment: (
    phoneNumber: string,
    amount: number,
  ) => Promise<PaymentResponse>;
  checkStatus: (transactionId: string) => Promise<PaymentStatus>;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  status: PaymentStatus;
  reference?: string;
}

type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

// M-Pesa Provider Implementation
export const MPesaProvider: MobileMoneyProvider = {
  name: "M-Pesa",
  code: "mpesa",
  logo: "/assets/mpesa-logo.png",
  countryCode: "+255",
  numberFormat: "+255 7XX XXX XXX",

  validateNumber: (number: string) => {
    // Basic validation for Tanzania M-Pesa numbers
    const regex = /^\+255[67]\d{8}$/;
    return regex.test(number);
  },

  initiatePayment: async (phoneNumber: string, amount: number) => {
    try {
      // In a real implementation, this would call the M-Pesa API
      // For demo purposes, we'll simulate a successful response

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        success: true,
        transactionId: `MPESA-${Date.now()}`,
        message:
          "Payment request sent to your phone. Please check your phone and enter PIN to confirm payment.",
        status: "pending",
        reference: `REF-${Math.floor(Math.random() * 1000000)}`,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to initiate M-Pesa payment",
        status: "failed",
      };
    }
  },

  checkStatus: async (transactionId: string) => {
    // In a real implementation, this would check the status with M-Pesa API
    // For demo purposes, we'll simulate a completed status
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "completed";
  },
};

// Airtel Money Provider Implementation
export const AirtelMoneyProvider: MobileMoneyProvider = {
  name: "Airtel Money",
  code: "airtel",
  logo: "/assets/airtel-logo.png",
  countryCode: "+255",
  numberFormat: "+255 78X XXX XXX",

  validateNumber: (number: string) => {
    // Basic validation for Tanzania Airtel Money numbers
    const regex = /^\+255[78]\d{8}$/;
    return regex.test(number);
  },

  initiatePayment: async (phoneNumber: string, amount: number) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        success: true,
        transactionId: `AIRTEL-${Date.now()}`,
        message:
          "Payment request sent to your phone. Please confirm on your device.",
        status: "pending",
        reference: `REF-${Math.floor(Math.random() * 1000000)}`,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to initiate Airtel Money payment",
        status: "failed",
      };
    }
  },

  checkStatus: async (transactionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "completed";
  },
};

// Tigo Pesa Provider Implementation
export const TigoPesaProvider: MobileMoneyProvider = {
  name: "Tigo Pesa",
  code: "tigo",
  logo: "/assets/tigo-logo.png",
  countryCode: "+255",
  numberFormat: "+255 71X XXX XXX",

  validateNumber: (number: string) => {
    // Basic validation for Tanzania Tigo Pesa numbers
    const regex = /^\+255[76]\d{8}$/;
    return regex.test(number);
  },

  initiatePayment: async (phoneNumber: string, amount: number) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        success: true,
        transactionId: `TIGO-${Date.now()}`,
        message:
          "Payment request sent. Please check your phone for confirmation prompt.",
        status: "pending",
        reference: `REF-${Math.floor(Math.random() * 1000000)}`,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to initiate Tigo Pesa payment",
        status: "failed",
      };
    }
  },

  checkStatus: async (transactionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "completed";
  },
};

// T-Pesa Provider Implementation
export const TPesaProvider: MobileMoneyProvider = {
  name: "T-Pesa",
  code: "tpesa",
  logo: "/assets/tpesa-logo.png",
  countryCode: "+255",
  numberFormat: "+255 71X XXX XXX",

  validateNumber: (number: string) => {
    // Basic validation for Tanzania T-Pesa numbers
    const regex = /^\+255[67]\d{8}$/;
    return regex.test(number);
  },

  initiatePayment: async (phoneNumber: string, amount: number) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        success: true,
        transactionId: `TPESA-${Date.now()}`,
        message: "Payment request initiated. Please confirm on your device.",
        status: "pending",
        reference: `REF-${Math.floor(Math.random() * 1000000)}`,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to initiate T-Pesa payment",
        status: "failed",
      };
    }
  },

  checkStatus: async (transactionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "completed";
  },
};

// Get provider by code
export const getProviderByCode = (code: string): MobileMoneyProvider | null => {
  switch (code) {
    case "mpesa":
      return MPesaProvider;
    case "airtel":
      return AirtelMoneyProvider;
    case "tigo":
      return TigoPesaProvider;
    case "tpesa":
      return TPesaProvider;
    default:
      return null;
  }
};

// Validate mobile number based on provider
export const validateMobileNumber = (
  number: string,
  providerCode: string,
): boolean => {
  const provider = getProviderByCode(providerCode);
  if (!provider) return false;
  return provider.validateNumber(number);
};

// Initiate payment with selected provider
export const initiatePayment = async (
  providerCode: string,
  phoneNumber: string,
  amount: number,
): Promise<PaymentResponse> => {
  const provider = getProviderByCode(providerCode);
  if (!provider) {
    return {
      success: false,
      message: "Invalid payment provider",
      status: "failed",
    };
  }

  return provider.initiatePayment(phoneNumber, amount);
};

// Export types for use in components
export type { MobileMoneyProvider, PaymentResponse, PaymentStatus };
