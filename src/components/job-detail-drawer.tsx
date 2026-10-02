
"use client";

import { JobApplication, JobStatusHistory } from "@prisma/client";
import { format } from "date-fns";
import { X, ExternalLink, MapPin, Building2, Calendar, FileText, Trash2, Edit, Activity } from "lucide-react";
import { deleteJob } from "@/actions/job-actions";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { DeleteDialog } from "./delete-dialog";
import { useToast } from "@/hooks/use-toast";

type DrawerProps = {
  job: (JobApplication & { statusHistory?: JobStatusHistory[] }) | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
};

export function JobDetailDrawer({ job, isOpen, onClose, onEdit }: DrawerProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  if (!job) return null;

  const handleDelete = async () => {
    try {
      await deleteJob(job.id);
      toast({
        title: "Successfully Deleted",
        description: `Job application for ${job.company} has been deleted.`,
        variant: "info"
      });
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Something went wrong.",
        variant: "error"
      });
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md glass-panel !rounded-none !rounded-l-3xl z-50 transform transition-transform duration-300 ease-out bg-white/70 ${isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-start p-6 border-b border-white/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{job.role}</h2>
            <div className="flex items-center gap-2 text-blue-600 mt-1 font-medium">
              <Building2 className="w-4 h-4" />
              <span>{job.company}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 h-[calc(100vh-160px)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 p-4 rounded-2xl shadow-sm border border-white/60">
              <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">Status</span>
              <Badge className="bg-blue-100 text-blue-700 font-bold">{job.status.replace("_", " ")}</Badge>
            </div>
            <div className="bg-white/50 p-4 rounded-2xl shadow-sm border border-white/60">
              <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">Applied</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <Calendar className="w-4 h-4 text-blue-500" />
                {format(new Date(job.appliedDate), "MMM d, yyyy")}
              </div>
            </div>
            <div className="bg-white/50 p-4 rounded-2xl shadow-sm border border-white/60">
              <span className="text-xs font-semibold text-slate-400 block mb-2 uppercase tracking-wider">Location</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <MapPin className="w-4 h-4 text-blue-500" />
                {job.location || job.workMode}
              </div>
            </div>
            <div className="bg-white/50 p-4 rounded-2xl shadow-sm border border-white/60 col-span-2">
              <span className="text-xs font-semibold text-slate-400 block mb-3 uppercase tracking-wider">Salaries</span>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Market Range</span>
                  <div className="text-sm font-semibold text-slate-700">
                    {job.salaryMin || job.salaryMax ? `${job.salaryMin ? new Intl.NumberFormat("id-ID", { style: 'currency', currency: job.currency, maximumFractionDigits: 0 }).format(job.salaryMin) : ''}${job.salaryMin && job.salaryMax ? ' - ' : ''}${job.salaryMax ? new Intl.NumberFormat("id-ID", { style: 'currency', currency: job.currency, maximumFractionDigits: 0 }).format(job.salaryMax) : ''}` : "-"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Expected</span>
                  <div className="text-sm font-semibold text-blue-600">
                    {job.expectedSalary ? new Intl.NumberFormat("id-ID", { style: 'currency', currency: job.currency, maximumFractionDigits: 0 }).format(job.expectedSalary) : "-"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Real / Offered</span>
                  <div className="text-sm font-semibold text-emerald-600">
                    {job.realSalary ? new Intl.NumberFormat("id-ID", { style: 'currency', currency: job.currency, maximumFractionDigits: 0 }).format(job.realSalary) : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {job.jobUrl && (
            <a 
              href={job.jobUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 p-3 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View Original Job Posting
            </a>
          )}

          {job.resumeUsed && (
            <a 
              href={job.resumeUsed.startsWith('http') ? job.resumeUsed : (job.resumeUsed.startsWith('file://') ? job.resumeUsed : `file:///${job.resumeUsed.replace(/\\/g, '/')}`)}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 p-3 rounded-xl text-sm font-semibold transition-all shadow-sm mt-3"
              title={job.resumeUsed}
            >
              <FileText className="w-4 h-4" />
              View CV/Resume (Local Folder)
            </a>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Notes
            </h3>
            <div className="bg-white/50 p-4 rounded-2xl text-sm text-slate-700 leading-relaxed min-h-[120px] whitespace-pre-wrap shadow-sm border border-white/60">
              {job.notes || <span className="text-slate-400 italic">No notes added yet.</span>}
            </div>
          </div>

          <div className="space-y-3 pb-8">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" /> Status History
            </h3>
            <div className="bg-white/50 p-5 rounded-2xl shadow-sm border border-white/60">
              {job.statusHistory && job.statusHistory.length > 0 ? (
                <div className="relative border-l-2 border-blue-200 ml-2 space-y-5">
                  {job.statusHistory.map((history) => (
                    <div key={history.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                      <div className="text-[11px] font-bold text-slate-400 mb-1 tracking-wide uppercase">
                        {format(new Date(history.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 font-bold border border-blue-200/50 shadow-sm">{history.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 italic text-sm">No history recorded yet.</span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/50 bg-white/40 backdrop-blur-md flex justify-between gap-4">
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50/80 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <Edit className="w-4 h-4" />
            Edit Job
          </button>
        </div>
      </div>

      <DeleteDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={() => setIsDeleteDialogOpen(false)} 
        onConfirm={handleDelete}
        title="Delete Job Application"
        description={`Are you sure you want to delete your application for ${job.role} at ${job.company}? This action cannot be undone.`}
      />
    </>
  );
}

