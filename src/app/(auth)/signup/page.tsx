import Link from "next/link";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { strings } from "@/lib/strings";

import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: `${strings.auth.signup.title} — ${strings.app.name}`,
};

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.auth.signup.title}</CardTitle>
        <CardDescription>{strings.auth.signup.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
      <CardFooter className="justify-center gap-1.5 text-sm">
        <span className="text-muted-foreground">
          {strings.auth.signup.haveAccount}
        </span>
        <Link href="/login" className="font-medium underline underline-offset-4">
          {strings.auth.signup.loginLink}
        </Link>
      </CardFooter>
    </Card>
  );
}
