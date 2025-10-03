-- Migration: Fix profile creation by adding INSERT policy
-- Created: 2025-10-03
-- Description: Adds missing INSERT policy so the trigger can create profiles for new users

-- Add INSERT policy for profiles table
-- This allows the trigger function to insert profiles when new users sign up
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
