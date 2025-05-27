/*
  # Authentication System Setup

  1. New Tables
    - `auth_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `company_id` (uuid, foreign key)
      - `role` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on auth_users table
    - Add policies for user management
*/

-- Create auth_users table
CREATE TABLE IF NOT EXISTS auth_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  role TEXT NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own data"
  ON auth_users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Company admins can manage their employees"
  ON auth_users
  USING (
    role = 'admin' AND 
    company_id = (
      SELECT company_id 
      FROM auth_users 
      WHERE id = auth.uid()
    )
  );