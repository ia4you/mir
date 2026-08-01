CREATE TABLE IF NOT EXISTS visitas (
  id SERIAL PRIMARY KEY,
  pagina VARCHAR(200) NOT NULL,
  ip_hash VARCHAR(64), -- hash SHA-256 de la IP, nunca la IP real
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitas_created_at ON visitas (created_at);
CREATE INDEX IF NOT EXISTS idx_visitas_pagina ON visitas (pagina);
