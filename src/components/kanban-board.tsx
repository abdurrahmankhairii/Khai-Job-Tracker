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
    <div className="flex gap-4 overflow-x-auto pb-6 snap-x pt-2">
      {statuses.map((status) => {
        const columnJobs = jobs.filter((j) => j.status === status);
        return (
          <div key={status} className="flex-shrink-0 w-80 flex flex-col bg-white/20 backdrop-blur-md rounded-3xl p-4 snap-center border border-white/50 shadow-sm h-[600px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white/60 backdrop-blur-xl p-3 rounded-2xl z-10 border border-white/60 shadow-sm">
              <h3 className="font-bold text-slate-700 text-sm tracking-wide">
                {status.replace("_", " ")}
              </h3>
              <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 rounded-full shadow-sm">
                {columnJobs.length}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {columnJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onCardClick(job.id)}
                  className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/80 hover:shadow-[0_8px_30px_rgba(0,100,255,0.1)] hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={`${priorityColors[job.priority]} text-[10px] px-1.5 py-0 font-bold`}>
                      {job.priority}
                    </Badge>
                    <select
                      value={job.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(job.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 border border-slate-200 rounded-lg outline-none px-1 py-0.5 text-slate-600 font-medium"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{job.company}</h4>
                  <p className="text-slate-500 text-xs mb-3 font-medium">{job.role}</p>
                  
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                    <span className="uppercase tracking-wider">{job.platform || "Direct"}</span>
                    <span>{format(new Date(job.appliedDate), "MMM d")}</span>
                  </div>
                </div>
              ))}
              {columnJobs.length === 0 && (
                <div className="flex-1 flex items-center justify-center h-24 border-2 border-dashed border-white/50 rounded-2xl">
                  <span className="text-sm text-slate-400 font-medium">Drop here</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
