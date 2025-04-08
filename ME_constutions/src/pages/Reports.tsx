import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  BarChart as BarChartComponent,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const KPI_SEGMENTS = [
  {
    name: 'Costs & Schedule',
    table: 'cost_overruns_schedule_delays',
    kpis: ['budget_variance', 'cpi', 'spi', 'rework_ratio']
  },
  {
    name: 'Productivity',
    table: 'productivity_metrics',
    kpis: ['productivity', 'utilization', 'labourratio', 'scheduleadherance', 'benchmarkindex']
  },
  {
    name: 'Labour Management',
    table: 'labour_management_metrics',
    kpis: ['training_hours', 'absenteeism_rate', 'turnover_rate', 'afr', 'certification_coverage']
  },
  {
    name: 'Risk Management',
    table: 'risk_management_metrics',
    kpis: ['variation_orders', 'avg_variation_approval_time', 'risk_register_update_frequency', 'claims_ratio', 'weighted_risk_rating']
  },
  {
    name: 'Supply Chain',
    table: 'supply_chain_metrics',
    kpis: ['procurement_lead_time', 'inventory_turnover_ratio', 'stock_out_frequency', 'supplier_on_time_delivery_rate', 'material_waste_rate', 'quality_acceptance_rate']
  }
];

export default function Reports() {
  const [kpiData, setKpiData] = useState({});

  useEffect(() => {
    const fetchKPIData = async () => {
      const allData = {};
      for (const segment of KPI_SEGMENTS) {
        const { data, error } = await supabase
          .from(segment.table)
          .select("date, " + segment.kpis.join(", "));
        
        if (!error) {
          allData[segment.name] = data;
        }
      }
      setKpiData(allData);
      console.log(allData);
    };

    fetchKPIData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">KPI Reports</h1>
      <p className="text-gray-600 mb-8">Comprehensive view of all KPIs</p>

      {KPI_SEGMENTS.map((segment) => (
        <div key={segment.name} className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800">{segment.name}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {segment.kpis.map((kpi) => (
              <div key={kpi} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900">{kpi.replace('_', ' ')}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpiData[segment.name] || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey={kpi} stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}