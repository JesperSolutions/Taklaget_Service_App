/*
  # Add findings and enhance report images
  
  1. Changes
    - Add comment and severity to report images
    - Create new findings table for detailed issue tracking
    - Add severity levels for better issue categorization
  
  2. New Tables
    - `findings`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text) 
      - `severity` (text)
      - `reportId` (uuid, foreign key)
      - `createdAt` (timestamp)
      - `updatedAt` (timestamp)
  
  3. Modified Tables
    - `report_images`
      - Added `comment` (text, nullable)
      - Added `severity` (text, nullable)
*/

-- Add columns to report_images
ALTER TABLE report_images
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS severity TEXT;

-- Create findings table
CREATE TABLE IF NOT EXISTS findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on findings
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for findings
CREATE POLICY "Users can manage their own findings" ON findings
  USING (
    report_id IN (
      SELECT id FROM reports 
      WHERE company_id = (SELECT id FROM companies WHERE code = current_setting('app.company_code'))
    )
  );