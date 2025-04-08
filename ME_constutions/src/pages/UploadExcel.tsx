import React, { useCallback, useState } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, AlertCircle, Loader2, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { cn } from '../utils/utils';
import { 
  calculateProjectKPIs, 
  calculateProjectProductivityKPIs, 
  calculateLabourMangmentKPIs, 
  calculateRiskManagementKPIs, 
  calculateSupplyChainKPIs,
  type ProjectMetrics,
  type productivityMetrics,
  type labourManagmentMetrics,
  type RiskManagementMetrics,
  type SupplyChainMetrics
} from '../utils/construction_calculations';

type UploadStatus = {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
  progress: number;
};

type SegmentOption = {
  id: string;
  name: string;
  tableName: string;
  variablesTableName: string; // Added table name for variables
  sheetMappings: Record<string, string>;
};

// Sheet mappings for each segment
const SHEET_MAPPINGS_1 = {
  "Earned Value (EV)": "ev",
  "Actual Cost (AC)": "ac",
  "Planned Value (PV)": "pv",
  "Rework Hours": "rework_hours",
  "Total Hours Worked": "total_hours"
} as const;

const SHEET_MAPPINGS_2 = {
  "Units Completed": "units_completed",
  "Labour Hours": "labour_hours",
  "Equipment Active Time": "equipment_active_time",
  "Total Available Time": "total_available_time",
  "Direct Labour Hours": "direct_labour_hours",
  "Indirect Labour Hours": "indirect_labour_hours",
  "Planned Milestone": "planned_milestone",
  "Actual Milestone": "actual_milestone",
  "Cost Index": "cost_index",
  "Industry Benchmark": "industry_benchmark"
} as const;

const SHEET_MAPPINGS_3 = {
  "Training Attendance": "training_attendance",
  "Employee Count": "employee_count",
  "Attendance Records": "attendance_records",
  "Scheduled Workdays": "scheduled_workdays",
  "Separation Data": "separation_data",
  "Average Workforce": "average_workforcers",
  "Recordable Incidents": "recordable_incidents",
  "Total Hours Worked": "total_hours_worked",
  "Certified Workers": "certifed_workers",
  "Total Workers": "total_workers"
} as const;

const SHEET_MAPPINGS_4 = {
  "Contract Change Orders": "change_orders",
  "Total Variation Days": "total_variation_days",
  "Number of Variation Orders": "num_variation_orders",
  "Risk Register Updates": "risk_register_updates",
  "Project Duration (Months)": "project_duration_months",
  "Claims Filed": "claims_filed",
  "Total Contracts": "total_contracts",
  "Risk Probabilities": "risk_probabilities",
  "Risk Impacts": "risk_impacts"
} as const;

const SHEET_MAPPINGS_5 = {
  "Total Lead Time": "total_lead_time",
  "Items Procured": "items_procured",
  "Cost of Materials Used": "cost_of_materials_used",
  "Average Inventory Value": "avg_inventory_value",
  "Stock-Out Events": "stock_out_events",
  "Total Project Days": "total_project_days",
  "On-Time Deliveries": "on_time_deliveries",
  "Total Deliveries": "total_deliveries",
  "Wasted Material Volume": "wasted_material_volume",
  "Total Material Purchased": "total_material_purchased",
  "Accepted Materials": "accepted_materials",
  "Total Materials Delivered": "total_materials_delivered"
} as const;

// Segment options
const SEGMENT_OPTIONS: SegmentOption[] = [
  {
    id: "segment1",
    name: "Costs and Schedule KPIs",
    tableName: "cost_overruns_schedule_delays",
    variablesTableName: "cost_schedule_variables",
    sheetMappings: SHEET_MAPPINGS_1
  },
  {
    id: "segment2",
    name: "Productivity KPIs",
    tableName: "productivity_metrics",
    variablesTableName: "productivity_variables",
    sheetMappings: SHEET_MAPPINGS_2
  },
  {
    id: "segment3",
    name: "Labour Management KPIs",
    tableName: "labour_management_metrics",
    variablesTableName: "labour_management_variables",
    sheetMappings: SHEET_MAPPINGS_3
  },
  {
    id: "segment4",
    name: "Risk Management KPIs",
    tableName: "risk_management_metrics",
    variablesTableName: "risk_management_variables",
    sheetMappings: SHEET_MAPPINGS_4
  },
  {
    id: "segment5",
    name: "Supply Chain KPIs",
    tableName: "supply_chain_metrics",
    variablesTableName: "supply_chain_variables",
    sheetMappings: SHEET_MAPPINGS_5
  }
];

export default function Upload() {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedSegment, setSelectedSegment] = useState<SegmentOption>(SEGMENT_OPTIONS[0]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: '',
    progress: 0,
  });

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    
    if (!validTypes.includes(file.type)) {
      setUploadStatus({
        status: 'error',
        message: 'Invalid file type. Please upload an Excel file.',
        progress: 0,
      });
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadStatus({
        status: 'error',
        message: 'File size too large. Maximum size is 10MB.',
        progress: 0,
      });
      return false;
    }

    return true;
  };

// Store variables for Segment 1
const storeSegment1Variables = async (metrics: ProjectMetrics[]) => {
  const variables = metrics.map(projectMetrics => {
    return {
      project_id: projectMetrics.project_id,
      project_name: projectMetrics.project_name,
      ev: projectMetrics.ev,
      ac: projectMetrics.ac,
      pv: projectMetrics.pv,
      rework_hours: projectMetrics.rework_hours,
      total_hours: projectMetrics.total_hours,
      date: new Date().toISOString()
    };
  });

  const { error } = await supabase
    .from(selectedSegment.variablesTableName)
    .insert(variables);

  if (error) throw error;
};

// Store variables for Segment 2
const storeSegment2Variables = async (metrics: productivityMetrics[]) => {
  const variables = metrics.map(productivityMetrics => {
    return {
      project_id: productivityMetrics.project_id,
      project_name: productivityMetrics.project_name,
      units_completed: productivityMetrics.units_completed,
      labour_hours: productivityMetrics.labour_hours,
      equipment_active_time: productivityMetrics.equipment_active_time,
      total_available_time: productivityMetrics.total_available_time,
      direct_labour_hours: productivityMetrics.direct_labour_hours,
      indirect_labour_hours: productivityMetrics.indirect_labour_hours,
      planned_milestone: productivityMetrics.planned_milestone,
      actual_milestone: productivityMetrics.actual_milestone,
      cost_index: productivityMetrics.cost_index,
      industry_benchmark: productivityMetrics.industry_benchmark,
      date: new Date().toISOString()
    };
  });

  const { error } = await supabase
    .from(selectedSegment.variablesTableName)
    .insert(variables);

  if (error) throw error;
};

// Store variables for Segment 3
const storeSegment3Variables = async (metrics: labourManagmentMetrics[]) => {
  const variables = metrics.map(labourMetrics => {
    return {
      project_id: labourMetrics.project_id,
      project_name: labourMetrics.project_name,
      training_attendance: labourMetrics.training_attendance,
      employee_count: labourMetrics.employee_count,
      attendance_records: labourMetrics.attendance_records,
      scheduled_workdays: labourMetrics.scheduled_workdays,
      separation_data: labourMetrics.separation_data,
      average_workforcers: labourMetrics.average_workforcers,
      recordable_incidents: labourMetrics.recordable_incidents,
      total_hours_worked: labourMetrics.total_hours_worked,
      certifed_workers: labourMetrics.certifed_workers,
      total_workers: labourMetrics.total_workers,
      date: new Date().toISOString()
    };
  });

  const { error } = await supabase
    .from(selectedSegment.variablesTableName)
    .insert(variables);

  if (error) throw error;
};

// Store variables for Segment 4
const storeSegment4Variables = async (metrics: RiskManagementMetrics[]) => {
  const variables = metrics.map(riskMetrics => {
    return {
      project_id: riskMetrics.project_id,
      project_name: riskMetrics.project_name,
      change_orders: riskMetrics.change_orders,
      total_variation_days: riskMetrics.total_variation_days,
      num_variation_orders: riskMetrics.num_variation_orders,
      risk_register_updates: riskMetrics.risk_register_updates,
      project_duration_months: riskMetrics.project_duration_months,
      claims_filed: riskMetrics.claims_filed,
      total_contracts: riskMetrics.total_contracts,
      risk_probabilities: riskMetrics.risk_probabilities,
      risk_impacts: riskMetrics.risk_impacts,
      date: new Date().toISOString()
    };
  });

  const { error } = await supabase
    .from(selectedSegment.variablesTableName)
    .insert(variables);

  if (error) throw error;
};

// Store variables for Segment 5
const storeSegment5Variables = async (metrics: SupplyChainMetrics[]) => {
  const variables = metrics.map(supplyMetrics => {
    return {
      project_id: supplyMetrics.project_id,
      project_name: supplyMetrics.project_name,
      total_lead_time: supplyMetrics.total_lead_time,
      items_procured: supplyMetrics.items_procured,
      cost_of_materials_used: supplyMetrics.cost_of_materials_used,
      avg_inventory_value: supplyMetrics.avg_inventory_value,
      stock_out_events: supplyMetrics.stock_out_events,
      total_project_days: supplyMetrics.total_project_days,
      on_time_deliveries: supplyMetrics.on_time_deliveries,
      total_deliveries: supplyMetrics.total_deliveries,
      wasted_material_volume: supplyMetrics.wasted_material_volume,
      total_material_purchased: supplyMetrics.total_material_purchased,
      accepted_materials: supplyMetrics.accepted_materials,
      total_materials_delivered: supplyMetrics.total_materials_delivered,
      date: new Date().toISOString()
    };
  });

  const { error } = await supabase
    .from(selectedSegment.variablesTableName)
    .insert(variables);

  if (error) throw error;
};


  // Calculate and store KPIs for Segment 1
  const calculateAndStoreSegment1KPIs = async (metrics: ProjectMetrics[]) => {
    const kpis = metrics.map(projectMetrics => {
      const {
        budget_variance,
        cpi,
        spi,
        rework_ratio
      } = calculateProjectKPIs(projectMetrics);
  
      return {
        project_id: projectMetrics.project_id,
        project_name: projectMetrics.project_name,
        budget_variance,
        cpi,
        spi,
        rework_ratio,
        date: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from('cost_overruns_schedule_delays')
      .insert(kpis)
      

    if (error) throw error;
  };

  // Calculate and store KPIs for Segment 2
  const calculateAndStoreSegment2KPIs = async (metrics: productivityMetrics[]) => {
    const kpis = metrics.map(productivityMetrics => {
      const {
        productivity,
        utilization,
        labourratio,
        scheduleadherance,
        benchmarkindex
      } = calculateProjectProductivityKPIs(productivityMetrics);
  
      return {
        project_id: productivityMetrics.project_id,
        project_name: productivityMetrics.project_name,
        productivity,
        utilization,
        labourratio,
        scheduleadherance,
        benchmarkindex,
        date: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from('productivity_metrics')
      .insert(kpis);

    if (error) throw error;
  };

  // Calculate and store KPIs for Segment 3
  const calculateAndStoreSegment3KPIs = async (metrics: labourManagmentMetrics[]) => {
    const kpis = metrics.map(labourMetrics => {
      const {
        training_hours,
        absenteeism_rate,
        turnover_rate,
        afr,
        certification_coverage
      } = calculateLabourMangmentKPIs(labourMetrics);
  
      return {
        project_id: labourMetrics.project_id,
        project_name: labourMetrics.project_name,
        training_hours,
        absenteeism_rate,
        turnover_rate,
        afr,
        certification_coverage,
        date: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from('labour_management_metrics')
      .insert(kpis);

    if (error) throw error;
  };

  // Calculate and store KPIs for Segment 4
  const calculateAndStoreSegment4KPIs = async (metrics: RiskManagementMetrics[]) => {
    const kpis = metrics.map(riskMetrics => {
      const {
        variation_orders,
        avg_variation_approval_time,
        risk_register_update_frequency,
        claims_ratio,
        weighted_risk_rating
      } = calculateRiskManagementKPIs(riskMetrics);
  
      return {
        project_id: riskMetrics.project_id,
        project_name: riskMetrics.project_name,
        variation_orders,
        avg_variation_approval_time,
        risk_register_update_frequency,
        claims_ratio,
        weighted_risk_rating,
        date: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from('risk_management_metrics')
      .insert(kpis);

    if (error) throw error;
  };

  // Calculate and store KPIs for Segment 5
  const calculateAndStoreSegment5KPIs = async (metrics: SupplyChainMetrics[]) => {
    const kpis = metrics.map(supplyMetrics => {
      const {
        procurement_lead_time,
        inventory_turnover_ratio,
        stock_out_frequency,
        supplier_on_time_delivery_rate,
        material_waste_rate,
        quality_acceptance_rate
      } = calculateSupplyChainKPIs(supplyMetrics);
  
      return {
        project_id: supplyMetrics.project_id,
        project_name: supplyMetrics.project_name,
        procurement_lead_time,
        inventory_turnover_ratio,
        stock_out_frequency,
        supplier_on_time_delivery_rate,
        material_waste_rate,
        quality_acceptance_rate,
        date: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from('supply_chain_metrics')
      .insert(kpis);

    if (error) throw error;
  };

  // Process file based on selected segment
  const processFile = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    try {
      setUploadStatus({
        status: 'processing',
        message: 'Reading file...',
        progress: 20,
      });

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // Validate all required sheets exist
      const requiredSheets = Object.keys(selectedSegment.sheetMappings);
      const missingSheets = requiredSheets.filter(
        sheet => !workbook.SheetNames.includes(sheet)
      );

      if (missingSheets.length > 0) {
        throw new Error(`Missing required sheets: ${missingSheets.join(', ')}`);
      }

      setUploadStatus({
        status: 'processing',
        message: 'Processing sheets...',
        progress: 40,
      });

      // Process based on selected segment
      switch (selectedSegment.id) {
        case 'segment1':
          await processSegment1(workbook);
          break;
        case 'segment2':
          await processSegment2(workbook);
          break;
        case 'segment3':
          await processSegment3(workbook);
          break;
        case 'segment4':
          await processSegment4(workbook);
          break;
        case 'segment5':
          await processSegment5(workbook);
          break;
      }

      setUploadStatus({
        status: 'success',
        message: `Successfully processed ${selectedSegment.name} data and calculated KPIs`,
        progress: 100,
      });

      toast.success('Data uploaded and KPIs calculated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Error processing file',
        progress: 0,
      });
      toast.error('Failed to upload data');
    }
  }, [selectedSegment]);

  // Process Segment 1 (Costs and Schedule KPIs)
  const processSegment1 = async (workbook: XLSX.WorkBook) => {
    const projectMetricsMap = new Map<string, ProjectMetrics>();

    for (const [sheetName, metricType] of Object.entries(SHEET_MAPPINGS_1)) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      jsonData.forEach((row: any) => {
        const key = `${row.project_id}-${row.project_name}`;
        const metrics = projectMetricsMap.get(key) || {
          project_id: row.project_id,
          project_name: row.project_name,
          ev: 0,
          ac: 0,
          pv: 0,
          rework_hours: 0,
          total_hours: 0
        };

        // Map the value to the correct field based on sheet type
        switch (metricType) {
          case 'ev':
            metrics.ev = row.value;
            break;
          case 'ac':
            metrics.ac = row.value;
            break;
          case 'pv':
            metrics.pv = row.value;
            break;
          case 'rework_hours':
            metrics.rework_hours = row.value;
            break;
          case 'total_hours':
            metrics.total_hours = row.value;
            break;
        }

        projectMetricsMap.set(key, metrics);
      });
    }
    setUploadStatus({
      status: 'processing',
      message: 'Storing raw variables...',
      progress: 60,
    });
    const metricsArray = Array.from(projectMetricsMap.values());
    await storeSegment1Variables(metricsArray);

    setUploadStatus({
      status: 'processing',
      message: 'Calculating KPIs...',
      progress: 80,
    });

    // Calculate and store KPIs
    await calculateAndStoreSegment1KPIs(metricsArray);
  };

  
  // Process Segment 2 (Productivity KPIs)
  const processSegment2 = async (workbook: XLSX.WorkBook) => {
    const productivityMetricsMap = new Map<string, productivityMetrics>();

    for (const [sheetName, metricType] of Object.entries(SHEET_MAPPINGS_2)) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      jsonData.forEach((row: any) => {
        const key = `${row.project_id}-${row.project_name}`;
        const metrics = productivityMetricsMap.get(key) || {
          project_id: row.project_id,
          project_name: row.project_name,
          units_completed: 0,
          labour_hours: 0,
          equipment_active_time: 0,
          total_available_time: 0,
          direct_labour_hours: 0,
          indirect_labour_hours: 0,
          planned_milestone: 0,
          actual_milestone: 0,
          cost_index: 0,
          industry_benchmark: 0
        };

        // Map the value to the correct field
        switch (metricType) {
          case 'units_completed':
            metrics.units_completed = row.value;
            break;
          case 'labour_hours':
            metrics.labour_hours = row.value;
            break;
          case 'equipment_active_time':
            metrics.equipment_active_time = row.value;
            break;
          case 'total_available_time':
            metrics.total_available_time = row.value;
            break;
          case 'direct_labour_hours':
            metrics.direct_labour_hours = row.value;
            break;
          case 'indirect_labour_hours':
            metrics.indirect_labour_hours = row.value;
            break;
          case 'planned_milestone':
            metrics.planned_milestone = row.value;
            break;
          case 'actual_milestone':
            metrics.actual_milestone = row.value;
            break;
          case 'cost_index':
            metrics.cost_index = row.value;
            break;
          case 'industry_benchmark':
            metrics.industry_benchmark = row.value;
            break;
        }

        productivityMetricsMap.set(key, metrics);
      });
    }

    const metricsArray = Array.from(productivityMetricsMap.values());
    await storeSegment2Variables(metricsArray);

    // Then calculate and store KPIs
    setUploadStatus({
      status: 'processing',
      message: 'Calculating Productivity KPIs...',
      progress: 80,
    });

    await calculateAndStoreSegment2KPIs(metricsArray);}

  // Process Segment 3 (Labour Management KPIs)
  const processSegment3 = async (workbook: XLSX.WorkBook) => {
    const labourMetricsMap = new Map<string, labourManagmentMetrics>();

    for (const [sheetName, metricType] of Object.entries(SHEET_MAPPINGS_3)) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      jsonData.forEach((row: any) => {
        const key = `${row.project_id}-${row.project_name}`;
        const metrics = labourMetricsMap.get(key) || {
          project_id: row.project_id,
          project_name: row.project_name,
          training_attendance: 0,
          employee_count: 0,
          attendance_records: 0,
          scheduled_workdays: 0,
          separation_data: 0,
          average_workforcers: 0,
          recordable_incidents: 0,
          total_hours_worked: 0,
          certifed_workers: 0,
          total_workers: 0
        };

        // Map the value to the correct field
        switch (metricType) {
          case 'training_attendance':
            metrics.training_attendance = row.value;
            break;
          case 'employee_count':
            metrics.employee_count = row.value;
            break;
          case 'attendance_records':
            metrics.attendance_records = row.value;
            break;
          case 'scheduled_workdays':
            metrics.scheduled_workdays = row.value;
            break;
          case 'separation_data':
            metrics.separation_data = row.value;
            break;
          case 'average_workforcers':
            metrics.average_workforcers = row.value;
            break;
          case 'recordable_incidents':
            metrics.recordable_incidents = row.value;
            break;
          case 'total_hours_worked':
            metrics.total_hours_worked = row.value;
            break;
          case 'certifed_workers':
            metrics.certifed_workers = row.value;
            break;
          case 'total_workers':
            metrics.total_workers = row.value;
            break;
        }

        labourMetricsMap.set(key, metrics);
      });
    }

    setUploadStatus({
      status: 'processing',
      message: 'Storing raw variables...',
      progress: 60,
    });
    
    const metricsArray = Array.from(labourMetricsMap.values());
    await storeSegment3Variables(metricsArray);

    // Then calculate and store KPIs
    setUploadStatus({
      status: 'processing',
      message: 'Calculating Labour Management KPIs...',
      progress: 80,
    });

    await calculateAndStoreSegment3KPIs(metricsArray);
  };

  // Process Segment 4 (Risk Management KPIs)
  const processSegment4 = async (workbook: XLSX.WorkBook) => {
    const riskMetricsMap = new Map<string, RiskManagementMetrics>();

    for (const [sheetName, metricType] of Object.entries(SHEET_MAPPINGS_4)) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      jsonData.forEach((row: any) => {
        const key = `${row.project_id}-${row.project_name}`;
        const metrics = riskMetricsMap.get(key) || {
          project_id: row.project_id,
          project_name: row.project_name,
          change_orders: 0,
          total_variation_days: 0,
          num_variation_orders: 0,
          risk_register_updates: 0,
          project_duration_months: 0,
          claims_filed: 0,
          total_contracts: 0,
          risk_probabilities: [],
          risk_impacts: []
        };

        // Special handling for array fields
        if (metricType === 'risk_probabilities' || metricType === 'risk_impacts') {
          // Assuming these are provided as comma-separated values in the Excel
          const values = row.value.split(',').map((v: string) => parseFloat(v.trim()));
          if (metricType === 'risk_probabilities') {
            metrics.risk_probabilities = values;
          } else {
            metrics.risk_impacts = values;
          }
        } else {
          // Map other values
          switch (metricType) {
            case 'change_orders':
              metrics.change_orders = row.value;
              break;
            case 'total_variation_days':
              metrics.total_variation_days = row.value;
              break;
            case 'num_variation_orders':
              metrics.num_variation_orders = row.value;
              break;
            case 'risk_register_updates':
              metrics.risk_register_updates = row.value;
              break;
            case 'project_duration_months':
              metrics.project_duration_months = row.value;
              break;
            case 'claims_filed':
              metrics.claims_filed = row.value;
              break;
            case 'total_contracts':
              metrics.total_contracts = row.value;
              break;
          }
        }

        riskMetricsMap.set(key, metrics);
      });
    }

    // First store the raw variables
    setUploadStatus({
      status: 'processing',
      message: 'Storing raw variables...',
      progress: 60,
    });
    
    const metricsArray = Array.from(riskMetricsMap.values());
    await storeSegment4Variables(metricsArray);

    // Then calculate and store KPIs
    setUploadStatus({
      status: 'processing',
      message: 'Calculating Risk Management KPIs...',
      progress: 80,
    });

    await calculateAndStoreSegment4KPIs(metricsArray);
  };

  // Process Segment 5 (Supply Chain KPIs)
  const processSegment5 = async (workbook: XLSX.WorkBook) => {
    const supplyChainMetricsMap = new Map<string, SupplyChainMetrics>();

    for (const [sheetName, metricType] of Object.entries(SHEET_MAPPINGS_5)) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      jsonData.forEach((row: any) => {
        const key = `${row.project_id}-${row.project_name}`;
        const metrics = supplyChainMetricsMap.get(key) || {
          project_id: row.project_id,
          project_name: row.project_name,
          total_lead_time: 0,
          items_procured: 0,
          cost_of_materials_used: 0,
          avg_inventory_value: 0,
          stock_out_events: 0,
          total_project_days: 0,
          on_time_deliveries: 0,
          total_deliveries: 0,
          wasted_material_volume: 0,
          total_material_purchased: 0,
          accepted_materials: 0,
          total_materials_delivered: 0
        };

        // Map the value to the correct field
        switch (metricType) {
          case 'total_lead_time':
            metrics.total_lead_time = row.value;
            break;
          case 'items_procured':
            metrics.items_procured = row.value;
            break;
          case 'cost_of_materials_used':
            metrics.cost_of_materials_used = row.value;
            break;
          case 'avg_inventory_value':
            metrics.avg_inventory_value = row.value;
            break;
          case 'stock_out_events':
            metrics.stock_out_events = row.value;
            break;
          case 'total_project_days':
            metrics.total_project_days = row.value;
            break;
          case 'on_time_deliveries':
            metrics.on_time_deliveries = row.value;
            break;
          case 'total_deliveries':
            metrics.total_deliveries = row.value;
            break;
          case 'wasted_material_volume':
            metrics.wasted_material_volume = row.value;
            break;
          case 'total_material_purchased':
            metrics.total_material_purchased = row.value;
            break;
          case 'accepted_materials':
            metrics.accepted_materials = row.value;
            break;
          case 'total_materials_delivered':
            metrics.total_materials_delivered = row.value;
            break;
        }

        supplyChainMetricsMap.set(key, metrics);
      });
    }

    // First store the raw variables
    setUploadStatus({
      status: 'processing',
      message: 'Storing raw variables...',
      progress: 60,
    });
    
    const metricsArray = Array.from(supplyChainMetricsMap.values());
    await storeSegment5Variables(metricsArray);

    // Then calculate and store KPIs
    setUploadStatus({
      status: 'processing',
      message: 'Calculating Risk Management KPIs...',
      progress: 80,
    });

    await calculateAndStoreSegment5KPIs(metricsArray);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleSegmentSelect = (segment: SegmentOption) => {
    setSelectedSegment(segment);
    setIsDropdownOpen(false);
  };

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case 'processing':
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return <FileSpreadsheet className="h-12 w-12 text-gray-400" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Upload Data</h1>
        <p className="text-gray-600">Upload Excel file with KPI metrics</p>
      </div>

      {/* Segment Selection Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select KPI Segment
        </label>
        <div className="relative">
          <button
            type="button"
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center justify-between">
              <span>{selectedSegment.name}</span>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto">
              {SEGMENT_OPTIONS.map((segment) => (
                <button
                  key={segment.id}
                  className={cn(
                    "block w-full text-left px-4 py-2 text-sm",
                    selectedSegment.id === segment.id ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => handleSegmentSelect(segment)}
                >
                  {segment.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-12',
          'flex flex-col items-center justify-center',
          'transition-colors duration-200',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          uploadStatus.status === 'processing' ? 'opacity-75' : ''
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          {getStatusIcon()}
          </div>
        
        {uploadStatus.status === 'processing' ? (
          <div className="w-full max-w-xs">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-600">{uploadStatus.message}</span>
              <span className="text-gray-600">{uploadStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadStatus.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="text-lg text-gray-600 mb-2">
              Drag and drop your Excel file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to select a file
            </p>
            <label className="relative cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                disabled={uploadStatus.status === 'processing'}
              />
              <span className={cn(
                "bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2",
                uploadStatus.status === 'processing' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              )}>
                <UploadIcon className="h-5 w-5" />
                Select File
              </span>
            </label>
          </>
        )}
      </div>

      {(uploadStatus.status === 'success' || uploadStatus.status === 'error') && (
        <div className={cn(
          'mt-6 p-4 rounded-lg flex items-center gap-3',
          uploadStatus.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        )}>
          <AlertCircle className="h-5 w-5" />
          <p>{uploadStatus.message}</p>
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Guidelines for {selectedSegment.name}</h2>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            File must be Excel format (.xlsx, .xls)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Maximum file size: 10MB
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Required sheets: {Object.keys(selectedSegment.sheetMappings).join(', ')}
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Each sheet must contain: project_id, project_name, value
          </li>
        </ul>
      </div>
    </div>
  );
}