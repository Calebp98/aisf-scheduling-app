"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useContext, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowTopRightOnSquareIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import { UserSelect } from "./user-select";
import { UserContext } from "./context";
import { Guest } from "@/db/guests";

export function MapModal() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        className="relative inline-flex items-center justify-center rounded-md p-1.5 bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
        onClick={() => setOpen(true)}
      >
        <MapIcon className="h-5 w-5 stroke-2" aria-hidden="true" />
      </button>
      <Modal open={open} setOpen={setOpen}>
        <Image
          src="/map.png"
          alt="Map"
          className="w-full h-full"
          width={500}
          height={500}
        />
      </Modal>
    </div>
  );
}

export function CurrentUserModal(props: {
  guests: Guest[];
  open: boolean;
  close: () => void;
  rsvp: () => void;
  sessionInfoDisplay?: React.ReactNode;
  rsvpd: boolean;
  isLoading?: boolean;
}) {
  const { guests, open, close, rsvp, sessionInfoDisplay, rsvpd, isLoading = false } = props;
  const { user } = useContext(UserContext);
  
  return (
    <Modal open={open} setOpen={close} hideClose={!!user}>
      {sessionInfoDisplay}
      
      {!user && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-black text-sm mb-2">Select who you are to RSVP:</p>
          <UserSelect guests={guests} />
        </div>
      )}
      
      {user && (
        <div className="mt-4">
          <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-black">
            <strong>RSVPing as:</strong> {guests.find(g => g.ID === user)?.Name || "Unknown User"}
          </div>
          
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={rsvp}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              rsvpd ? "Un-RSVP" : "RSVP"
            )}
          </button>
        </div>
      )}
    </Modal>
  );
}

export function ExportScheduleModal() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        className="relative inline-flex items-center justify-center rounded-md p-1.5 bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
        onClick={() => setOpen(true)}
      >
        <ArrowTopRightOnSquareIcon
          className="h-5 w-5 stroke-2"
          aria-hidden="true"
        />
      </button>
      <Modal open={open} setOpen={setOpen}>
        <h1 className="text-2xl font-bold text-black">Export schedule</h1>
        <p className="mt-2 text-black">
          Add the schedule to an external calendar using any of the links below.
        </p>
        <div className="flex flex-col gap-4 mt-3 pl-4">
          <a
            href="https://calendar.google.com/calendar/u/0?cid=fo6ng9e5sji2mli6eisk5lctpk9eb8da@import.calendar.google.com"
            className="text-black hover:underline"
          >
            Google Calendar link
          </a>
          <a
            href="https://calendar.google.com/calendar/ical/fo6ng9e5sji2mli6eisk5lctpk9eb8da%40import.calendar.google.com/public/basic.ics"
            className="text-black hover:underline"
          >
            iCal link
          </a>
          <a
            href="https://calendar.google.com/calendar/embed?src=fo6ng9e5sji2mli6eisk5lctpk9eb8da%40import.calendar.google.com&ctz=America%2FLos_Angeles"
            className="text-black hover:underline"
          >
            Public generic link
          </a>
        </div>
      </Modal>
    </div>
  );
}

export function Modal(props: {
  open: boolean;
  setOpen: (value: boolean) => void;
  children: React.ReactNode;
  hideClose?: boolean;
}) {
  const { open, setOpen, children, hideClose } = props;
  const fakeRef = useRef(null);
  return (
    <div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          initialFocus={fakeRef}
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setOpen(false)}
        >
          <button ref={fakeRef} className="hidden" />
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
          <div className="fixed inset-0 z-10 w-full overflow-y-auto">
            <div className="flex min-h-full w-full items-center justify-center p-4 text-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative mb-10 transform overflow-visible rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 text-black">
                  {children}
                  {!hideClose && (
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:text-sm"
                        onClick={() => setOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
