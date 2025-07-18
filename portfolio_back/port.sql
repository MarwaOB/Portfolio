SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema portfolio2
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema portfolio2
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `portfolio2` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `portfolio2` ;

-- -----------------------------------------------------
-- Table `portfolio2`.`client`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`client` (
  `client_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(512) NOT NULL,
  `tel` VARCHAR(20) NULL DEFAULT NULL,
  `e_mail` VARCHAR(100) NULL DEFAULT NULL,
  `image` VARCHAR(512) NULL DEFAULT NULL,
  PRIMARY KEY (`client_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio2`.`message`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`message` (
  `message_id` INT NOT NULL AUTO_INCREMENT,
  `content` TEXT NOT NULL,
  `contact` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  PRIMARY KEY (`message_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio2`.`post`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`post` (
  `post_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `status` TINYINT(1) NULL DEFAULT '0',
  `abstract` TEXT NULL DEFAULT NULL,
  `head_image` VARCHAR(512) NULL DEFAULT NULL,
  `content` JSON NULL DEFAULT NULL,
  `date` date default null,
  PRIMARY KEY (`post_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- -----------------------------------------------------
-- Table `portfolio2`.`post_keywords`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`post_keywords` (
  `post_key_id` INT NOT NULL AUTO_INCREMENT,
  `post_id` INT NULL DEFAULT NULL,
  `keyword` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`post_key_id`),
  INDEX `post_id` (`post_id` ASC) VISIBLE,
  CONSTRAINT `post_keywords_ibfk_1`
    FOREIGN KEY (`post_id`)
    REFERENCES `portfolio2`.`post` (`post_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;



-- -----------------------------------------------------
-- Table `portfolio2`.`project`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`project` (
  `project_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(1000) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `status` TINYINT(1) NULL DEFAULT '0',
  `live_link` VARCHAR(2048) NULL DEFAULT NULL,
  `git_link` VARCHAR(2048) NULL DEFAULT NULL,
  `start_date` DATE NULL DEFAULT NULL,
  `end_date` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`project_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio2`.`project_client`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`project_client` (
  `project_id` INT NOT NULL,
  `client_id` INT NOT NULL,
  PRIMARY KEY (`project_id`, `client_id`),
  INDEX `client_id` (`client_id` ASC) VISIBLE,
  CONSTRAINT `project_client_ibfk_1`
    FOREIGN KEY (`project_id`)
    REFERENCES `portfolio2`.`project` (`project_id`),
  CONSTRAINT `project_client_ibfk_2`
    FOREIGN KEY (`client_id`)
    REFERENCES `portfolio2`.`client` (`client_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio2`.`project_demos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`project_demos` (
  `project_id` INT NOT NULL,
  `demo` VARCHAR(512) NOT NULL,
  PRIMARY KEY (`project_id`, `demo`),
  CONSTRAINT `project_demos_ibfk_1`
    FOREIGN KEY (`project_id`)
    REFERENCES `portfolio2`.`project` (`project_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio2`.`project_images`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`project_images` (
  `project_id` INT NOT NULL,
  `image` VARCHAR(512) NOT NULL,
  PRIMARY KEY (`project_id`, `image`),
  CONSTRAINT `project_images_ibfk_1`
    FOREIGN KEY (`project_id`)
    REFERENCES `portfolio2`.`project` (`project_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio2`.`tool`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`tool` (
  `tool_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(512) NOT NULL,
  `type` VARCHAR(512) NULL DEFAULT NULL,
  `image` VARCHAR(512) NULL DEFAULT NULL,
  PRIMARY KEY (`tool_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio2`.`project_tool`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`project_tool` (
  `project_id` INT NOT NULL,
  `tool_id` INT NOT NULL,
  PRIMARY KEY (`project_id`, `tool_id`),
  INDEX `tool_id` (`tool_id` ASC) VISIBLE,
  CONSTRAINT `project_tool_ibfk_1`
    FOREIGN KEY (`project_id`)
    REFERENCES `portfolio2`.`project` (`project_id`),
  CONSTRAINT `project_tool_ibfk_2`
    FOREIGN KEY (`tool_id`)
    REFERENCES `portfolio2`.`tool` (`tool_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio2`.`service`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`service` (
  `service_id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(1000) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `status` TINYINT(1) NULL DEFAULT '0',
  `created_at` DATE NULL DEFAULT NULL,
  `pricing` INT NULL DEFAULT NULL,
  PRIMARY KEY (`service_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `portfolio2`.`service_image`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `portfolio2`.`service_image` (
  `service_id` INT NOT NULL,
  `image` VARCHAR(512) NOT NULL,
  `public_id` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`service_id`, `image`)
)ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

-- Add authentication tokens table
CREATE TABLE IF NOT EXISTS auth_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster token lookups
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_email ON auth_tokens(email);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
