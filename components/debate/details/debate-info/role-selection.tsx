import type { ParticipantRole } from "@prisma";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleOption {
  value: ParticipantRole;
  label: string;
  taken: boolean;
}

interface RoleSelectionProps {
  availableRoles: RoleOption[];
  selectedRole: ParticipantRole;
  onRoleChange: (role: ParticipantRole) => void;
}

export function RoleSelection({
  availableRoles,
  selectedRole,
  onRoleChange,
}: RoleSelectionProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Roles</h4>
      <RadioGroup
        value={selectedRole}
        onValueChange={(value: "PROPOSER" | "OPPOSER") => onRoleChange(value)}
        className="flex gap-2"
      >
        {availableRoles.map((role) => (
          <div key={role.value} className="flex-1">
            <RadioGroupItem
              value={role.value}
              id={`role-${role.value}`}
              disabled={role.taken}
              className="sr-only"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor={`role-${role.value}`}
                    className={`
                      flex flex-col items-center justify-center rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all
                      whitespace-nowrap min-h-[2.5rem]
                      ${
                        selectedRole === role.value && !role.taken
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-popover hover:bg-accent"
                      }
                      ${
                        role.taken
                          ? "opacity-50 cursor-not-allowed border-dashed"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    <span>{role.label}</span>
                  </Label>
                </TooltipTrigger>
                {role.taken && (
                  <TooltipContent>
                    <p>This role is already taken</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
