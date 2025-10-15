-- Add detailed_report column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS detailed_report BOOLEAN NOT NULL DEFAULT false;