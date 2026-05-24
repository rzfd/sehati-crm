"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts"

interface VolumeChartProps {
  data: Array<{ day: string; total: number; ai: number; staff: number }>
}

export function VolumeChart({ data }: VolumeChartProps) {
  const peak = data.reduce((m, d) => Math.max(m, d.total), 0)

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-card-title text-ink">Volume Mingguan</p>
          <p className="text-body-sm text-ink-muted">Total percakapan per hari</p>
        </div>
        <div className="flex items-center gap-3 text-caption text-ink-muted">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary" /> AI</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-tertiary" /> Staff</span>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 16, right: 4, left: 4, bottom: 0 }} barCategoryGap="28%">
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#6F665A" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(70,97,71,0.06)" }}
              contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #E8E0CC", boxShadow: "0 8px 24px rgba(45,30,10,0.06)" }}
              labelStyle={{ color: "#1f1b14", fontWeight: 600 }}
            />
            <Bar dataKey="total" radius={[6, 6, 6, 6]} maxBarSize={40}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.total >= peak && peak > 0 ? "#466147" : "#D9E1D2"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
