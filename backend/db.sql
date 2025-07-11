CREATE TABLE project (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  toolsFront json,
  toolsBack json,
  toolsBd json,
  demo_link VARCHAR(255),
  github_link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed boolean default(false),
  startDate date ,
  Period int
);

-- Blog 
CREATE TABLE blog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  date date
);

-- Blog and/or Project images
CREATE TABLE image (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(255),
  projectId int,
  blogId int,

  FOREIGN KEY (projectId) REFERENCES project(id) ON DELETE CASCADE,
  FOREIGN KEY (blogId) REFERENCES blog(id) ON DELETE CASCADE
);

-- Services table
CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
    demo_link VARCHAR(255),
  tools json
);

