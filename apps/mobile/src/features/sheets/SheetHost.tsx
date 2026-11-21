import React, { useEffect, useState } from "react";
import { BottomSheet } from "@/components";
import { useSheets, type SheetRequest } from "@/providers/SheetProvider";
import { AccountsSheet } from "./AccountsSheet";
import { HowItWorksSheet } from "./HowItWorksSheet";
import { PickTokenSheet } from "./PickTokenSheet";
import { ReceiveSheet } from "./ReceiveSheet";
import { gateSheet } from "./sheetGate";
import { SoonSheet } from "./SoonSheet";
import { ThemeSheet } from "./ThemeSheet";
import { TxDetailSheet } from "./TxDetailSheet";

function SheetBody({ request, close }: { request: SheetRequest; close: () => void }) {
  switch (request.name) {
    case "receive":
      return <ReceiveSheet params={request.params} close={close} />;
    case "txDetail":
      return <TxDetailSheet params={request.params} close={close} />;
    case "accounts":
      return <AccountsSheet close={close} />;
    case "pickToken":
      return <PickTokenSheet params={request.params} close={close} />;
    case "soon":
      return <SoonSheet params={request.params} close={close} />;
    case "howItWorks":
      return <HowItWorksSheet close={close} />;
    case "theme":
      return <ThemeSheet close={close} />;
  }
}

/** `walletOpen` must follow the wallet route group's guard (see routeAccess). */
export function SheetHost({ walletOpen }: { walletOpen: boolean }) {
  const { active, close } = useSheets();
  const { shown, mustClose } = gateSheet(walletOpen, active);
  // Keep the last body mounted through the exit animation by deriving it during
  // render (only advancing when a new sheet opens).
  const [displayed, setDisplayed] = useState(shown);
  if (shown && shown !== displayed) setDisplayed(shown);
  if (!walletOpen && displayed) setDisplayed(null);

  useEffect(() => {
    if (mustClose) close();
  }, [mustClose, close]);

  // Unmount the modal outright when locked: an exit animation would leave
  // wallet details on top of the lock screen for its duration.
  if (!walletOpen) return null;

  return (
    <BottomSheet visible={!!active} onClose={close}>
      {displayed ? <SheetBody request={displayed} close={close} /> : null}
    </BottomSheet>
  );
}
