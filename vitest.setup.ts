// Env dummy supaya modul yang baca process.env saat import tidak meledak.
process.env.ANTHROPIC_API_KEY ??= "test-key"
process.env.VOYAGE_API_KEY ??= "test-key"
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon"
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service"
