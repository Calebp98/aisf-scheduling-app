import { CakeIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export type NavItem = {
  name: string;
  href: string;
  icon: any;
};

export const CONSTS = {
  TITLE: "AI Security Forum",
  DESCRIPTION:
    "We bring together experts in AI, cybersecurity, and policy to secure powerful AI models—preventing catastrophies while accelerating scientific and economic progress.",
  MULTIPLE_EVENTS: false, // Show single event directly but still have nav
  // Navigation items for the unified app
  NAV_ITEMS: [
    { name: "Schedule", href: "/", icon: UserGroupIcon },
    { name: "Chat", href: "/chat", icon: CakeIcon },
  ] as NavItem[],
};
