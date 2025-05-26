/*
  # Esquema inicial para API de Shopify

  1. Nuevas Tablas
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password` (text)
      - `role` (text)
      - `last_login` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `shops`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `shop_domain` (text, unique)
      - `shop_name` (text)
      - `access_token` (text)
      - `api_version` (text)
      - `status` (text)
      - `connected_at` (timestamptz)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `webhooks`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key)
      - `webhook_id` (text)
      - `topic` (text)
      - `address` (text)
      - `format` (text)
      - `created_at` (timestamptz)

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para acceso autenticado
*/

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de tiendas
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  shop_domain text UNIQUE NOT NULL,
  shop_name text,
  access_token text NOT NULL,
  api_version text NOT NULL,
  status text NOT NULL DEFAULT 'connected',
  connected_at timestamptz DEFAULT now(),
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  webhook_id text NOT NULL,
  topic text NOT NULL,
  address text NOT NULL,
  format text NOT NULL DEFAULT 'json',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas para tiendas
CREATE POLICY "Users can read own shops"
  ON shops
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own shops"
  ON shops
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own shops"
  ON shops
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own shops"
  ON shops
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Políticas para webhooks
CREATE POLICY "Users can read own webhooks"
  ON webhooks
  FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert webhooks for own shops"
  ON webhooks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_id IN (
      SELECT id FROM shops WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete webhooks from own shops"
  ON webhooks
  FOR DELETE
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shops WHERE user_id = auth.uid()
    )
  );

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_domain ON shops(shop_domain);
CREATE INDEX IF NOT EXISTS idx_webhooks_shop_id ON webhooks(shop_id);