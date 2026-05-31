import { Redirect } from "expo-router";

// First launch lands on onboarding; once a wallet exists this will route
// straight to the locked app instead.
export default function Index() {
  return <Redirect href="/onboarding" />;
}
