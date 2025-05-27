const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

let supabase;

try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  console.log('✅ Conexión con Supabase establecida correctamente');
} catch (error) {
  console.error('❌ Error al conectar con Supabase:', error.message);
  process.exit(1);
}

module.exports = supabase;