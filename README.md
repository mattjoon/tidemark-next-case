# Databook - Company Data Explorer

A modern web application for exploring and analyzing company data, built with Next.js and Supabase.

Production link: https://tidemark-next-case.vercel.app/

## Features

- 🔐 **Authentication**: Secure sign-in/sign-up with email verification
- 🔍 **Company Search**: Search through company data with powerful filtering
- 📝 **Note-taking**: Add and manage notes for each company
- 🎨 **Modern UI**: Clean, responsive design with dark mode support
- 🚀 **Performance**: Built with Next.js for optimal performance

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React Query for data fetching
- **Form Handling**: React Hook Form with Zod validation

## Design Rationale

### Architecture
- **Route Groups**: Used Next.js route groups (`(auth-pages)`) to organize authentication-related pages while maintaining clean URLs
- **Server Components**: Leveraged Next.js server components for better performance and SEO
- **Client Components**: Used client components only where necessary (forms, interactive elements)

### UI/UX Decisions
- **Minimalist Design**: Clean, focused interface that prioritizes content
- **Responsive Layout**: Adapts to all screen sizes with a mobile-first approach
- **Dark Mode**: Built-in dark mode support for better viewing experience
- **Form Validation**: Client-side validation with clear error messages
- **Loading States**: Skeleton loaders and pending states for better UX

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Environment variables (see `.env.example`)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mattsjlee/tidemark-next.git
   cd tidemark-next
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

1. Create a new Supabase project
2. Run the SQL setup script in the Supabase SQL editor:
   ```sql
   -- Enable Row Level Security
   ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

   -- Create policy to allow authenticated users to read data
   CREATE POLICY "Allow authenticated users to read data" 
   ON companies FOR SELECT 
   TO authenticated 
   USING (true);

   -- Add sample data
   INSERT INTO companies (name, description, headcount, industry) VALUES
   ('Example Corp', 'A leading technology company', 500, 'Technology'),
   ('Sample Inc', 'Innovative solutions provider', 200, 'Services');
   ```

## Usage

### Authentication
- Sign up with your email address
- Verify your email through the link sent to your inbox
- Sign in to access the company explorer

### Company Explorer
- Browse through the list of companies
- Use the search bar to find specific companies
- Filter companies by headcount and industry
- Click on a company to view detailed information
- Add notes to companies (requires authentication)

### Notes
- Add notes to any company
- Notes are private to your account
- Edit or delete your notes at any time

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Matthew Lee - [msjlee@berkeley.edu](mailto:msjlee@berkeley.edu)

Project Link: [https://github.com/mattjoon/tidemark-next](https://github.com/mattjoon/tidemark-next)
