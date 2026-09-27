const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@tracker.app' },
    update: {},
    create: {
      email: 'demo@tracker.app',
      name: 'Demo User',
      passwordHash,
    },
  });

  console.log(`Created user with id: ${user.id}`);

  // Seed 8 realistic applications
  const applications = [
    {
      company: 'TechCorp',
      role: 'Frontend Developer',
      status: 'WISHLIST',
      priority: 'HIGH',
      workMode: 'REMOTE',
      jobType: 'FULL_TIME',
      platform: 'LinkedIn',
      salaryMin: 15000000,
      salaryMax: 20000000,
      userId: user.id,
    },
    {
      company: 'DataFlow Inc',
      role: 'Full Stack Engineer',
      status: 'APPLIED',
      priority: 'MEDIUM',
      workMode: 'HYBRID',
      jobType: 'FULL_TIME',
      platform: 'Glints',
      userId: user.id,
      appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      company: 'Fintech Solutions',
      role: 'React Native Developer',
      status: 'ASSESSMENT',
      priority: 'HIGH',
      workMode: 'ONSITE',
      jobType: 'CONTRACT',
      platform: 'Company Web',
      userId: user.id,
      appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      company: 'CloudWorks',
      role: 'Backend Developer',
      status: 'HR_INTERVIEW',
      priority: 'MEDIUM',
      workMode: 'REMOTE',
      jobType: 'FULL_TIME',
      platform: 'LinkedIn',
      userId: user.id,
      appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      company: 'AI Startup',
      role: 'Software Engineer',
      status: 'TECH_INTERVIEW',
      priority: 'HIGH',
      workMode: 'HYBRID',
      jobType: 'FULL_TIME',
      platform: 'Glints',
      userId: user.id,
      appliedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      company: 'Global Retail',
      role: 'Web Developer',
      status: 'OFFER',
      priority: 'LOW',
      workMode: 'ONSITE',
      jobType: 'FULL_TIME',
      platform: 'Indeed',
      salaryMin: 12000000,
      salaryMax: 15000000,
      userId: user.id,
      appliedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      company: 'Local Agency',
      role: 'Frontend Intern',
      status: 'REJECTED',
      priority: 'LOW',
      workMode: 'REMOTE',
      jobType: 'INTERNSHIP',
      platform: 'LinkedIn',
      userId: user.id,
      appliedDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    },
    {
      company: 'Crypto Exchange',
      role: 'Senior React Developer',
      status: 'GHOSTED',
      priority: 'HIGH',
      workMode: 'REMOTE',
      jobType: 'FULL_TIME',
      platform: 'Company Web',
      userId: user.id,
      appliedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const app of applications) {
    await prisma.jobApplication.create({
      data: app,
    });
  }

  console.log('Seeded 8 applications.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
