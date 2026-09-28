
"use client";

import { JobApplication } from "@prisma/client";
import { format, subDays } from "date-fns";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

type AnalyticsProps = {
  jobs: JobApplication[];
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b", "#0ea5e9"];

export function AnalyticsCharts({ jobs }: AnalyticsProps) {
  // 1. Job Status Distribution (Pie Chart)
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status.replace("_", " "),
    value: statusCounts[status]
  })).sort((a, b) => b.value - a.value);

  // 2. Application Funnel (Bar Chart)
  const totalApplied = jobs.length;
  const interviewing = jobs.filter(j => ["HR_INTERVIEW", "TECH_INTERVIEW"].includes(j.status)).length;
  const offered = jobs.filter(j => ["OFFER", "ACCEPTED"].includes(j.status)).length;

  const funnelData = [
    { stage: "Applied", count: totalApplied },
    { stage: "Interviewing", count: interviewing },
    { stage: "Offered", count: offered },
  ];

  // 3. Applications Over Time (Line Chart)
  // Last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentJobs = jobs.filter(j => new Date(j.appliedDate) >= thirtyDaysAgo);
  
  const dateCounts = recentJobs.reduce((acc, job) => {
    const dateStr = format(new Date(job.appliedDate), "MMM dd");
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fill in empty days for better chart
  const lineData = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const dateStr = format(d, "MMM dd");
    lineData.push({
      date: dateStr,
      applications: dateCounts[dateStr] || 0
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      <div className="glass-panel p-6 h-96 flex flex-col">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Application Funnel</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.4)" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={90} tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }} />
              <RechartsTooltip 
                cursor={{ fill: "rgba(255,255,255,0.4)" }}
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)" }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-6 h-96 flex flex-col">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Status Distribution</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
                itemStyle={{ color: "#1e293b", fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/40 px-2 py-1 rounded-md">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              {entry.name} ({entry.value})
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 h-96 flex flex-col lg:col-span-2">
        <h3 className="text-lg font-bold text-slate-700 mb-4">Application Velocity (Last 30 Days)</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.4)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickMargin={10} />
              <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 11 }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
              />
              <Line 
                type="monotone" 
                dataKey="applications" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

