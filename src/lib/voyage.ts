import { AI_CONFIG } from "@/lib/constants"

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings"

interface VoyageResponse {
  data: { embedding: number[] }[]
}

async function callVoyage(input: string[]): Promise<number[][]> {
  const res = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY!}`,
    },
    body: JSON.stringify({ input, model: AI_CONFIG.EMBEDDING_MODEL }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Voyage AI error ${res.status}: ${text}`)
  }

  const data = (await res.json()) as VoyageResponse
  return data.data.map((d) => d.embedding)
}

export async function embedText(text: string): Promise<number[]> {
  const result = await callVoyage([text])
  return result[0]
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  return callVoyage(texts)
}
