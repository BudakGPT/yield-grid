import { redirect } from "next/navigation";

export default function LegacyRescuePage() {
  redirect("/marketplace?segment=processing");
}
