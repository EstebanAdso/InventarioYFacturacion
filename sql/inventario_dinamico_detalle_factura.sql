-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: inventario_dinamico
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.28-MariaDB

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
-- Table structure for table `detalle_factura`
--

DROP TABLE IF EXISTS `detalle_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_factura` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `garantia` varchar(255) DEFAULT NULL,
  `precio_unitario` float NOT NULL,
  `factura_id` bigint(20) DEFAULT NULL,
  `producto_id` bigint(20) DEFAULT NULL,
  `nombre_producto` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKucgyfvfujw8g2tt3c6fdkxai` (`factura_id`),
  KEY `FKdch2fu45yordkhnsqsgrfkn3u` (`producto_id`),
  CONSTRAINT `FKdch2fu45yordkhnsqsgrfkn3u` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`),
  CONSTRAINT `FKucgyfvfujw8g2tt3c6fdkxai` FOREIGN KEY (`factura_id`) REFERENCES `factura` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_factura`
--

LOCK TABLES `detalle_factura` WRITE;
/*!40000 ALTER TABLE `detalle_factura` DISABLE KEYS */;
INSERT INTO `detalle_factura` VALUES (2,2,'Producto de alta calidad','2 años de garantía',50,2,40,NULL),(4,2,'Producto de alta calidad','2 años de garantía',50,3,40,NULL),(6,2,'Producto de alta calidad','2 años de garantía',50,4,40,NULL),(8,2,'Producto de alta calidad','2 años de garantía',50,5,40,NULL),(9,1,'Producto básico','1 año de garantía',100,5,41,NULL),(10,2,'Producto de alta calidad','2 años de garantía',50,6,40,NULL),(11,1,'Producto básico','1 año de garantía',100,6,41,NULL),(12,2,'Producto de alta calidad','2 años de garantía',50,7,40,NULL),(13,1,'Producto básico','1 año de garantía',100,7,41,NULL),(14,2,'Producto de alta calidad','2 años de garantía',50,9,40,NULL),(15,1,'Producto básico','1 año de garantía',100,9,41,NULL),(16,2,'Producto de alta calidad','2 años de garantía',50,10,40,NULL),(17,1,'Producto básico','1 año de garantía',100,10,41,NULL),(18,3,'ssd','3',150000,11,45,NULL),(19,3,'46','3',65000,12,46,NULL),(20,2,'45','2',150000,13,45,'SSD 512 GIGAS PATRIOT'),(21,3,'SSD','3',95000,14,44,'SSD 256 GIGAS PATRIOT'),(22,2,'44','2',95000,15,44,'SSD 256 GIGAS PATRIOT'),(23,1,'46','4',65000,15,46,'SSD 128 SOMMAMBULIST'),(24,3,'58','3',580000,15,58,'MONITOR DE 27 PULGADAS SANSUI'),(25,3,'ssd','3',150000,16,45,'SSD 512 GIGAS PATRIOT'),(26,3,'ssd','3',150000,17,45,'SSD 512 GIGAS PATRIOT'),(27,3,'3','3',65000,18,46,'SSD 128 SOMMAMBULIST'),(28,3,'ssd','3',95000,19,44,'SSD 256 GIGAS PATRIOT'),(29,3,'ssd','3',150000,20,47,'SSD 512 FIKWOT'),(30,1,'43','1',65000,21,43,'SSD 128 PATRIOT'),(31,3,'3','3',95000,22,44,'SSD 256 GIGAS PATRIOT'),(32,1,'45','3',150000,23,45,'SSD 512 GIGAS PATRIOT'),(33,1,'43','3',65000,23,43,'SSD 128 PATRIOT'),(34,3,'44','3',95000,25,44,'SSD 256 GIGAS PATRIOT'),(35,3,'ssd','3',65000,26,43,'SSD 128 PATRIOT'),(36,43,'ssd','1',65000,27,43,'SSD 128 PATRIOT'),(37,1,'ssd','3',65000,28,43,'SSD 128 PATRIOT'),(38,3,'ssd','3',150000,31,47,'SSD 512 FIKWOT'),(39,2,'ssd','2',150000,32,47,'SSD 512 FIKWOT'),(40,3,'ssd','3',65000,33,43,'SSD 128 PATRIOT'),(41,2,'3','3',65000,35,43,'SSD 128 PATRIOT'),(42,3,'43','3',65000,36,43,'SSD 128 PATRIOT'),(43,1,'ssd','1',350000,37,242,'Mesa Para pc'),(44,1,'1','1',350000,38,242,'Mesa Para pc'),(45,1,'ssd','3',65000,39,43,'SSD 128 PATRIOT'),(46,1,'ssd','1',65000,40,43,'SSD 128 PATRIOT'),(47,1,'ssd','1',65000,41,43,'SSD 128 PATRIOT'),(48,2,'2','2',65000,42,43,'SSD 128 PATRIOT'),(49,2,'re','3',300000,43,245,'Refrigueracion liquida'),(50,2,'ssd','2',36000,44,246,'Teclado de membrana hyte'),(51,2,'ssd','3',36000,45,246,NULL),(52,1,'membrana','3',36000,46,246,NULL),(53,1,'ssd','1',36000,47,246,NULL),(54,1,'5','1',36000,48,246,NULL),(55,19,'ssd','1',36000,50,246,NULL),(56,2,'teclado de membrana 247','2',36000,51,247,'Teclado de membrana hyte'),(57,10,'ssd','2',36000,52,247,'Teclado de membrana hyte'),(58,8,'ssd','3',36000,53,247,'Teclado de membrana hyte'),(59,3,'3','3',500000,54,248,'SSD CRUCIAL 4 TERAS '),(60,7,'ssd','3',500000,55,248,'SSD CRUCIAL 4 TERAS '),(61,1,'1','1',500000,56,248,'SSD CRUCIAL 4 TERAS ');
/*!40000 ALTER TABLE `detalle_factura` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-22 11:17:20
