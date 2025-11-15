import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DisabledStateProps {
  title: string;
  message: string;
  icon?: React.ComponentType<any>;
}

export function DisabledState({
  title,
  message,
  icon: Icon = Lock,
}: DisabledStateProps) {
  return (
    <Card className="border-dashed bg-muted/50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className="h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </CardContent>
    </Card>
  );
}
