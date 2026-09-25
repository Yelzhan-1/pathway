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

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: `${strings.auth.login.title} — ${strings.app.name}`,
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.auth.login.title}</CardTitle>
        <CardDescription>{strings.auth.login.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center gap-1.5 text-sm">
        <span className="text-muted-foreground">
          {strings.auth.login.noAccount}
        </span>
        <Link href="/signup" className="font-medium underline underline-offset-4">
          {strings.auth.login.signupLink}
        </Link>
      </CardFooter>
    </Card>
  );
}
