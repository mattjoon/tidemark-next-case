'use client';

import CompaniesPage from './companies/page';
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
          Databook
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Explore and analyze company data with powerful search, filtering, and note-taking capabilities.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a 
            href="https://github.com/mattjoon/tidemark-next-case"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub Repository
          </a>
          <span>•</span>
          <a 
            href="mailto:mattsjlee@berkeley.edu"
            className="hover:text-foreground transition-colors"
          >
            Built by Matthew Lee
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Get Started</h2>
          <p className="text-muted-foreground">Sign in or create an account to explore company data</p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/sign-in"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Sign In
            </a>
            <a 
              href="/sign-up"
              className="px-4 py-2 border border-input rounded-md hover:bg-accent"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
