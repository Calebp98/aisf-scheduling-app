import { CakeIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export type NavItem = {
  name: string;
  href: string;
  icon: any;
};

export const CONSTS = {
  TITLE: "AI Security Forum",
  DESCRIPTION:
    "We bring together experts in AI, cybersecurity, and policy to secure powerful AI models—preventing catastrophes while accelerating scientific and economic progress.",
  MULTIPLE_EVENTS: false, // Set to true if you have multiple events
  // If you have multiple events, add your events to the nav bar below
  // If you only have one event, you can leave the array empty
  // Find available icons at https://heroicons.com/
  NAV_ITEMS: [
    // { name: "Conference", href: "/Conference", icon: UserGroupIcon },
    // { name: "After Party", href: "/After-Party", icon: CakeIcon },
  ] as NavItem[],
};
