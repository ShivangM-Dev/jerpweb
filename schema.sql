-- Items Table (Main table for jewelry items)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    gross_weight DECIMAL(10, 3) NOT NULL,
    carate VARCHAR(10) NOT NULL,
    diamonds JSONB DEFAULT '[]'::jsonb,
    stones JSONB DEFAULT '[]'::jsonb,
    net_weight DECIMAL(10, 3) NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    making DECIMAL(10, 2),
    fine DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_client_id ON items(client_id);
CREATE INDEX IF NOT EXISTS idx_items_date ON items(date);
CREATE INDEX IF NOT EXISTS idx_items_item_id ON items(item_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Example queries to fetch items:

-- Get all items:
-- SELECT * FROM items ORDER BY created_at DESC;

-- Get items with client info:
-- SELECT i.*, c.name as client_name, c.phone as client_phone
-- FROM items i
-- LEFT JOIN clients c ON i.client_id = c.id
-- ORDER BY i.created_at DESC;
