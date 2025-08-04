import { base } from "./db";

export type RSVP = {
  id: string;
  Session: string[];
  Guest: string[];
  Created?: string;
};

export async function getAllRSVPs(): Promise<RSVP[]> {
  const rsvps: RSVP[] = [];
  try {
    await base("RSVPs")
      .select({
        fields: ["Session", "Guest", "Created"]
      })
      .eachPage(function page(records: any, fetchNextPage: any) {
        records.forEach(function (record: any) {
          rsvps.push({
            id: record.id,
            ...record.fields
          });
        });
        fetchNextPage();
      });
    console.log(`📊 Loaded ${rsvps.length} total RSVPs from database`);
  } catch (error) {
    console.error("❌ Error fetching all RSVPs:", error);
  }
  return rsvps;
}

export async function getRSVPsByUser(guestId?: string): Promise<RSVP[]> {
  if (!guestId) {
    console.log("⚠️ No guest ID provided, returning empty RSVPs");
    return [];
  }
  
  const allRSVPs = await getAllRSVPs();
  const userRSVPs = allRSVPs.filter(rsvp => 
    rsvp.Guest && rsvp.Guest.includes(guestId)
  );
  
  console.log(`👤 User ${guestId} has ${userRSVPs.length} RSVPs:`, userRSVPs.map(r => ({
    id: r.id,
    session: r.Session?.[0],
    guest: r.Guest?.[0]
  })));
  
  return userRSVPs;
}

export async function getRSVPsBySession(sessionId: string): Promise<RSVP[]> {
  const allRSVPs = await getAllRSVPs();
  const sessionRSVPs = allRSVPs.filter(rsvp => 
    rsvp.Session && rsvp.Session.includes(sessionId)
  );
  
  console.log(`📅 Session ${sessionId} has ${sessionRSVPs.length} RSVPs`);
  return sessionRSVPs;
}

export async function createRSVP(sessionId: string, guestId: string): Promise<string | null> {
  try {
    console.log(`➕ Creating RSVP: ${guestId} → ${sessionId}`);
    
    const result = await base("RSVPs").create([
      {
        fields: {
          Session: [sessionId],
          Guest: [guestId]
        }
      }
    ]);
    
    const newRSVPId = result[0].id;
    console.log(`✅ RSVP created successfully: ${newRSVPId}`);
    return newRSVPId;
    
  } catch (error) {
    console.error("❌ Failed to create RSVP:", error);
    return null;
  }
}

export async function deleteRSVP(sessionId: string, guestId: string): Promise<boolean> {
  try {
    console.log(`🗑️ Deleting RSVP: ${guestId} → ${sessionId}`);
    
    const allRSVPs = await getAllRSVPs();
    const rsvpToDelete = allRSVPs.find(rsvp =>
      rsvp.Session?.includes(sessionId) && rsvp.Guest?.includes(guestId)
    );
    
    if (!rsvpToDelete) {
      console.log("⚠️ No matching RSVP found to delete");
      return false;
    }
    
    await base("RSVPs").destroy([rsvpToDelete.id]);
    console.log(`✅ RSVP deleted successfully: ${rsvpToDelete.id}`);
    return true;
    
  } catch (error) {
    console.error("❌ Failed to delete RSVP:", error);
    return false;
  }
}