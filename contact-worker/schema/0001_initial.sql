CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target TEXT NOT NULL CHECK (target IN ('Ninedbase', 'PriceMemo', 'Other')),
  body TEXT NOT NULL,
  reply_to TEXT,
  created_at TEXT NOT NULL,
  read_at TEXT
);

CREATE INDEX IF NOT EXISTS inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_read_at ON inquiries(read_at);
