-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Directories table
CREATE TABLE IF NOT EXISTS directories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS directory_tags (
  dir_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (dir_id, tag_id),
  FOREIGN KEY(dir_id) REFERENCES directories(id) ON DELETE CASCADE,
  FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dir_tags_tag ON directory_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_dir_tags_dir ON directory_tags(dir_id);
CREATE INDEX IF NOT EXISTS idx_directories_path ON directories(path);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
