-- Create the companies table
CREATE TABLE IF NOT EXISTS companies (
  entity_id bigint PRIMARY KEY,
  name text NOT NULL,
  domain text,
  headcount integer,
  year_founded integer,
  hq_location text,
  description text,
  linkedin_url text,
  headcount_change_6m integer,
  headcount_change_1y integer,
  headcount_change_2y integer,
  headcount_growth_6m decimal,
  headcount_growth_1y decimal,
  headcount_growth_2y decimal,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read companies"
ON companies FOR SELECT
TO authenticated
USING (true);

-- Sample data for testing
INSERT INTO companies (
  entity_id, name, domain, headcount, year_founded, hq_location, description
) VALUES
(1, 'Example Corp', 'example.com', 100, 2020, 'San Francisco, CA', 'An example company'),
(2, 'Test Inc', 'test.com', 50, 2019, 'New York, NY', 'A test company');

-- Grant permissions
GRANT SELECT ON companies TO authenticated; 