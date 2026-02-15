import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  "https://cgvsodhgusbhfqtumvjh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndnNvZGhndXNiaGZxdHVtdmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTU5NDEsImV4cCI6MjA4NjY5MTk0MX0.knyvd729erhx_HbMOxgkDb2XKjTJRCC3oMkMxAiL3q0"
);
