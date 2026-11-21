import * as Haptics from "expo-haptics";

export const haptics = {
  selection: () => void Haptics.selectionAsync().catch(() => undefined),
  success: () =>
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  error: () =>
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined),
};
