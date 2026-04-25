-- ============================================================================
-- ENABLE RLS — Belt-and-suspenders sécu Supabase
-- ============================================================================
-- Contexte : Momento utilise NextAuth + Prisma via connection Postgres directe.
-- L'API REST PostgREST de Supabase n'est PAS utilisée par l'app.
-- Toutes les tables `public.*` étaient UNRESTRICTED → si la Data API est ON
-- + anon key fuite, n'importe qui peut SELECT/INSERT/UPDATE/DELETE.
--
-- Ce script :
-- 1. Active RLS sur toutes les tables `public.*`
-- 2. NE crée PAS de policies → par défaut, aucun accès via les rôles
--    `anon` et `authenticated` (= les rôles utilisés par PostgREST).
-- 3. Le rôle `postgres` (= notre connection Prisma) garde TOUS les droits
--    car RLS ne s'applique pas aux superusers.
--
-- Résultat : Prisma continue de fonctionner normalement, PostgREST devient
-- aveugle sauf pour les tables où on ajoute volontairement des policies.
-- ============================================================================

-- Toutes les tables publiques visibles
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    -- ENABLE seulement (pas FORCE). FORCE applique RLS même au owner et casserait Prisma.
    -- Avec ENABLE simple : rôles `anon`/`authenticated` (PostgREST) sont bloqués,
    -- le rôle owner (= notre connection Prisma) bypasse RLS automatiquement.
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END $$;

-- Vérification : lister les tables et leur statut RLS
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Pour révoquer en cas de souci (à NE PAS exécuter par défaut) :
-- DO $$ DECLARE r RECORD; BEGIN
--   FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
--     EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', r.tablename);
--   END LOOP;
-- END $$;
