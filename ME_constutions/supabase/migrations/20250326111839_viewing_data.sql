CREATE POLICY "Enable read access for authenticated users"
ON public.cost_overruns_schedule_delays
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users"
ON public.productivity_metrics
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users"
ON public.labour_management_metrics
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users"
ON public.risk_management_metrics
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users"
ON public.supply_chain_metrics
FOR SELECT USING (auth.role() = 'authenticated');
