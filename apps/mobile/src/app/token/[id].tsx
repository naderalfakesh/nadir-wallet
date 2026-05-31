import { useLocalSearchParams } from "expo-router";
import { TokenDetailScreen } from "@/features/token/TokenDetailScreen";

export default function TokenDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TokenDetailScreen id={id} />;
}
