import { AI_CONFIG } from "@/lib/constants"

// ── File parsing ──────────────────────────────────────────

export async function parsePdf(buffer: Buffer): Promise<string> {
  const { pdf } = await import("pdf-parse")
  // Convert Node Buffer → Uint8Array (pdf-parse v2 expects ArrayBuffer/TypedArray)
  const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  const result = await pdf(data)
  return result.text
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth")
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export function parseTxt(buffer: Buffer): string {
  return buffer.toString("utf8")
}

export async function parseDocument(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") return parsePdf(buffer)
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) return parseDocx(buffer)
  if (mimeType === "text/plain") return parseTxt(buffer)
  throw new Error(`Tipe file tidak didukung: ${mimeType}`)
}

// ── Chunking ──────────────────────────────────────────────
// Token estimate: ~4 chars per token for English/Indonesian latin script.

const CHARS_PER_TOKEN = 4
const CHUNK_CHARS     = AI_CONFIG.CHUNK_SIZE * CHARS_PER_TOKEN     // ~3200 chars
const OVERLAP_CHARS   = AI_CONFIG.CHUNK_OVERLAP * CHARS_PER_TOKEN  // ~200 chars

export function chunkText(text: string): string[] {
  // Normalize whitespace + drop empty paragraphs
  const clean = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
  if (!clean) return []
  if (clean.length <= CHUNK_CHARS) return [clean]

  // Split by paragraphs first, then accumulate into chunks
  const paragraphs = clean.split(/\n\n+/)
  const chunks: string[] = []
  let current = ""

  for (const para of paragraphs) {
    if (!para.trim()) continue
    // Single paragraph too large → split on sentences
    if (para.length > CHUNK_CHARS) {
      if (current) { chunks.push(current); current = "" }
      const sentences = para.split(/(?<=[.!?])\s+/)
      for (const s of sentences) {
        if ((current + " " + s).length > CHUNK_CHARS) {
          if (current) chunks.push(current)
          current = s
        } else {
          current = current ? current + " " + s : s
        }
      }
      continue
    }
    if ((current + "\n\n" + para).length > CHUNK_CHARS) {
      chunks.push(current)
      // Carry overlap tail of previous chunk for context
      const tail = current.length > OVERLAP_CHARS ? current.slice(-OVERLAP_CHARS) : current
      current = tail + "\n\n" + para
    } else {
      current = current ? current + "\n\n" + para : para
    }
  }
  if (current) chunks.push(current)
  return chunks
}
