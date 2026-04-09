-- Enable RLS on benchmark_results table
ALTER TABLE benchmark_results ENABLE ROW LEVEL SECURITY;

-- Public read access for benchmark results
CREATE POLICY "benchmark_results_public_read" ON benchmark_results
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert benchmark results
CREATE POLICY "benchmark_results_authenticated_insert" ON benchmark_results
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update benchmark results
CREATE POLICY "benchmark_results_authenticated_update" ON benchmark_results
  FOR UPDATE
  TO authenticated
  USING (true);

-- Admin users can delete benchmark results
CREATE POLICY "benchmark_results_admin_delete" ON benchmark_results
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.com'
    )
  );
