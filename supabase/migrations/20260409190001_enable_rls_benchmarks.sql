-- Enable RLS on benchmarks table
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;

-- Public read access for benchmarks
CREATE POLICY "benchmarks_public_read" ON benchmarks
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert benchmarks
CREATE POLICY "benchmarks_authenticated_insert" ON benchmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update benchmarks
CREATE POLICY "benchmarks_authenticated_update" ON benchmarks
  FOR UPDATE
  TO authenticated
  USING (true);

-- Admin users can delete benchmarks
CREATE POLICY "benchmarks_admin_delete" ON benchmarks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.com'
    )
  );
