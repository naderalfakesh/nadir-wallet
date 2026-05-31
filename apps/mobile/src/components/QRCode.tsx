import React from "react";
import QR from "react-native-qrcode-svg";

// Real QR for the receive address, rendered via react-native-svg (already a
// dependency). Visual styling matches the design's white tile.
export function QRCode({
  value,
  size = 188,
  fg = "#0c0e12",
  bg = "#fff",
}: {
  value: string;
  size?: number;
  fg?: string;
  bg?: string;
}) {
  return <QR value={value || "nadirwallet"} size={size} color={fg} backgroundColor={bg} ecl="M" />;
}
