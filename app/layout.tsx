import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Vollkorn } from "next/font/google";
import type React from "react";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { AuthProvider } from "@/lib/auth-context.tsx";
import { TRPCProvider } from "@/lib/trpc/provider.tsx";
import "@/lib/config/env-validation.ts"; // Validate environment at startup
import "./globals.css";

const vollkorn = Vollkorn({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Spruce Kitchen Meals",
  description: "Fresh, chef-crafted meals delivered to your door",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={vollkorn.variable} suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <TRPCProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              disableTransitionOnChange
              enableSystem
            >
              {children}
            </ThemeProvider>
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
