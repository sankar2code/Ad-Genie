import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

/**
 * Sign up a new user.
 * Hashes password with bcrypt and inserts into the `users` table.
 */
export async function signUp({ name, email, password }) {
  const existing = await supabase.from('users').select('id').eq('email', email).single();
  if (existing.data) throw new Error('An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase
    .from('users')
    .insert({ display_name: name, email, password_hash: passwordHash })
    .select('id, email')
    .single();

  if (error) throw new Error(error.message);
  return { userId: data.id, email: data.email };
}

/**
 * Sign in an existing user.
 * Fetches the user by email, then verifies the bcrypt hash.
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, password_hash')
    .eq('email', email)
    .single();

  if (error || !data) throw new Error('Invalid email or password.');

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) throw new Error('Invalid email or password.');

  return { userId: data.id, email: data.email };
}
