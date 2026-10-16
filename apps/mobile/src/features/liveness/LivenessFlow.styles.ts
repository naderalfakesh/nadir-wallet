import { StyleSheet } from "react-native";

export const livenessStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
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
  stepPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  headerSpacer: {
    width: 36,
  },
  badgeWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  prompt: {
    textAlign: "center",
  },
  resultBody: {
    textAlign: "center",
    marginTop: 5,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
  },
  scopeNote: {
    textAlign: "center",
    marginTop: 14,
  },
});
