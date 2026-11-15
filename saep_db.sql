DROP DATABASE IF EXISTS saep_db;
CREATE DATABASE saep_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saep_db;

CREATE TABLE usuarios (
  id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome  VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  senha VARCHAR(255) NOT NULL COMMENT 'hash bcrypt',
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE clientes (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome     VARCHAR(100) NOT NULL,
  cpf      VARBINARY(64) NOT NULL COMMENT 'AES_ENCRYPT',
  telefone VARCHAR(15)  NOT NULL,
  email    VARCHAR(120) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_cpf (cpf)
) ENGINE=InnoDB;

CREATE TABLE barbeiros (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(100) NOT NULL,
  cpf           VARBINARY(64) NOT NULL COMMENT 'AES_ENCRYPT',
  telefone      VARCHAR(15)  NOT NULL,
  especialidade VARCHAR(80)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_barbeiros_cpf (cpf)
) ENGINE=InnoDB;

CREATE TABLE servicos (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(80)  NOT NULL,
  descricao   VARCHAR(200) NULL,
  preco       DECIMAL(8,2) NOT NULL,
  duracao_min SMALLINT UNSIGNED NOT NULL,
  barbeiro_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_servicos_barbeiro FOREIGN KEY (barbeiro_id) REFERENCES barbeiros (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE agendamentos (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cliente_id INT UNSIGNED NOT NULL,
  servico_id INT UNSIGNED NOT NULL,
  data_hora  DATETIME NOT NULL,
  status     ENUM('Agendado','Concluído','Cancelado') NOT NULL DEFAULT 'Agendado',
  observacao VARCHAR(200) NULL,
  PRIMARY KEY (id),
  KEY idx_agendamentos_data (data_hora),
  CONSTRAINT fk_agend_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_agend_servico FOREIGN KEY (servico_id) REFERENCES servicos (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Senhas: admin123 / marcos123 / juliana123
INSERT INTO usuarios (nome, email, senha) VALUES
('Administrador Navalha', 'admin@barbearia.com', '$2y$10$mqbBrYLQypkGuys/z0mbceYIaTsMz.Be6/MetI11kRX7T2wmi2WmC'),
('Marcos Ribeiro', 'marcos@barbearia.com', '$2y$10$.i1.7L5gaAFhBvnEHDkBreIXkO32qkcm2pIXaKBsUKVTwkVO/0AaK'),
('Juliana Prado', 'juliana@barbearia.com', '$2y$10$rCtZ50JOs2TH9g1Oh35fqeKO1VUTYmtpWLLcZXDDLztIEn1qLk4Ya');

INSERT INTO clientes (nome, cpf, telefone, email) VALUES
('Carlos Eduardo Silva', AES_ENCRYPT('52998224725', 'saep_barbearia_chave_2025'), '(47) 99111-2233', 'carlos.silva@email.com'),
('Rafael Almeida', AES_ENCRYPT('11144477735', 'saep_barbearia_chave_2025'), '(47) 99222-3344', 'rafael.almeida@email.com'),
('Bruno Henrique Costa', AES_ENCRYPT('39053344705', 'saep_barbearia_chave_2025'), '(47) 99333-4455', NULL),
('Lucas Pereira Matos', AES_ENCRYPT('12345678909', 'saep_barbearia_chave_2025'), '(47) 99444-5566', 'lucas.matos@email.com');

INSERT INTO barbeiros (nome, cpf, telefone, especialidade) VALUES
('André Nogueira', AES_ENCRYPT('98765432100', 'saep_barbearia_chave_2025'), '(47) 99555-6677', 'Degradê e navalhado'),
('Thiago Martins', AES_ENCRYPT('24681357928', 'saep_barbearia_chave_2025'), '(47) 99666-7788', 'Barba e bigode'),
('Diego Fontana', AES_ENCRYPT('13579246828', 'saep_barbearia_chave_2025'), '(47) 99777-8899', 'Platinado e coloração');

INSERT INTO servicos (nome, descricao, preco, duracao_min, barbeiro_id) VALUES
('Corte degradê', 'Máquina e tesoura com acabamento na navalha', 50.00, 40, 1),
('Corte social', 'Corte clássico na tesoura', 40.00, 30, 3),
('Barba completa', 'Toalha quente, navalha e hidratação', 35.00, 30, 2),
('Corte + barba', 'Combo de corte e barba', 80.00, 60, 1),
('Platinado', 'Descoloração e matização', 150.00, 120, 3);

INSERT INTO agendamentos (cliente_id, servico_id, data_hora, status, observacao) VALUES
(1, 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00'), 'Agendado', 'Prefere degradê baixo'),
(2, 3, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00'), 'Agendado', NULL),
(3, 4, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00'), 'Agendado', 'Primeira visita'),
(4, 2, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '16:00:00'), 'Agendado', NULL),
(1, 5, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '11:00:00'), 'Agendado', 'Mostrar referência de cor');
