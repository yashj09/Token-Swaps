import "styles/globals.css";

import { Toaster } from "../components/ui/toaster";
import Provider from "@/lib/provider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-black text-white">
        <Provider>
          <main>{children}</main>
        </Provider>
        <Toaster />
      </body>
    </html>
  );
}
