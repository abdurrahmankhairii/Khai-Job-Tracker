"use client";

import { JobApplication } from "@prisma/client";
import { format } from "date-fns";
import { X, ExternalLink, MapPin, Building2, Calendar, FileText, Trash2, Save } from "lucide-react";
import { deleteJob, updateJob } from "@/actions/job-actions";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";

type DrawerProps = {
  job: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
};

export function JobDetailDrawer({ job, isOpen, onClose }: DrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (job) {
      setNotes(job.notes || "");
      setIsEditing(false);
    }
  }, [job]);

  if (!job) return null;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this application?")) {
      await deleteJob(job.id);
      onClose();
    }
  };

  const handleSaveNotes = async () => {
    await updateJob(job.id, { notes });
    setIsEditing(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md glass-panel !rounded-none !rounded-l-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}
      >
        <div className="flex justify-between items-start p-6 border-b border-white/40">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{job.role}</h2>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <Building2 className="w-4 h-4" />
              <span>{job.company}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 p-3 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Status</span>
              <Badge className="bg-sky-100 text-sky-700">{job.status.replace("_", " ")}</Badge>
            </div>
            <div className="bg-white/50 p-3 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Applied</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Calendar className="w-4 h-4 text-sky-500" />
                {format(new Date(job.appliedDate), "MMM d, yyyy")}
              </div>
            </div>
            <div className="bg-white/50 p-3 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Location</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <MapPin className="w-4 h-4 text-sky-500" />
                {job.location || job.workMode}
              </div>
            </div>
            <div className="bg-white/50 p-3 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Salary</span>
              <div className="text-sm font-medium text-slate-700">
                {job.salaryMin ? `${new Intl.NumberFormat('id-ID', { notation: "compact" }).format(job.salaryMin)} - ${new Intl.NumberFormat('id-ID', { notation: "compact" }).format(job.salaryMax || job.salaryMin)}` : "-"}
              </div>
            </div>
          </div>

          {/* Links */}
          {job.jobUrl && (
            <a 
              href={job.jobUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sky-500 hover:text-sky-600 bg-sky-50 p-3 rounded-xl text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Original Job Posting
            </a>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Notes
              </h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-sky-500 font-medium hover:underline"
                >
                  Edit
                </button>
              ) : (
                <button 
                  onClick={handleSaveNotes}
                  className="text-xs text-emerald-500 font-medium flex items-center gap-1 hover:underline"
                >
                  <Save className="w-3 h-3" /> Save
                </button>
              )}
            </div>
            
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white/50 resize-none"
                placeholder="Add interview notes, recruiter names, etc..."
              />
            ) : (
              <div className="bg-white/50 p-4 rounded-xl text-sm text-slate-600 min-h-[100px] whitespace-pre-wrap">
                {notes || <span className="text-slate-400 italic">No notes added yet.</span>}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/40 flex justify-end">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Application
          </button>
        </div>
      </div>
    </>
  );
}
