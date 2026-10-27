require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.JWT_SECRET) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or JWT_SECRET in backend/.env");
  process.exit(1);
}
// Service-role key stays on the server only. All access checks happen in our routes.
module.exports = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
