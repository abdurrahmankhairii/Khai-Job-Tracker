import { getJobs, getDashboardStats } from "@/actions/job-actions";
import { JobClient } from "./job-client";

export default async function DashboardPage() {
  const jobs = await getJobs();
  const stats = await getDashboardStats();

  return <JobClient initialJobs={jobs} stats={stats} />;
}
