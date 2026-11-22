import type { IconName } from "@/components/Icon";

export type SecurityTier = "excellent" | "actionNeeded" | "atRisk";

export interface SecurityRowModel {
  key: string;
  icon: IconName;
  tone: "neutral" | "accent" | "pos" | "warn";
  label: string;
  sub: string;
  onPress?: () => void;
  toggle?: { on: boolean; onChange: () => void };
}
