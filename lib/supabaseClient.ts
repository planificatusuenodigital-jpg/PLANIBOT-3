import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const supabaseUrl = 'https://vwckkdlyxsrohqnlsevg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2trZGx5eHNyb2hxbmxzZXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDM0MTksImV4cCI6MjA3NzQ3OTQxOX0.mv_WdRDJyjoO2p0fPRAGZ4Q-dG78whJ7kGDZRQuVOn8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
