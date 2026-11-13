const CONFIG = {
  // Project Settings > API en Supabase. Usá la clave "anon" (pública), nunca la "service_role".
  SUPABASE_URL: "https://TU-PROYECTO.supabase.co",
  SUPABASE_ANON_KEY: "TU_CLAVE_ANON_PUBLICA",
  // Endpoint para traer el top de la AREDL por ID. No está verificado: si falla, el top se carga a mano.
  AREDL_LEVEL_URL: "https://api.aredl.net/v2/api/aredl/levels/{id}"
};
