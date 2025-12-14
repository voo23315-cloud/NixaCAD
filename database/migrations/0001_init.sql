-- Initial migration for NixaCAD
-- Requires pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
CREATE TABLE "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Civilians
CREATE TABLE civilian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  vorname TEXT NOT NULL,
  nachname TEXT NOT NULL,
  geburtsdatum TIMESTAMP WITH TIME ZONE,
  geschlecht TEXT,
  adresse TEXT,
  telefonnummer TEXT,
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_civilian_name ON civilian (vorname, nachname);

-- Medical records
CREATE TABLE medical_record (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civilian_id UUID UNIQUE REFERENCES civilian(id) ON DELETE CASCADE,
  blutgruppe TEXT,
  allergien TEXT,
  vorkrankheiten TEXT,
  notizen TEXT,
  metadata JSONB
);

CREATE TABLE treatment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  krankenakte_id UUID NOT NULL REFERENCES medical_record(id) ON DELETE CASCADE,
  beschreibung TEXT NOT NULL,
  behandelnder_mitarbeiter TEXT,
  zeitstempel TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criminal records
CREATE TYPE criminal_status AS ENUM ('OFFEN','VERURTEILT','FREIGESPROCHEN');
CREATE TABLE criminal_record (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civilian_id UUID NOT NULL REFERENCES civilian(id) ON DELETE CASCADE,
  straftat TEXT NOT NULL,
  beschreibung TEXT,
  datum TIMESTAMP WITH TIME ZONE NOT NULL,
  ort TEXT,
  status criminal_status DEFAULT 'OFFEN',
  beamter_id UUID,
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Licenses
CREATE TYPE license_type AS ENUM ('FUEHRERSCHEIN','WAFFENSCHEIN','JAGDSCHEIN','SONSTIGES');
CREATE TYPE license_status AS ENUM ('GUELTIG','ENTZOGEN','ABGELAUFEN');
CREATE TABLE license (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civilian_id UUID NOT NULL REFERENCES civilian(id) ON DELETE CASCADE,
  typ license_type NOT NULL,
  klasse TEXT,
  status license_status DEFAULT 'GUELTIG',
  ausstellende_behoerde TEXT,
  ablaufdatum TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Vehicles
CREATE TABLE vehicle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civilian_id UUID NOT NULL REFERENCES civilian(id) ON DELETE SET NULL,
  kennzeichen TEXT NOT NULL UNIQUE,
  fahrzeugtyp TEXT,
  farbe TEXT,
  versicherung TEXT,
  zugelassen BOOLEAN DEFAULT true,
  fahndungsstatus BOOLEAN DEFAULT false
);

-- Departments & Applications
CREATE TABLE department (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  beschreibung TEXT,
  aktiv BOOLEAN DEFAULT true
);

CREATE TYPE application_status AS ENUM ('OFFEN','ANGENOMMEN','ABGELEHNT');
CREATE TABLE application (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civilian_id UUID NOT NULL REFERENCES civilian(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES department(id) ON DELETE CASCADE,
  status application_status DEFAULT 'OFFEN',
  erstellt_am TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Roles & assignments
CREATE TYPE duty_status AS ENUM ('IM_DIENST','AUSSER_DIENST');
CREATE TABLE role_tbl (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE role_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civilian_id UUID NOT NULL REFERENCES civilian(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES role_tbl(id) ON DELETE CASCADE,
  dienststatus duty_status DEFAULT 'AUSSER_DIENST'
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  when TIMESTAMP WITH TIME ZONE DEFAULT now(),
  where_info TEXT,
  meta JSONB
);

-- Full-text search index for civilians (vorname + nachname)
CREATE INDEX idx_civilian_fulltext ON civilian USING GIN (to_tsvector('german', coalesce(vorname,'') || ' ' || coalesce(nachname,'')));
