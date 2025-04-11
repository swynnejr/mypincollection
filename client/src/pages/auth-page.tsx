import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { PinOff } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const { loginMutation, registerMutation, user } = useAuth();
  const { theme } = useTheme();
  const [_, navigate] = useLocation();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      avatarUrl: ""
    },
  });

  // Reset form fields when switching between login and register
  useEffect(() => {
    if (authType === "login") {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
  }, [authType, loginForm, registerForm]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Ensure form validation
    const isValid = await registerForm.trigger();
    
    if (!isValid) {
      console.log("Form validation failed:", registerForm.formState.errors);
      return;
    }
    
    // Get form data directly from the form
    const formData = registerForm.getValues();
    console.log("Register form values:", formData);
    
    // Create cleaned data for submission
    const userData = {
      username: formData.username,
      password: formData.password,
      displayName: formData.displayName || "",
      email: formData.email || "",
      avatarUrl: formData.avatarUrl || ""
    };
    
    console.log("Final register data:", userData);
    
    // Check if username is empty
    if (!userData.username) {
      registerForm.setError("username", { 
        type: "manual", 
        message: "Username is required" 
      });
      return;
    }
    
    // Submit the data
    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Hero Section */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-primary/10">
        <div className="flex items-center gap-2">
          <PinOff className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold">Pin Portfolio</span>
        </div>
        
        <div className="space-y-5 max-w-md">
          <h1 className="text-4xl font-bold">Build Your Disney Enamel Pin Collection</h1>
          <p className="text-lg text-muted-foreground">
            Track your collection, discover new pins, connect with other collectors, and stay updated with current values.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <span>Track pins you have and want</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <span>View current market values from eBay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <span>Trade with other collectors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
              <span>Choose from multiple themes</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Pin Portfolio
          </div>
          <ThemeSelector />
        </div>
      </div>

      {/* Auth Forms */}
      <div className="flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <PinOff className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">Pin Portfolio</span>
            </div>
            <ThemeSelector />
          </div>

          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setAuthType("login")}
                className={`px-4 py-2 text-sm ${authType === "login" ? "bg-primary text-white" : "bg-transparent"}`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthType("register")}
                className={`px-4 py-2 text-sm ${authType === "register" ? "bg-primary text-white" : "bg-transparent"}`}
              >
                Register
              </button>
            </div>
          </div>

          {authType === "login" ? (
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
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
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setAuthType("register")}
                    className="text-primary underline"
                  >
                    Register
                  </button>
                </p>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Enter your details to start your pin collection journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={onRegisterSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="username" className="text-sm font-medium">Username</label>
                      <input
                        id="username"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="username"
                        {...registerForm.register("username", { required: true })}
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm font-medium text-destructive">Username is required</p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="displayName" className="text-sm font-medium">Display Name</label>
                      <input
                        id="displayName"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Display Name"
                        {...registerForm.register("displayName")}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <input
                        id="email"
                        type="email"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="email@example.com"
                        {...registerForm.register("email")}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="password" className="text-sm font-medium">Password</label>
                      <input
                        id="password"
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="••••••••"
                        {...registerForm.register("password", { required: true, minLength: 6 })}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm font-medium text-destructive">Password is required (min 6 characters)</p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="••••••••"
                        {...registerForm.register("confirmPassword", { 
                          required: true,
                          validate: value => value === registerForm.getValues("password") || "Passwords don't match"
                        })}
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-sm font-medium text-destructive">
                          {registerForm.formState.errors.confirmPassword.message || "Please confirm your password"}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Register"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => setAuthType("login")}
                    className="text-primary underline"
                  >
                    Login
                  </button>
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
