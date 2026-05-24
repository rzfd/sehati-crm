# Menjalankan Sehati CRM dengan Docker

App di-build sebagai Next.js **standalone** → image ramping (multi-stage).

## Prasyarat
`.env.local` berisi env yang dibutuhkan:
- Client (di-inline saat build): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`
- Server (runtime): `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, dan opsional `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

## Cara cepat (docker compose)
```bash
docker compose --env-file .env.local up --build
```
> `--env-file .env.local` WAJIB agar `NEXT_PUBLIC_*` terbaca sebagai build args
> (di-inline ke bundle client). Runtime secret diteruskan via `env_file`.

Buka http://localhost:3000

## Tanpa compose
```bash
# build (NEXT_PUBLIC_* harus ada saat build)
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --build-arg NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  -t sehati-crm .

# run (secret server-only via --env-file)
docker run -p 3000:3000 --env-file .env.local sehati-crm
```

## Catatan
- **Rate limiter**: tanpa env Upstash → in-memory (cukup untuk single container). Set `UPSTASH_REDIS_REST_URL`/`TOKEN` untuk multi-instance.
- **Healthcheck** sudah ada di compose (cek `/login`).
- Image tidak memuat secret apa pun di layer (server secret hanya runtime).
- Scripts (`seed:kb`, `reembed:kb`, `bench:*`, `test`) dijalankan di host (butuh dev deps), bukan di image produksi.
