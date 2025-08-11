"use client";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

interface AvailableSlot {
  startTime: string;
  endTime: string;
  sessionTitle: string;
  sessionId: string;
}

export function useAvailability() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const checkMutualAvailability = async (otherUserUID: string) => {
    if (!user || !otherUserUID) {
      return { availableSlots: [], user1RSVPCount: 0, user2RSVPCount: 0 };
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid1: user.uid,
          uid2: otherUserUID,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          availableSlots: data.availableSlots as AvailableSlot[],
          user1RSVPCount: data.user1RSVPCount,
          user2RSVPCount: data.user2RSVPCount,
        };
      } else {
        console.error("Failed to check availability:", data.error);
        return { availableSlots: [], user1RSVPCount: 0, user2RSVPCount: 0 };
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      return { availableSlots: [], user1RSVPCount: 0, user2RSVPCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  return {
    checkMutualAvailability,
    loading,
  };
}