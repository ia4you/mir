CREATE TABLE IF NOT EXISTS visitas (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  fecha DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_visitas_created_at ON visitas (created_at);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas (fecha);
