-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Members Table (update for extensibility)
CREATE TABLE IF NOT EXISTS Members (
  member_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  date_of_birth TEXT, -- ISO8601
  registration_date TEXT NOT NULL, -- ISO8601
  photo_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_members_name ON Members(name);

-- Groups Table
CREATE TABLE IF NOT EXISTS Groups (
  group_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);
CREATE INDEX IF NOT EXISTS idx_groups_name ON Groups(name);

-- Member_Groups (many-to-many)
CREATE TABLE IF NOT EXISTS Member_Groups (
  member_id INTEGER,
  group_id INTEGER,
  PRIMARY KEY (member_id, group_id),
  FOREIGN KEY (member_id) REFERENCES Members(member_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES Groups(group_id) ON DELETE CASCADE
);

-- Sports_Branches Table
CREATE TABLE IF NOT EXISTS Sports_Branches (
  branch_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

-- Member_Sports_Branches (many-to-many)
CREATE TABLE IF NOT EXISTS Member_Sports_Branches (
  member_id INTEGER,
  branch_id INTEGER,
  PRIMARY KEY (member_id, branch_id),
  FOREIGN KEY (member_id) REFERENCES Members(member_id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES Sports_Branches(branch_id) ON DELETE CASCADE
);

-- Membership_Packages Table
CREATE TABLE IF NOT EXISTS Membership_Packages (
  package_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('duration', 'class')),
  duration_days INTEGER,
  num_classes INTEGER,
  price REAL NOT NULL
);

-- Member_Packages Table
CREATE TABLE IF NOT EXISTS Member_Packages (
  member_package_id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  package_id INTEGER NOT NULL,
  start_date TEXT, -- ISO8601
  end_date TEXT,   -- ISO8601
  classes_remaining INTEGER,
  FOREIGN KEY (member_id) REFERENCES Members(member_id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES Membership_Packages(package_id) ON DELETE RESTRICT
);
