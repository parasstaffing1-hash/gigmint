import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Gigmint — The Freelance Marketplace",
  description:
    "Connect with world-class freelancers or find your next project. The premium freelance marketplace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid rgba(55, 53, 47, 0.09)",
              color: "#37352f",
              borderRadius: "6px",
              fontSize: "14px",
              boxShadow: "rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px",
            },
          }}
        />
      </body>
    </html>
  );
}
