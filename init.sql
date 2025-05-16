CREATE TABLE IF NOT EXISTS users (
  userID INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50),
  updateuserby INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (updateuserby) REFERENCES users(userID)
);




-- Sample data for tasks table
INSERT INTO tasks (id, title, description, status, updateuserby, updated_at) VALUES
(14, '1', '1', '1', 1, '2025-05-16 14:40:19'),
(15, '2', '2', '2', 1, '2025-05-16 14:40:21'),
(16, '1', '1', '1', 1, '2025-05-16 14:40:39'),
(17, '3', '3', '3', 1, '2025-05-16 14:45:21'),
(18, '1', '1', '1', 1, '2025-05-16 15:16:29');