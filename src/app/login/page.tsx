import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="container-page grid min-h-[78vh] place-items-center py-12">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}