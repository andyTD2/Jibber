CREATE DATABASE  IF NOT EXISTS `jibber-db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `jibber-db`;
-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: jibber-db
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accountverificationcodes`
--

DROP TABLE IF EXISTS `accountverificationcodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accountverificationcodes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) DEFAULT NULL,
  `verificationCode` varchar(6) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `expiresAt` timestamp NULL DEFAULT ((now() + interval 20 minute)),
  PRIMARY KEY (`id`),
  KEY `fk_verification_code_unverifieduser` (`username`),
  CONSTRAINT `fk_verification_code_unverifieduser` FOREIGN KEY (`username`) REFERENCES `unverifiedusers` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `boards`
--

DROP TABLE IF EXISTS `boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(64) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `sidebar` text,
  `createdBy` int NOT NULL,
  `postCount` int DEFAULT '0',
  `numSubscribers` int DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `boardPicture` varchar(5000) NOT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_title` (`title`),
  KEY `fk_createdBy` (`createdBy`),
  CONSTRAINT `fk_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `boardsubscriptions`
--

DROP TABLE IF EXISTS `boardsubscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boardsubscriptions` (
  `userId` int NOT NULL,
  `boardId` int NOT NULL,
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `unique_user_board` (`boardId`,`userId`),
  KEY `fk_users_subscriptions` (`userId`),
  CONSTRAINT `fk_boards_subscriptions` FOREIGN KEY (`boardId`) REFERENCES `boards` (`id`),
  CONSTRAINT `fk_users_subscriptions` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL,
  `numVotes` int DEFAULT (1),
  `content` varchar(15000) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `userId` int NOT NULL,
  `postId` int DEFAULT NULL,
  `parentId` int DEFAULT NULL,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `user_id` (`userId`),
  KEY `post_id` (`postId`),
  KEY `parent_id` (`parentId`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`),
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`),
  CONSTRAINT `fk_comments_content` FOREIGN KEY (`id`) REFERENCES `content` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `commentvotes`
--

DROP TABLE IF EXISTS `commentvotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commentvotes` (
  `commentId` int DEFAULT NULL,
  `userId` int NOT NULL,
  `direction` int NOT NULL,
  KEY `comment_id` (`commentId`),
  KEY `user_id` (`userId`),
  CONSTRAINT `commentvotes_ibfk_1` FOREIGN KEY (`commentId`) REFERENCES `comments` (`id`),
  CONSTRAINT `commentvotes_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `content`
--

DROP TABLE IF EXISTS `content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `content` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('post','comment') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=439 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `senderId` int NOT NULL,
  `recipientId` int NOT NULL,
  `title` varchar(256) DEFAULT NULL,
  `body` text,
  `status` enum('unread','read') DEFAULT 'unread',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `parentId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`senderId`),
  KEY `recipient_id` (`recipientId`),
  KEY `fk_parent_id` (`parentId`),
  CONSTRAINT `fk_parent_id` FOREIGN KEY (`parentId`) REFERENCES `messages` (`id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipientId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `passwordresetcodes`
--

DROP TABLE IF EXISTS `passwordresetcodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passwordresetcodes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `resetCode` varchar(6) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `expiresAt` timestamp NULL DEFAULT ((now() + interval 20 minute)),
  PRIMARY KEY (`id`),
  KEY `fk_password_code_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `passwordresetratelimits`
--

DROP TABLE IF EXISTS `passwordresetratelimits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passwordresetratelimits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) DEFAULT NULL,
  `attemptCount` int DEFAULT '0',
  `firstAttempt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user` (`username`),
  CONSTRAINT `fk_username` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL,
  `title` varchar(300) NOT NULL,
  `numVotes` int DEFAULT (1),
  `content` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `boardId` int NOT NULL,
  `userId` int NOT NULL,
  `score` float NOT NULL,
  `link` text,
  `imgSrc` text,
  `commentCount` int DEFAULT '0',
  `rootCommentCount` int DEFAULT '0',
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`userId`),
  KEY `posts_ibfk_1` (`boardId`),
  CONSTRAINT `fk_posts_content` FOREIGN KEY (`id`) REFERENCES `content` (`id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`boardId`) REFERENCES `boards` (`id`),
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `postvotes`
--

DROP TABLE IF EXISTS `postvotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postvotes` (
  `userId` int NOT NULL,
  `postId` int NOT NULL,
  `direction` int NOT NULL,
  UNIQUE KEY `unique_user_post` (`userId`,`postId`),
  KEY `post_id` (`postId`),
  CONSTRAINT `postvotes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `postvotes_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` int NOT NULL,
  `description` varchar(256) DEFAULT NULL,
  `bio` text,
  `profilePicture` varchar(5000) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `systemmessages`
--

DROP TABLE IF EXISTS `systemmessages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `systemmessages` (
  `messageId` int NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `content` text NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`messageId`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Dumping data for table `systemmessages`
--

LOCK TABLES `systemmessages` WRITE;
/*!40000 ALTER TABLE `systemmessages` DISABLE KEYS */;
INSERT INTO `systemmessages` VALUES (16,'Welcome to Jibber (Jabber)!','<p>This personal project of mine is a platform for sharing news and discussing various topics. While it’s mainly created for demonstration purposes, it\'s fully functional, so feel free to create an account, make some posts, or comment on others! You\'re welcome to interact with the platform as you wish. If you\'re interested in how it all works, the full source code is available on my GitHub <a href=\'https://github.com/andyTD2/Jibber\' class=\'hover:underline\' style=\'color: #9a6bf1\'>here</a>.<br><br></p>','2025-03-20 01:43:36');
/*!40000 ALTER TABLE `systemmessages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unverifiedusers`
--

DROP TABLE IF EXISTS `unverifiedusers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unverifiedusers` (
  `email` varchar(320) NOT NULL,
  `userPassword` varchar(60) NOT NULL,
  `username` varchar(20) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`username`),
  UNIQUE KEY `userName` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userbans`
--

DROP TABLE IF EXISTS `userbans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userbans` (
  `banId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `scope` int DEFAULT NULL,
  `isSitewide` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`banId`),
  KEY `userId` (`userId`),
  KEY `scope` (`scope`),
  CONSTRAINT `userbans_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `userbans_ibfk_2` FOREIGN KEY (`scope`) REFERENCES `boards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userpermissions`
--

DROP TABLE IF EXISTS `userpermissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userpermissions` (
  `permissionId` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `permission` varchar(250) NOT NULL,
  `boardId` int DEFAULT NULL,
  PRIMARY KEY (`permissionId`),
  KEY `userId` (`userId`),
  KEY `fk_boardId` (`boardId`),
  CONSTRAINT `fk_boardId` FOREIGN KEY (`boardId`) REFERENCES `boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `userpermissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `userPassword` char(60) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `numVotes` int DEFAULT '0',
  `email` varchar(320) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'jibber-db'
--
/*!50003 DROP FUNCTION IF EXISTS `levenshtein` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `levenshtein`( s1 VARCHAR(255), s2 VARCHAR(255) ) RETURNS int
    DETERMINISTIC
BEGIN
        DECLARE s1_len, s2_len, i, j, c, c_temp, cost INT;
        DECLARE s1_char CHAR;
        
        DECLARE cv0, cv1 VARBINARY(256);

        SET s1_len = CHAR_LENGTH(s1), s2_len = CHAR_LENGTH(s2), cv1 = 0x00, j = 1, i = 1, c = 0;

        IF s1 = s2 THEN
            RETURN 0;
        ELSEIF s1_len = 0 THEN
            RETURN s2_len;
        ELSEIF s2_len = 0 THEN
            RETURN s1_len;
        ELSE
            WHILE j <= s2_len DO
                SET cv1 = CONCAT(cv1, UNHEX(HEX(j))), j = j + 1;
            END WHILE;
            WHILE i <= s1_len DO
                SET s1_char = SUBSTRING(s1, i, 1), c = i, cv0 = UNHEX(HEX(i)), j = 1;
                WHILE j <= s2_len DO
                    SET c = c + 1;
                    IF s1_char = SUBSTRING(s2, j, 1) THEN
                        SET cost = 0; ELSE SET cost = 1;
                    END IF;
                    SET c_temp = CONV(HEX(SUBSTRING(cv1, j, 1)), 16, 10) + cost;
                    IF c > c_temp THEN SET c = c_temp; END IF;
                    SET c_temp = CONV(HEX(SUBSTRING(cv1, j+1, 1)), 16, 10) + 1;
                    IF c > c_temp THEN
                        SET c = c_temp;
                    END IF;
                    SET cv0 = CONCAT(cv0, UNHEX(HEX(c))), j = j + 1;
                END WHILE;
                SET cv1 = cv0, i = i + 1;
            END WHILE;
        END IF;
        RETURN c;
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-26 19:09:42
