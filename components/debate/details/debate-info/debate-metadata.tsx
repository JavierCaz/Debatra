import { format } from "date-fns";
import { Calendar, Clock, FileText, Trophy, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { T } from "@/components/ui/translated-text";
import type { DebateWithDetails } from "@/types/debate";

interface DebateMetadataProps {
  debate: DebateWithDetails;
}

export function DebateMetadata({ debate }: DebateMetadataProps) {
  const getFormatLabel = (format: string) => {
    switch (format) {
      case "ONE_VS_ONE":
        return <T k="debate.info.format1v1" />;
      case "ONE_VS_MANY":
        return <T k="debate.info.format1vMany" />;
      case "MULTI_SIDED":
        return <T k="debate.info.formatMulti" />;
      default:
        return format;
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="metadata" className="border-b-0">
        <AccordionTrigger className="py-2 hover:no-underline hover:bg-muted/50 rounded-lg px-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <T k="debate.info.debateDetails" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-2 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium mb-2">
              <T k="debate.info.description" />
            </h3>
            <p className="text-sm text-muted-foreground">
              {debate.description}
            </p>
          </div>

          {/* Debate Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  <T k="debate.info.format" />
                </p>
                <p className="text-sm text-muted-foreground">
                  {getFormatLabel(debate.format)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  <T k="debate.info.participants" />
                </p>
                <p className="text-sm text-muted-foreground">
                  <T
                    k="debate.info.maxParticipants"
                    values={{ count: debate.maxParticipants }}
                  />
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  <T k="debate.info.turnsPerSide" />
                </p>
                <p className="text-sm text-muted-foreground">
                  {debate.turnsPerSide}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  <T k="debate.info.timeLimit" />
                </p>
                <p className="text-sm text-muted-foreground">
                  {debate.turnTimeLimit ? (
                    <T
                      k="debate.info.timeLimitValue"
                      values={{ hours: debate.turnTimeLimit }}
                    />
                  ) : (
                    <T k="debate.info.noLimit" />
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  <T k="debate.info.minReferences" />
                </p>
                <p className="text-sm text-muted-foreground">
                  {debate.minReferences}
                </p>
              </div>
            </div>

            {debate.winCondition && (
              <div className="flex items-start space-x-2">
                <Trophy className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    <T k="debate.info.winCondition" />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <T
                      k={`debate.winConditionType.${debate.winCondition.type}`}
                    />
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
                <p className="text-sm font-medium">
                  <T k="debate.info.created" />
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(debate.createdAt), "PPp")}
                </p>
              </div>
            </div>

            {debate.startedAt && (
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    <T k="debate.info.started" />
                  </p>
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
                  <p className="text-sm font-medium">
                    <T k="debate.info.completed" />
                  </p>
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
