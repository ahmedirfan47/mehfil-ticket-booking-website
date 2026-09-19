import { redirect } from "next/navigation";

export default function ActivitiesPage() {
  redirect("/events?type=activity");
}