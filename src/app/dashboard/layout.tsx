import { signOut } from "@/auth";
import { LogOut, Briefcase } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 glass-panel border-b-0 rounded-none rounded-b-2xl mx-4 mt-4 px-6 py-4 flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-sky-100 p-2 rounded-lg">
            <Briefcase className="w-5 h-5 text-sky-500" />
          </div>
          <span className="font-bold text-lg text-slate-800">Job Tracker</span>
        </div>
        
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-500 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </header>
      
      <main className="flex-1 px-4 pb-12 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
