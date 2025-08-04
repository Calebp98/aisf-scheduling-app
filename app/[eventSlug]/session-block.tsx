import clsx from "clsx";
import { ClockIcon, PlusIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import { Session } from "@/db/sessions";
import { Day } from "@/db/days";
import { Location } from "@/db/locations";
import { Guest } from "@/db/guests";
import { RSVP } from "@/db/rsvps";
import { Tooltip } from "./tooltip";
import { DateTime } from "luxon";
import Link from "next/link";
import { useContext, useState } from "react";
import { CurrentUserModal } from "../modals";
import { UserContext } from "../context";
import { useScreenWidth } from "@/utils/hooks";
import { useRSVP } from "@/hooks/useRSVP";

export function SessionBlock(props: {
  eventName: string;
  session: Session;
  location: Location;
  day: Day;
  guests: Guest[];
  rsvpsForEvent: RSVP[];
}) {
  const { eventName, session, location, day, guests, rsvpsForEvent } = props;
  const startTime = new Date(session["Start time"]).getTime();
  const endTime = new Date(session["End time"]).getTime();
  const sessionLength = endTime - startTime;
  const numHalfHours = sessionLength / 1000 / 60 / 30;
  const isBlank = !session.Title;
  
  const isBookable =
    !!isBlank &&
    !!location.Bookable &&
    location.Name === "Community Breakout Room" &&
    startTime > new Date().getTime() &&
    startTime >= new Date(day["Start bookings"]).getTime() &&
    startTime < new Date(day["End bookings"]).getTime();
    
  return isBookable ? (
    <BookableSessionCard
      eventName={eventName}
      session={session}
      location={location}
      numHalfHours={numHalfHours}
    />
  ) : (
    <>
      {isBlank ? (
        <BlankSessionCard numHalfHours={numHalfHours} />
      ) : (
        <RealSessionCard
          session={session}
          location={location}
          numHalfHours={numHalfHours}
          guests={guests}
          rsvpsForEvent={rsvpsForEvent}
        />
      )}
    </>
  );
}

export function BookableSessionCard(props: {
  location: Location;
  session: Session;
  numHalfHours: number;
  eventName: string;
}) {
  const { numHalfHours, session, location, eventName } = props;
  const dayParam = DateTime.fromISO(session["Start time"])
    .setZone("America/Los_Angeles")
    .toFormat("MM-dd");
  const timeParam = DateTime.fromISO(session["Start time"])
    .setZone("America/Los_Angeles")
    .toFormat("HH:mm");
  const eventSlug = eventName.replace(" ", "-");
  
  return (
    <div className={`row-span-${numHalfHours} my-0.5 min-h-10`}>
      <Link
        className="rounded font-mono h-full w-full bg-white border border-black hover:bg-gray-100 flex items-center justify-center"
        href={`/${eventSlug}/add-session?location=${location.Name}&time=${timeParam}&day=${dayParam}`}
      >
        <PlusIcon className="h-4 w-4 text-black" />
      </Link>
    </div>
  );
}

function BlankSessionCard(props: { numHalfHours: number }) {
  const { numHalfHours } = props;
  return <div className={`row-span-${numHalfHours} my-0.5 min-h-12`} />;
}

export function RealSessionCard(props: {
  session: Session;
  numHalfHours: number;
  location: Location;
  guests: Guest[];
  rsvpsForEvent: RSVP[];
}) {
  const { session, numHalfHours, location, guests, rsvpsForEvent } = props;
  const { user: currentUser } = useContext(UserContext);
  
  // Check if user has RSVP'd to this session
  const userHasRSVPd = currentUser ? rsvpsForEvent.some(rsvp => 
    rsvp.Session?.includes(session.ID) && rsvp.Guest?.includes(currentUser)
  ) : false;
  
  const { isRSVPd, isLoading, toggleRSVP } = useRSVP(session.ID, userHasRSVPd);
  
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const screenWidth = useScreenWidth();
  const onMobile = screenWidth < 640;

  const handleClick = () => {
    setRsvpModalOpen(true);
  };

  const handleRSVP = async () => {
    if (!currentUser) {
      console.log("❌ No user selected for RSVP");
      return;
    }
    
    const success = await toggleRSVP(currentUser);
    if (success) {
      setRsvpModalOpen(false);
    }
  };

  const formattedHostNames = session["Host name"]?.join(", ") ?? "No hosts";
  const numRSVPs = (session["Num RSVPs"] ?? 0) + (rsvpsForEvent.length || 0);
  
  // Visual styling based on RSVP status
  const isUserRSVPd = isRSVPd || userHasRSVPd;
  const isHost = currentUser && session.Hosts?.includes(currentUser);
  
  const SessionInfoDisplay = () => (
    <>
      <h1 className="text-lg font-bold leading-tight text-black">{session.Title}</h1>
      <p className="text-xs text-black mb-2 mt-1">
        Hosted by {formattedHostNames}
      </p>
      <p className="text-sm whitespace-pre-line text-black">{session.Description}</p>
      <div className="flex justify-between mt-2 gap-4 text-xs text-black">
        <div className="flex gap-1">
          <UserIcon className="h-4 w-4" />
          <span>
            {numRSVPs} RSVPs (max capacity {session.Capacity})
          </span>
        </div>
        <div className="flex gap-1">
          <ClockIcon className="h-4 w-4" />
          <span>
            {DateTime.fromISO(session["Start time"])
              .setZone("America/Los_Angeles")
              .toFormat("h:mm a")}{" "}
            -{" "}
            {DateTime.fromISO(session["End time"])
              .setZone("America/Los_Angeles")
              .toFormat("h:mm a")}
          </span>
        </div>
      </div>
    </>
  );
  
  return (
    <Tooltip
      content={onMobile ? undefined : <SessionInfoDisplay />}
      className={`row-span-${numHalfHours} my-0.5 overflow-hidden group`}
    >
      <CurrentUserModal
        close={() => setRsvpModalOpen(false)}
        open={rsvpModalOpen}
        rsvp={handleRSVP}
        guests={guests}
        rsvpd={isUserRSVPd}
        sessionInfoDisplay={<SessionInfoDisplay />}
        isLoading={isLoading}
      />
      <button
        className={clsx(
          "py-1 px-1 rounded font-mono h-full min-h-10 cursor-pointer flex flex-col relative w-full border-2 transition-colors",
          isUserRSVPd || isHost
            ? "bg-black text-white border-black" // User RSVP'd or is host - dark
            : "bg-white text-black border-black hover:bg-gray-100" // Not RSVP'd - light
        )}
        onClick={handleClick}
        disabled={isLoading}
      >
        <p
          className={clsx(
            "font-medium text-xs leading-[1.15] text-left",
            numHalfHours > 1 ? "line-clamp-2" : "line-clamp-1"
          )}
        >
          {session.Title}
        </p>
        <p
          className={clsx(
            "text-[10px] leading-tight text-left",
            numHalfHours > 2
              ? "line-clamp-3"
              : numHalfHours > 1
              ? "line-clamp-2"
              : "line-clamp-1"
          )}
        >
          {formattedHostNames}
        </p>
        <div
          className={clsx(
            "absolute py-[1px] px-1 rounded-tl text-[10px] bottom-0 right-0 flex gap-0.5 items-center",
            isUserRSVPd || isHost
              ? "bg-white text-black" // Dark session gets light badge
              : "bg-black text-white"  // Light session gets dark badge
          )}
        >
          <UserIcon className="h-2.5 w-2.5" />
          {numRSVPs}
          {isLoading && <span className="ml-1">...</span>}
        </div>
        {isUserRSVPd && (
          <div className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full m-1" 
               title="You are RSVP'd to this session" />
        )}
      </button>
    </Tooltip>
  );
}