export type HomeQuickActionIcon = "receive" | "send" | "swap" | "trend";

export interface HomeQuickAction {
  icon: HomeQuickActionIcon;
  label: string;
  onPress: () => void;
  primary?: boolean;
}
