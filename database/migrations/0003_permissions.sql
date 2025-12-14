-- Permissions and role_permission mapping
CREATE TABLE permission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE role_permission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES role_tbl(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permission(id) ON DELETE CASCADE
);

-- Seed common permissions
INSERT INTO permission (name, description) VALUES
  ('issue_ticket','Issue fines/tickets'),
  ('issue_warrant','Issue arrest warrants'),
  ('view_audit','View audit logs')
ON CONFLICT (name) DO NOTHING;

-- Assign these permissions to Officer role
DO $$
DECLARE r_id UUID; p_id UUID;
BEGIN
  SELECT id INTO r_id FROM role_tbl WHERE name='Officer';
  IF r_id IS NOT NULL THEN
    FOR p_id IN SELECT id FROM permission WHERE name IN ('issue_ticket','issue_warrant','view_audit') LOOP
      INSERT INTO role_permission (role_id, permission_id) VALUES (r_id, p_id) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END$$;
