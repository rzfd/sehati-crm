"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface VolumeChartProps {
  data: Array<{ day: string; total: number; ai: number; staff: number }>
}

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Volume percakapan 7 hari</p>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-teal-400" /> AI</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-500" /> Staff</span>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="aiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#1D9E75" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="staffFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#185FA5" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#185FA5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="ai"    stroke="#1D9E75" fill="url(#aiFill)"    strokeWidth={2} />
            <Area type="monotone" dataKey="staff" stroke="#185FA5" fill="url(#staffFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
