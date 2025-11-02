import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "F1 GPT - Formula 1 AI Assistant",
  description: "Ask anything about Formula 1 powered by Gemini AI and Vector Search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
