import { getEventByName } from "@/db/events";
import EventPage from "./event-page";
import { notFound } from "next/navigation";

export default async function Page(props: { params: { eventSlug: string } }) {
  const { eventSlug } = props.params;
  
  // Decode URL and convert slug back to event name
  let eventName;
  try {
    // First decode the URL
    const decoded = decodeURIComponent(eventSlug);
    // Then replace hyphens with spaces if needed
    eventName = decoded.replace(/-/g, " ");
  } catch (error) {
    // If decoding fails, just replace hyphens
    eventName = eventSlug.replace(/-/g, " ");
  }
  
  console.log(`🔍 Looking for event: "${eventName}" from slug: "${eventSlug}"`);
  
  const event = await getEventByName(eventName);
  
  if (!event) {
    console.log(`❌ Event not found: "${eventName}"`);
    notFound();
  }
  
  return <EventPage event={event} />;
}
