-- Add incidents, tickets and warrants
CREATE TABLE incident (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  reported_by UUID,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  meta JSONB
);

CREATE TABLE ticket (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civilian_id UUID NOT NULL REFERENCES civilian(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  issued_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE warrant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civilian_id UUID NOT NULL REFERENCES civilian(id) ON DELETE CASCADE,
  issued_by UUID,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
