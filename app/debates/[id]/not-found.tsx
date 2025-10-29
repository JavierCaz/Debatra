import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h1 className="text-3xl font-bold mb-2">Debate Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The debate you're looking for doesn't exist or has been removed.
      </p>
      <Link href="/debates">
        <Button>Back to Debates</Button>
      </Link>
    </div>
  );
}
