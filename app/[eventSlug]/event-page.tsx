import { EventDisplay } from "./event";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { getDaysByEvent } from "@/db/days";
import { getSessionsByEvent } from "@/db/sessions";
import { getLocations } from "@/db/locations";
import { getGuests } from "@/db/guests";
import { getRSVPsByUser } from "@/db/rsvps";
import { Event } from "@/db/events";

export default async function EventPage(props: { event: Event }) {
  const { event } = props;
  const cookieStore = cookies();
  const currentUser = cookieStore.get("user")?.value;
  const [days, sessions, locations, guests, rsvps] = await Promise.all([
    getDaysByEvent(event.Name),
    getSessionsByEvent(event.Name),
    getLocations(),
    getGuests(),
    getRSVPsByUser(currentUser),
  ]);
  
  console.log(`🔍 Loading RSVPs for user: ${currentUser || 'none'} - Found ${rsvps.length} RSVPs`);
  days.forEach((day) => {
    const dayStartMillis = new Date(day.Start).getTime();
    const dayEndMillis = new Date(day.End).getTime();
    day.Sessions = sessions.filter((s) => {
      const sessionStartMillis = new Date(s["Start time"]).getTime();
      const sessionEndMillis = new Date(s["End time"]).getTime();
      return (
        dayStartMillis <= sessionStartMillis && dayEndMillis >= sessionEndMillis
      );
    });
  });
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventDisplay
        event={event}
        days={days}
        locations={locations}
        guests={guests}
        rsvps={rsvps}
      />
    </Suspense>
  );
}
