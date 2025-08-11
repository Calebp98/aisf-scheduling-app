import { EventDisplay } from "./event";
import { Suspense } from "react";
import { getDaysByEvent } from "@/db/days";
import { getSessionsByEvent } from "@/db/sessions";
import { getLocations } from "@/db/locations";
import { getGuests } from "@/db/guests";
import { Event } from "@/db/events";

export default async function EventPage(props: { event: Event }) {
  const { event } = props;
  
  // Load server-side data (no user-specific data since we use Firebase auth)
  const [days, sessions, locations, guests] = await Promise.all([
    getDaysByEvent(event.Name),
    getSessionsByEvent(event.Name),
    getLocations(),
    getGuests(),
  ]);
  
  // Process day sessions on server side
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
        rsvps={[]} // RSVPs will be loaded client-side now
      />
    </Suspense>
  );
}
