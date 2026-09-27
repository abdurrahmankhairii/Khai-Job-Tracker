"use client";

import { useState } from "react";
import { 
  BarChart3, 
  Briefcase, 
  CheckCircle2, 
  Clock,
  LayoutGrid,
  List
} from "lucide-react";
import { JobApplication } from "@prisma/client";
import { JobTable } from "@/components/job-table";
import { KanbanBoard } from "@/components/kanban-board";
import { JobDetailDrawer } from "@/components/job-detail-drawer";
import { updateJob } from "@/actions/job-actions";

type JobClientProps = {
  initialJobs: JobApplication[];
  stats: {
    total: number;
    active: number;
    offers: number;
    responseRate: number;
  };
};

export function JobClient({ initialJobs, stats }: JobClientProps) {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const selectedJob = initialJobs.find(j => j.id === selectedJobId) || null;

  const handleStatusChange = async (id: string, status: any) => {
    await updateJob(id, { status });
  };

  return (
    <div className="space-y-8">
      {/* Analytics Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Briefcase />} title="Total Applied" value={stats.total} />
        <StatCard icon={<Clock />} title="Active Processes" value={stats.active} color="text-amber-500" bg="bg-amber-100" />
        <StatCard icon={<CheckCircle2 />} title="Offers Received" value={stats.offers} color="text-emerald-500" bg="bg-emerald-100" />
        <StatCard icon={<BarChart3 />} title="Response Rate" value={`${stats.responseRate}%`} color="text-indigo-500" bg="bg-indigo-100" />
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Applications</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const company = prompt("Enter company name:");
                const role = prompt("Enter role:");
                if (company && role) {
                  import("@/actions/job-actions").then(m => m.createJob({ company, role }));
                }
              }}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              + Add New
            </button>
            <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-lg">
              <button
                onClick={() => setView("table")}
                className={`p-2 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-sky-500" : "text-slate-500 hover:text-slate-700"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("kanban")}
                className={`p-2 rounded-md transition-colors ${view === "kanban" ? "bg-white shadow-sm text-sky-500" : "text-slate-500 hover:text-slate-700"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {view === "table" ? (
          <JobTable jobs={initialJobs} onRowClick={(id) => setSelectedJobId(id)} onStatusChange={handleStatusChange} />
        ) : (
          <KanbanBoard jobs={initialJobs} onCardClick={(id) => setSelectedJobId(id)} onStatusChange={handleStatusChange} />
        )}
      </div>

      <JobDetailDrawer 
        job={selectedJob} 
        isOpen={!!selectedJobId} 
        onClose={() => setSelectedJobId(null)} 
      />
    </div>
  );
}

function StatCard({ icon, title, value, color = "text-sky-500", bg = "bg-sky-100" }: any) {
  return (
    <div className="glass-panel p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
      <div className={`${bg} ${color} p-4 rounded-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
