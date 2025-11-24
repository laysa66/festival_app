-- Festival App Database Initialization
-- This file will be executed when the database is created for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add your table schemas here later
-- Example:
-- CREATE TABLE festivals (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- For now, just a simple message
SELECT 'Database initialized successfully!' as message;
