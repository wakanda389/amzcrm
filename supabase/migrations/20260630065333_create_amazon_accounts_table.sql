/*
# Create Amazon Account Management CRM tables

1. New Tables
- `amazon_accounts`
  - `id` (uuid, primary key, auto-generated)
  - `profile_name` (text, not null — the name of the Amazon profile)
  - `email` (text, not null — account email address)
  - `password` (text, not null — account password, stored as plaintext for this demo CRM)
  - `owner_name` (text — name of the person who owns this account)
  - `phone` (text — phone number associated with the account)
  - `card_type` (text — card type like Visa, Mastercard)
  - `card_last4` (text — last 4 digits of the card)
  - `address` (text — shipping/billing address)
  - `notes` (text — free-form notes about the account)
  - `stage` (text, not null — workflow stage: one of 5 stages)
  - `stage_start_date` (date — the date when the current stage started)
  - `created_at` (timestamptz, auto now)
  - `updated_at` (timestamptz, auto now)

2. Security
- Enable RLS on `amazon_accounts`.
- Allow anon + authenticated CRUD because this is a single-tenant team CRM app without sign-in.
*/

CREATE TABLE IF NOT EXISTS amazon_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_name text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  owner_name text,
  phone text,
  card_type text,
  card_last4 text,
  address text,
  notes text,
  stage text NOT NULL DEFAULT 'prime_trial_running',
  stage_start_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE amazon_accounts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for idempotency
DROP POLICY IF EXISTS "anon_select_accounts" ON amazon_accounts;
CREATE POLICY "anon_select_accounts"
ON amazon_accounts FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_accounts" ON amazon_accounts;
CREATE POLICY "anon_insert_accounts"
ON amazon_accounts FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_accounts" ON amazon_accounts;
CREATE POLICY "anon_update_accounts"
ON amazon_accounts FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_accounts" ON amazon_accounts;
CREATE POLICY "anon_delete_accounts"
ON amazon_accounts FOR DELETE
TO anon, authenticated USING (true);
