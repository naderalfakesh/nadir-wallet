const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "Today" / "Yesterday" / "May 28", plus the same label with the time, relative to `now`. */
export function formatWhenDay(ts: number, now: Date): { day: string; when: string } {
  const d = new Date(ts);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const day = sameDay(d, now)
    ? "Today"
    : sameDay(d, yesterday)
      ? "Yesterday"
      : `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return { day, when: `${day} · ${h}:${String(m).padStart(2, "0")} ${ampm}` };
}
