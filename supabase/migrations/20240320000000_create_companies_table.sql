-- Create fulldatabase table
CREATE TABLE IF NOT EXISTS fulldatabase (
    entity_id int8 PRIMARY KEY,
    name text,
    domain text,
    headcount int8,
    year_founded int8,
    hq_location text,
    description text,
    linkedin_url text,
    headcount_change_6m text,
    headcount_change_1y float8,
    headcount_change_2y float8,
    keywords text,
    uid int4
);

-- Enable Row Level Security
ALTER TABLE fulldatabase ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read data
CREATE POLICY "Allow authenticated users to read fulldatabase" 
ON fulldatabase FOR SELECT 
TO authenticated 
USING (true);

-- Insert some sample data
INSERT INTO fulldatabase (
    name, domain, headcount, year_founded, hq_location, description, 
    linkedin_url, headcount_change_6m, headcount_change_1y, headcount_change_2y,
    keywords, uid
) VALUES
    ('Acme Corp', 'acme.com', 500, 2010, 'San Francisco, CA', 'Leading provider of innovative solutions', 
    'https://linkedin.com/company/acme', '50', 100, 200, 'innovative solutions', 1),
    ('TechStart', 'techstart.io', 200, 2018, 'New York, NY', 'Fast-growing tech startup', 
    'https://linkedin.com/company/techstart', '30', 80, 150, 'fast-growing tech startup', 2),
    ('Global Industries', 'globalind.com', 1000, 2000, 'London, UK', 'International manufacturing company', 
    'https://linkedin.com/company/globalind', '20', 50, 100, 'international manufacturing company', 3); 