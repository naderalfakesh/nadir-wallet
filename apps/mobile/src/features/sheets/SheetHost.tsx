import React, { useState } from "react";
import { BottomSheet } from "@/components";
import { useSheets, type SheetName } from "@/providers/SheetProvider";
import type { SheetBodyProps } from "./types";
import { ReceiveSheet } from "./ReceiveSheet";
import { TxDetailSheet } from "./TxDetailSheet";
import { AccountsSheet, PickTokenSheet } from "./WalletSheets";
import { ScanSheet, SoonSheet, HowItWorksSheet, ThemeSheet } from "./InfoSheets";

const REGISTRY: Record<SheetName, React.ComponentType<SheetBodyProps>> = {
  receive: ReceiveSheet,
  txDetail: TxDetailSheet,
  accounts: AccountsSheet,
  pickToken: PickTokenSheet,
  scan: ScanSheet,
  soon: SoonSheet,
  howItWorks: HowItWorksSheet,
  theme: ThemeSheet,
};

export function SheetHost() {
  const { active, close } = useSheets();
  // Keep the last body mounted through the exit animation by deriving it during
  // render (only advancing when a new sheet opens).
  const [displayed, setDisplayed] = useState(active);
  if (active && active !== displayed) setDisplayed(active);

  const Body = displayed ? REGISTRY[displayed.name] : null;

  return (
    <BottomSheet visible={!!active} onClose={close}>
      {Body && displayed ? <Body params={displayed.params} close={close} /> : null}
    </BottomSheet>
  );
}
