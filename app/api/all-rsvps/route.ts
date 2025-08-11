import { getAllRSVPs } from "@/db/rsvps";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log(`📊 Loading all RSVPs for count calculation`);
    const rsvps = await getAllRSVPs();
    
    return Response.json({ 
      success: true, 
      rsvps 
    });
    
  } catch (error) {
    console.error("💥 All RSVPs API Error:", error);
    return Response.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}