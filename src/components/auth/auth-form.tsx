
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Link component is no longer needed here if we remove the bottom link entirely
// import Link from "next/link";
import { AppLogo } from "../core/app-logo";
import { useRouter } from "next/navigation";

// AuthFormProps is no longer needed as 'mode' is removed
// interface AuthFormProps {
//   mode: "login" | "signup";
// }

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// signupSchema is removed
// const signupSchema = z.object({
//   fullName: z.string().min(2, { message: "Full name is required." }),
//   email: z.string().email({ message: "Invalid email address." }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters." }),
//   role: z.enum(["student", "company", "college_admin", "platform_admin"]),
// });

type LoginFormValues = z.infer<typeof loginSchema>;
// SignupFormValues is removed
// type SignupFormValues = z.infer<typeof signupSchema>;

export function AuthForm() { // Removed mode prop
  const router = useRouter();
  // isLogin is no longer needed
  // const isLogin = mode === "login";
  // schema is now always loginSchema
  const schema = loginSchema;

  const form = useForm<LoginFormValues>({ // Type is now just LoginFormValues
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }, // Default values are for login
  });

  function onSubmit(values: LoginFormValues) { // Parameter type is now just LoginFormValues
    console.log(values);
    // In a real app, you'd handle authentication here.
    // For this example, we'll redirect to a default dashboard.
    // This should be replaced with actual auth logic and role-based redirection.
    router.push("/student/dashboard"); // Default redirect after login
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="inline-block mx-auto">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl font-headline">
            Welcome Back! {/* Title is now static */}
          </CardTitle>
          <CardDescription>
            Log in to continue to CampusConnect. {/* Description is now static */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* FullName field removed */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Role selection field removed */}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Log In {/* Button text is now static */}
              </Button>
            </form>
          </Form>
          {/* Link to signup page removed */}
          {/* <div className="mt-6 text-center text-sm">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-accent hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-accent hover:underline">
                  Log in
                </Link>
              </>
            )}
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
