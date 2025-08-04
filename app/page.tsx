import SummaryPage from "./summary-page";
import EventPage from "./[eventSlug]/event-page";
import { getEvents } from "@/db/events";
import { CONSTS } from "@/utils/constants";

export default async function Home() {
  try {
    const events = await getEvents();
    
    // Filter out events missing required fields
    const validEvents = events.filter(event => 
      event.Name && event.Start && event.End
    );
    
    if (validEvents.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">
              No Events Found
            </h1>
            <p className="text-black mb-4">
              Please add events to your Airtable base with required fields:
            </p>
            <ul className="text-left text-black">
              <li>• Name (required)</li>
              <li>• Start date (required)</li>
              <li>• End date (required)</li>
              <li>• Description (optional)</li>
              <li>• Website (optional)</li>
            </ul>
          </div>
        </div>
      );
    }
    
    const sortedEvents = validEvents.sort((a, b) => {
      return new Date(a.Start).getTime() - new Date(b.Start).getTime();
    });
    
    if (CONSTS.MULTIPLE_EVENTS) {
      return <SummaryPage events={sortedEvents} />;
    } else {
      return <EventPage event={sortedEvents[0]} />;
    }
  } catch (error) {
    console.error('Error loading events:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">
            Connection Error
          </h1>
          <p className="text-black mb-4">
            Could not connect to Airtable. Please check:
          </p>
          <ul className="text-left text-black">
            <li>• Your API key in .env.local</li>
            <li>• Your Base ID in .env.local</li>
            <li>• That you have an &quot;Events&quot; table</li>
            <li>• That the Events table has data</li>
          </ul>
        </div>
      </div>
    );
  }
}
