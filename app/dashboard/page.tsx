import { Info, Shield, User } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth/options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl">
                Welcome, {session.user.name || session.user.email}!
              </CardTitle>
            </div>
            <CardDescription>
              This is a protected page. Only authenticated users can see this.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {session.user.name ? "Name provided" : "Email only"}
              </Badge>
              <Badge variant="outline">{session.user.email}</Badge>
              {session.user.image && (
                <Badge variant="outline">Has profile image</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Your Session Information</AlertTitle>
          <AlertDescription>
            <pre className="text-sm mt-2 overflow-auto bg-muted/50 p-4 rounded-md w-full">
              {JSON.stringify(session, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>

        {/* Additional dashboard cards can go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You are successfully authenticated and have access to this
                protected dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">
                  {session.user.name || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{session.user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Session expires:</span>
                <span className="font-medium">
                  {session.expires
                    ? new Date(session.expires).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
