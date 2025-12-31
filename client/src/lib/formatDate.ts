import { formatDistanceToNow } from "date-fns";

export function formatTimestamp(date: Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
