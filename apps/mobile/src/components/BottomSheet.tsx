import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";
import { useTranslation } from "@/i18n/useTranslation";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [rendered, setRendered] = useState(visible);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  if (visible && !rendered) setRendered(true);

  useEffect(() => {
    if (visible) {
      drag.set(0);
      progress.value = withTiming(1, { duration: 300 });
    } else if (rendered) {
      progress.value = withTiming(0, { duration: 230 }, (finished) => {
        if (finished) scheduleOnRN(setRendered, false);
      });
    }
  }, [visible, rendered, drag, progress]);

  const pan = usePanGesture({
    enabled: visible,
    activeOffsetY: 8,
    onUpdate: ({ translationY }) => {
      drag.set(Math.max(0, translationY));
    },
    onDeactivate: ({ canceled, translationY, velocityY }) => {
      if (!canceled && (translationY >= 96 || (translationY >= 18 && velocityY >= 850))) {
        scheduleOnRN(onClose);
      } else {
        drag.set(withSpring(0, { damping: 22, stiffness: 240 }));
      }
    },
  });
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height + drag.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * (1 - Math.min(drag.value / height, 1)),
  }));

  if (!rendered) return null;

  return (
    <Modal transparent visible={rendered} onRequestClose={onClose} animationType="none">
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={styles.backdropPressable}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t("common.a11y.closeSheet")}
          />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + theme.spacing.pad }, sheetStyle]}
        >
          <GestureDetector gesture={pan}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "flex-end" },
    backdrop: { position: "absolute", inset: 0, backgroundColor: alpha("#000", 0.55) },
    backdropPressable: { flex: 1 },
    sheet: {
      maxHeight: "88%",
      backgroundColor: theme.colors.bgGrad1,
      borderTopLeftRadius: theme.radius.sheet,
      borderTopRightRadius: theme.radius.sheet,
      borderTopWidth: 1,
      borderColor: theme.colors.hairlineStrong,
      paddingHorizontal: theme.spacing.pad,
    },
    handleArea: { height: 32, justifyContent: "center", alignItems: "center" },
    handle: {
      width: 40,
      height: 5,
      borderRadius: 99,
      backgroundColor: theme.colors.hairlineStrong,
    },
  });
