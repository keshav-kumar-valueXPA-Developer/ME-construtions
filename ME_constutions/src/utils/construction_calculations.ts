//segment 1
export interface CostsAndScheduleKPI {
  budget_variance: number;
  cpi: number;
  spi: number;
  rework_ratio: number;
}

export interface ProjectMetrics {
  project_id: string;
  project_name: string;
  ev: number;
  ac: number;
  pv: number;
  rework_hours: number;
  total_hours: number;
}

export function calculateProjectKPIs(metrics: ProjectMetrics): CostsAndScheduleKPI {
  const budget_variance = metrics.ev - metrics.ac;
  const cpi = metrics.ac !== 0 ? metrics.ev / metrics.ac : 0;
  const spi = metrics.pv !== 0 ? metrics.ev / metrics.pv : 0;
  const rework_ratio = metrics.total_hours !== 0 ? metrics.rework_hours / metrics.total_hours : 0;

  return {
    budget_variance,
    cpi,
    spi,
    rework_ratio
  };
}

//segment-2 

export interface productivityKPI {
  productivity: number;
  utilization: number;
  labourratio: number;
  scheduleadherance: number;
  benchmarkindex: number;
}

export interface productivityMetrics {
  project_id: string;
  project_name: string;
  units_completed: number;
  labour_hours: number;
  equipment_active_time: number;
  total_available_time: number;
  direct_labour_hours: number;
  indirect_labour_hours: number;
  planned_milestone: number;
  actual_milestone:number;
  cost_index:number;
  industry_benchmark:number;
}

export function calculateProjectProductivityKPIs(metrics: productivityMetrics): productivityKPI {
  const productivity = metrics.units_completed/ metrics.labour_hours;
  const utilization = metrics.total_available_time!==0? metrics.equipment_active_time/metrics.total_available_time:0;
  const labourratio = metrics.indirect_labour_hours !== 0 ? metrics.direct_labour_hours/metrics.indirect_labour_hours : 0;
  const scheduleadherance = metrics.actual_milestone !== 0 ? metrics.planned_milestone / metrics.actual_milestone : 0;
  const benchmarkindex= metrics.industry_benchmark!==0?metrics.cost_index/metrics.industry_benchmark:0;
  return {
    productivity,
    utilization,
    labourratio,
    scheduleadherance,
    benchmarkindex
  };
}

//segment-4

export interface labourManagmentKPI {
  training_hours: number;
  absenteeism_rate: number;
  turnover_rate: number;
  afr: number;
  certification_coverage: number;
}

export interface labourManagmentMetrics {
  project_id: string;
  project_name: string;
  training_attendance: number;
  employee_count: number;
  attendance_records: number;
  scheduled_workdays: number;
  separation_data : number;
  average_workforcers: number;
  recordable_incidents: number;
  total_hours_worked:number;
  certifed_workers :number;
  total_workers:number;
}

export function calculateLabourMangmentKPIs(metrics: labourManagmentMetrics): labourManagmentKPI {
  const training_hours = metrics.training_attendance/ metrics.employee_count;
  const absenteeism_rate = metrics.attendance_records!==0? metrics.attendance_records/metrics.scheduled_workdays:0;
  const turnover_rate = metrics.separation_data !== 0 ? ((metrics.separation_data/metrics.average_workforcers)* 100) : 0;
  const afr = metrics.recordable_incidents !== 0 ? (metrics.recordable_incidents*20000 )/ metrics.total_hours_worked : 0;
  const certification_coverage= metrics.certifed_workers!==0?metrics.certifed_workers/metrics.total_workers:0;
  return {
    training_hours,
    absenteeism_rate,
    turnover_rate,
    afr,
    certification_coverage
  };
}

//segment-5
export interface RiskManagementKPI {
  variation_orders: number;
  avg_variation_approval_time: number;
  risk_register_update_frequency: number;
  claims_ratio: number;
  weighted_risk_rating: number;
}

export interface RiskManagementMetrics {
  project_id: string;
  project_name: string;
  change_orders: number;
  total_variation_days: number;
  num_variation_orders: number;
  risk_register_updates: number;
  project_duration_months: number;
  claims_filed: number;
  total_contracts: number;
  risk_probabilities: number[];
  risk_impacts: number[];
}

export function calculateRiskManagementKPIs(metrics: RiskManagementMetrics): RiskManagementKPI {
  const variation_orders = metrics.change_orders;
  const avg_variation_approval_time =
    metrics.num_variation_orders !== 0 ? metrics.total_variation_days / metrics.num_variation_orders : 0;
  const risk_register_update_frequency =
    metrics.project_duration_months !== 0 ? metrics.risk_register_updates / metrics.project_duration_months : 0;
  const claims_ratio =
    metrics.total_contracts !== 0 ? metrics.claims_filed / metrics.total_contracts : 0;
  
    const weighted_risk_rating = 
    metrics.risk_probabilities.length > 0 
      ? metrics.risk_probabilities
          .map((prob, i) => (prob !== null && metrics.risk_impacts[i] !== null) ? prob * metrics.risk_impacts[i] : 0)
          .reduce((sum, val) => sum + val, 0)
      : 0;


  return {
    variation_orders,
    avg_variation_approval_time,
    risk_register_update_frequency,
    claims_ratio,
    weighted_risk_rating,
  };
}

//segment-6
export interface SupplyChainKPI {
  procurement_lead_time: number;
  inventory_turnover_ratio: number;
  stock_out_frequency: number;
  supplier_on_time_delivery_rate: number;
  material_waste_rate: number;
  quality_acceptance_rate: number;
}

export interface SupplyChainMetrics {
  project_id: string;
  project_name: string;
  total_lead_time: number;
  items_procured: number;
  cost_of_materials_used: number;
  avg_inventory_value: number;
  stock_out_events: number;
  total_project_days: number;
  on_time_deliveries: number;
  total_deliveries: number;
  wasted_material_volume: number;
  total_material_purchased: number;
  accepted_materials: number;
  total_materials_delivered: number;
}

export function calculateSupplyChainKPIs(metrics: SupplyChainMetrics): SupplyChainKPI {
  const procurement_lead_time =
    metrics.items_procured !== 0 ? metrics.total_lead_time / metrics.items_procured : 0;
  const inventory_turnover_ratio =
    metrics.avg_inventory_value !== 0 ? metrics.cost_of_materials_used / metrics.avg_inventory_value : 0;
  const stock_out_frequency =
    metrics.total_project_days !== 0 ? metrics.stock_out_events / metrics.total_project_days : 0;
  const supplier_on_time_delivery_rate  =
    metrics.total_deliveries !== 0 ? metrics.on_time_deliveries / metrics.total_deliveries : 0;
  const material_waste_rate =
    metrics.total_material_purchased !== 0 ? metrics.wasted_material_volume / metrics.total_material_purchased : 0;
  const quality_acceptance_rate =
    metrics.total_materials_delivered !== 0 ? metrics.accepted_materials / metrics.total_materials_delivered : 0;

  return {
    procurement_lead_time,
    inventory_turnover_ratio,
    stock_out_frequency,
    supplier_on_time_delivery_rate,
    material_waste_rate,
    quality_acceptance_rate,
  };
}
