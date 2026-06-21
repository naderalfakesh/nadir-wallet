import React, { useState } from "react";
import { BottomSheet } from "@/components";
import { useSheets, type SheetRequest } from "@/providers/SheetProvider";
import { ReceiveSheet } from "./ReceiveSheet";
import { TxDetailSheet } from "./TxDetailSheet";
import { AccountsSheet, PickTokenSheet } from "./WalletSheets";
import { ScanSheet, SoonSheet, HowItWorksSheet, ThemeSheet } from "./InfoSheets";

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
    case "scan":
      return <ScanSheet close={close} />;
    case "soon":
      return <SoonSheet params={request.params} close={close} />;
    case "howItWorks":
      return <HowItWorksSheet close={close} />;
    case "theme":
      return <ThemeSheet close={close} />;
  }
}

export function SheetHost() {
  const { active, close } = useSheets();
  // Keep the last body mounted through the exit animation by deriving it during
  // render (only advancing when a new sheet opens).
  const [displayed, setDisplayed] = useState(active);
  if (active && active !== displayed) setDisplayed(active);

  return (
    <BottomSheet visible={!!active} onClose={close}>
      {displayed ? <SheetBody request={displayed} close={close} /> : null}
    </BottomSheet>
  );
}
