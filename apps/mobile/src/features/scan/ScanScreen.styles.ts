import { StyleSheet } from "react-native";

export const scanStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  reticleWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  reticle: {
    width: 240,
    height: 240,
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
  },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  headerSpacer: {
    width: 36,
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
  },
  hint: {
    textAlign: "center",
  },
});
