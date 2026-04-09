-- Enable RLS on organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Public read access for organizations
CREATE POLICY "organizations_public_read" ON organizations
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert organizations
CREATE POLICY "organizations_authenticated_insert" ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update organizations
CREATE POLICY "organizations_authenticated_update" ON organizations
  FOR UPDATE
  TO authenticated
  USING (true);

-- Admin users can delete organizations
CREATE POLICY "organizations_admin_delete" ON organizations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@admin.com'
    )
  );
