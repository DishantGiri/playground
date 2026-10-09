import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { Providers } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Bored? | Give us 5 minutes. We'll give you something fun to do.",
  description:
    "The modern entertainment platform designed to cure boredom instantly. Play reaction games, memory puzzles, personality tests, funny generators, and quizzes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#F7F7F5] text-[#202124]" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col w-full min-w-0">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
