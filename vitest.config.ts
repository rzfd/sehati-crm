import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    // Tidak ada akses jaringan/DB di unit test — semua AI/Voyage di-mock.
    setupFiles: ["./vitest.setup.ts"],
  },
})
