
-- Add start_time, estimated_cost, and estimated_time columns to production_schedules table
ALTER TABLE production_schedules 
ADD COLUMN start_time TIME,
ADD COLUMN estimated_cost DECIMAL(10, 2),
ADD COLUMN estimated_time TEXT;
