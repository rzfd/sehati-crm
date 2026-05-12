"use client"

import { useEffect, useState } from "react"
import { useSmartReply } from "@/hooks/useSmartReply"

interface Template {
  id:      string
  title:   string
  content: string
}

interface Props {
  patientMessage: string
  clinicId:       string
  onUseReply:     (text: string) => void
}

const TABS: { key: keyof Variants; label: string; color: string }[] = [
  { key: "formal",  label: "Formal",  color: "bg-blue-50 text-blue-600" },
  { key: "warm",    label: "Hangat",  color: "bg-teal-50 text-teal-600" },
  { key: "concise", label: "Singkat", color: "bg-purple-50 text-purple-500" },
]

type Variants = { formal: string; warm: string; concise: string }

export function SmartReplyPanel({ patientMessage, clinicId, onUseReply }: Props) {
  const { result, loading, generate, clear } = useSmartReply()
  const [edited, setEdited] = useState<string>("")
  const [active, setActive] = useState<keyof Variants>("warm")
  const [templates, setTemplates] = useState<Template[]>([])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetch("/api/reply-templates")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  function applyTemplate(t: Template) {
    onUseReply(t.content)
    fetch(`/api/reply-templates/${t.id}`, { method: "POST" }).catch(() => {})
  }

  function handleGenerate() {
    setEdited("")
    generate(patientMessage, clinicId)
  }

  function selectVariant(k: keyof Variants) {
    setActive(k)
    if (result) setEdited(result[k])
  }

  return (
    <div className="card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-700">Smart Reply</p>
        {result && (
          <button onClick={() => { clear(); setEdited("") }} className="text-[10px] text-gray-400 hover:text-gray-600">
            Reset
          </button>
        )}
      </div>

      {templates.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-400 uppercase mb-1">Template cepat</p>
          <div className="flex flex-wrap gap-1">
            {templates.slice(0, 6).map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className="pill pill-purple text-[10px] hover:bg-purple-100"
                title={t.content}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {!result ? (
        <button onClick={handleGenerate} disabled={loading} className="btn-secondary w-full justify-center">
          {loading ? "Generate…" : "Generate 3 variant"}
        </button>
      ) : (
        <>
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => selectVariant(t.key)}
                className={`pill text-[10px] ${active === t.key ? t.color : "pill-gray"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={edited || result[active]}
            onChange={(e) => setEdited(e.target.value)}
            rows={4}
            className="input text-xs"
          />
          <div className="flex gap-2">
            <button onClick={() => onUseReply(edited || result[active])} className="btn-primary text-xs flex-1 justify-center">
              Pakai &amp; kirim
            </button>
            <button onClick={handleGenerate} disabled={loading} className="btn-secondary text-xs">
              {loading ? "..." : "Regenerate"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
