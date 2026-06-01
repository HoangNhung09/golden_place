-- GoldenPlace SQL Server bootstrap
-- The application tables are generated from SQLAlchemy models by backend/app/database.py.

IF DB_ID(N'GoldenPlace') IS NULL
BEGIN
    CREATE DATABASE [GoldenPlace];
END;
GO

USE [GoldenPlace];
GO

-- After creating the database, run one of:
-- 1. python scripts/create_db.py
-- 2. python scripts/seed_data.py
-- 3. alembic upgrade head
