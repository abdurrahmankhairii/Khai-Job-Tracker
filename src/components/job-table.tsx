"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { JobApplication } from "@prisma/client";
import { format } from "date-fns";
import { Search, ChevronDown, ChevronUp, ExternalLink, FileText } from "lucide-react";
import { Badge } from "./ui/badge";

type JobTableProps = {
  jobs: JobApplication[];
  onRowClick: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
};

const statusColors: Record<string, string> = {
  WISHLIST: "bg-slate-100 text-slate-700",
  APPLIED: "bg-blue-100 text-blue-700",
  ASSESSMENT: "bg-purple-100 text-purple-700",
  HR_INTERVIEW: "bg-fuchsia-100 text-fuchsia-700",
  TECH_INTERVIEW: "bg-indigo-100 text-indigo-700",
  OFFER: "bg-emerald-100 text-emerald-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  GHOSTED: "bg-orange-100 text-orange-700",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
};

export function JobTable({ jobs, onRowClick, onStatusChange }: JobTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = [
    {
      accessorKey: "company",
      header: "Company & Role",
      cell: ({ row }: any) => (
        <div>
          <div className="font-semibold text-slate-800">{row.original.company}</div>
          <div className="text-sm text-slate-500">{row.original.role}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const val = row.original.status;
        return (
          <select 
            value={val}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(row.original.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs font-medium px-2.5 py-1 rounded-full outline-none appearance-none cursor-pointer border-r-8 border-transparent ${statusColors[val]}`}
          >
            {Object.keys(statusColors).map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        );
      }
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: any) => (
        <Badge className={priorityColors[row.original.priority]}>
          {row.original.priority}
        </Badge>
      )
    },
    {
      accessorKey: "salaryMin",
      header: "Salaries",
      cell: ({ row }: any) => {
        const min = row.original.salaryMin;
        const max = row.original.salaryMax;
        const expected = row.original.expectedSalary;
        const real = row.original.realSalary;
        const currency = row.original.currency;
        
        const formatMoney = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);

        if (!min && !expected && !real) return <span className="text-slate-400">-</span>;

        return (
          <div className="flex flex-col gap-1.5 text-xs min-w-[180px]">
            {(min || max) && (
               <div className="flex justify-between items-center gap-3">
                 <span className="text-slate-400">Market</span>
                 <span className="font-medium text-slate-600 whitespace-nowrap">
                   {min ? formatMoney(min) : ''} {min && max ? ' - ' : ''} {max ? formatMoney(max) : ''}
                 </span>
               </div>
            )}
            {expected && (
               <div className="flex justify-between items-center gap-3">
                 <span className="text-slate-400">Expected</span>
                 <span className="font-medium text-blue-600 whitespace-nowrap">
                   {formatMoney(expected)}
                 </span>
               </div>
            )}
            {real && (
               <div className="flex justify-between items-center gap-3">
                 <span className="text-slate-400">Offered</span>
                 <span className="font-medium text-emerald-600 whitespace-nowrap">
                   {formatMoney(real)}
                 </span>
               </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "appliedDate",
      header: "Applied Date",
      cell: ({ row }: any) => (
        <span className="text-sm text-slate-600">
          {format(new Date(row.original.appliedDate), "MMM d, yyyy")}
        </span>
      )
    },
    {
      id: "links",
      header: "Links",
      cell: ({ row }: any) => (
        <div className="flex gap-2 items-center">
          {row.original.jobUrl ? (
            <a 
              href={row.original.jobUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors tooltip-trigger"
              title="Job Posting Link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="p-1.5 text-slate-300"><ExternalLink className="w-4 h-4" /></span>
          )}
          {row.original.resumeUsed ? (
            <a 
              href={row.original.resumeUsed.startsWith('http') ? row.original.resumeUsed : (row.original.resumeUsed.startsWith('file://') ? row.original.resumeUsed : `file:///${row.original.resumeUsed.replace(/\\/g, '/')}`)}
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
              title={`CV: ${row.original.resumeUsed}`}
            >
              <FileText className="w-4 h-4" />
            </a>
          ) : (
            <span className="p-1.5 text-slate-300"><FileText className="w-4 h-4" /></span>
          )}
        </div>
      )
    }
  ];

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center relative mb-6">
        <Search className="w-5 h-5 absolute left-4 text-blue-500/60" />
        <input
          placeholder="Filter companies..."
          value={(table.getColumn("company")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("company")?.setFilterValue(event.target.value)
          }
          className="pl-11 pr-4 py-2.5 bg-white/40 backdrop-blur-md border border-white/60 shadow-sm focus:bg-white/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all rounded-xl text-sm outline-none w-full max-w-sm text-slate-700"
        />
      </div>
      <div className="rounded-2xl border border-white/60 overflow-hidden bg-white/30 backdrop-blur-md shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-white/40 bg-blue-50/30">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1 hover:text-blue-600 transition-colors"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="w-4 h-4 text-blue-500" />,
                          desc: <ChevronDown className="w-4 h-4 text-blue-500" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick(row.original.id)}
                  className="border-b border-white/30 last:border-0 hover:bg-white/60 transition-all cursor-pointer group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Search className="w-8 h-8 mb-2 opacity-20" />
                    <p>No applications found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
