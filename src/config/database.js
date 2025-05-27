const { createClient } = require('@supabase/supabase-js');

// Validar que las variables de entorno existan
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Debugging para Railway
console.log('🔍 Verificando variables de entorno:');
console.log('SUPABASE_URL:', supabaseUrl ? 'Configurada ✅' : 'NO CONFIGURADA ❌');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Configurada ✅' : 'NO CONFIGURADA ❌');

if (!supabaseUrl) {
  console.error('❌ Error: SUPABASE_URL no está configurada');
  console.error('En Railway, ve a Variables y agrega SUPABASE_URL');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ Error: SUPABASE_ANON_KEY no está configurada');
  console.error('En Railway, ve a Variables y agrega SUPABASE_ANON_KEY');
  process.exit(1);
}

let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Conexión con Supabase establecida correctamente');
  console.log('🌐 URL:', supabaseUrl);
} catch (error) {
  console.error('❌ Error al conectar con Supabase:', error.message);
  process.exit(1);
}

module.exports = supabase;