/*
  # Update schema to link findings and images

  1. Changes
    - Move images from reports to findings
    - Add findingId to report_images table
    - Remove reportId from report_images table
    - Update foreign key relationships

  2. Security
    - Maintain existing RLS policies
    - Update policies for new relationships
*/

-- Remove old relationship
ALTER TABLE report_images
DROP CONSTRAINT report_images_report_id_fkey;

-- Add new column and relationship
ALTER TABLE report_images
ADD COLUMN finding_id UUID REFERENCES findings(id) ON DELETE CASCADE;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage their own images" ON report_images;

CREATE POLICY "Users can manage their own images" ON report_images
  USING (
    finding_id IN (
      SELECT id FROM findings 
      WHERE report_id IN (
        SELECT id FROM reports 
        WHERE company_id = (SELECT id FROM companies WHERE code = current_setting('app.company_code'))
      )
    )
  );

-- Remove old column after migration
ALTER TABLE report_images
DROP COLUMN report_id;