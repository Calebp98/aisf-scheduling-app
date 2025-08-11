"use client";
import { Guest } from "@/db/guests";
import { Day } from "@/db/days";
import { useMeetings } from "@/hooks/useMeetings";
import { useAuth } from "@/components/AuthProvider";
import { useFirebaseUsers } from "@/hooks/useFirebaseUsers";
import { DateTime } from "luxon";

export function MeetingsColumn(props: { 
  day: Day;
  guests: Guest[];
}) {
  const { day, guests } = props;
  const { user } = useAuth();
  const { users: firebaseUsers, loading: loadingUsers } = useFirebaseUsers();
  
  const { 
    confirmMeeting, 
    declineMeeting,
    getPendingRequests,
    getConfirmedMeetings,
    getSentRequests
  } = useMeetings();

  const pendingRequests = getPendingRequests();
  const confirmedMeetings = getConfirmedMeetings();
  const sentRequests = getSentRequests();

  // Filter meetings for this day
  const dayStart = DateTime.fromISO(day.Start).startOf('day');
  const dayEnd = dayStart.endOf('day');
  
  const dayMeetings = confirmedMeetings.filter(meeting => {
    const meetingStart = DateTime.fromISO(meeting["Start Time"]);
    return meetingStart >= dayStart && meetingStart <= dayEnd;
  });

  const dayPendingRequests = pendingRequests.filter(meeting => {
    const meetingStart = DateTime.fromISO(meeting["Start Time"]);
    return meetingStart >= dayStart && meetingStart <= dayEnd;
  });

  const daySentRequests = sentRequests.filter(meeting => {
    const meetingStart = DateTime.fromISO(meeting["Start Time"]);
    return meetingStart >= dayStart && meetingStart <= dayEnd;
  });

  return (
    <div className="bg-white border-2 border-black rounded p-4 h-full">
      <h3 className="font-bold text-black font-mono mb-4">1:1 Meetings</h3>
      
      <p className="text-xs text-gray-600 font-mono mb-4">
        Click on any time slot to book a 1:1 meeting
      </p>

      {/* Confirmed Meetings for this day */}
      {dayMeetings.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-black font-mono text-sm mb-2">
            Today's Meetings
          </h4>
          <div className="space-y-2">
            {dayMeetings.map((meeting) => {
              const otherUserUID = meeting["Requester UID"] === user?.uid 
                ? meeting["Requestee UID"] 
                : meeting["Requester UID"];
              const otherUser = firebaseUsers.find(u => u.uid === otherUserUID);
              
              return (
                <div
                  key={meeting.id}
                  className="p-2 bg-black text-white rounded text-xs font-mono"
                >
                  <div className="font-bold">{meeting.Title}</div>
                  <div>with {otherUser?.displayName || 'Unknown'}</div>
                  <div>
                    {DateTime.fromISO(meeting["Start Time"])
                      .setZone("America/Los_Angeles")
                      .toFormat("h:mm a")}
                    {" - "}
                    {DateTime.fromISO(meeting["End Time"])
                      .setZone("America/Los_Angeles")
                      .toFormat("h:mm a")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Requests for this day (incoming) */}
      {dayPendingRequests.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-black font-mono text-sm mb-2">
            Incoming Requests
          </h4>
          <div className="space-y-2">
            {dayPendingRequests.map((meeting) => {
              const requesterUID = meeting["Requester UID"];
              const requester = firebaseUsers.find(u => u.uid === requesterUID);
              
              return (
                <div
                  key={meeting.id}
                  className="p-2 bg-yellow-50 border border-yellow-400 rounded text-xs font-mono"
                >
                  <div className="font-bold">Meeting Request</div>
                  <div>from {requester?.displayName || 'Unknown'}</div>
                  <div>
                    {DateTime.fromISO(meeting["Start Time"])
                      .setZone("America/Los_Angeles")
                      .toFormat("h:mm a")}
                    {" - "}
                    {DateTime.fromISO(meeting["End Time"])
                      .setZone("America/Los_Angeles")
                      .toFormat("h:mm a")}
                  </div>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => confirmMeeting(meeting.id)}
                      className="px-2 py-1 bg-black text-white rounded text-xs font-bold hover:bg-gray-800"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => declineMeeting(meeting.id)}
                      className="px-2 py-1 bg-white text-black border border-black rounded text-xs font-bold hover:bg-gray-100"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sent Requests for this day (outgoing) */}
      {daySentRequests.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-black font-mono text-sm mb-2">
            Sent Requests
          </h4>
          <div className="space-y-2">
            {daySentRequests.map((meeting) => {
              const requesteeUID = meeting["Requestee UID"];
              const requestee = firebaseUsers.find(u => u.uid === requesteeUID);
              
              return (
                <div
                  key={meeting.id}
                  className="p-2 bg-blue-50 border border-blue-400 rounded text-xs font-mono"
                >
                  <div className="font-bold">Pending Request</div>
                  <div>to {requestee?.displayName || 'Unknown'}</div>
                  <div>
                    {DateTime.fromISO(meeting["Start Time"])
                      .setZone("America/Los_Angeles")
                      .toFormat("h:mm a")}
                    {" - "}
                    {DateTime.fromISO(meeting["End Time"])
                      .setZone("America/Los_Angeles")
                      .toFormat("h:mm a")}
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    Waiting for response...
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show helpful message if no meetings today */}
      {dayMeetings.length === 0 && dayPendingRequests.length === 0 && daySentRequests.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 font-mono text-sm">
            No meetings scheduled for today
          </p>
          <p className="text-gray-400 font-mono text-xs mt-2">
            Hover over any session to book a 1:1
          </p>
        </div>
      )}
    </div>
  );
}