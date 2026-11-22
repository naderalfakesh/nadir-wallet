import React from "react";
import { Row, Toggle } from "@/components";

interface ToggleRowProps {
  title: string;
  sub?: React.ReactNode;
  on: boolean;
  onChange: () => void;
  left?: React.ReactNode;
  last?: boolean;
}

export function ToggleRow({ title, sub, on, onChange, left, last }: ToggleRowProps) {
  return (
    <Row
      left={left}
      title={title}
      sub={sub}
      last={last}
      right={<Toggle label={title} on={on} onChange={onChange} />}
    />
  );
}
