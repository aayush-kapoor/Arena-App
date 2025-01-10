import { createClient } from '@supabase/supabase-js';
// import { Database } from './types/supabase';

const supabaseUrl = 'https://bifzrkxicesdwtgrrrrm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZnpya3hpY2VzZHd0Z3JycnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzODIwOTIsImV4cCI6MjA0Nzk1ODA5Mn0.b7KDgcXRK_3mqQAuQ148staa4NdSYsFhxZ3S42AmjCI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });