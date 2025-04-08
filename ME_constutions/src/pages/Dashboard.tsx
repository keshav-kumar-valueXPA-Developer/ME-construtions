import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Percent,
  Activity,
  AlertTriangle,
  Truck,
  Loader2,
} from 'lucide-react';
import {
  BarChart as BarChartComponent,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { cn } from '../utils/utils';

const importantStats = [
  {
    name: 'Costs & Schedule',
    table: 'cost_overruns_schedule_delays',
    icon: TrendingUp,
    kpis: ['budget_variance'],
  },
  {
    name: 'Productivity',
    table: 'productivity_metrics',
    icon: Percent,
    kpis: ['productivity'],
  },
  {
    name: 'Labour Management',
    table: 'labour_management_metrics',
    icon: Activity,
    kpis: ['training_hours'],
  },
  {
    name: 'Risk Management',
    table: 'risk_management_metrics',
    icon: AlertTriangle,
    kpis: ['variation_orders'],
  },
  {
    name: 'Supply Chain',
    table: 'supply_chain_metrics',
    icon: Truck,
    kpis: ['quality_acceptance_rate'],
  },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({});

  useEffect(() => {
    const fetchKPIData = async () => {
      const allData = {};
      for (const segment of importantStats) {
        const { data, error } = await supabase
          .from(segment.table)
          .select("date, " + segment.kpis.join(", "));
        
        if (!error) {
          allData[segment.name] = data;
        }
      }
      setKpiData(allData);
      setLoading(false);
    };
    fetchKPIData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="text-gray-600">Key Project KPIs</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {importantStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{kpiData[stat.name]?.[0]?.[stat.kpis[0]] || 'N/A'}</h3>
            <p className="text-gray-600">{stat.name}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {importantStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">{stat.name}</h3>
            <p className="text-sm text-gray-500">Last 6 months</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpiData[stat.name]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey={stat.kpis[0]} stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
