-- Add city, area, and deserve_zakkah columns to cases table
ALTER TABLE public.cases 
ADD COLUMN city text,
ADD COLUMN area text,
ADD COLUMN deserve_zakkah boolean DEFAULT false;