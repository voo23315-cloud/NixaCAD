-- Add manage_roles permission and assign to Officer
INSERT INTO permission (name, description) VALUES ('manage_roles','Create and assign roles') ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE r_id UUID; p_id UUID;
BEGIN
  SELECT id INTO r_id FROM role_tbl WHERE name='Officer';
  SELECT id INTO p_id FROM permission WHERE name='manage_roles';
  IF r_id IS NOT NULL AND p_id IS NOT NULL THEN
    INSERT INTO role_permission (role_id, permission_id) VALUES (r_id, p_id) ON CONFLICT DO NOTHING;
  END IF;
END$$;
