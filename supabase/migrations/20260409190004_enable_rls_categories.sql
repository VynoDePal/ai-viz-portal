-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert categories
CREATE POLICY "categories_authenticated_insert" ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update categories
CREATE POLICY "categories_authenticated_update" ON categories
  FOR UPDATE
  TO authenticated
  USING (true);

-- Admin users can delete categories
CREATE POLICY "categories_admin_delete" ON categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.com'
    )
  );
