import { areUsersFreeAtTime, getAllMeetings } from "@/db/meetings";
import { getAllRSVPs } from "@/db/rsvps";
import { getSessionsByEvent } from "@/db/sessions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { uid1, uid2 } = await req.json();
    
    if (!uid1 || !uid2) {
      return Response.json({ 
        success: false, 
        error: "Both user IDs required" 
      }, { status: 400 });
    }
    
    console.log(`🔍 Checking availability for users ${uid1} and ${uid2}`);
    
    // Get all sessions to check time slots
    const sessions = await getSessionsByEvent("Vegas AI Security Forum '25");
    
    // Get RSVPs to see what both users are attending
    const allRSVPs = await getAllRSVPs();
    const user1RSVPs = allRSVPs.filter(rsvp => rsvp["Firebase UID"] === uid1);
    const user2RSVPs = allRSVPs.filter(rsvp => rsvp["Firebase UID"] === uid2);
    
    // Get confirmed meetings to check what time slots are already booked
    const allMeetings = await getAllMeetings();
    const confirmedMeetings = allMeetings.filter(meeting => meeting.Status === "confirmed");
    
    const availableSlots = [];
    
    // Check each session time slot
    for (const session of sessions) {
      const startTime = session["Start time"];
      const endTime = session["End time"];
      
      // Check if either user has RSVP'd to this session
      const user1HasRSVP = user1RSVPs.some(rsvp => rsvp.Session?.includes(session.ID));
      const user2HasRSVP = user2RSVPs.some(rsvp => rsvp.Session?.includes(session.ID));
      
      // Skip if either user is attending this session
      if (user1HasRSVP || user2HasRSVP) {
        continue;
      }
      
      // Check if either user has a confirmed meeting at this time
      const user1HasMeeting = confirmedMeetings.some(meeting =>
        (meeting["Requester UID"] === uid1 || meeting["Requestee UID"] === uid1) &&
        meeting["Start Time"] === startTime &&
        meeting["End Time"] === endTime
      );
      
      const user2HasMeeting = confirmedMeetings.some(meeting =>
        (meeting["Requester UID"] === uid2 || meeting["Requestee UID"] === uid2) &&
        meeting["Start Time"] === startTime &&
        meeting["End Time"] === endTime
      );
      
      // Skip if either user has a meeting at this time
      if (user1HasMeeting || user2HasMeeting) {
        continue;
      }
      
      // This slot is available for both users
      availableSlots.push({
        startTime,
        endTime,
        sessionTitle: session.Title || "Free time",
        sessionId: session.ID
      });
    }
    
    console.log(`✅ Found ${availableSlots.length} available slots for both users`);
    
    return Response.json({ 
      success: true, 
      availableSlots,
      user1RSVPCount: user1RSVPs.length,
      user2RSVPCount: user2RSVPs.length
    });
    
  } catch (error) {
    console.error("💥 Availability API Error:", error);
    return Response.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}