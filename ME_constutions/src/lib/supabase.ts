import { createClient } from '@supabase/supabase-js';
import{UserPreferences,Transaction,EquipmentMetric,ScheduleMetric} from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}


export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage
    },
    global: {
      headers: { 'x-my-custom-header': 'my-app-name' }
    },
    db: {
      schema: 'public'
    }
  }
);




// Helper function to check if user exists
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error checking user:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkUserExists:', error);
    return false;
  }
}

//function to check supabse connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('transactions').select('*').limit(1);
    console.log("Connection Test:", data, error);
  } catch (err) {
    console.error("Supabase Connection Error:", err);
  }
}


// Helper function to check Supabase connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return true; // Allow non-authenticated state

    const { error } = await supabase
      .from('transactions')
      .select('count')
      .limit(1)
      .single();

    if (error && !error.message.includes('No rows found')) {
      console.error('Supabase connection error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

// Helper function to ensure user is authenticated
export async function ensureAuthenticated(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth error:', error);
      return false;
    }

    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}






export async function getUserPreferences(): Promise<UserPreferences | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }

  return data;
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

export async function getTransactions(filters?: {
  project?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Transaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id);

  if (filters?.project) {
    query = query.eq('project', filters.project);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data;
}

export async function getEquipmentMetrics(projectId: string, startDate: string, endDate: string): Promise<EquipmentMetric[]> {
  const { data, error } = await supabase
    .from('equipment_metrics')
    .select('*')
    .eq('project_id', projectId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching equipment metrics:', error);
    return [];
  }

  return data;
}

export async function getScheduleMetrics(projectId: string): Promise<ScheduleMetric[]> {
  const { data, error } = await supabase
    .from('schedule_metrics')
    .select('*')
    .eq('project_id', projectId)
    .order('planned_date', { ascending: true });

  if (error) {
    console.error('Error fetching schedule metrics:', error);
    return [];
  }

  return data;
}

//function to excute sql queries
export async function executeSQLQuery(sql: string) {
  try {
    console.log("Executing SQL:", sql);
    
    // Remove any trailing semicolons
    const cleanQuery = sql.trim().replace(/;$/, '');
    
    const { data, error } = await supabase.rpc("execute_raw_sql", { sql: cleanQuery });

    if (error) {
      console.error("Supabase Query Error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Execution Error:", err);
    return null;
  }
}