import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from 'geist/font/sans'
import Link from 'next/link'
import "./globals.css";
import Providers from './providers'
import { ThemeProvider } from "@/components/theme-provider"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Company Explorer",
  description: "Explore and analyze company data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>
            <main className="min-h-screen bg-background flex flex-col items-center">
              <div className="flex-1 w-full flex flex-col items-center">
                <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                  <div className="w-full max-w-7xl flex justify-end items-center p-3 px-5">
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                    <div className="ml-4">
                      <ThemeSwitcher />
                    </div>
                  </div>
                </nav>
                <div className="flex-1 w-full">
                  {children}
                </div>
              </div>
            </main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
