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
import { useToast } from "@/hooks/use-toast";
import { JobApplication, JobStatus } from "@prisma/client";
import { JobTable } from "@/components/job-table";
import { KanbanBoard } from "@/components/kanban-board";
import { JobDetailDrawer } from "@/components/job-detail-drawer";
import { JobFormModal } from "@/components/job-form-modal";
import { AnalyticsCharts } from "@/components/analytics-charts";
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

type FilterType = "ALL" | "ACTIVE" | "OFFERS" | "RESPONDED";

export function JobClient({ initialJobs, stats }: JobClientProps) {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [filter, setFilter] = useState<FilterType>("ALL");

  const selectedJob = initialJobs.find(j => j.id === selectedJobId) || null;

  const { toast } = useToast();

  const handleStatusChange = async (id: string, status: any) => {
    try {
      await updateJob(id, { status });
      toast({
        title: "Status Updated",
        description: `Job application status changed to ${status}.`,
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update status.",
        variant: "error"
      });
    }
  };

  const activeStatuses = ['ASSESSMENT', 'HR_INTERVIEW', 'TECH_INTERVIEW'];
  
  const filteredJobs = initialJobs.filter(job => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return activeStatuses.includes(job.status);
    if (filter === "OFFERS") return job.status === "OFFER" || job.status === "ACCEPTED";
    if (filter === "RESPONDED") return job.status !== "WISHLIST" && job.status !== "APPLIED" && job.status !== "GHOSTED";
    return true;
  });

  const [tab, setTab] = useState<"applications" | "insights">("applications");

  return (
    <div className="space-y-8">
      {/* Top Header / Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm w-fit">
          <button 
            onClick={() => setTab("applications")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === "applications" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/30"}`}
          >
            Applications
          </button>
          <button 
            onClick={() => setTab("insights")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === "insights" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/30"}`}
          >
            Insights & Analytics
          </button>
        </div>
        
        {tab === "applications" && (
          <button
            onClick={() => {
              setEditingJob(null);
              setIsFormOpen(true);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            + Add New
          </button>
        )}
      </div>

      {/* Analytics Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Briefcase />} title="Total Applied" value={stats.total} 
          isActive={filter === "ALL"} onClick={() => setFilter("ALL")} 
        />
        <StatCard 
          icon={<Clock />} title="Active Processes" value={stats.active} color="text-amber-500" bg="bg-amber-100" 
          isActive={filter === "ACTIVE"} onClick={() => setFilter("ACTIVE")} 
        />
        <StatCard 
          icon={<CheckCircle2 />} title="Offers Received" value={stats.offers} color="text-emerald-500" bg="bg-emerald-100" 
          isActive={filter === "OFFERS"} onClick={() => setFilter("OFFERS")} 
        />
        <StatCard 
          icon={<BarChart3 />} title="Response Rate" value={`${stats.responseRate}%`} color="text-indigo-500" bg="bg-indigo-100" 
          isActive={filter === "RESPONDED"} onClick={() => setFilter("RESPONDED")} 
        />
      </div>

      {tab === "applications" ? (
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Applications {filter !== "ALL" && <span className="text-sm font-normal text-slate-500 ml-2">(Filtered)</span>}</h2>
            <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-white/60">
              <button
                onClick={() => setView("table")}
                className={`p-2 rounded-lg transition-all ${view === "table" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700 hover:bg-white/40"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("kanban")}
                className={`p-2 rounded-lg transition-all ${view === "kanban" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700 hover:bg-white/40"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {view === "table" ? (
            <JobTable jobs={filteredJobs} onRowClick={(id) => setSelectedJobId(id)} onStatusChange={handleStatusChange} />
          ) : (
            <KanbanBoard jobs={filteredJobs} onCardClick={(id) => setSelectedJobId(id)} onStatusChange={handleStatusChange} />
          )}
        </div>
      ) : (
        <AnalyticsCharts jobs={initialJobs} />
      )}

      <JobDetailDrawer 
        job={selectedJob} 
        isOpen={!!selectedJobId} 
        onClose={() => setSelectedJobId(null)} 
        onEdit={() => {
          if (selectedJob) setEditingJob(selectedJob);
          setIsFormOpen(true);
          setSelectedJobId(null);
        }}
      />

      <JobFormModal 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setTimeout(() => setEditingJob(null), 200);
        }} 
        jobToEdit={editingJob}
      />
    </div>
  );
}

function StatCard({ icon, title, value, color = "text-blue-500", bg = "bg-blue-100", isActive, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`glass-panel glass-panel-hover p-6 flex items-center gap-4 cursor-pointer transition-all duration-300 ${
        isActive ? "ring-2 ring-blue-500/50 bg-white/60 shadow-[0_12px_40px_rgba(0,100,255,0.15)] translate-y-[-2px]" : ""
      }`}
    >
      <div className={`${bg} ${color} p-4 rounded-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
