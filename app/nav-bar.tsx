"use client";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ExportScheduleModal, MapModal } from "./modals";
import { CONSTS, NavItem } from "@/utils/constants";
import { useAuth } from "@/components/AuthProvider";

export default function Example() {
  const { userProfile, logout } = useAuth();
  
  return (
    <Disclosure
      as="nav"
      className="bg-white border-b border-black fixed w-full z-30"
    >
      {({ open }) => (
        <>
          <div className="mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black">
                  <span className="absolute -inset-0.5" />
                  {open ? (
                    <XMarkIcon className="block h-6 w-6 stroke-2" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6 stroke-2" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex justify-between w-full items-center">
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  {/* Desktop nav */}
                  <div className="hidden sm:block">
                    <div className="flex space-x-4">
                      {CONSTS.NAV_ITEMS.map((item) => (
                        <NavBarItem key={item.name} item={item} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-black hidden sm:inline">
                    {userProfile?.displayName || 'User'}
                  </span>
                  <button
                    onClick={logout}
                    className="relative inline-flex items-center justify-center rounded-md p-1.5 bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 stroke-2" />
                  </button>
                  <MapModal />
                  <ExportScheduleModal />
                </div>
              </div>
            </div>
          </div>
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {CONSTS.NAV_ITEMS.map((item) => (
                <SmallNavBarItem key={item.name} item={item} />
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm font-mono text-black">
                  {userProfile?.displayName || 'User'}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-base font-medium text-black hover:bg-gray-100 rounded-md"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function NavBarItem(props: { item: NavItem }) {
  const { item } = props;
  const isCurrentPage = usePathname().includes(item.href) && item.href != null;
  return (
    <Link
      key={item.name}
      href={item.href}
      className={clsx(
        isCurrentPage
          ? "bg-black text-white"
          : "text-black hover:bg-gray-100",
        "group flex gap-1 cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium"
      )}
    >
      <item.icon className="block h-5 w-auto" />
      {item.name}
    </Link>
  );
}

function SmallNavBarItem(props: { item: NavItem }) {
  const { item } = props;
  const isCurrentPage = usePathname().includes(item.href) && item.href != null;
  return (
    <Disclosure.Button
      key={item.name}
      as="a"
      href={item.href}
      className={clsx(
        isCurrentPage
          ? "bg-black text-white"
          : "text-black hover:bg-gray-100",
        "flex gap-2 rounded-md px-3 py-2 text-base font-medium"
      )}
    >
      <item.icon className="block h-5 w-auto" />
      {item.name}
    </Disclosure.Button>
  );
}
