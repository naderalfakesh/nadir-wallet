import { Redirect } from "expo-router";

// Unknown deep links go through the same entry routing as a normal launch.
export default function NotFound() {
  return <Redirect href="/" />;
}
