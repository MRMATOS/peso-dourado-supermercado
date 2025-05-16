
import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = 'https://aqyiinliamrgljniojgy.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeWlpbmxpYW1yZ2xqbmlvamd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4Njc2NDcsImV4cCI6MjAzMTQ0MzY0N30.pI0v2SuCsA4SsFt09vjsLQnkEFgvPKOOKB3yHCB7m4A';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
