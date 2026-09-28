
"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createJob, updateJob } from "@/actions/job-actions";
import { JobApplication, JobStatus, Priority, WorkMode, JobType } from "@prisma/client";

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: JobApplication | null;
}

export function JobFormModal({ isOpen, onClose, jobToEdit }: JobFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "WISHLIST" as JobStatus,
    priority: "MEDIUM" as Priority,
    workMode: "ONSITE" as WorkMode,
    jobType: "FULL_TIME" as JobType,
    location: "",
    salaryMin: "",
    salaryMax: "",
    jobUrl: "",
    resumeUsed: "",
    notes: ""
  });

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        company: jobToEdit.company,
        role: jobToEdit.role,
        status: jobToEdit.status,
        priority: jobToEdit.priority,
        workMode: jobToEdit.workMode,
        jobType: jobToEdit.jobType,
        location: jobToEdit.location || "",
        salaryMin: jobToEdit.salaryMin?.toString() || "",
        salaryMax: jobToEdit.salaryMax?.toString() || "",
        jobUrl: jobToEdit.jobUrl || "",
        resumeUsed: jobToEdit.resumeUsed || "",
        notes: jobToEdit.notes || ""
      });
    } else {
      setFormData({
        company: "",
        role: "",
        status: "WISHLIST",
        priority: "MEDIUM",
        workMode: "ONSITE",
        jobType: "FULL_TIME",
        location: "",
        salaryMin: "",
        salaryMax: "",
        jobUrl: "",
        resumeUsed: "",
        notes: ""
      });
    }
  }, [jobToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
      };

      if (jobToEdit) {
        await updateJob(jobToEdit.id, dataToSubmit);
        toast({
          title: "Successfully Updated",
          description: `Job application for ${formData.company} has been updated.`,
          variant: "success"
        });
      } else {
        await createJob(dataToSubmit);
        toast({
          title: "Successfully Created",
          description: `New job application for ${formData.company} has been added.`,
          variant: "success"
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Something went wrong. Please try again.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 glass-panel bg-white/70 p-8 shadow-2xl focus:outline-none animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-slate-800">
              {jobToEdit ? "Edit Application" : "New Application"}
            </Dialog.Title>
            <Dialog.Close className="p-2 rounded-full hover:bg-black/5 transition-colors">
              <X className="h-5 w-5 text-slate-500" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Company *</label>
                <input required type="text" className="w-full glass-input px-4 py-2" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Role *</label>
                <input required type="text" className="w-full glass-input px-4 py-2" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select className="w-full glass-input px-4 py-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as JobStatus})}>
                  <option value="WISHLIST">Wishlist</option>
                  <option value="APPLIED">Applied</option>
                  <option value="ASSESSMENT">Assessment</option>
                  <option value="HR_INTERVIEW">HR Interview</option>
                  <option value="TECH_INTERVIEW">Tech Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="GHOSTED">Ghosted</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Priority</label>
                <select className="w-full glass-input px-4 py-2" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Work Mode</label>
                <select className="w-full glass-input px-4 py-2" value={formData.workMode} onChange={e => setFormData({...formData, workMode: e.target.value as WorkMode})}>
                  <option value="ONSITE">On-site</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Job Type</label>
                <select className="w-full glass-input px-4 py-2" value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value as JobType})}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Location</label>
                <input type="text" className="w-full glass-input px-4 py-2" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Link Apply (Job URL)</label>
                <input type="url" className="w-full glass-input px-4 py-2" value={formData.jobUrl} onChange={e => setFormData({...formData, jobUrl: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Link CV</label>
                <input type="url" className="w-full glass-input px-4 py-2" value={formData.resumeUsed} onChange={e => setFormData({...formData, resumeUsed: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Salary Min (IDR)</label>
                <input type="number" className="w-full glass-input px-4 py-2" value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Salary Max (IDR)</label>
                <input type="number" className="w-full glass-input px-4 py-2" value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <textarea rows={3} className="w-full glass-input px-4 py-2 resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50">
                {loading ? "Saving..." : jobToEdit ? "Save Changes" : "Create Application"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

