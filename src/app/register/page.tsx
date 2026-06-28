import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <main className="container-page grid min-h-[78vh] place-items-center py-12">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </main>
  );
}