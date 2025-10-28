import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDebateById } from "@/app/actions/debates";
import { ArgumentsList } from "@/components/debate/arguments-list";
import { DebateMetadata } from "@/components/debate/debate-metadata";
import { Button } from "@/components/ui/button";

interface DebateDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DebateDetailPage({
  params,
}: DebateDetailPageProps) {
  const { id } = await params;
  const debate = await getDebateById(id);

  if (!debate) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/debates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Debates
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Metadata */}
        <div className="lg:col-span-1">
          <DebateMetadata debate={debate} />
        </div>

        {/* Main Content - Arguments */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Arguments</h2>
          <ArgumentsList debate={debate} />
        </div>
      </div>
    </div>
  );
}
