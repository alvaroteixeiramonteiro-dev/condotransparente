SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `condotransparente`;
CREATE DATABASE `condotransparente` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */;
USE `condotransparente`;

CREATE TABLE `utilizadores` (
  `id_utilizador` int AUTO_INCREMENT PRIMARY KEY,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `consentimento_em` datetime NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `condominios` (
  `id_condominio` int AUTO_INCREMENT PRIMARY KEY,
  `id_utilizador` int NOT NULL,
  `nome` varchar(120) NOT NULL,
  `morada` varchar(200) NOT NULL,
  CONSTRAINT fk_condominios_utilizadores FOREIGN KEY (id_utilizador)
  REFERENCES utilizadores(id_utilizador) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ocorrencias` (
  `id_ocorrencia` int AUTO_INCREMENT PRIMARY KEY,
  `id_condominio` int NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descricao` text NULL,
  `prioridade` enum('Baixa', 'Média', 'Alta') NOT NULL DEFAULT 'Média',
  `estado` enum('Pendente', 'Em curso', 'Resolvida') NOT NULL DEFAULT 'Pendente',
  `data_registo` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ocorrencias_condominios FOREIGN KEY (id_condominio)
  REFERENCES condominios(id_condominio) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;