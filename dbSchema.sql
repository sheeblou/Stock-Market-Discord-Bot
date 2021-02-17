-- phpMyAdmin SQL Dump
-- version 4.6.6deb5
-- https://www.phpmyadmin.net/
--
-- Client :  localhost:3306
-- Généré le :  Mer 17 Février 2021 à 16:12
-- Version du serveur :  5.7.32-0ubuntu0.18.04.1
-- Version de PHP :  7.2.24-0ubuntu0.18.04.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `cryx300_stockmarket_discord`
--

-- --------------------------------------------------------

--
-- Structure de la table `limited_markets`
--

CREATE TABLE `limited_markets` (
  `markets` varchar(64) CHARACTER SET utf8 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `prefixserver`
--

CREATE TABLE `prefixserver` (
  `id` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prefix` text CHARACTER SET utf8mb4
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `stats_bot`
--

CREATE TABLE `stats_bot` (
  `timestamp` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `nb_servers` int(11) NOT NULL,
  `nb_users` int(11) NOT NULL,
  `total_money` decimal(50,5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `userdata`
--

CREATE TABLE `userdata` (
  `id` text,
  `money` decimal(50,5) DEFAULT NULL,
  `trades` text,
  `dailytime` decimal(50,1) DEFAULT NULL,
  `votetime` decimal(50,1) NOT NULL DEFAULT '0.0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
