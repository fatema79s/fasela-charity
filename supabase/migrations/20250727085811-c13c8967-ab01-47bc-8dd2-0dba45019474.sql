-- Create monthly_needs table for case expense breakdown
CREATE TABLE public.monthly_needs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  icon TEXT DEFAULT '💰',
  color TEXT DEFAULT 'bg-blue-500',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly_reports table for case updates
CREATE TABLE public.monthly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed',
  category TEXT NOT NULL DEFAULT 'general',
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.monthly_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly_needs
CREATE POLICY "Allow public to view monthly needs" 
ON public.monthly_needs 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to manage monthly needs" 
ON public.monthly_needs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for monthly_reports
CREATE POLICY "Allow public to view monthly reports" 
ON public.monthly_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to manage monthly reports" 
ON public.monthly_reports 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_monthly_needs_updated_at
BEFORE UPDATE ON public.monthly_needs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_reports_updated_at
BEFORE UPDATE ON public.monthly_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for monthly_needs
INSERT INTO public.monthly_needs (case_id, category, amount, description, icon, color) VALUES
-- For case 1 (assuming it exists)
((SELECT id FROM public.cases LIMIT 1), 'الطعام والمواد الغذائية', 1200, 'مواد غذائية أساسية شهرية للعائلة', '🍽️', 'bg-orange-500'),
((SELECT id FROM public.cases LIMIT 1), 'الإيجار والمرافق', 800, 'إيجار المنزل وفواتير الكهرباء والماء', '🏠', 'bg-blue-500'),
((SELECT id FROM public.cases LIMIT 1), 'التعليم والمدرسة', 400, 'مصاريف دراسية ومستلزمات تعليمية', '📚', 'bg-green-500'),
((SELECT id FROM public.cases LIMIT 1), 'الصحة والعلاج', 300, 'أدوية ومراجعات طبية ضرورية', '⚕️', 'bg-red-500'),
((SELECT id FROM public.cases LIMIT 1), 'الملابس والاحتياجات', 200, 'ملابس وحاجيات شخصية أساسية', '👕', 'bg-purple-500');

-- Insert sample data for monthly_reports
INSERT INTO public.monthly_reports (case_id, title, description, report_date, status, category, images) VALUES
((SELECT id FROM public.cases LIMIT 1), 'زيارة ميدانية وتوزيع المساعدات', 'تم توزيع المساعدات الشهرية والاطمئنان على أحوال العائلة. الأطفال بصحة جيدة والعائلة ممتنة للدعم المستمر.', CURRENT_DATE - INTERVAL '5 days', 'completed', 'food', '["https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200&h=200&fit=crop"]'::jsonb),
((SELECT id FROM public.cases LIMIT 1), 'دفع المصاريف الأساسية', 'تم دفع الإيجار وفواتير المرافق في الوقت المناسب، مما وفر الاستقرار للعائلة.', CURRENT_DATE - INTERVAL '15 days', 'completed', 'housing', '[]'::jsonb),
((SELECT id FROM public.cases LIMIT 1), 'شراء الاحتياجات الأساسية', 'تم شراء الملابس والاحتياجات الأساسية للأطفال.', CURRENT_DATE - INTERVAL '25 days', 'completed', 'general', '[]'::jsonb);