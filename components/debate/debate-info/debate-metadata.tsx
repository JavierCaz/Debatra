import { format } from "date-fns";
import { Calendar, Clock, FileText, Trophy, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { DebateWithDetails } from "@/types/debate";

interface DebateMetadataProps {
  debate: DebateWithDetails;
}

export function DebateMetadata({ debate }: DebateMetadataProps) {
  const getFormatLabel = (format: string) => {
    switch (format) {
      case "ONE_VS_ONE":
        return "1v1";
      case "ONE_VS_MANY":
        return "1 vs Many";
      case "MULTI_SIDED":
        return "Multi-sided";
      default:
        return format;
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="metadata" className="border-b-0">
        <AccordionTrigger className="py-2 hover:no-underline hover:bg-muted/50 rounded-lg px-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            Debate details
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-2 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">
              {debate.description}
            </p>
          </div>

          {/* Debate Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Format</p>
                <p className="text-sm text-muted-foreground">
                  {getFormatLabel(debate.format)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-sm text-muted-foreground">
                  Max {debate.maxParticipants}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Turns per side</p>
                <p className="text-sm text-muted-foreground">
                  {debate.turnsPerSide}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time limit</p>
                <p className="text-sm text-muted-foreground">
                  {debate.turnTimeLimit
                    ? `${debate.turnTimeLimit}h`
                    : "No limit"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Min. references</p>
                <p className="text-sm text-muted-foreground">
                  {debate.minReferences}
                </p>
              </div>
            </div>

            {debate.winCondition && (
              <div className="flex items-start space-x-2">
                <Trophy className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Win condition</p>
                  <p className="text-sm text-muted-foreground">
                    {debate.winCondition.type.replace("_", " ")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-start space-x-2">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(debate.createdAt), "PPp")}
                </p>
              </div>
            </div>

            {debate.startedAt && (
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Started</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(debate.startedAt), "PPp")}
                  </p>
                </div>
              </div>
            )}

            {debate.completedAt && (
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(debate.completedAt), "PPp")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
