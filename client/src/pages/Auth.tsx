import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";
import { useBars } from "@/context/BarContext";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { login, signup } = useBars();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(username, password);
      toast({
        title: "Welcome back!",
        description: "You're now logged in.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signup(username, password);
      toast({
        title: "Account created!",
        description: "Welcome to Orphan Bars. Start dropping heat.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="text-primary h-10 w-10" />
          <span className="font-display font-bold text-3xl tracking-tighter">ORPHAN BARS</span>
        </div>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Join the community of lyricists. Share your bars, get feedback, and build your catalog.
        </p>
      </div>

      <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-sm">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-t-lg rounded-b-none bg-secondary/50 p-0 h-14">
            <TabsTrigger 
              value="login" 
              className="h-full rounded-none data-[state=active]:bg-background data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary transition-all font-bold"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="h-full rounded-none data-[state=active]:bg-background data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary transition-all font-bold"
            >
              Create Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your rhyme book.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input 
                    id="login-username" 
                    data-testid="input-login-username"
                    placeholder="SpitFire_99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    data-testid="input-login-password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  data-testid="button-login"
                  className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Start your journey as a lyricist today.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input 
                    id="signup-username" 
                    data-testid="input-signup-username"
                    placeholder="SpitFire_99" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    data-testid="input-signup-password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-secondary/30 border-border/50"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  data-testid="button-signup"
                  className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        By continuing, you agree to our <span className="underline cursor-pointer hover:text-primary">Terms of Service</span> and <span className="underline cursor-pointer hover:text-primary">Privacy Policy</span>.
      </p>
    </div>
  );
}
