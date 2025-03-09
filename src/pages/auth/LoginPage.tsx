import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
