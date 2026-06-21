export type SecurityTier = "excellent" | "actionNeeded" | "atRisk";

export interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  sub: string;
  onPress?: () => void;
  toggle?: () => void;
}
