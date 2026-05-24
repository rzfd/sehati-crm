import { describe, it, expect } from "vitest"
import { checkKeywordFilter } from "./keyword-filter"

describe("checkKeywordFilter — safety blocklist", () => {
  it("menandai keluhan darurat eksplisit sebagai urgent", () => {
    expect(checkKeywordFilter("Tolong, suami saya tidak bisa nafas!").kind).toBe("urgent")
    expect(checkKeywordFilter("anak saya kejang dari tadi").kind).toBe("urgent")
    expect(checkKeywordFilter("saya kepikiran bunuh diri").kind).toBe("urgent")
  })

  it("menangkap parafrase darurat yang dulu lolos (regresi)", () => {
    // Sebelum URGENT_KEYWORDS diperluas, frasa ini lolos dari L1.
    expect(checkKeywordFilter("dada terasa sesak nafas sejak pagi").kind).toBe("urgent")
    expect(checkKeywordFilter("ada nyeri dada hebat").kind).toBe("urgent")
    expect(checkKeywordFilter("rasanya mau pingsan").kind).toBe("urgent")
  })

  it("case-insensitive", () => {
    expect(checkKeywordFilter("SAYA SESAK NAPAS").kind).toBe("urgent")
  })

  it("mengembalikan staff_escape untuk kata kunci 'staff' persis", () => {
    expect(checkKeywordFilter("staff").kind).toBe("staff_escape")
  })

  it("tidak salah-tandai pesan biasa sebagai urgent", () => {
    expect(checkKeywordFilter("Jam berapa klinik buka hari ini?").kind).toBe("none")
    expect(checkKeywordFilter("mau daftar ke dokter gigi").kind).toBe("none")
  })
})
