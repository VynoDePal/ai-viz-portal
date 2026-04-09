-- Enable RLS on models table
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Public read access for models
CREATE POLICY "models_public_read" ON models
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert models
CREATE POLICY "models_authenticated_insert" ON models
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update models
CREATE POLICY "models_authenticated_update" ON models
  FOR UPDATE
  TO authenticated
  USING (true);

-- Admin users can delete models
CREATE POLICY "models_admin_delete" ON models
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.com'
    )
  );
