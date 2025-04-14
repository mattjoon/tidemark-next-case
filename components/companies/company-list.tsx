'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search, Info, Settings } from "lucide-react";
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteForm } from './note-form';

// Create a client
const queryClient = new QueryClient();

interface Company {
  ENTITY_ID: string;
  NAME: string;
  DOMAIN: string;
  HEADCOUNT: number;
  YEAR_FOUNDED: number;
  HQ_LOCATION: string;
  LINKEDIN_URL?: string;
  DESCRIPTION?: string;
  KEYWORDS?: string;
  HEADCOUNT_CHANGE_3M?: string | number;
  HEADCOUNT_CHANGE_6M?: string | number;
  HEADCOUNT_CHANGE_1Y?: string | number;
}

type SortConfig = {
  key: keyof Company;
  direction: 'asc' | 'desc';
};

type TimeFrame = '3M' | '6M' | '1Y';

// Update ITEMS_PER_PAGE to be dynamic
type PageSize = 10 | 50 | 100 | 500 | 'all';
const PAGE_SIZE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 10, label: '10 per page' },
  { value: 50, label: '50 per page' },
  { value: 100, label: '100 per page' },
  { value: 500, label: '500 per page' },
  { value: 'all', label: 'Show all' },
];

type ColumnDef = {
  key: keyof Company;
  label: string;
  defaultVisible?: boolean;
};

const COLUMNS: ColumnDef[] = [
  { key: 'NAME', label: 'Name', defaultVisible: true },
  { key: 'DOMAIN', label: 'Domain', defaultVisible: true },
  { key: 'HEADCOUNT', label: 'Headcount', defaultVisible: true },
  { key: 'HEADCOUNT_CHANGE_3M', label: '3M Change', defaultVisible: false },
  { key: 'HEADCOUNT_CHANGE_6M', label: '6M Change', defaultVisible: false },
  { key: 'HEADCOUNT_CHANGE_1Y', label: '1Y Change', defaultVisible: false },
  { key: 'YEAR_FOUNDED', label: 'Founded', defaultVisible: true },
  { key: 'HQ_LOCATION', label: 'Location', defaultVisible: true },
  { key: 'LINKEDIN_URL', label: 'LinkedIn', defaultVisible: true },
  { key: 'DESCRIPTION', label: 'Description', defaultVisible: false },
  { key: 'KEYWORDS', label: 'Keywords', defaultVisible: false },
];

interface CompanyDialogProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

const CompanyDialog = ({ company, isOpen, onClose }: CompanyDialogProps) => {
  if (!company) return null;

  const keywords = company.KEYWORDS?.split(',').filter(Boolean) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{company.NAME}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 h-full overflow-hidden">
          {/* Company Details Column */}
          <div className="space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Company Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Domain:</span> {company.DOMAIN}</p>
                <p><span className="font-medium">Headcount:</span> {company.HEADCOUNT}</p>
                <p><span className="font-medium">Founded:</span> {company.YEAR_FOUNDED}</p>
                <p><span className="font-medium">Location:</span> {company.HQ_LOCATION}</p>
                {company.LINKEDIN_URL && (
                  <p>
                    <span className="font-medium">LinkedIn:</span>{' '}
                    <a 
                      href={company.LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {company.LINKEDIN_URL}
                    </a>
                  </p>
                )}
                {company.DESCRIPTION && (
                  <p className="text-muted-foreground mt-2">{company.DESCRIPTION}</p>
                )}
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {keywords.map((keyword, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Notes Column */}
          <div className="border-l pl-6 space-y-4 overflow-y-auto">
            <h3 className="text-lg font-semibold">Notes</h3>
            <NoteForm companyId={company.ENTITY_ID.toString()} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function CompanyListWrapper({ companies }: { companies: Company[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(["NAME", "HEADCOUNT", "YEAR_FOUNDED", "HQ_LOCATION"]);
  const [headcountFilter, setHeadcountFilter] = useState("all");
  const [keywordSearch, setKeywordSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'HEADCOUNT', direction: 'desc' });
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('6M');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  const supabase = createClient();

  const { data: companiesData = [], error: queryError } = useQuery<Company[]>({
    queryKey: ['companies', sortConfig, searchQuery, keywordSearch],
    queryFn: async () => {
      console.log('Fetching companies...');
      try {
        let query = supabase
          .from('fulldatabase')
          .select('*');

        if (searchQuery) {
          query = query.ilike('NAME', `%${searchQuery}%`);
        }

        if (keywordSearch) {
          query = query.ilike('KEYWORDS', `%${keywordSearch}%`);
        }

        query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Query error:', err);
        throw err;
      }
    },
  });

  // Update pagination logic
  const itemsPerPage = pageSize === 'all' ? companiesData.length : pageSize;
  const totalPages = Math.ceil(companiesData.length / itemsPerPage);
  const paginatedCompanies = companiesData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof Company) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleColumn = (key: keyof Company) => {
    setVisibleColumns(current => {
      const newSet = new Set(current);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return Array.from(newSet);
    });
  };

  const filterByHeadcount = (company: Company) => {
    const headcount = typeof company.HEADCOUNT === 'string' 
      ? parseInt(company.HEADCOUNT, 10) 
      : company.HEADCOUNT;

    if (isNaN(Number(headcount))) return true;
    const numericHeadcount = Number(headcount);

    switch (headcountFilter) {
      case "1-10":
        return numericHeadcount >= 1 && numericHeadcount <= 10;
      case "11-50":
        return numericHeadcount >= 11 && numericHeadcount <= 50;
      case "51-200":
        return numericHeadcount >= 51 && numericHeadcount <= 200;
      case "201-500":
        return numericHeadcount >= 201 && numericHeadcount <= 500;
      case "501+":
        return numericHeadcount >= 501;
      default:
        return true;
    }
  };

  // Filter companies based on search and headcount
  const filteredCompanies = companies
    .filter(company => 
      company.NAME.toLowerCase().includes(searchQuery.toLowerCase()) &&
      filterByHeadcount(company)
    );

  const getHeadcountChangeValue = (company: Company, timeFrame: TimeFrame) => {
    const value = company[timeFrame === '3M' ? 'HEADCOUNT_CHANGE_3M' :
                        timeFrame === '1Y' ? 'HEADCOUNT_CHANGE_1Y' :
                        'HEADCOUNT_CHANGE_6M'];
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  return (
    <div className="space-y-4 max-w-[1800px] mx-auto px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keywords..."
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Headcount Change:</span>
            <Select
              value={timeFrame}
              onValueChange={(value: TimeFrame) => setTimeFrame(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="6M">6 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={headcountFilter} onValueChange={setHeadcountFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by headcount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="1-10">1-10</SelectItem>
              <SelectItem value="11-50">11-50</SelectItem>
              <SelectItem value="51-200">51-200</SelectItem>
              <SelectItem value="201-500">201-500</SelectItem>
              <SelectItem value="501+">501+</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {COLUMNS.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibleColumns.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key as keyof Company)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="max-h-[70vh] overflow-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    {COLUMNS.filter(col => visibleColumns.includes(col.key)).map((column) => (
                      <TableHead 
                        key={column.key}
                        className={
                          column.key === 'DESCRIPTION' ? 'min-w-[400px]' :
                          column.key === 'NAME' ? 'min-w-[250px]' :
                          column.key === 'KEYWORDS' ? 'min-w-[300px]' :
                          'min-w-[180px]'
                        }
                      >
                        <Button variant="ghost" onClick={() => handleSort(column.key as keyof Company)}>
                          {column.label}
                          {sortConfig.key === column.key && (
                            sortConfig.direction === 'asc' ? 
                              <ChevronUp className="ml-2 h-4 w-4 inline" /> : 
                              <ChevronDown className="ml-2 h-4 w-4 inline" />
                          )}
                        </Button>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.map((company) => (
                    <TableRow 
                      key={company.ENTITY_ID}
                      className="group hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedCompany(company)}
                    >
                      {COLUMNS.filter(col => visibleColumns.includes(col.key)).map((column) => (
                        <TableCell key={column.key}>
                          {column.key === 'NAME' ? (
                            <div className="flex items-center gap-2">
                              {company.NAME}
                            </div>
                          ) : column.key === 'LINKEDIN_URL' ? (
                            company.LINKEDIN_URL ? (
                              <a 
                                href={company.LINKEDIN_URL} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Profile
                              </a>
                            ) : (
                              '-'
                            )
                          ) : column.key === 'HEADCOUNT_CHANGE_3M' || column.key === 'HEADCOUNT_CHANGE_6M' || column.key === 'HEADCOUNT_CHANGE_1Y' ? (
                            <span className={
                              (() => {
                                const value = typeof company[column.key] === 'string' 
                                  ? parseFloat(company[column.key] as string) 
                                  : company[column.key] as number;
                                if (value > 0) return 'text-green-600';
                                if (value < 0) return 'text-red-600';
                                return '';
                              })()
                            }>
                              {company[column.key]}
                            </span>
                          ) : column.key === 'DESCRIPTION' ? (
                            <HoverCard>
                              <HoverCardTrigger className="max-w-[300px] truncate block">
                                {company[column.key]}
                              </HoverCardTrigger>
                              <HoverCardContent side="left" align="start">
                                {company[column.key]}
                              </HoverCardContent>
                            </HoverCard>
                          ) : column.key === 'KEYWORDS' ? (
                            <div className="flex flex-wrap gap-1">
                              {company.KEYWORDS.split(',').slice(0, 3).map((keyword, i) => (
                                <span 
                                  key={i}
                                  className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                                >
                                  {keyword.trim()}
                                </span>
                              ))}
                              {company.KEYWORDS.split(',').length > 3 && (
                                <span className="text-sm text-muted-foreground">+{company.KEYWORDS.split(',').length - 3} more</span>
                              )}
                            </div>
                          ) : (
                            company[column.key]
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <CompanyDialog 
        company={selectedCompany}
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, companiesData.length)} of {companiesData.length} companies
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(value === 'all' ? 'all' : parseInt(value) as PageSize);
              setCurrentPage(1); // Reset to first page when changing page size
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Results per page" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(option => (
                <SelectItem key={option.value.toString()} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyList() {
  const supabase = createClient();

  const { data: companies = [], error: queryError } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fulldatabase')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <CompanyListWrapper companies={companies} />
    </QueryClientProvider>
  );
} 