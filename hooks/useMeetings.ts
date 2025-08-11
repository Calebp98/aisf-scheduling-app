"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Meeting } from "@/db/meetings";

// Cache to prevent multiple simultaneous requests
let loadingPromise: Promise<void> | null = null;
let lastUserId: string | null = null;
let cachedMeetings: Meeting[] = [];

export function useMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMeetings([]);
      setLoading(false);
      lastUserId = null;
      cachedMeetings = [];
      return;
    }

    // If user changed, clear cache
    if (lastUserId !== user.uid) {
      lastUserId = user.uid;
      cachedMeetings = [];
      loadingPromise = null;
    }

    // Use cached meetings if available
    if (cachedMeetings.length > 0 && lastUserId === user.uid) {
      setMeetings(cachedMeetings);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (loadingPromise) {
      loadingPromise.then(() => {
        setMeetings(cachedMeetings);
        setLoading(false);
      });
      return;
    }

    loadMeetings();
  }, [user]);

  const loadMeetings = async () => {
    if (!user) return;
    
    console.log(`🔄 Loading meetings for user ${user.uid}...`);
    
    // Create loading promise to prevent duplicate requests
    loadingPromise = (async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/meetings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get-user-meetings",
            firebaseUID: user.uid,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          cachedMeetings = data.meetings;
          setMeetings(data.meetings);
          console.log(`✅ Loaded ${data.meetings.length} meetings for user`);
        } else {
          console.error("Failed to load meetings:", data.error);
          cachedMeetings = [];
          setMeetings([]);
        }
      } catch (error) {
        console.error("Error loading meetings:", error);
        cachedMeetings = [];
        setMeetings([]);
      } finally {
        setLoading(false);
        loadingPromise = null; // Reset after completion
      }
    })();
    
    await loadingPromise;
  };

  const createMeetingRequest = async (
    requesteeUID: string,
    startTime: string,
    endTime: string,
    title?: string,
    notes?: string
  ) => {
    if (!user) {
      console.error("❌ No user found for meeting request");
      return false;
    }

    console.log("🔧 useMeetings.createMeetingRequest called with:", {
      requesteeUID,
      startTime,
      endTime,
      title,
      notes,
      requesterUID: user.uid
    });

    try {
      console.log("📡 Making fetch request to /api/meetings...");
      
      const requestBody = {
        action: "create-request",
        requesterUID: user.uid,
        requesteeUID,
        startTime,
        endTime,
        title,
        notes,
      };
      
      console.log("📦 Request body:", requestBody);
      
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📊 Fetch response status:", response.status);
      
      const data = await response.json();
      console.log("📋 Fetch response data:", data);
      
      if (data.success) {
        console.log("✅ Meeting request API call successful, refreshing meetings...");
        // Clear cache before refreshing
        cachedMeetings = [];
        loadingPromise = null;
        await loadMeetings(); // Refresh meetings
        console.log("✅ Meetings refreshed, returning true");
        return true;
      } else {
        console.error("❌ Failed to create meeting request:", data.error);
        return false;
      }
    } catch (error) {
      console.error("💥 Error creating meeting request:", error);
      return false;
    }
  };

  const confirmMeeting = async (meetingId: string) => {
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "confirm",
          meetingId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear cache before refreshing
        cachedMeetings = [];
        loadingPromise = null;
        await loadMeetings(); // Refresh meetings
        return true;
      } else {
        console.error("Failed to confirm meeting:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Error confirming meeting:", error);
      return false;
    }
  };

  const declineMeeting = async (meetingId: string) => {
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "decline",
          meetingId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear cache before refreshing
        cachedMeetings = [];
        loadingPromise = null;
        await loadMeetings(); // Refresh meetings
        return true;
      } else {
        console.error("Failed to decline meeting:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Error declining meeting:", error);
      return false;
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          meetingId,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear cache before refreshing
        cachedMeetings = [];
        loadingPromise = null;
        await loadMeetings(); // Refresh meetings
        return true;
      } else {
        console.error("Failed to delete meeting:", data.error);
        return false;
      }
    } catch (error) {
      console.error("Error deleting meeting:", error);
      return false;
    }
  };

  // Helper functions
  const getPendingRequests = () => {
    return meetings.filter(meeting => 
      meeting.Status === "pending" && 
      meeting["Requestee UID"] === user?.uid
    );
  };

  const getConfirmedMeetings = () => {
    return meetings.filter(meeting => meeting.Status === "confirmed");
  };

  const getSentRequests = () => {
    return meetings.filter(meeting => 
      meeting.Status === "pending" && 
      meeting["Requester UID"] === user?.uid
    );
  };

  return {
    meetings,
    loading,
    createMeetingRequest,
    confirmMeeting,
    declineMeeting,
    deleteMeeting,
    refreshMeetings: () => {
      cachedMeetings = [];
      loadingPromise = null;
      return loadMeetings();
    },
    getPendingRequests,
    getConfirmedMeetings,
    getSentRequests,
  };
}