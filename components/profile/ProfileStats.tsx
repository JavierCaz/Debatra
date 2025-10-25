interface ProfileStatsProps {
  stats: {
    debatesCreated: number;
    debatesParticipated: number;
    totalArguments: number;
    upvotesReceived: number;
    concessionsMade: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    {
      label: "Debates Created",
      value: stats.debatesCreated,
      icon: "🎯",
      color: "blue",
    },
    {
      label: "Participated In",
      value: stats.debatesParticipated,
      icon: "💬",
      color: "green",
    },
    {
      label: "Arguments Made",
      value: stats.totalArguments,
      icon: "📝",
      color: "purple",
    },
    {
      label: "Upvotes Received",
      value: stats.upvotesReceived,
      icon: "👍",
      color: "orange",
    },
    {
      label: "Concessions Made",
      value: stats.concessionsMade,
      icon: "🤝",
      color: "pink",
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-white shadow rounded-lg p-6 text-center"
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
