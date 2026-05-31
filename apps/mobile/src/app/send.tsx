import { useLocalSearchParams } from "expo-router";
import { SendScreen } from "@/features/send/SendScreen";

export default function Send() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  return <SendScreen tokenId={token} />;
}
