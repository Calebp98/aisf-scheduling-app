import { getRSVPsByUser } from "@/db/rsvps";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { firebaseUID } = await req.json();
    
    if (!firebaseUID) {
      return Response.json({ 
        success: false, 
        error: "Firebase UID required" 
      }, { status: 400 });
    }
    
    console.log(`📊 Loading RSVPs for Firebase user: ${firebaseUID}`);
    const rsvps = await getRSVPsByUser(firebaseUID);
    
    return Response.json({ 
      success: true, 
      rsvps 
    });
    
  } catch (error) {
    console.error("💥 User RSVPs API Error:", error);
    return Response.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}