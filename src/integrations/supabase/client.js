import { createClient } from '@supabase/supabase-js';

// Demo 项目：以下为占位配置，实际使用时请替换为真实的 Supabase 连接信息
const SUPABASE_URL = "https://your-supabase-instance.database.example.com";
const SUPABASE_ANON_KEY = "your-anon-key-here";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
