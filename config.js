const CONFIG = {
  // Project Settings > API en Supabase. Usá la clave "anon" (pública), nunca la "service_role".
  SUPABASE_URL: "https://wvmzdcjeyykiolevgwhn.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bXpkY2pleXlraW9sZXZnd2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2MDE1MjEsImV4cCI6MjExMDE3NzUyMX0.7zaOWH9R98PoqiGG9y3vdRRgtI_6QfPTfg671K8R40Y",
  // Endpoint para traer el top de la AREDL por ID. No está verificado: si falla, el top se carga a mano.
  AREDL_LEVEL_URL: "https://api.aredl.net/v2/api/aredl/levels/{id}"
};
