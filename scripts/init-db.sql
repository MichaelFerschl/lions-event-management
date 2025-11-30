-- Initialize PostgreSQL database for Lions Event Management Hub
-- This script runs automatically when the database is created

\c lions_hub_dev;

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create custom types (can be extended later)
-- Example: CREATE TYPE user_role AS ENUM ('admin', 'member', 'guest');

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Lions Hub database initialized successfully';
  RAISE NOTICE 'Extensions enabled: uuid-ossp, pgcrypto';
END $$;
