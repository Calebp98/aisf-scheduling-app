"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useRSVP(sessionId: string, initiallyRSVPd: boolean = false) {
  const [isRSVPd, setIsRSVPd] = useState(initiallyRSVPd);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleRSVP = async (guestId: string) => {
    if (!guestId) {
      console.log("❌ No guest ID provided for RSVP");
      return;
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
          guestId,
          remove: isRSVPd, // If currently RSVP'd, we want to remove it
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsRSVPd(!isRSVPd); // Toggle the state
        console.log(`✅ RSVP ${data.action}: ${sessionId}`);
        
        // Refresh the page to update server-side data
        router.refresh();
        
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