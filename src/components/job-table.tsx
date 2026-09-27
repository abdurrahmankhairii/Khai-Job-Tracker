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
import { Search, ChevronDown, ChevronUp } from "lucide-react";
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
      header: "Salary",
      cell: ({ row }: any) => {
        const min = row.original.salaryMin;
        const max = row.original.salaryMax;
        if (!min) return <span className="text-slate-400">-</span>;
        return (
          <span className="text-sm font-medium text-slate-600">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: row.original.currency, maximumFractionDigits: 0 }).format(min)}
            {max ? ` - ${new Intl.NumberFormat('id-ID', { notation: "compact", maximumFractionDigits: 1 }).format(max)}` : ''}
          </span>
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
      <div className="flex items-center relative">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <input
          placeholder="Filter companies..."
          value={(table.getColumn("company")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("company")?.setFilterValue(event.target.value)
          }
          className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-white/50 w-full max-w-sm transition-all"
        />
      </div>
      <div className="rounded-xl border border-slate-100 overflow-hidden bg-white/40">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50/50">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 text-sm font-medium text-slate-500">
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center gap-1 hover:text-slate-800 transition-colors"
                            : ""
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="w-4 h-4" />,
                          desc: <ChevronDown className="w-4 h-4" />,
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
                  className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center text-slate-500">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
