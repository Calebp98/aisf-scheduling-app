import { createRSVP, deleteRSVP, getRSVPsByUser } from "@/db/rsvps";

type RSVPRequest = {
  sessionId: string;
  guestId: string;
  remove?: boolean;
};

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sessionId, guestId, remove = false } = (await req.json()) as RSVPRequest;
    
    console.log(`🎯 RSVP Request: ${remove ? 'REMOVE' : 'ADD'} | Guest: ${guestId} | Session: ${sessionId}`);
    
    // Validate inputs
    if (!sessionId || !guestId) {
      console.log("❌ Missing sessionId or guestId");
      return Response.json({ 
        success: false, 
        error: "Missing sessionId or guestId" 
      }, { status: 400 });
    }
    
    if (remove) {
      // Remove RSVP
      const deleted = await deleteRSVP(sessionId, guestId);
      
      if (deleted) {
        console.log("✅ RSVP removed successfully");
        return Response.json({ 
          success: true, 
          action: "removed",
          message: "RSVP removed successfully" 
        });
      } else {
        console.log("⚠️ RSVP not found for removal");
        return Response.json({ 
          success: false, 
          error: "RSVP not found" 
        }, { status: 404 });
      }
      
    } else {
      // Add RSVP
      const rsvpId = await createRSVP(sessionId, guestId);
      
      if (rsvpId) {
        console.log(`✅ RSVP created successfully: ${rsvpId}`);
        return Response.json({ 
          success: true, 
          action: "added",
          rsvpId,
          message: "RSVP added successfully" 
        });
      } else {
        console.log("❌ Failed to create RSVP (possibly duplicate)");
        return Response.json({ 
          success: false, 
          error: "Failed to create RSVP - possibly already exists" 
        }, { status: 409 });
      }
    }
    
  } catch (error) {
    console.error("💥 RSVP API Error:", error);
    return Response.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}