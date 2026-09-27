"use client";

import { JobApplication } from "@prisma/client";
import { format } from "date-fns";
import { Badge } from "./ui/badge";

type KanbanBoardProps = {
  jobs: JobApplication[];
  onCardClick: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
};

const statuses = [
  "WISHLIST",
  "APPLIED",
  "ASSESSMENT",
  "HR_INTERVIEW",
  "TECH_INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "GHOSTED",
];

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

export function KanbanBoard({ jobs, onCardClick, onStatusChange }: KanbanBoardProps) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
      {statuses.map((status) => {
        const columnJobs = jobs.filter((j) => j.status === status);
        return (
          <div key={status} className="flex-shrink-0 w-80 flex flex-col bg-slate-50/50 rounded-2xl p-4 snap-center border border-slate-100 h-[600px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-50/90 backdrop-blur-sm p-1 rounded z-10">
              <h3 className="font-semibold text-slate-700 text-sm">
                {status.replace("_", " ")}
              </h3>
              <span className="text-xs font-medium bg-white text-slate-500 px-2 py-1 rounded-full shadow-sm">
                {columnJobs.length}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {columnJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onCardClick(job.id)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${priorityColors[job.priority]} text-[10px] px-1.5 py-0`}>
                      {job.priority}
                    </Badge>
                    <select
                      value={job.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(job.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 border-none rounded outline-none"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">{job.company}</h4>
                  <p className="text-slate-500 text-xs mb-3">{job.role}</p>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{job.platform || "Direct"}</span>
                    <span>{format(new Date(job.appliedDate), "MMM d")}</span>
                  </div>
                </div>
              ))}
              {columnJobs.length === 0 && (
                <div className="flex-1 flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-xl">
                  <span className="text-sm text-slate-400 font-medium">Empty</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
