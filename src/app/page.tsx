
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseBusiness, ArrowRight, UserCheck, School, Building } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <header className="py-6 px-4 md:px-8 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold font-headline text-primary">
            <BriefcaseBusiness className="h-8 w-8 text-accent" />
            CampusConnect
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            {/* Sign Up button removed as per request */}
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-6xl font-bold font-headline mb-6">
          Welcome to <span className="text-accent">CampusConnect</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-12">
          Your all-in-one platform for bridging students, colleges, and companies for seamless campus placements and career opportunities.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-5xl mb-16">
          {[
            { title: "Student Portal", href: "/student/dashboard", icon: UserCheck, description: "Manage your profile, find jobs, and track applications." },
            { title: "Admin Dashboard", href: "/admin/dashboard", icon: School, description: "Oversee all platform activities, data, and users." },
            { title: "Company Portal", href: "/company/dashboard", icon: Building, description: "Post jobs, find talent, and schedule interviews." },
            { title: "College Portal", href: "/college/dashboard", icon: BriefcaseBusiness, description: "Track student placements and engage with companies." },
          ].map((item) => (
            <Card key={item.title} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="p-3 rounded-full bg-accent/10 text-accent mb-3">
                  <item.icon className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>{item.description}</CardDescription>
                <Button variant="outline" className="mt-4 w-full group" asChild>
                  <Link href={item.href}>
                    Go to Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Select a portal above to explore its features or log in to access your account.
        </p>
      </main>

      <footer className="py-8 text-center border-t">
        <p className="text-muted-foreground">&copy; {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
