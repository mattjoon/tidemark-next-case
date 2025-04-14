'use client';

import { createClient } from '@/utils/supabase/client'
import { redirect, useRouter } from 'next/navigation';
import CompanyList from '@/components/companies/company-list';
import { Suspense, useEffect } from 'react';
import { Shell } from '@/components/shell';
import { CompanyTableSkeleton } from '@/components/companies/company-table-skeleton';

export default function CompaniesPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/sign-in');
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1">
        <div className="container mx-auto py-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Company Explorer</h2>
                <p className="text-muted-foreground">
                  Discover and analyze companies in our database.
                </p>
              </div>
            </div>
            <Suspense fallback={<CompanyTableSkeleton />}>
              <CompanyList />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
} 