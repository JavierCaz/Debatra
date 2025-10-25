interface Debate {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  _count?: {
    arguments: number;
  };
}

interface DebateListProps {
  debates: Debate[];
  type: "created" | "participated";
}

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function DebateList({ debates, type }: DebateListProps) {
  if (debates.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No {type === "created" ? "debates created" : "participations"} yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {debates.map((debate) => (
        <a
          key={debate.id}
          href={`/debates/${debate.id}`}
          className="block border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 flex-1">
              {debate.title}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                statusColors[debate.status as keyof typeof statusColors]
              }`}
            >
              {debate.status.replace("_", " ")}
            </span>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>
              {new Date(debate.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {debate._count && (
              <>
                <span className="mx-2">•</span>
                <span>{debate._count.arguments} arguments</span>
              </>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
