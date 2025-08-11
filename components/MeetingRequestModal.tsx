"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useFirebaseUsers } from "@/hooks/useFirebaseUsers";
import { useMeetings } from "@/hooks/useMeetings";
import { useAuth } from "@/components/AuthProvider";
import { DateTime } from "luxon";

interface MeetingRequestModalProps {
  open: boolean;
  onClose: () => void;
  startTime: string;
  endTime: string;
  sessionTitle?: string;
}

export function MeetingRequestModal(props: MeetingRequestModalProps) {
  const { open, onClose, startTime, endTime, sessionTitle } = props;
  const { user } = useAuth();
  const { users: firebaseUsers, loading: loadingUsers } = useFirebaseUsers();
  const { createMeetingRequest } = useMeetings();
  
  const [selectedUser, setSelectedUser] = useState("");
  const [title, setTitle] = useState("1:1 Meeting");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);

  // Filter out current user
  const otherUsers = firebaseUsers.filter(u => u.uid !== user?.uid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || sending) return;

    console.log("🚀 Starting meeting request submission...");
    console.log("📋 Request data:", {
      selectedUser,
      startTime,
      endTime,
      title,
      notes,
      currentUser: user?.uid
    });

    setSending(true);
    
    try {
      console.log("📤 Calling createMeetingRequest...");
      const success = await createMeetingRequest(
        selectedUser,
        startTime,
        endTime,
        title,
        notes
      );
      
      console.log("📥 Request result:", success);
      
      if (success) {
        console.log("✅ Meeting request successful, closing modal");
        onClose();
        // Reset form
        setSelectedUser("");
        setTitle("1:1 Meeting");
        setNotes("");
      } else {
        console.log("❌ Meeting request failed");
        alert("Failed to send meeting request. Please try again.");
      }
    } catch (error) {
      console.error("💥 Error in handleSubmit:", error);
      alert("An error occurred. Please try again.");
    }
    
    setSending(false);
    console.log("🏁 Meeting request submission complete");
  };

  const handleClose = () => {
    if (sending) return;
    onClose();
    // Reset form when closing
    setSelectedUser("");
    setTitle("1:1 Meeting");
    setNotes("");
  };

  const formatTime = (isoTime: string) => {
    return DateTime.fromISO(isoTime)
      .setZone("America/Los_Angeles")
      .toFormat("h:mm a");
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <h3 className="text-lg font-bold text-black font-mono mb-4">
                    Request 1:1 Meeting
                  </h3>
                  
                  <div className="mb-4 p-3 bg-gray-50 rounded border border-black">
                    <div className="text-sm font-mono text-black">
                      <div className="font-bold">Time Slot:</div>
                      <div>
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </div>
                      {sessionTitle && sessionTitle !== "Free time" && (
                        <div className="mt-1 text-xs text-gray-600">
                          During: {sessionTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black font-mono mb-2">
                        Meet with:
                      </label>
                      {loadingUsers ? (
                        <div className="w-full px-3 py-2 border-2 border-black rounded font-mono bg-gray-100 text-black text-sm">
                          Loading users...
                        </div>
                      ) : (
                        <select
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                          required
                          className="w-full px-3 py-2 border-2 border-black rounded font-mono bg-white text-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        >
                          <option value="">Select someone...</option>
                          {otherUsers.map((firebaseUser) => (
                            <option key={firebaseUser.uid} value={firebaseUser.uid}>
                              {firebaseUser.displayName}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black font-mono mb-2">
                        Meeting Title:
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black rounded font-mono bg-white text-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        placeholder="1:1 Meeting"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black font-mono mb-2">
                        Notes (optional):
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border-2 border-black rounded font-mono bg-white text-black focus:outline-none focus:ring-2 focus:ring-black text-sm resize-none"
                        placeholder="Add any details about the meeting..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={!selectedUser || sending}
                        className="flex-1 bg-black text-white py-2 px-4 rounded font-mono font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sending ? "Sending Request..." : "Send Meeting Request"}
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={sending}
                        className="flex-1 bg-white text-black border-2 border-black py-2 px-4 rounded font-mono font-bold hover:bg-gray-100 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}