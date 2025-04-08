import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Database, 
  BarChart, 
  Network, 
  Settings, 
  LogOut,
  Building2
} from 'lucide-react';
import { cn } from '../../utils/utils';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Upload', to: '/upload', icon: Upload },
  { name: 'Transactions', to: '/transactions', icon: Database },
  { name: 'Reports', to: '/reports', icon: BarChart },
  { name: 'Agent Flow', to: '/agent-flow', icon: Network },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-lg">A1-Agentic</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <select className="w-full p-2 border rounded-md">
          <option>Construction — Cost Metrics</option>
          <option>Financial Forecasting</option>
          <option>HR Analytics</option>
        </select>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 w-full px-3 py-2">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}