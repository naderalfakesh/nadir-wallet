import React, { useEffect, useState } from "react";
import { BottomSheet } from "@/components";
import { useSheets, type SheetRequest } from "@/providers/SheetProvider";
import { AccountsSheet } from "./AccountsSheet";
import { CurrencySheet } from "./CurrencySheet";
import { NetworksSheet } from "./NetworksSheet";
import { NotificationsSheet } from "./NotificationsSheet";
import { PickTokenSheet } from "./PickTokenSheet";
import { PrivacySheet } from "./PrivacySheet";
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
    case "networks":
      return <NetworksSheet close={close} />;
    case "currency":
      return <CurrencySheet close={close} />;
    case "privacy":
      return <PrivacySheet close={close} />;
    case "notifications":
      return <NotificationsSheet close={close} />;
    case "theme":
      return <ThemeSheet close={close} />;
  }
}

export function SheetHost({ walletOpen }: { walletOpen: boolean }) {
  const { active, close } = useSheets();
  const { shown, mustClose } = gateSheet(walletOpen, active);
  // Keep the last sheet body mounted through the exit animation.
  const [displayed, setDisplayed] = useState(shown);
  if (shown && shown !== displayed) setDisplayed(shown);
  if (!walletOpen && displayed) setDisplayed(null);

  useEffect(() => {
    if (mustClose) close();
  }, [mustClose, close]);

  // Unmount outright when locked so the exit animation cannot overlap the lock screen.
  if (!walletOpen) return null;

  return (
    <BottomSheet visible={!!active} onClose={close}>
      {displayed ? <SheetBody request={displayed} close={close} /> : null}
    </BottomSheet>
  );
}
