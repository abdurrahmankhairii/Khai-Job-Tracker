"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getJobs() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function createJob(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.jobApplication.create({
    data: {
      ...data,
      userId: session.user.id,
      statusHistory: {
        create: {
          status: data.status || 'WISHLIST'
        }
      }
    }
  });
  revalidatePath("/dashboard");
}

export async function updateJob(id: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const job = await prisma.jobApplication.findUnique({ where: { id } });
  if (job?.userId !== session.user.id) throw new Error("Unauthorized");

  const updateData: any = { ...data };
  if (data.status && data.status !== job.status) {
    updateData.statusHistory = {
      create: {
        status: data.status
      }
    };
  }

  await prisma.jobApplication.update({
    where: { id },
    data: updateData
  });
  revalidatePath("/dashboard");
}

export async function deleteJob(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const job = await prisma.jobApplication.findUnique({ where: { id } });
  if (job?.userId !== session.user.id) throw new Error("Unauthorized");

  await prisma.jobApplication.delete({
    where: { id }
  });
  revalidatePath("/dashboard");
}

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) return { total: 0, active: 0, offers: 0, responseRate: 0 };

  const jobs = await prisma.jobApplication.findMany({
    where: { userId: session.user.id }
  });

  const total = jobs.length;
  
  const activeStatuses = ['ASSESSMENT', 'HR_INTERVIEW', 'TECH_INTERVIEW'];
  const active = jobs.filter(j => activeStatuses.includes(j.status)).length;
  
  const offers = jobs.filter(j => j.status === 'OFFER' || j.status === 'ACCEPTED').length;
  
  const ghostedOrRejected = jobs.filter(j => j.status === 'REJECTED' || j.status === 'GHOSTED' || j.status === 'WISHLIST' || j.status === 'APPLIED').length;
  const responded = total - jobs.filter(j => j.status === 'WISHLIST' || j.status === 'APPLIED' || j.status === 'GHOSTED').length;
  
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  return { total, active, offers, responseRate };
}
