-- Members Table
CREATE TABLE IF NOT EXISTS Members (
  member_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  date_of_birth TEXT, -- ISO8601 format ("YYYY-MM-DD")
  registration_date TEXT NOT NULL -- ISO8601 format ("YYYY-MM-DD")
);

CREATE INDEX IF NOT EXISTS idx_members_name ON Members(name);

-- Groups Table
CREATE TABLE IF NOT EXISTS Groups (
  group_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_groups_name ON Groups(name);
