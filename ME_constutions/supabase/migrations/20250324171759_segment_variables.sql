

-- Table for cost_schedule_variables
CREATE TABLE cost_schedule_variables(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  ev NUMERIC,
  ac NUMERIC,
  pv NUMERIC,
  rework_hours NUMERIC,
  total_hours NUMERIC,
  date TIMESTAMPTZ DEFAULT now()
);

-- Table for productivity_variables
CREATE TABLE productivity_variables(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  units_completed NUMERIC,
  labour_hours NUMERIC,
  equipment_active_time NUMERIC,
  total_available_time NUMERIC,
  direct_labour_hours NUMERIC,
  indirect_labour_hours NUMERIC,
  planned_milestone NUMERIC,
  actual_milestone NUMERIC,
  cost_index NUMERIC,
  industry_benchmark NUMERIC,
  date TIMESTAMPTZ DEFAULT now()
);

-- Table for labour_management_variables
CREATE TABLE labour_management_variables(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  Training_Attendance NUMERIC,
  Employee_Count NUMERIC,
  Attendance_Records NUMERIC,
  Scheduled_Workdays NUMERIC,
  Separation_Data NUMERIC,
  Average_Workforcers NUMERIC,
  Recordable_Incidents NUMERIC,
  Total_Hours_Worked NUMERIC,
  Certifed_workers NUMERIC,
  total_workers NUMERIC,
  date TIMESTAMPTZ DEFAULT now()
);

-- Table for risk_management_variables
CREATE TABLE risk_management_variables(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  change_orders NUMERIC,
  total_variation_days NUMERIC,
  num_variation_orders NUMERIC,
  risk_register_updates NUMERIC,
  project_duration_months NUMERIC,
  claims_filed NUMERIC,
  total_contracts NUMERIC,
  risk_probabilities NUMERIC[],
  risk_impacts NUMERIC[],
  date TIMESTAMPTZ DEFAULT now()
);

-- Table for supply_chain_variables
CREATE TABLE supply_chain_variables(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  total_lead_time NUMERIC,
  items_procured NUMERIC,
  cost_of_materials_used NUMERIC,
  avg_inventory_value NUMERIC,
  stock_out_events NUMERIC,
  total_project_days NUMERIC,
  on_time_deliveries NUMERIC,
  total_deliveries NUMERIC,
  wasted_material_volume NUMERIC,
  total_material_purchased NUMERIC,
  accepted_materials NUMERIC,
  total_materials_delivered NUMERIC,
  date TIMESTAMPTZ DEFAULT now()
);


-- Enabling Row-Level Security (RLS)
ALTER TABLE cost_schedule_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_management_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_management_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_chain_variables ENABLE ROW LEVEL SECURITY;

-- Policies to allow anyone to insert into the tables
CREATE POLICY insert_anyone ON cost_schedule_variables
FOR INSERT WITH CHECK (true);

CREATE POLICY insert_anyone ON productivity_variables
FOR INSERT WITH CHECK (true);

CREATE POLICY insert_anyone ON labour_management_variables
FOR INSERT WITH CHECK (true);

CREATE POLICY insert_anyone ON risk_management_variables
FOR INSERT WITH CHECK (true);

CREATE POLICY insert_anyone ON supply_chain_variables
FOR INSERT WITH CHECK (true);
