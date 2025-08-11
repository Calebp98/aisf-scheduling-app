import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./nav-bar";
import { Context } from "./context";
import { AuthProvider } from "@/components/AuthProvider";
import clsx from "clsx";
import { CONSTS } from "@/utils/constants";

export const metadata: Metadata = {
  title: CONSTS.TITLE,
  description: CONSTS.DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-mono bg-white text-black">
        <AuthProvider>
          <Context>
            <NavBar />
            <main
              className={clsx(
                "lg:px-24 sm:px-10 p-6",
                "py-24" // Always add padding for nav bar
              )}
            >
              {children}
            </main>
          </Context>
        </AuthProvider>
      </body>
    </html>
  );
}
