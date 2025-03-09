export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  createdAt: string;
  status: "active" | "suspended" | "pending";
}

export interface Loan {
  id: string;
  userId: string;
  amount: number;
  term: number; // in months
  interestRate: number;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "active"
    | "completed"
    | "defaulted";
  purpose: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  status: "pending" | "completed" | "failed";
  paymentMethod: "card" | "bank" | "mobile";
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "loan" | "payment" | "account" | "system";
}
