import "styles/globals.css";

import { Toaster } from "../components/ui/toaster";
import { Providers } from "@/lib/provider";
import { config } from "./config";
import { headers } from "next/headers";
import { cookieToInitialState } from "@account-kit/core";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    config,
    headers().get("cookie") ?? undefined
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-black text-white">
        <Providers initialState={initialState}>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
