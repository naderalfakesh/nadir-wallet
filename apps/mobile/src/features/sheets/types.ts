import type { SheetName, SheetParams } from "@/providers/SheetProvider";

export interface SheetBodyProps<K extends SheetName = SheetName> {
  params: SheetParams[K];
  close: () => void;
}

export interface SheetCloseProps {
  close: () => void;
}
