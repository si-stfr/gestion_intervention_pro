-- Script MySQL Workbench / Aiven
-- Sélectionner la base cible Aiven dans Workbench avant l'exécution.
-- L'import recrée les tables et remplace les données existantes.
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 08 sep. 2026 à 13:54
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET NAMES utf8mb4;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
START TRANSACTION;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_intervention`
--

USE `gestion_intervention`;

DROP TABLE IF EXISTS `intervention_materiel`;
DROP TABLE IF EXISTS `actions_realisees`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `interventions`;
DROP TABLE IF EXISTS `materiels`;
DROP TABLE IF EXISTS `users`;

-- --------------------------------------------------------

--
-- Structure de la table `actions_realisees`
--

CREATE TABLE `actions_realisees` (
  `id` int(11) NOT NULL,
  `intervention_id` int(11) NOT NULL,
  `action_nom` enum('Nettoyage_systeme','Suppression_virus_ou_malware','Installation_logiciel','Reinstallation_systeme','Remplacement_materiel','Configuration_reseau','Sauvegarde_ou_Restauration','Mise_a_jour_systeme','Autre') NOT NULL,
  `action_autre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `interventions`
--

CREATE TABLE `interventions` (
  `id` int(11) NOT NULL,
  `Date_de_la_demande` date NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description_de_la_panne` text NOT NULL,
  `source_demande` enum('Direct','E-mail','Formcreator','Helpdesk','Other','Phone','Written') NOT NULL,
  `urgence` enum('Très haute','Haute','Moyenne','Basse','Très basse') NOT NULL,
  `impact` enum('Très haut','Haut','Moyen','Bas','Très bas') NOT NULL,
  `priorite` enum('Majeure','Très haute','Moyenne','Basse','Très basse') NOT NULL,
  `type_intervention` enum('Livraison','Installation','Livraison + Installation','Stockage','Prêt de Matériel','Mise à jour','Autre') NOT NULL,
  `type_intervention_autre` varchar(255) DEFAULT NULL,
  `diagnostique_effectue` text DEFAULT NULL,
  `resultat_intervention` enum('Problème résolu','Nouvelle intervention nécessaire') DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `statut` enum('SIGNALE','EN_COURS','EN_RETARD','EN_ATTENTE_VALIDATION','ABOUTI','IMPOSSIBLE') NOT NULL DEFAULT 'SIGNALE',
  `date_debut` date NOT NULL,
  `echeance` date NOT NULL,
  `date_fin` date NOT NULL,
  `lieu` text DEFAULT NULL COMMENT 'Lieu de l''intervention',
  `demandeur_id` int(11) NOT NULL,
  `technicien_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `actions_realisees` varchar(500) DEFAULT NULL,
  `actions_autre` varchar(255) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `date_verification` date DEFAULT NULL,
  `lock_statut` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `interventions`
--

INSERT INTO `interventions` (`id`, `Date_de_la_demande`, `titre`, `description_de_la_panne`, `source_demande`, `urgence`, `impact`, `priorite`, `type_intervention`, `type_intervention_autre`, `diagnostique_effectue`, `resultat_intervention`, `commentaire`, `statut`, `date_debut`, `echeance`, `date_fin`, `lieu`, `demandeur_id`, `technicien_id`, `created_at`, `actions_realisees`, `actions_autre`, `manager_id`, `date_verification`, `lock_statut`) VALUES
(1, '2026-05-20', 'Test', 'CONCLUANT', 'Direct', 'Très haute', 'Très haut', 'Majeure', 'Livraison', NULL, 'il apparait que c\'est bon', 'Problème résolu', 'Je sens que ça va être long...', 'EN_COURS', '2026-05-20', '2026-05-21', '2026-05-22', '99.9', 6, 5, '2026-05-19 12:59:02', 'Demander à Chatpgt', '', 7, '2026-05-22', 1),
(3, '2026-05-22', 'test2', 'ceci est un nouveau test', 'Phone', 'Haute', 'Moyen', 'Moyenne', 'Installation', NULL, NULL, NULL, NULL, 'SIGNALE', '2026-05-22', '2026-05-23', '2026-05-24', '77.7', 8, 5, '2026-05-23 05:14:18', NULL, NULL, NULL, NULL, 0),
(4, '2026-09-07', 'Test 3', 'J\'espère que ça marchera', 'Direct', 'Très haute', 'Très haut', 'Majeure', 'Livraison', NULL, 'ça peut marcher', 'Problème résolu', 'ça fonctionne', 'IMPOSSIBLE', '2026-09-07', '2026-09-08', '2026-09-09', 'CTM', 4, 5, '2026-09-07 20:45:51', 'Demander à Chatgpt', NULL, 7, '2026-09-07', 1);

-- --------------------------------------------------------

--
-- Structure de la table `intervention_materiel`
--

CREATE TABLE `intervention_materiel` (
  `intervention_id` int(11) NOT NULL,
  `materiel_id` int(11) NOT NULL,
  `quantite` int(11) NOT NULL,
  PRIMARY KEY (`intervention_id`, `materiel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `intervention_materiel`
--

INSERT INTO `intervention_materiel` (`intervention_id`, `materiel_id`, `quantite`) VALUES
(4, 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `materiels`
--

CREATE TABLE `materiels` (
  `id` int(11) NOT NULL,
  `intervention_id` int(11) DEFAULT NULL,
  `type_de_materiel` varchar(255) NOT NULL,
  `marque_ou_modele` varchar(255) DEFAULT NULL,
  `numero_de_serie` varchar(255) DEFAULT NULL,
  `utilisateur_concerne_id` int(11) NOT NULL,
  `lieu_stockage` varchar(255) DEFAULT NULL,
  `statut` varchar(255) DEFAULT NULL,
  `quantite` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `materiels`
--

INSERT INTO `materiels` (`id`, `intervention_id`, `type_de_materiel`, `marque_ou_modele`, `numero_de_serie`, `utilisateur_concerne_id`, `lieu_stockage`, `statut`, `quantite`) VALUES
(1, NULL, 'Equipement public', 'PNY', 'SN-6477-AC', 5, '', 'En état', 1);

-- --------------------------------------------------------

--
-- Structure de la table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `token`, `user_id`, `expires_at`) VALUES
(1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk3MzA2MDAsInR5cGUiOiJyZWZyZXNoIn0.Oa9Tq8Wt1Bwk43D8znAj3rU5oRmlqjm_1_5U_LY-uBw', 4, '2026-05-25 17:36:40'),
(2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk3MzEwODMsInR5cGUiOiJyZWZyZXNoIn0.rqmfwqM3pNPG6qr6yghOU8MzEKGUlekhaCbJYDPzjUg', 4, '2026-05-25 17:44:43'),
(3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk3MzEyMzMsInR5cGUiOiJyZWZyZXNoIn0.mt0eIHeMnRxz8DP3Y-FSWwbRFT9L2W622cTv5rmbRtM', 4, '2026-05-25 17:47:13'),
(4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk3MzE2NDQsInR5cGUiOiJyZWZyZXNoIn0.1DAvQEnNuxD5BHJCTvEORNoTClG0diwAHObsJJDuMaQ', 4, '2026-05-25 17:54:04'),
(5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk3MzYxOTgsInR5cGUiOiJyZWZyZXNoIn0.CIuYOLt-H4L-jCHZbLZMCQPcbYIj29AjyTfKWNrOpMg', 4, '2026-05-25 19:09:58'),
(6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk3OTUwNzUsInR5cGUiOiJyZWZyZXNoIn0.wE8LRjCZ6TO8WRojjSYVD-ydpwAJbrOj1tXdt0kNIuM', 4, '2026-05-26 11:31:15'),
(7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk3OTg2NzcsInR5cGUiOiJyZWZyZXNoIn0.twy3fKNzEhEhSCaX63Et0qy6vZJsFf7p6LbSJJ2LOyI', 4, '2026-05-26 12:31:17'),
(8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk4MDA5MzgsInR5cGUiOiJyZWZyZXNoIn0.hyehFRGDaisbuMgUw4tf_ZUb38Uyi-oJ3ci3SlONqUY', 4, '2026-05-26 13:08:58'),
(9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3Nzk4ODQ1MDAsInR5cGUiOiJyZWZyZXNoIn0.-05PudZqb8XFG9LAZP9uy5tNr0nAAsy4LiMpHpyT_-8', 7, '2026-05-27 12:21:40'),
(10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk4ODQ1MjAsInR5cGUiOiJyZWZyZXNoIn0.sz55DzYpC1CWNPd09mz0Gr7qNyCqVLtO8Ii1dQijdfY', 4, '2026-05-27 12:22:00'),
(11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3Nzk4ODQ1NjcsInR5cGUiOiJyZWZyZXNoIn0.DqwNGhu4CrrVDgjyTNs8DF1pOIiV8s3Rd8BYc0-f1oY', 7, '2026-05-27 12:22:47'),
(12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3Nzk4ODQ3MTAsInR5cGUiOiJyZWZyZXNoIn0.RYfFDWRTIGQH_RdiCLLgdEmPKTL1Pd0CfM7J-6d0EOo', 7, '2026-05-27 12:25:10'),
(13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk4ODQ3MjksInR5cGUiOiJyZWZyZXNoIn0.dKyrXMun58uMx_LvqX3Dzg2CmFyhwRd2OpXsNpGAMrw', 4, '2026-05-27 12:25:29'),
(14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk4ODY5ODksInR5cGUiOiJyZWZyZXNoIn0.pqbMd580h1CPrMxbQ5WOHl7OSjOm-a9nrwraDzxK0Ms', 4, '2026-05-27 13:03:09'),
(15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk4OTA5MDUsInR5cGUiOiJyZWZyZXNoIn0.G2NGVl5lcD_OZSurzGE_uMtbaSAhYQ33CP3J5OjisFg', 4, '2026-05-27 14:08:25'),
(16, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk4OTUwMjQsInR5cGUiOiJyZWZyZXNoIn0.ounHAKVmCRMwaT08sTmTdsIa6nd5_pYmCrr7qiB2-f0', 4, '2026-05-27 15:17:04'),
(17, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk4OTkzODQsInR5cGUiOiJyZWZyZXNoIn0.NcJp_rMF_8S2n3qgb8OKpKE_40lcs6U0FbnViIDvw4I', 4, '2026-05-27 16:29:44'),
(18, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk5MjAwNzcsInR5cGUiOiJyZWZyZXNoIn0.34TgbSS15ObIxm6DnXIURaCWFv4PEhvt0tnRIUnAMp4', 4, '2026-05-27 22:14:37'),
(19, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk5MjYxNDUsInR5cGUiOiJyZWZyZXNoIn0.5Fy4YtQzrM_s9vC_GypA6YJLJP_mJoTVJ9DIZhfjZCw', 4, '2026-05-27 23:55:45'),
(20, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk5MzAwMzMsInR5cGUiOiJyZWZyZXNoIn0.oZ9tJ28iU0rbvDC2rAAl9La5TGuK2PTNdpvzp8BEduo', 4, '2026-05-28 01:00:33'),
(21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk5MzM4NDgsInR5cGUiOiJyZWZyZXNoIn0.NBTKLP3FuOIJAnjL-yadBh5WYM42usVOKLF327Owl_c', 4, '2026-05-28 02:04:08'),
(22, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk5NjgwMzUsInR5cGUiOiJyZWZyZXNoIn0.FzTanHrE1qC2PobTFUkR0DfrxNmitvIR_CHyId-YahQ', 4, '2026-05-28 11:33:55'),
(23, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3Nzk5NjgzNDMsInR5cGUiOiJyZWZyZXNoIn0.fM93nTYXT9G9el_NlyjZn5ADly1PjaG0Y4SWn0VFKbs', 5, '2026-05-28 11:39:03'),
(24, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3Nzk5NzcwNTMsInR5cGUiOiJyZWZyZXNoIn0.X0-hIKhYAMbZX_gL_JP5-fgtly0RyLVuaMIl5n3z-Dw', 5, '2026-05-28 14:04:13'),
(25, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3Nzk5ODEyMTUsInR5cGUiOiJyZWZyZXNoIn0.UdKTzx2UimKbcLhg_frNr_7CTerNIkVlw0MR0s7Flys', 5, '2026-05-28 15:13:35'),
(26, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3Nzk5ODI2MzEsInR5cGUiOiJyZWZyZXNoIn0.lOeG2RDBoFpm0mEKCD3HtM1nkDnNuIs1neQ9-gvlXss', 5, '2026-05-28 15:37:11'),
(27, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3Nzk5ODczMjYsInR5cGUiOiJyZWZyZXNoIn0.DW2vJ779L2eaKj4n78sh30ZdKu_3j9tH95cEf22UJJE', 5, '2026-05-28 16:55:26'),
(28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3Nzk5OTI0MjksInR5cGUiOiJyZWZyZXNoIn0.tDDAqDsbu_4xnlo7qzy0iiD_i51BHVV4QTWNAC_0IA4', 5, '2026-05-28 18:20:29'),
(29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3Nzk5OTcxMTUsInR5cGUiOiJyZWZyZXNoIn0.a3HsrfUm1-UKZZ9t5i9YJe4mfGemYPiumQiYNqb1r9k', 4, '2026-05-28 19:38:35'),
(30, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3Nzk5OTcyNjEsInR5cGUiOiJyZWZyZXNoIn0.vWA_LY7PdoS1sTtenW8JQ3A9VyHT_ygEkv_lndTeOHU', 5, '2026-05-28 19:41:01'),
(31, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNTQ0MDksInR5cGUiOiJyZWZyZXNoIn0.72ErhKmlThb1b2fzLCPvMnS4tZIY0mR0O8QlLVjegEA', 5, '2026-05-29 11:33:29'),
(32, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODAwNTY3NjgsInR5cGUiOiJyZWZyZXNoIn0.bF31rd4Lseygfqnu9o-dHkP1zDK4L9Nj8fs0aXRS_Oo', 7, '2026-05-29 12:12:48'),
(33, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNTcxNDEsInR5cGUiOiJyZWZyZXNoIn0.q9w4XsNDTwbM_KzfjmQgBx56aI7gXehSj_bFeyJZAhc', 5, '2026-05-29 12:19:01'),
(34, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNTc0MTcsInR5cGUiOiJyZWZyZXNoIn0.WZa90rkmzApBfY9aoPncc1H8laEU0SKyB4KqI0XRRHA', 5, '2026-05-29 12:23:37'),
(35, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODAwNTg0ODksInR5cGUiOiJyZWZyZXNoIn0.MVy08-ESxDpZ00laY8-yNfP_JFWbFkDrFFBSaIKeOLo', 7, '2026-05-29 12:41:29'),
(36, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNTg3NzMsInR5cGUiOiJyZWZyZXNoIn0.eRehTFrTTyOj-7vpdRGxlOBgB8KVxy15yywwpX92dtU', 5, '2026-05-29 12:46:13'),
(37, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODAwNTg4MTQsInR5cGUiOiJyZWZyZXNoIn0.uvAODyWetovlgnmmLVR90-ZGZ5JgIAofgJQgbNWnWTM', 7, '2026-05-29 12:46:54'),
(38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNTk3NzMsInR5cGUiOiJyZWZyZXNoIn0.euqStX1EsUkx9IAcFs-KCRIZjqJTMLQ2Oq9_gFxWWe8', 5, '2026-05-29 13:02:53'),
(39, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODAwNjA3MDksInR5cGUiOiJyZWZyZXNoIn0.ma314B46AAhaPpaddI8MapdXglA3fqvRLJZz1S7Bwlw', 7, '2026-05-29 13:18:29'),
(40, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNjA3NDAsInR5cGUiOiJyZWZyZXNoIn0.1crVq0cb-R-zcvYfyb1Mp2Q4vZsfbNMOCwzIdXq-gMk', 5, '2026-05-29 13:19:00'),
(41, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODAwNjA5NzYsInR5cGUiOiJyZWZyZXNoIn0.Z3Y33kpMmBFLpvAyxihcArRUmWfkMz2GCOdejVEizWw', 7, '2026-05-29 13:22:56'),
(42, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNjA5OTEsInR5cGUiOiJyZWZyZXNoIn0.9xEtGOfAVtBaRQ78AboeEWvZt88i_HmneyhIATnIOTE', 5, '2026-05-29 13:23:11'),
(43, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODAwNjExNTksInR5cGUiOiJyZWZyZXNoIn0.kwQzCN_skJByLedOt2nLYWpQVo5A_icUFKt31Ukx7fU', 7, '2026-05-29 13:25:59'),
(44, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNjE2ODMsInR5cGUiOiJyZWZyZXNoIn0.35dccZ58o45j2Qla7YM98zXUAYOmAuROEuCGf50lrgo', 5, '2026-05-29 13:34:43'),
(45, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNjU1MjUsInR5cGUiOiJyZWZyZXNoIn0.hNlmK_YJAprPd7R0z9lM9j_QWQz_YgQSs0IZUwPC0C8', 5, '2026-05-29 14:38:45'),
(46, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODAwNjkzNDAsInR5cGUiOiJyZWZyZXNoIn0.nvot-Bveu5VcGcBC4FWFJrC2-_QWJ8n3mMTXAEn6w98', 7, '2026-05-29 15:42:20'),
(47, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODAwNzA5MzAsInR5cGUiOiJyZWZyZXNoIn0.00VvFSOrgt0Wyz0UzES4K6hUexiuYPsp6m82twErMOQ', 5, '2026-05-29 16:08:50'),
(48, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODAwNzE1NjEsInR5cGUiOiJyZWZyZXNoIn0.JEC3WCRSz2NQ5bhV0sIpallKVLsKE3RpSiVlSTsdPiw', 7, '2026-05-29 16:19:21'),
(49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJleHAiOjE3ODAwNzIxMTQsInR5cGUiOiJyZWZyZXNoIn0.AXF9I6nLAFb7ZA3NdPJXz9EWjEhEJwVMrYCAStvaC2Q', 6, '2026-05-29 16:28:34'),
(50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODAwNzIxNzksInR5cGUiOiJyZWZyZXNoIn0.Ojsl9SQM0OgMUIOdxfbTwDhYdE4TFZF8FZxJ4Fr-Opw', 4, '2026-05-29 16:29:39'),
(51, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJleHAiOjE3ODAwNzMyNTMsInR5cGUiOiJyZWZyZXNoIn0.jW-A3xpWd5ctRx3bXNi_qIvFylmHpy38HyZZL5pEI2s', 6, '2026-05-29 16:47:33'),
(52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODAwNzM0NTksInR5cGUiOiJyZWZyZXNoIn0.gkMzyULWuK_MwjSZA1DtbFM8Zy1OW7D6-WMql7cvwig', 4, '2026-05-29 16:50:59'),
(53, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJleHAiOjE3ODAwNzQyODcsInR5cGUiOiJyZWZyZXNoIn0.kTgaRhJlZciof2bKuOEwWjXj6Qrv4EhD8UprAVoTJ8E', 6, '2026-05-29 17:04:47'),
(54, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODAwNzQ4NTIsInR5cGUiOiJyZWZyZXNoIn0.o4GkmO5uFWaYahRD8sodbWS78UtM5D_fvsPJjBb17wo', 4, '2026-05-29 17:14:12'),
(55, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJleHAiOjE3ODAwNzUzODIsInR5cGUiOiJyZWZyZXNoIn0.n23jETmEXYDICuwLKFjuu2OjpUz6qCEUdfq4aPOUEkI', 6, '2026-05-29 17:23:02'),
(56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODAwNzU1NTgsInR5cGUiOiJyZWZyZXNoIn0.M2tt6hjNxEwu8bS9E2yKHZflbgVBP4E5N2caDa8ngAE', 4, '2026-05-29 17:25:58'),
(57, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJleHAiOjE3ODAwOTk2NzAsInR5cGUiOiJyZWZyZXNoIn0.nG4wyUHEnhaPUHcrfsR1G-IE2kT-2uvPuwS1FNZvPJ4', 6, '2026-05-30 00:07:50'),
(58, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJleHAiOjE3ODAwOTk3NjgsInR5cGUiOiJyZWZyZXNoIn0.DgPyX3tWeWKgPfYZ0s2zuMhmQ4pvNW29PNbSfAquIdI', 6, '2026-05-30 00:09:28'),
(59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJleHAiOjE3ODAxMDIwMDcsInR5cGUiOiJyZWZyZXNoIn0.9w8K76qFv8LZxeizoC-a9gWfN2qtEoQgKFZY6gGW_Iw', 6, '2026-05-30 00:46:47'),
(60, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODAxMDIwMjUsInR5cGUiOiJyZWZyZXNoIn0.N-bBWHfrf5j4boD9meL3VFQdbNUZ7KuA1l5fV3GKowA', 4, '2026-05-30 00:47:05'),
(61, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo4LCJleHAiOjE3ODAxMDMyNjIsInR5cGUiOiJyZWZyZXNoIn0.k9hrWDweqzKyY9uHqWgnJu5jNft3h6vo671y4I8gx3U', 8, '2026-05-30 01:07:42'),
(62, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo4LCJleHAiOjE3ODAxMDMzMTcsInR5cGUiOiJyZWZyZXNoIn0.OwFd4AxpThFcaLmf2-mQMNPx-P-EroSq_TDAXg2lXZw', 8, '2026-05-30 01:08:37'),
(63, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODAxMDQ3MjMsInR5cGUiOiJyZWZyZXNoIn0.zK-41MlqDRsg4hdkRqAs6I4alZvWQMsPGTmIpQ9XLAI', 4, '2026-05-30 01:32:03'),
(64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODAxMDQ4ODAsInR5cGUiOiJyZWZyZXNoIn0.IAFPdk0UoyIupiEkBoI4r11fHFEUFCxO0E99sswV2WM', 4, '2026-05-30 01:34:40'),
(65, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODAxMDY0NTgsInR5cGUiOiJyZWZyZXNoIn0.kPiAyixtE_-sTxCArsLuidz41fWptiY9On83YFmWlI8', 4, '2026-05-30 02:00:58'),
(66, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODkzOTUwMzIsInR5cGUiOiJyZWZyZXNoIn0.0nfpCzI1tkL2HZOIlfMxjuGyLdqW016XtrtPOejizNg', 4, '2026-09-14 14:10:32'),
(67, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODkzOTkyOTUsInR5cGUiOiJyZWZyZXNoIn0.XPzNKyywO-25H2-BppnKMIGotBURvBEd9PyXnCxeBls', 4, '2026-09-14 15:21:35'),
(68, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODk0MDM5OTMsInR5cGUiOiJyZWZyZXNoIn0.AXGCT_e3Bq5jzLYvuocQeJ1jtrmM-Yqt3Tr_jmzIs9g', 4, '2026-09-14 16:39:53'),
(69, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODk0MDQ0MzgsInR5cGUiOiJyZWZyZXNoIn0.a69PyiQ6j0cRPDtnDX0KCe73nAWDJpKPGzmu5Z_v2wc', 5, '2026-09-14 16:47:18'),
(70, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODk0MDYwMzQsInR5cGUiOiJyZWZyZXNoIn0.DlP5mrgTlnXjxG5w_jpq6JhTxR-9rv_bRW0VX5e-DHk', 7, '2026-09-14 17:13:54'),
(71, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJleHAiOjE3ODk0MDYwNjIsInR5cGUiOiJyZWZyZXNoIn0.BCcWMaIXmRMPo3hMe_ehRS-hqHCWcwVuETn32IsoJ7s', 5, '2026-09-14 17:14:22'),
(72, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3LCJleHAiOjE3ODk0MDYxMTIsInR5cGUiOiJyZWZyZXNoIn0.OE_lrQjCqjxrtcGkjSQwlVsAFdd42-nTz7zOX1Z2FBU', 7, '2026-09-14 17:15:12'),
(73, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJleHAiOjE3ODk0MDYyMDYsInR5cGUiOiJyZWZyZXNoIn0.ffWWL0vqZkAKXTW4GXZ2JLHkK6y4gEdvJXe00aU2Fr4', 4, '2026-09-14 17:16:46');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `profil` enum('ADMIN','TECHNICIEN','INTERVENANT','MANAGER') NOT NULL DEFAULT 'INTERVENANT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `hashed_password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `telephone`, `profil`, `created_at`, `hashed_password`) VALUES
(4, 'Lesi', 'philipe.lesi@gmail.com', '0690889911', 'ADMIN', '2026-05-18 14:30:00', '$2b$10$PulFo/U2gvWI0Sa0CYps2ejqxKPYKG9/dJwRgUXPx4PzD2fFpjHuG'),
(5, 'Tidgy', 'Carnan.tidgy@gmail.com', '0690775522', 'TECHNICIEN', '2026-05-18 14:25:19', '$2b$10$0qCp1hd.1Wt15vjLA.AoMeQ1XDJ64U6zlYEKMyYKghNP6EqIzJ.f6'),
(6, 'Lory', 'Lory.hero@outlook.fr', '0690778855', 'INTERVENANT', '2026-05-18 14:25:46', '$2b$10$yOXGD2i8ZJd8Blee3fe1puhvfVSJ9LfqXHg7yAc5xRox0Ek6wvh0G'),
(7, 'Mark', 'Mark.evans@gmail.com', '0690775533', 'MANAGER', '2026-05-19 18:52:50', '$2b$10$vljOi2XobbwLXGKAyel2duqY.uq/wwru3ESXjIOmp5r9oxsD/LoGi'),
(8, 'Axel', 'axel.blaze@gmail.com', '00690101010', 'INTERVENANT', '2026-05-23 01:07:17', '$2b$12$Zk.Up2Yg.tZvIKvWVwQeTubDluaCbFnd4LWxI1rlEknR66os3Q5j.');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `actions_realisees`
--
ALTER TABLE `actions_realisees`
  ADD KEY `intervention_id` (`intervention_id`);

--
-- Index pour la table `interventions`
--
ALTER TABLE `interventions`
  ADD KEY `demandeur_id` (`demandeur_id`),
  ADD KEY `technicien_id` (`technicien_id`),
  ADD KEY `fk_intervention_manager` (`manager_id`);

--
-- Index pour la table `intervention_materiel`
--
ALTER TABLE `intervention_materiel`
  ADD KEY `materiel_id` (`materiel_id`);

--
-- Index pour la table `materiels`
--
ALTER TABLE `materiels`
  ADD KEY `intervention_id` (`intervention_id`),
  ADD KEY `utilisateur_concerne_id` (`utilisateur_concerne_id`);

--
-- Index pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `ix_refresh_tokens_id` (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `actions_realisees`
--
ALTER TABLE `actions_realisees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `interventions`
--
ALTER TABLE `interventions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `materiels`
--
ALTER TABLE `materiels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `actions_realisees`
--
ALTER TABLE `actions_realisees`
  ADD CONSTRAINT `fk_actions_intervention` FOREIGN KEY (`intervention_id`) REFERENCES `interventions` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `interventions`
--
ALTER TABLE `interventions`
  ADD CONSTRAINT `fk_intervention_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `interventions_ibfk_1` FOREIGN KEY (`demandeur_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `interventions_ibfk_2` FOREIGN KEY (`technicien_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `intervention_materiel`
--
ALTER TABLE `intervention_materiel`
  ADD CONSTRAINT `intervention_materiel_ibfk_1` FOREIGN KEY (`intervention_id`) REFERENCES `interventions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `intervention_materiel_ibfk_2` FOREIGN KEY (`materiel_id`) REFERENCES `materiels` (`id`);

--
-- Contraintes pour la table `materiels`
--
ALTER TABLE `materiels`
  ADD CONSTRAINT `materiels_ibfk_1` FOREIGN KEY (`intervention_id`) REFERENCES `interventions` (`id`),
  ADD CONSTRAINT `materiels_ibfk_2` FOREIGN KEY (`utilisateur_concerne_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
