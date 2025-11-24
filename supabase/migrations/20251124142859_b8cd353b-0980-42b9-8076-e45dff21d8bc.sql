-- Create doctor availability table
CREATE TABLE public.doctor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  availability_type TEXT NOT NULL CHECK (availability_type IN ('weekdays', 'weekends', 'all')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;

-- Doctors can view their own availability
CREATE POLICY "Doctors can view their own availability"
ON public.doctor_availability
FOR SELECT
USING (auth.uid() = doctor_id);

-- Doctors can manage their own availability
CREATE POLICY "Doctors can manage their own availability"
ON public.doctor_availability
FOR ALL
USING (auth.uid() = doctor_id);

-- Patients can view doctor availability
CREATE POLICY "Patients can view doctor availability"
ON public.doctor_availability
FOR SELECT
USING (true);

-- Admins can manage all availability
CREATE POLICY "Admins can manage all availability"
ON public.doctor_availability
FOR ALL
USING (has_role(auth.uid(), 'hospital_admin'::app_role));