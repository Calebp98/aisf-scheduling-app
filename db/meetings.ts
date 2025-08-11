import { base } from "./db";

export type Meeting = {
  id: string;
  "Requester UID": string; // Firebase UID of person who requested
  "Requestee UID": string; // Firebase UID of person being requested
  "Start Time": string; // ISO datetime
  "End Time": string; // ISO datetime
  Status: "pending" | "confirmed" | "declined"; // Meeting status
  "Created": string; // When request was made
  "Confirmed At"?: string; // When request was confirmed
  Title?: string; // Optional meeting title
  Notes?: string; // Optional meeting notes
};

export async function getAllMeetings(): Promise<Meeting[]> {
  const meetings: Meeting[] = [];
  try {
    await base("Meetings")
      .select({
        fields: [
          "Requester UID",
          "Requestee UID", 
          "Start Time",
          "End Time",
          "Status",
          "Created",
          "Confirmed At",
          "Title",
          "Notes"
        ]
      })
      .eachPage(function page(records: any, fetchNextPage: any) {
        records.forEach(function (record: any) {
          meetings.push({
            id: record.id,
            ...record.fields
          });
        });
        fetchNextPage();
      });
    console.log(`📅 Loaded ${meetings.length} total meetings from database`);
  } catch (error) {
    console.error("❌ Error fetching all meetings:", error);
  }
  return meetings;
}

export async function getMeetingsForUser(firebaseUID: string): Promise<Meeting[]> {
  if (!firebaseUID) {
    console.log("⚠️ No Firebase UID provided, returning empty meetings");
    return [];
  }
  
  const allMeetings = await getAllMeetings();
  
  // Debug: show what meetings exist
  console.log(`🔍 Debug: All meetings:`, allMeetings.map(m => ({
    id: m.id,
    requester: m["Requester UID"],
    requestee: m["Requestee UID"],
    status: m.Status
  })));
  
  const userMeetings = allMeetings.filter(meeting => 
    meeting["Requester UID"] === firebaseUID || 
    meeting["Requestee UID"] === firebaseUID
  );
  
  console.log(`👤 Firebase user ${firebaseUID} has ${userMeetings.length} meetings`);
  return userMeetings;
}

export async function getConfirmedMeetingsForTimeSlot(
  startTime: string, 
  endTime: string
): Promise<Meeting[]> {
  const allMeetings = await getAllMeetings();
  return allMeetings.filter(meeting => 
    meeting.Status === "confirmed" &&
    meeting["Start Time"] === startTime &&
    meeting["End Time"] === endTime
  );
}

export async function createMeetingRequest(
  requesterUID: string,
  requesteeUID: string,
  startTime: string,
  endTime: string,
  title?: string,
  notes?: string
): Promise<string | null> {
  try {
    console.log(`➕ Creating meeting request: ${requesterUID} → ${requesteeUID} at ${startTime}`);
    
    // Check if there's already a meeting at this time for either user
    const existingMeetings = await getAllMeetings();
    const conflictingMeeting = existingMeetings.find(meeting =>
      meeting.Status === "confirmed" &&
      meeting["Start Time"] === startTime &&
      meeting["End Time"] === endTime &&
      (meeting["Requester UID"] === requesterUID || 
       meeting["Requestee UID"] === requesterUID ||
       meeting["Requester UID"] === requesteeUID || 
       meeting["Requestee UID"] === requesteeUID)
    );
    
    if (conflictingMeeting) {
      console.log("⚠️ Time slot already booked");
      return null;
    }
    
    const result = await base("Meetings").create([
      {
        fields: {
          "Requester UID": requesterUID,
          "Requestee UID": requesteeUID,
          "Start Time": startTime,
          "End Time": endTime,
          Status: "pending",
          ...(title && { Title: title }),
          ...(notes && { Notes: notes })
        }
      }
    ]);
    
    const newMeetingId = result[0].id;
    console.log(`✅ Meeting request created: ${newMeetingId}`);
    return newMeetingId;
    
  } catch (error) {
    console.error("❌ Failed to create meeting request:", error);
    return null;
  }
}

export async function confirmMeeting(meetingId: string): Promise<boolean> {
  try {
    console.log(`✅ Confirming meeting: ${meetingId}`);
    
    await base("Meetings").update([
      {
        id: meetingId,
        fields: {
          Status: "confirmed",
          "Confirmed At": new Date().toISOString()
        }
      }
    ]);
    
    console.log(`✅ Meeting confirmed: ${meetingId}`);
    return true;
    
  } catch (error) {
    console.error("❌ Failed to confirm meeting:", error);
    return false;
  }
}

export async function declineMeeting(meetingId: string): Promise<boolean> {
  try {
    console.log(`❌ Declining meeting: ${meetingId}`);
    
    await base("Meetings").update([
      {
        id: meetingId,
        fields: {
          Status: "declined"
        }
      }
    ]);
    
    console.log(`✅ Meeting declined: ${meetingId}`);
    return true;
    
  } catch (error) {
    console.error("❌ Failed to decline meeting:", error);
    return false;
  }
}

export async function deleteMeeting(meetingId: string): Promise<boolean> {
  try {
    console.log(`🗑️ Deleting meeting: ${meetingId}`);
    
    await base("Meetings").destroy([meetingId]);
    console.log(`✅ Meeting deleted: ${meetingId}`);
    return true;
    
  } catch (error) {
    console.error("❌ Failed to delete meeting:", error);
    return false;
  }
}

// Helper function to check if two users are both free at a given time
export async function areUsersFreeAtTime(
  uid1: string,
  uid2: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const confirmedMeetings = await getConfirmedMeetingsForTimeSlot(startTime, endTime);
  
  const user1Busy = confirmedMeetings.some(meeting =>
    meeting["Requester UID"] === uid1 || meeting["Requestee UID"] === uid1
  );
  
  const user2Busy = confirmedMeetings.some(meeting =>
    meeting["Requester UID"] === uid2 || meeting["Requestee UID"] === uid2
  );
  
  return !user1Busy && !user2Busy;
}