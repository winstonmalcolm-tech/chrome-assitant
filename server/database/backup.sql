-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: mysql-11289512-jobboard-97.g.aivencloud.com    Database: assistant_db
-- ------------------------------------------------------
-- Server version	8.0.35

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

-- SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '17fa7e82-5e70-11f0-a568-862ccfb013c2:1-15,
-- 28e298e0-52b9-11f0-b221-862ccfb0531b:1-15,
-- 4206c247-b8b6-11ef-9eb2-4eff2159861f:1-15,
-- b16977d5-12f3-11f0-919a-12d6329d1ca1:1-127,
-- bdbbf025-9298-11f0-aac9-862ccfb0338e:1-457,
-- d4b985d2-3b5c-11f0-b2fc-862ccfb0734b:1-15,
-- ddd8b21f-2a91-11f0-a1b7-862ccfb01265:1-15,
-- e8da4c9b-f18a-11ef-8bf5-3252034c55d9:1-53,
-- fb30a03c-841b-11f0-b945-862ccfb00fcf:1-15,
-- ff165235-b4be-11ef-8fd8-065dcfe8b2c5:1-32';

--
-- Table structure for table `login_tokens_tbl`
--

DROP TABLE IF EXISTS `login_tokens_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_tokens_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `login_tokens_tbl_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users_tbl` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_tokens_tbl`
--

LOCK TABLES `login_tokens_tbl` WRITE;
/*!40000 ALTER TABLE `login_tokens_tbl` DISABLE KEYS */;
/*!40000 ALTER TABLE `login_tokens_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `magic_links_tbl`
--

DROP TABLE IF EXISTS `magic_links_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `magic_links_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `magic_links_tbl`
--

LOCK TABLES `magic_links_tbl` WRITE;
/*!40000 ALTER TABLE `magic_links_tbl` DISABLE KEYS */;
INSERT INTO `magic_links_tbl` VALUES (1,'winstonmalcolm77@gmail.com','2765451463ed19ab69d31e27dada376d2ddf6e09a3c179c4ba4e2540f049397b','2026-01-10 19:53:55',1,'2026-01-11 00:38:55'),(2,'winstonmalcolm77@gmail.com','f864cf2ccafd038554578737b4451cc95681f69b4bbc7fcc29235f9118d230c8','2026-01-10 20:10:09',1,'2026-01-11 00:55:10'),(5,'kailiawhi@gmail.com','4337b00f07a71b59ec51b17bd7623b6be7521a8135444aa03700d5b86a0ca717','2026-01-11 02:37:37',0,'2026-01-11 02:22:37'),(12,'winstonmalcolm77@gmail.com','25277bd8e4e716139e475509f477a3b530caa631c8cad076d40724cb086b18bd','2026-01-11 12:11:44',1,'2026-01-11 16:56:43');
/*!40000 ALTER TABLE `magic_links_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_tbl`
--

DROP TABLE IF EXISTS `message_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_role` varchar(11) NOT NULL,
  `content` longtext NOT NULL,
  `sentAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `message_tbl_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users_tbl` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_tbl`
--

LOCK TABLES `message_tbl` WRITE;
/*!40000 ALTER TABLE `message_tbl` DISABLE KEYS */;
INSERT INTO `message_tbl` VALUES (1,3,'user','How do I become a self-taught software engineer?','2026-01-11 01:01:28'),(2,3,'model','Becoming a self-taught software engineer is a rewarding journey! Here\'s a direct path:\n\n*   **Choose a Language:** Start with one popular language like Python or JavaScript.\n*   **Learn Fundamentals:** Understand core programming concepts: variables, loops, functions, data types.\n*   **Study Data Structures & Algorithms:** These are crucial for problem-solving.\n*   **Build Projects:** Apply what you learn by creating small to complex projects. This is key.\n    *   Start with simple tools.\n    *   Then build a web app, mobile app, or desktop tool.\n*   **Use Version Control (Git):** Learn Git and GitHub to manage your code.\n*   **Understand Software Development:** Learn about testing, debugging, and clean code principles.\n*   **Create a Portfolio:** Showcase your best projects online (e.g., GitHub, personal website).\n*   **Network:** Connect with other developers online or in person.\n*   **Practice Interviewing:** Solve coding challenges and prepare for technical questions.\n*   **Never Stop Learning:** The tech world constantly evolves. Embrace continuous learning.','2026-01-11 01:01:28');
/*!40000 ALTER TABLE `message_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans_tbl`
--

DROP TABLE IF EXISTS `subscription_plans_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `paddle_plan_id` varchar(130) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `billing_cycle` enum('once','monthly','yearly') NOT NULL DEFAULT 'once',
  `token_quota` bigint NOT NULL DEFAULT '8000',
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans_tbl`
--

LOCK TABLES `subscription_plans_tbl` WRITE;
/*!40000 ALTER TABLE `subscription_plans_tbl` DISABLE KEYS */;
INSERT INTO `subscription_plans_tbl` VALUES (1,'Free Plan',NULL,0.00,'once',8000,1,'2025-10-03 20:00:36'),(2,'Pro Plan',NULL,10.00,'monthly',6000000,1,'2025-10-03 20:00:37');
/*!40000 ALTER TABLE `subscription_plans_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_usage_tbl`
--

DROP TABLE IF EXISTS `token_usage_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_usage_tbl` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `usage_start` date NOT NULL,
  `usage_end` date DEFAULT NULL,
  `total_tokens` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_usage_tbl`
--

LOCK TABLES `token_usage_tbl` WRITE;
/*!40000 ALTER TABLE `token_usage_tbl` DISABLE KEYS */;
INSERT INTO `token_usage_tbl` VALUES (1,3,'2025-12-11',NULL,733),(2,5,'2026-01-10',NULL,0),(3,6,'2026-01-11',NULL,0),(4,7,'2026-01-11',NULL,0),(5,3,'2026-01-12','2026-02-12',0),(6,3,'2026-01-12','2026-02-12',0),(7,3,'2026-01-12','2026-02-12',0);
/*!40000 ALTER TABLE `token_usage_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_subscriptions_tbl`
--

DROP TABLE IF EXISTS `user_subscriptions_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_subscriptions_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `paddle_subscription_id` varchar(100) DEFAULT NULL,
  `paddle_customer_id` varchar(100) DEFAULT NULL,
  `plan_id` int NOT NULL,
  `status` enum('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid') NOT NULL,
  `start_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `next_bill_date` date DEFAULT NULL,
  `cancel_at` date DEFAULT NULL,
  `is_recurring` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paddle_subscription_id` (`paddle_subscription_id`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `user_subscriptions_tbl_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users_tbl` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_subscriptions_tbl_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans_tbl` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_subscriptions_tbl`
--

LOCK TABLES `user_subscriptions_tbl` WRITE;
/*!40000 ALTER TABLE `user_subscriptions_tbl` DISABLE KEYS */;
INSERT INTO `user_subscriptions_tbl` VALUES (1,1,NULL,NULL,1,'past_due','2025-10-04 02:02:54',NULL,NULL,0,'2025-10-04 02:02:54','2025-11-03 20:39:08'),(2,2,NULL,NULL,1,'active','2025-10-05 14:52:18',NULL,NULL,0,'2025-10-05 14:52:18','2025-10-05 14:52:18'),(4,4,NULL,NULL,1,'active','2025-10-05 15:09:48',NULL,NULL,0,'2025-10-05 15:09:48','2025-10-05 15:09:48'),(5,5,NULL,NULL,1,'active','2026-01-10 23:53:44',NULL,NULL,0,'2026-01-10 23:53:44','2026-01-10 23:53:44'),(6,6,NULL,NULL,1,'active','2026-01-11 00:28:16',NULL,NULL,0,'2026-01-11 00:28:16','2026-01-11 00:28:16'),(7,7,NULL,NULL,1,'active','2026-01-11 02:21:40',NULL,NULL,0,'2026-01-11 02:21:40','2026-01-11 02:21:40'),(10,3,'f5df649b-aaea-4b3f-85ee-9311f1ec3c5b','06470f63-59be-45e3-ae4e-d50e65dbb782',2,'active','2026-01-12 03:41:13','2026-02-12',NULL,1,'2026-01-12 03:40:17','2026-01-12 15:26:53');
/*!40000 ALTER TABLE `user_subscriptions_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_tbl`
--

DROP TABLE IF EXISTS `users_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_tbl` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_tbl`
--

LOCK TABLES `users_tbl` WRITE;
/*!40000 ALTER TABLE `users_tbl` DISABLE KEYS */;
INSERT INTO `users_tbl` VALUES (1,'Timmy','delivered@resend.dev','2025-10-04 02:02:54'),(2,'jaci','kmason.b1@gmail.com','2025-10-05 14:52:18'),(3,'Winston Malcolm','winstonmalcolm77@gmail.com','2025-10-05 15:06:05'),(4,'Winston Malcolm','winston.malcolm2016@gmail.com','2025-10-05 15:09:48'),(5,'Winston','malxprogrammer27@gmail.com','2026-01-10 23:53:44'),(6,'Malx','programmermalx27@gmail.com','2026-01-11 00:28:16'),(7,'Kailia','kailiawhi@gmail.com','2026-01-11 02:21:40');
/*!40000 ALTER TABLE `users_tbl` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-14 18:05:00
