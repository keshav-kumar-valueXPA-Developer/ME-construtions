
  # Initial Schema Setup

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `theme` (text)
      - `notification_level` (text)
      - `active_domain` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `project` (text)
      - `type` (text)
      - `amount` (numeric)
      - `status` (text)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `equipment_metrics`
      - `id` (uuid, primary key)
      - `project_id` (text)
      - `equipment_id` (text)
      - `active_time` (numeric)
      - `total_available_time` (numeric)
      - `date` (date)
      - `created_at` (timestamp)

    - `schedule_metrics`
      - `id` (uuid, primary key)
      - `project_id` (text)
      - `milestone` (text)
      - `planned_date` (date)
      - `actual_date` (date)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users


-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  theme text DEFAULT 'light',
  notification_level text DEFAULT 'all',
  active_domain text DEFAULT 'construction',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  project text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Equipment Metrics Table
CREATE TABLE IF NOT EXISTS equipment_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  equipment_id text NOT NULL,
  active_time numeric NOT NULL,
  total_available_time numeric NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view equipment metrics"
  ON equipment_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- Schedule Metrics Table
CREATE TABLE IF NOT EXISTS schedule_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  milestone text NOT NULL,
  planned_date date NOT NULL,
  actual_date date,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedule_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view schedule metrics"
  ON schedule_metrics
  FOR SELECT
  TO authenticated
  USING (true);