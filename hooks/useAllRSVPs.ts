"use client";
import { useState, useEffect } from "react";
import { RSVP } from "@/db/rsvps";

// Cache to prevent multiple simultaneous requests
let rsvpLoadingPromise: Promise<void> | null = null;
let cachedRSVPs: RSVP[] = [];
let rsvpCacheInitialized = false;

export function useAllRSVPs() {
  const [allRSVPs, setAllRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use cached RSVPs if available
    if (rsvpCacheInitialized && cachedRSVPs.length >= 0) {
      setAllRSVPs(cachedRSVPs);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (rsvpLoadingPromise) {
      rsvpLoadingPromise.then(() => {
        setAllRSVPs(cachedRSVPs);
        setLoading(false);
      });
      return;
    }

    const loadAllRSVPs = async () => {
      console.log("🔄 Loading all RSVPs (first time)...");
      
      // Create loading promise to prevent duplicate requests
      rsvpLoadingPromise = (async () => {
        try {
          setLoading(true);
          
          // Load all RSVPs to count per session
          const response = await fetch("/api/all-rsvps", {
            method: "GET",
          });

          const data = await response.json();
          
          if (data.success) {
            cachedRSVPs = data.rsvps;
            setAllRSVPs(data.rsvps);
            console.log(`✅ Loaded ${data.rsvps.length} RSVPs (cached for other components)`);
          } else {
            console.error("Failed to load all RSVPs:", data.error);
            cachedRSVPs = [];
            setAllRSVPs([]);
          }
        } catch (error) {
          console.error("Error loading all RSVPs:", error);
          cachedRSVPs = [];
          setAllRSVPs([]);
        } finally {
          setLoading(false);
          rsvpCacheInitialized = true;
          rsvpLoadingPromise = null; // Reset after completion
        }
      })();
      
      await rsvpLoadingPromise;
    };

    loadAllRSVPs();
  }, []);

  const getRSVPCount = (sessionId: string) => {
    return allRSVPs.filter(rsvp => 
      rsvp.Session?.includes(sessionId)
    ).length;
  };

  const refreshAllRSVPs = async () => {
    console.log("🔄 Refreshing all RSVPs cache...");
    try {
      // Clear cache
      cachedRSVPs = [];
      rsvpCacheInitialized = false;
      rsvpLoadingPromise = null;
      
      const response = await fetch("/api/all-rsvps", {
        method: "GET",
      });

      const data = await response.json();
      if (data.success) {
        cachedRSVPs = data.rsvps;
        setAllRSVPs(data.rsvps);
        rsvpCacheInitialized = true;
        console.log(`✅ Refreshed ${data.rsvps.length} RSVPs`);
      }
    } catch (error) {
      console.error("Error refreshing all RSVPs:", error);
    }
  };

  return {
    allRSVPs,
    loading,
    getRSVPCount,
    refreshAllRSVPs
  };
}