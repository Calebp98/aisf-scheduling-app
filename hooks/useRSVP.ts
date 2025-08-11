"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface UseRSVPOptions {
  onRSVPChange?: () => void;
}

export function useRSVP(sessionId: string, initiallyRSVPd: boolean = false, options: UseRSVPOptions = {}) {
  const [isRSVPd, setIsRSVPd] = useState(initiallyRSVPd);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Sync state when initiallyRSVPd changes
  useEffect(() => {
    setIsRSVPd(initiallyRSVPd);
  }, [initiallyRSVPd]);

  const toggleRSVP = async (firebaseUID?: string) => {
    const userUID = firebaseUID || user?.uid;
    
    if (!userUID) {
      console.log("❌ No Firebase UID provided for RSVP");
      return false;
    }

    setIsLoading(true);
    
    try {
      console.log(`🎯 Toggling RSVP: ${isRSVPd ? 'removing' : 'adding'} for session ${sessionId}`);
      
      const response = await fetch("/api/toggle-rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          guestId: userUID, // Send Firebase UID
          remove: isRSVPd, // If currently RSVP'd, we want to remove it
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsRSVPd(!isRSVPd); // Toggle the state
        console.log(`✅ RSVP ${data.action}: ${sessionId}`);
        
        // Call the callback to refresh parent data
        options.onRSVPChange?.();
        
        return true;
      } else {
        console.error("❌ RSVP failed:", data.error);
        return false;
      }
      
    } catch (error) {
      console.error("💥 RSVP request failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isRSVPd,
    isLoading,
    toggleRSVP
  };
}