import Link from "next/link"
import { QAEditor } from "@/components/kb/QAEditor"
import { AIPreview } from "@/components/kb/AIPreview"

export default function NewQAPage() {
  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/kb/qa" className="text-xs text-gray-500 hover:text-purple-500">← Kembali ke Q&amp;A</Link>
        <h1 className="text-xl font-medium text-gray-700 mt-2">Q&amp;A Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Buat pasangan pertanyaan-jawaban untuk knowledge base</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <QAEditor />
        <AIPreview />
      </div>
    </div>
  )
}
