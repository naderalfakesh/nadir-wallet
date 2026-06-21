import React, { useEffect, useState } from "react";
import { Animated, Dimensions, Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { alpha, useTheme } from "@/theme";

// Start the sheet a full screen-height below so the open animation always
// slides up from true offscreen, on any device.
const OFFSCREEN = Dimensions.get("window").height;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [rendered, setRendered] = useState(visible);
  const [translateY] = useState(() => new Animated.Value(OFFSCREEN));
  const [backdrop] = useState(() => new Animated.Value(0));

  // Mount during render so the open animation runs from a true offscreen start;
  // unmount happens after the close animation finishes.
  if (visible && !rendered) setRendered(true);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else if (rendered) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: OFFSCREEN, duration: 240, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setRendered(false));
    }
  }, [visible, rendered, translateY, backdrop]);

  if (!rendered) return null;

  return (
    <Modal transparent visible={rendered} onRequestClose={onClose} animationType="none">
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha("#000", 0.55),
            opacity: backdrop,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close sheet" />
        </Animated.View>
        <Animated.View
          style={{
            transform: [{ translateY }],
            maxHeight: "88%",
            backgroundColor: theme.colors.bgGrad1,
            borderTopLeftRadius: theme.radius.sheet,
            borderTopRightRadius: theme.radius.sheet,
            borderTopWidth: 1,
            borderColor: theme.colors.hairlineStrong,
            paddingHorizontal: theme.spacing.pad,
            paddingTop: 12,
            paddingBottom: insets.bottom + theme.spacing.pad,
          }}
        >
          <View
            style={{
              width: 40,
              height: 5,
              borderRadius: 99,
              backgroundColor: theme.colors.hairlineStrong,
              alignSelf: "center",
              marginBottom: 14,
            }}
          />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
