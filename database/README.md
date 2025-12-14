# Datenbank

Dieses Verzeichnis enthält die SQL-Migrationen und Beschreibungen des PostgreSQL-Schemas für NixaCAD.

- Migrations: `migrations/0001_init.sql`
- Prisma-Schema: `../backend/prisma/schema.prisma`

ER-Diagramm (Kurzbeschreibung):
- `User` 1:n `Civilian`
- `Civilian` 1:1 `MedicalRecord`
- `MedicalRecord` 1:n `Treatment`
- `Civilian` 1:n `CriminalRecord`, `License`, `Vehicle`, `Application`
- `Department` 1:n `Application`
- `Role` n:m `Civilian` via `RoleAssignment`
- `AuditLog` zentral für alle Aktionen
