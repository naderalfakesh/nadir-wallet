import { t } from "./index";

// Thin hook so screens depend on a hook rather than the module directly,
// leaving room for a locale-aware implementation later.
export function useTranslation() {
  return { t };
}
