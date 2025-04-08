export type UserPreferences = {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  notification_level: 'all' | 'important' | 'none';
  active_domain: string;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  project: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  created_at: string;
  updated_at: string;
};

export type EquipmentMetric = {
  id: string;
  project_id: string;
  equipment_id: string;
  active_time: number;
  total_available_time: number;
  date: string;
  created_at: string;
};

export type ScheduleMetric = {
  id: string;
  project_id: string;
  milestone: string;
  planned_date: string;
  actual_date: string | null;
  status: string;
  created_at: string;
};


export type AgentNode = {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    status: 'active' | 'idle' | 'error';
  };

export type UploadHistoryItem = {
    filename: string;
    date: Date;
    user: string;
    type: 'Earned Value (EV)'| 'Actual Cost (AC)' | 'Planned Value (PV)' | 'Rework Hours' | 'Total Hours Worked'
  };

  export type ContextDocument= {
    id: string;
    title: string;
    url: string;
    type: 'link' | 'document';
    uploadDate: Date;
    description?: string;
  };