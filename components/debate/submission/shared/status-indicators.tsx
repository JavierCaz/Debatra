interface StatusIndicatorsProps {
  hasContent: boolean;
  hasReferences: boolean;
}

export function StatusIndicators({
  hasContent,
  hasReferences,
}: StatusIndicatorsProps) {
  return (
    <div className="flex items-center space-x-1">
      {hasContent && (
        <div
          className="w-2 h-2 rounded-full bg-green-500"
          title="Has content"
        />
      )}
      {hasReferences && (
        <div
          className="w-2 h-2 rounded-full bg-blue-500"
          title="Has references"
        />
      )}
    </div>
  );
}
