"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { RSVP } from "@/db/rsvps";

export function useUserRSVPs() {
  const { user } = useAuth();
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRSVPs([]);
      setLoading(false);
      return;
    }

    const loadRSVPs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user-rsvps", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firebaseUID: user.uid,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setRSVPs(data.rsvps);
        } else {
          console.error("Failed to load user RSVPs:", data.error);
          setRSVPs([]);
        }
      } catch (error) {
        console.error("Error loading user RSVPs:", error);
        setRSVPs([]);
      } finally {
        setLoading(false);
      }
    };

    loadRSVPs();
  }, [user]);

  const refreshRSVPs = async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/user-rsvps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseUID: user.uid,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRSVPs(data.rsvps);
      }
    } catch (error) {
      console.error("Error refreshing RSVPs:", error);
    }
  };

  const hasRSVP = (sessionId: string) => {
    return rsvps.some(rsvp => 
      rsvp.Session?.includes(sessionId) && rsvp["Firebase UID"] === user?.uid
    );
  };

  return {
    rsvps,
    loading,
    hasRSVP,
    refreshRSVPs
  };
}