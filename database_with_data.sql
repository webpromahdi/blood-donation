-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: blood_donation
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `target_audience` enum('all','donors','hospitals','seekers') DEFAULT 'all',
  `priority` enum('normal','high','urgent') DEFAULT 'normal',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','scheduled','published','archived') DEFAULT 'published',
  `admin_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `idx_announcements_status` (`status`),
  KEY `idx_announcements_target` (`target_audience`),
  KEY `idx_announcements_priority` (`priority`),
  KEY `idx_announcements_scheduled` (`scheduled_at`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `donation_id` int(11) DEFAULT NULL,
  `hospital_id` int(11) NOT NULL,
  `donor_id` int(11) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('scheduled','confirmed','completed','cancelled','no_show') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_appointments_donation` (`donation_id`),
  KEY `idx_appointments_hospital` (`hospital_id`),
  KEY `idx_appointments_donor` (`donor_id`),
  KEY `idx_appointments_date` (`appointment_date`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blogs`
--

DROP TABLE IF EXISTS `blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `author_id` int(11) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `status` enum('draft','published') DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `blogs_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blogs`
--

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blood_groups`
--

DROP TABLE IF EXISTS `blood_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blood_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blood_type` varchar(5) NOT NULL,
  `can_donate_to` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`can_donate_to`)),
  `can_receive_from` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`can_receive_from`)),
  `description` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `blood_type` (`blood_type`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blood_groups`
--

LOCK TABLES `blood_groups` WRITE;
/*!40000 ALTER TABLE `blood_groups` DISABLE KEYS */;
INSERT INTO `blood_groups` VALUES (1,'A+','[\"A+\", \"AB+\"]','[\"A+\", \"A-\", \"O+\", \"O-\"]','A Positive','2026-08-09 05:44:54'),(2,'A-','[\"A+\", \"A-\", \"AB+\", \"AB-\"]','[\"A-\", \"O-\"]','A Negative','2026-08-09 05:44:54'),(3,'B+','[\"B+\", \"AB+\"]','[\"B+\", \"B-\", \"O+\", \"O-\"]','B Positive','2026-08-09 05:44:54'),(4,'B-','[\"B+\", \"B-\", \"AB+\", \"AB-\"]','[\"B-\", \"O-\"]','B Negative','2026-08-09 05:44:54'),(5,'AB+','[\"AB+\"]','[\"A+\", \"A-\", \"B+\", \"B-\", \"AB+\", \"AB-\", \"O+\", \"O-\"]','AB Positive - Universal Recipient','2026-08-09 05:44:54'),(6,'AB-','[\"AB+\", \"AB-\"]','[\"A-\", \"B-\", \"AB-\", \"O-\"]','AB Negative','2026-08-09 05:44:54'),(7,'O+','[\"A+\", \"B+\", \"AB+\", \"O+\"]','[\"O+\", \"O-\"]','O Positive','2026-08-09 05:44:54'),(8,'O-','[\"A+\", \"A-\", \"B+\", \"B-\", \"AB+\", \"AB-\", \"O+\", \"O-\"]','[\"O-\"]','O Negative - Universal Donor','2026-08-09 05:44:54');
/*!40000 ALTER TABLE `blood_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blood_requests`
--

DROP TABLE IF EXISTS `blood_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blood_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_code` varchar(20) NOT NULL,
  `requester_id` int(11) NOT NULL,
  `requester_type` enum('hospital','seeker') NOT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_age` int(11) DEFAULT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `blood_group_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `units_fulfilled` int(11) DEFAULT 0,
  `hospital_id` int(11) DEFAULT NULL,
  `hospital_name` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `required_date` date NOT NULL,
  `medical_reason` text DEFAULT NULL,
  `urgency` enum('normal','emergency') DEFAULT 'normal',
  `status` enum('pending','approved','rejected','in_progress','completed','cancelled') DEFAULT 'pending',
  `admin_id` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_code` (`request_code`),
  KEY `hospital_id` (`hospital_id`),
  KEY `admin_id` (`admin_id`),
  KEY `idx_requests_code` (`request_code`),
  KEY `idx_requests_requester` (`requester_id`,`requester_type`),
  KEY `idx_requests_blood_group` (`blood_group_id`),
  KEY `idx_requests_status` (`status`),
  KEY `idx_requests_urgency` (`urgency`),
  KEY `idx_requests_date` (`required_date`),
  CONSTRAINT `blood_requests_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blood_requests_ibfk_2` FOREIGN KEY (`blood_group_id`) REFERENCES `blood_groups` (`id`),
  CONSTRAINT `blood_requests_ibfk_3` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `blood_requests_ibfk_4` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blood_requests`
--

LOCK TABLES `blood_requests` WRITE;
/*!40000 ALTER TABLE `blood_requests` DISABLE KEYS */;
INSERT INTO `blood_requests` VALUES (1,'REQ-REAL-17862965831',5,'seeker','Patient',NULL,'018',NULL,1,1,0,NULL,NULL,NULL,'2026-08-09',NULL,'normal','pending',NULL,NULL,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(2,'REQ-REAL-17862966061',5,'seeker','Patient',NULL,'018',NULL,1,1,0,NULL,NULL,NULL,'2026-08-09',NULL,'normal','pending',NULL,NULL,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(3,'REQ-REAL-17862966062',5,'seeker','Patient',NULL,'018',NULL,1,1,0,NULL,NULL,NULL,'2026-08-09',NULL,'normal','pending',NULL,NULL,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(4,'REQ-REAL-17862966063',5,'seeker','Patient',NULL,'018',NULL,1,1,0,NULL,NULL,NULL,'2026-08-09',NULL,'normal','pending',NULL,NULL,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(5,'REQ-REAL-17862966064',5,'seeker','Patient',NULL,'018',NULL,1,1,0,NULL,NULL,NULL,'2026-08-09',NULL,'normal','pending',NULL,NULL,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(6,'REQ-REAL-17862966065',5,'seeker','Patient',NULL,'018',NULL,1,1,0,NULL,NULL,NULL,'2026-08-09',NULL,'normal','pending',NULL,NULL,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06');
/*!40000 ALTER TABLE `blood_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `certificate_code` varchar(50) NOT NULL,
  `donation_id` int(11) NOT NULL,
  `donor_id` int(11) NOT NULL,
  `donor_name` varchar(255) NOT NULL,
  `blood_group` varchar(5) NOT NULL,
  `donation_date` date NOT NULL,
  `hospital_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `downloaded_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_code` (`certificate_code`),
  UNIQUE KEY `donation_id` (`donation_id`),
  KEY `idx_certificates_code` (`certificate_code`),
  KEY `idx_certificates_donation` (`donation_id`),
  KEY `idx_certificates_donor` (`donor_id`),
  CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_conversations`
--

DROP TABLE IF EXISTS `chat_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` varchar(50) NOT NULL,
  `user_1_id` int(11) NOT NULL,
  `user_2_id` int(11) NOT NULL,
  `last_message_id` int(11) DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `user_1_unread_count` int(11) DEFAULT 0,
  `user_2_unread_count` int(11) DEFAULT 0,
  `is_blocked` tinyint(1) DEFAULT 0,
  `blocked_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversation_id` (`conversation_id`),
  KEY `user_2_id` (`user_2_id`),
  KEY `last_message_id` (`last_message_id`),
  KEY `idx_users` (`user_1_id`,`user_2_id`),
  CONSTRAINT `chat_conversations_ibfk_1` FOREIGN KEY (`user_1_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_conversations_ibfk_2` FOREIGN KEY (`user_2_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_conversations_ibfk_3` FOREIGN KEY (`last_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_conversations`
--

LOCK TABLES `chat_conversations` WRITE;
/*!40000 ALTER TABLE `chat_conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` varchar(50) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `message_type` enum('text','system') DEFAULT 'text',
  `request_id` int(11) DEFAULT NULL,
  `donation_id` int(11) DEFAULT NULL,
  `voluntary_donation_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `voluntary_donation_id` (`voluntary_donation_id`),
  KEY `idx_conversation` (`conversation_id`,`created_at`),
  KEY `idx_sender` (`sender_id`,`created_at`),
  KEY `idx_receiver` (`receiver_id`,`is_read`,`created_at`),
  KEY `idx_unread` (`receiver_id`,`is_read`,`created_at`),
  KEY `idx_request_context` (`request_id`,`created_at`),
  KEY `idx_donation_context` (`donation_id`,`created_at`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_3` FOREIGN KEY (`request_id`) REFERENCES `blood_requests` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chat_messages_ibfk_4` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chat_messages_ibfk_5` FOREIGN KEY (`voluntary_donation_id`) REFERENCES `voluntary_donations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read','replied') DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `donations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_id` int(11) NOT NULL,
  `donor_id` int(11) NOT NULL,
  `status` enum('accepted','on_the_way','reached','completed','cancelled') DEFAULT 'accepted',
  `quantity` int(11) DEFAULT 1,
  `accepted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `started_at` timestamp NULL DEFAULT NULL,
  `reached_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_donations_request` (`request_id`),
  KEY `idx_donations_donor` (`donor_id`),
  KEY `idx_donations_status` (`status`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `blood_requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `donations_ibfk_2` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
INSERT INTO `donations` VALUES (2,2,1,'completed',1,'2026-08-09 17:30:06',NULL,NULL,'2026-08-09 13:30:06',NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(3,3,1,'completed',1,'2026-08-09 17:30:06',NULL,NULL,'2026-08-09 13:30:06',NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(4,4,1,'completed',1,'2026-08-09 17:30:06',NULL,NULL,'2026-08-09 13:30:06',NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(5,5,1,'completed',1,'2026-08-09 17:30:06',NULL,NULL,'2026-08-09 13:30:06',NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(6,6,1,'completed',1,'2026-08-09 17:30:06',NULL,NULL,'2026-08-09 13:30:06',NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06');
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donor_health`
--

DROP TABLE IF EXISTS `donor_health`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `donor_health` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `donor_id` int(11) NOT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `blood_pressure_systolic` int(11) DEFAULT NULL,
  `blood_pressure_diastolic` int(11) DEFAULT NULL,
  `hemoglobin` decimal(4,2) DEFAULT NULL,
  `has_diabetes` tinyint(1) DEFAULT 0,
  `has_hypertension` tinyint(1) DEFAULT 0,
  `has_heart_disease` tinyint(1) DEFAULT 0,
  `has_blood_disorders` tinyint(1) DEFAULT 0,
  `has_infectious_disease` tinyint(1) DEFAULT 0,
  `has_asthma` tinyint(1) DEFAULT 0,
  `has_allergies` tinyint(1) DEFAULT 0,
  `has_recent_surgery` tinyint(1) DEFAULT 0,
  `is_on_medication` tinyint(1) DEFAULT 0,
  `smoking_status` enum('no','occasionally','regularly') DEFAULT 'no',
  `alcohol_consumption` enum('none','occasionally','regularly') DEFAULT 'none',
  `exercise_frequency` enum('rarely','weekly','daily') DEFAULT 'rarely',
  `medications` text DEFAULT NULL,
  `allergies_details` text DEFAULT NULL,
  `last_medical_checkup` date DEFAULT NULL,
  `additional_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `donor_id` (`donor_id`),
  KEY `idx_donor_health_donor` (`donor_id`),
  CONSTRAINT `donor_health_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donor_health`
--

LOCK TABLES `donor_health` WRITE;
/*!40000 ALTER TABLE `donor_health` DISABLE KEYS */;
INSERT INTO `donor_health` VALUES (1,1,NULL,NULL,NULL,13.00,0,0,0,0,0,0,0,0,0,'no','none','rarely',NULL,NULL,NULL,NULL,'2026-08-09 05:53:02','2026-08-09 05:53:02');
/*!40000 ALTER TABLE `donor_health` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donors`
--

DROP TABLE IF EXISTS `donors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `donors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `blood_group_id` int(11) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `total_donations` int(11) DEFAULT 0,
  `last_donation_date` date DEFAULT NULL,
  `next_eligible_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_donors_user` (`user_id`),
  KEY `idx_donors_blood_group` (`blood_group_id`),
  KEY `idx_donors_city` (`city`),
  KEY `idx_donors_available` (`is_available`),
  CONSTRAINT `donors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `donors_ibfk_2` FOREIGN KEY (`blood_group_id`) REFERENCES `blood_groups` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donors`
--

LOCK TABLES `donors` WRITE;
/*!40000 ALTER TABLE `donors` DISABLE KEYS */;
INSERT INTO `donors` VALUES (1,3,1,25,65.00,'male','Dhaka','123 Demo St',1,2,'2026-08-08','2026-11-06','2026-08-09 05:45:02','2026-08-09 17:13:19'),(102,177,2,25,70.00,'male','Rajshahi','Rajshahi, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(103,178,3,25,70.00,'male','Chittagong','Chittagong, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(104,179,4,25,70.00,'male','Sylhet','Sylhet, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(105,180,5,25,70.00,'male','Rajshahi','Rajshahi, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(106,181,6,25,70.00,'male','Dhaka','Dhaka, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(107,182,7,25,70.00,'male','Chittagong','Chittagong, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(108,183,8,25,70.00,'male','Dhaka','Dhaka, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(109,184,1,25,70.00,'male','Sylhet','Sylhet, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(110,185,2,25,70.00,'male','Sylhet','Sylhet, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(111,186,3,25,70.00,'male','Rajshahi','Rajshahi, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(112,187,4,25,70.00,'male','Chittagong','Chittagong, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(113,188,5,25,70.00,'male','Chittagong','Chittagong, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(114,192,2,25,70.00,'male','Rajshahi','Rajshahi, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(115,193,3,25,70.00,'male','Dhaka','Dhaka, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(116,194,4,25,70.00,'male','Chittagong','Chittagong, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(117,195,5,25,70.00,'male','Dhaka','Dhaka, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(118,196,6,25,70.00,'male','Sylhet','Sylhet, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(119,197,7,25,70.00,'male','Rajshahi','Rajshahi, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(120,198,8,25,70.00,'male','Rajshahi','Rajshahi, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(121,199,1,25,70.00,'male','Dhaka','Dhaka, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(122,200,2,25,70.00,'male','Rajshahi','Rajshahi, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(123,201,3,25,70.00,'male','Rajshahi','Rajshahi, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(124,202,4,25,70.00,'male','Rajshahi','Rajshahi, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(125,203,5,25,70.00,'male','Dhaka','Dhaka, Bangladesh',1,0,NULL,NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06');
/*!40000 ALTER TABLE `donors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospital_inventory`
--

DROP TABLE IF EXISTS `hospital_inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hospital_inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hospital_id` int(11) NOT NULL,
  `blood_group_id` int(11) NOT NULL,
  `units` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_hospital_blood` (`hospital_id`,`blood_group_id`),
  KEY `blood_group_id` (`blood_group_id`),
  CONSTRAINT `hospital_inventory_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hospital_inventory_ibfk_2` FOREIGN KEY (`blood_group_id`) REFERENCES `blood_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospital_inventory`
--

LOCK TABLES `hospital_inventory` WRITE;
/*!40000 ALTER TABLE `hospital_inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `hospital_inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospitals`
--

DROP TABLE IF EXISTS `hospitals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hospitals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `hospital_type` enum('government','private','charity') DEFAULT 'private',
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `operating_hours` varchar(100) DEFAULT NULL,
  `license_expiry_date` date DEFAULT NULL,
  `has_blood_bank` tinyint(1) DEFAULT 0,
  `total_requests` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `idx_hospitals_user` (`user_id`),
  KEY `idx_hospitals_city` (`city`),
  KEY `idx_hospitals_registration` (`registration_number`),
  CONSTRAINT `hospitals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospitals`
--

LOCK TABLES `hospitals` WRITE;
/*!40000 ALTER TABLE `hospitals` DISABLE KEYS */;
INSERT INTO `hospitals` VALUES (1,4,'REG12345','private','Demo Hospital Ave','Dhaka',NULL,NULL,'https://demohospital.com','Dr. Smith',NULL,NULL,0,0,'2026-08-09 05:45:02','2026-08-09 05:45:02'),(22,189,'REG-REAL-91774','private','Sylhet Medical Area','Sylhet',NULL,NULL,NULL,'Contact Person',NULL,NULL,0,0,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(23,190,'REG-REAL-77776','private','Chittagong Medical Area','Chittagong',NULL,NULL,NULL,'Contact Person',NULL,NULL,0,0,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(24,191,'REG-REAL-81386','private','Rajshahi Medical Area','Rajshahi',NULL,NULL,NULL,'Contact Person',NULL,NULL,0,0,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(25,204,'REG-REAL-59533','private','Rajshahi Medical Area','Rajshahi',NULL,NULL,NULL,'Contact Person',NULL,NULL,0,0,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(26,205,'REG-REAL-84963','private','Chittagong Medical Area','Chittagong',NULL,NULL,NULL,'Contact Person',NULL,NULL,0,0,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(27,206,'REG-REAL-73925','private','Rajshahi Medical Area','Rajshahi',NULL,NULL,NULL,'Contact Person',NULL,NULL,0,0,'2026-08-09 17:30:06','2026-08-09 17:30:06');
/*!40000 ALTER TABLE `hospitals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error','request','donation','announcement') DEFAULT 'info',
  `related_type` varchar(50) DEFAULT NULL,
  `related_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_read` (`is_read`),
  KEY `idx_notifications_type` (`type`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seekers`
--

DROP TABLE IF EXISTS `seekers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seekers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `total_requests` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_seekers_user` (`user_id`),
  KEY `idx_seekers_city` (`city`),
  CONSTRAINT `seekers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seekers`
--

LOCK TABLES `seekers` WRITE;
/*!40000 ALTER TABLE `seekers` DISABLE KEYS */;
INSERT INTO `seekers` VALUES (1,5,'Dhaka','456 Seeker Rd',2,'2026-08-09 05:45:02','2026-08-09 14:17:48');
/*!40000 ALTER TABLE `seekers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `auth_provider` enum('credentials','google') NOT NULL DEFAULT 'credentials',
  `google_id` varchar(255) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','donor','hospital','seeker') NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'approved',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=207 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@bloodconnect.com','$2y$10$PoNoNzrsSKW3WEOkAiWUOuZA1H57AMsK6SpBrDyGF6z1SXpmpiIWW','System Admin','1234567890','admin','approved',NULL,'2026-08-09 05:44:55','2026-08-09 05:44:55'),(2,'admin@demo.com','$2y$10$yKlvxUxNTyR/Z53Uq951M.GVzAtsbgMeP0NjMLk5R3GK2qC/3S9pC','Demo Admin',NULL,'admin','approved',NULL,'2026-08-09 05:45:01','2026-08-09 05:45:01'),(3,'donor@demo.com','$2y$10$GT7u6ZcRbto7imQPHluDTutu7WwW8N90rMUnNeAfaccxO9dTdrke.','Demo Donor',NULL,'donor','approved',NULL,'2026-08-09 05:45:02','2026-08-09 05:45:02'),(4,'hospital@demo.com','$2y$10$RMchIGZxJ8/jts43N1zzM.tlUF427OfHYWLCeBjOVsD8Q5AC0dfg.','Demo Hospital',NULL,'hospital','approved',NULL,'2026-08-09 05:45:02','2026-08-09 05:45:02'),(5,'seeker@demo.com','$2y$10$X4t7oKexrX2QWBIa0.pZMOj2NJo9oixFpzKB587ZZE6wi8n4wB2Ti','Demo Seeker',NULL,'seeker','approved',NULL,'2026-08-09 05:45:02','2026-08-09 05:45:02'),(177,'realdonor1_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 1','01730154013','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(178,'realdonor2_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 2','01728611495','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(179,'realdonor3_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 3','01745145145','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(180,'realdonor4_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 4','01787400209','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(181,'realdonor5_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 5','01763357923','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(182,'realdonor6_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 6','01713963980','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(183,'realdonor7_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 7','01773342563','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(184,'realdonor8_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 8','01775769015','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(185,'realdonor9_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 9','01798941965','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(186,'realdonor10_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 10','01712307596','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(187,'realdonor11_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 11','01767895427','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(188,'realdonor12_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Donor 12','01729643344','donor','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(189,'realhospital1_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Hospital 1','01965895627','hospital','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(190,'realhospital2_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Hospital 2','01945104114','hospital','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(191,'realhospital3_1786296583@test.com','$2y$10$1VpY7jWuHb3BpxwwqJFDlOdY.rWOXewQrjhP7BF3Yjo2nWeerdNOW','Real Hospital 3','01983782716','hospital','approved',NULL,'2026-08-09 17:29:43','2026-08-09 17:29:43'),(192,'realdonor1_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 1','01722869646','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(193,'realdonor2_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 2','01741406037','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(194,'realdonor3_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 3','01735006162','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(195,'realdonor4_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 4','01731055444','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(196,'realdonor5_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 5','01779947513','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(197,'realdonor6_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 6','01743973395','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(198,'realdonor7_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 7','01778502878','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(199,'realdonor8_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 8','01786339486','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(200,'realdonor9_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 9','01711572264','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(201,'realdonor10_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 10','01760675171','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(202,'realdonor11_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 11','01788362790','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(203,'realdonor12_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Donor 12','01790784236','donor','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(204,'realhospital1_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Hospital 1','01998528228','hospital','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(205,'realhospital2_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Hospital 2','01959444217','hospital','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06'),(206,'realhospital3_1786296606@test.com','$2y$10$gfZEKUYsM2VMzKCmE0ttTus5EWVJ6KSk3tU.60Q0mhhS/2ktnm8kq','Real Hospital 3','01919824571','hospital','approved',NULL,'2026-08-09 17:30:06','2026-08-09 17:30:06');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voluntary_donations`
--

DROP TABLE IF EXISTS `voluntary_donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `voluntary_donations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `donor_id` int(11) NOT NULL,
  `blood_group_id` int(11) NOT NULL,
  `city` varchar(100) NOT NULL,
  `availability_date` date NOT NULL,
  `preferred_time` enum('morning','afternoon','evening','any') DEFAULT 'any',
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','scheduled','rejected','completed','cancelled') DEFAULT 'pending',
  `approved_by_admin_id` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `hospital_id` int(11) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `scheduled_time` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `approved_by_admin_id` (`approved_by_admin_id`),
  KEY `hospital_id` (`hospital_id`),
  KEY `idx_voluntary_donor` (`donor_id`),
  KEY `idx_voluntary_blood_group` (`blood_group_id`),
  KEY `idx_voluntary_city` (`city`),
  KEY `idx_voluntary_status` (`status`),
  KEY `idx_voluntary_date` (`availability_date`),
  CONSTRAINT `voluntary_donations_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `voluntary_donations_ibfk_2` FOREIGN KEY (`blood_group_id`) REFERENCES `blood_groups` (`id`),
  CONSTRAINT `voluntary_donations_ibfk_3` FOREIGN KEY (`approved_by_admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `voluntary_donations_ibfk_4` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voluntary_donations`
--

LOCK TABLES `voluntary_donations` WRITE;
/*!40000 ALTER TABLE `voluntary_donations` DISABLE KEYS */;
/*!40000 ALTER TABLE `voluntary_donations` ENABLE KEYS */;
UNLOCK TABLES;

--

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-10  0:32:33
