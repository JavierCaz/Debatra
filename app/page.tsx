import { BookCheck, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth/options";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Evidence-Based Debates
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Engage in structured, asynchronous debates with mandatory references
            and clear win conditions. Quality over speed.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {session ? (
              <>
                <Button asChild size="lg">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/debates">Browse Debates</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <BookCheck className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Evidence-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All arguments must be backed by credible references and sources.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-lg">Turn-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Asynchronous format allows for thoughtful, well-researched
                responses.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-2">
                <Trophy className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Clear Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Defined win conditions and community voting determine winners.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
