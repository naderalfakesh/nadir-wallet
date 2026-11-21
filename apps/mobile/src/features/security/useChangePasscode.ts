import { useRef, useState } from "react";
import { usePinEntry } from "@/features/auth/usePinEntry";
import { useApp } from "@/providers/AppProvider";

export type Stage = "current" | "new" | "confirm" | "done";
export type EntryError = "incorrect" | "mismatch" | "saveFailed";

export function useChangePasscode() {
  const { verifyPasscode, setPasscode, logEvent } = useApp();
  const [stage, setStage] = useState<Stage>("current");
  const [first, setFirst] = useState("");
  const [entryError, setEntryError] = useState<EntryError>("incorrect");
  // Hashing and the keychain write take a moment; ignore keys until it settles
  // so a re-entered PIN can't start a second save or log the change twice.
  const saving = useRef(false);

  const { pin, error, shake, press, clear } = usePinEntry({
    onComplete: (entered, helpers) => {
      if (stage === "current") {
        void verifyPasscode(entered).then((ok) => {
          if (ok) {
            helpers.clear();
            setStage("new");
          } else {
            setEntryError("incorrect");
            helpers.fail();
          }
        });
      } else if (stage === "new") {
        setFirst(entered);
        helpers.clear();
        setStage("confirm");
      } else if (stage === "confirm") {
        if (entered === first) {
          if (saving.current) return;
          saving.current = true;
          setPasscode(entered).then(
            () => {
              saving.current = false;
              helpers.clear();
              logEvent("passcode_changed");
              setStage("done");
            },
            // The old PIN stays in place; start the new-PIN entry over.
            () => {
              saving.current = false;
              setEntryError("saveFailed");
              helpers.fail(() => {
                setFirst("");
                setStage("new");
              });
            },
          );
        } else {
          setEntryError("mismatch");
          helpers.fail(() => {
            setFirst("");
            setStage("new");
          });
        }
      }
    },
  });

  const goBack = () => {
    clear();
    setStage(stage === "confirm" ? "new" : "current");
  };

  const pressKey = (key: Parameters<typeof press>[0]) => {
    if (!saving.current) press(key);
  };

  return { stage, entryError, pin, error, shake, pressKey, goBack };
}
