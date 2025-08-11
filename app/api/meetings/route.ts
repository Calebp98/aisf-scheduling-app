import { getMeetingsForUser, createMeetingRequest, confirmMeeting, declineMeeting, deleteMeeting } from "@/db/meetings";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, ...params } = body;
    
    switch (action) {
      case "get-user-meetings": {
        const { firebaseUID } = params;
        if (!firebaseUID) {
          return Response.json({ success: false, error: "Firebase UID required" }, { status: 400 });
        }
        
        const meetings = await getMeetingsForUser(firebaseUID);
        return Response.json({ success: true, meetings });
      }
      
      case "create-request": {
        const { requesterUID, requesteeUID, startTime, endTime, title, notes } = params;
        
        if (!requesterUID || !requesteeUID || !startTime || !endTime) {
          return Response.json({ 
            success: false, 
            error: "Missing required fields" 
          }, { status: 400 });
        }
        
        const meetingId = await createMeetingRequest(
          requesterUID, 
          requesteeUID, 
          startTime, 
          endTime, 
          title, 
          notes
        );
        
        if (meetingId) {
          return Response.json({ 
            success: true, 
            meetingId,
            message: "Meeting request sent" 
          });
        } else {
          return Response.json({ 
            success: false, 
            error: "Failed to create meeting request - time may be already booked" 
          }, { status: 409 });
        }
      }
      
      case "confirm": {
        const { meetingId } = params;
        if (!meetingId) {
          return Response.json({ success: false, error: "Meeting ID required" }, { status: 400 });
        }
        
        const success = await confirmMeeting(meetingId);
        return Response.json({ 
          success,
          message: success ? "Meeting confirmed" : "Failed to confirm meeting"
        });
      }
      
      case "decline": {
        const { meetingId } = params;
        if (!meetingId) {
          return Response.json({ success: false, error: "Meeting ID required" }, { status: 400 });
        }
        
        const success = await declineMeeting(meetingId);
        return Response.json({ 
          success,
          message: success ? "Meeting declined" : "Failed to decline meeting"
        });
      }
      
      case "delete": {
        const { meetingId } = params;
        if (!meetingId) {
          return Response.json({ success: false, error: "Meeting ID required" }, { status: 400 });
        }
        
        const success = await deleteMeeting(meetingId);
        return Response.json({ 
          success,
          message: success ? "Meeting deleted" : "Failed to delete meeting"
        });
      }
      
      default:
        return Response.json({ 
          success: false, 
          error: "Invalid action" 
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error("💥 Meetings API Error:", error);
    return Response.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}