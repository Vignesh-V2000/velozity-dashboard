import { PrismaClient, Role, ProjectStatus, TaskStatus, Priority, NotificationType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data in dependency order
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // --- USERS ---
  const admin = await prisma.user.create({
    data: { email: 'admin@velozity.com', password: hashedPassword, name: 'Alex Admin', role: Role.ADMIN },
  });

  const pm1 = await prisma.user.create({
    data: { email: 'pm1@velozity.com', password: hashedPassword, name: 'Priya Mehta', role: Role.PM },
  });

  const pm2 = await prisma.user.create({
    data: { email: 'pm2@velozity.com', password: hashedPassword, name: 'James Turner', role: Role.PM },
  });

  const dev1 = await prisma.user.create({
    data: { email: 'dev1@velozity.com', password: hashedPassword, name: 'Dev Chen', role: Role.DEVELOPER },
  });

  const dev2 = await prisma.user.create({
    data: { email: 'dev2@velozity.com', password: hashedPassword, name: 'Sara Kim', role: Role.DEVELOPER },
  });

  const dev3 = await prisma.user.create({
    data: { email: 'dev3@velozity.com', password: hashedPassword, name: 'Marco Rossi', role: Role.DEVELOPER },
  });

  const dev4 = await prisma.user.create({
    data: { email: 'dev4@velozity.com', password: hashedPassword, name: 'Lena Patel', role: Role.DEVELOPER },
  });

  // --- CLIENTS ---
  const client1 = await prisma.client.create({
    data: { name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corporation' },
  });

  const client2 = await prisma.client.create({
    data: { name: 'TechStart Inc', email: 'hello@techstart.io', company: 'TechStart Inc' },
  });

  const client3 = await prisma.client.create({
    data: { name: 'Global Media', email: 'ops@globalmedia.net', company: 'Global Media Group' },
  });

  // --- PROJECTS ---
  const project1 = await prisma.project.create({
    data: {
      name: 'Acme E-Commerce Redesign',
      description: 'Full redesign and replatform of Acme\'s e-commerce storefront using React and a headless CMS.',
      status: ProjectStatus.ACTIVE,
      clientId: client1.id,
      createdById: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'TechStart Mobile App',
      description: 'Cross-platform mobile application for TechStart\'s SaaS product using React Native.',
      status: ProjectStatus.ACTIVE,
      clientId: client2.id,
      createdById: pm1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Global Media CMS',
      description: 'Custom CMS platform for Global Media to manage their editorial workflow.',
      status: ProjectStatus.ON_HOLD,
      clientId: client3.id,
      createdById: pm2.id,
    },
  });

  // Helper to create tasks
  const createTask = async (
    projectId: string,
    taskNumber: number,
    title: string,
    description: string,
    status: TaskStatus,
    priority: Priority,
    assignedToId: string,
    createdById: string,
    dueDate: Date | null = null,
    isOverdue = false,
  ) => {
    return prisma.task.create({
      data: { projectId, taskNumber, title, description, status, priority, assignedToId, createdById, dueDate: dueDate ?? undefined, isOverdue },
    });
  };

  const now = new Date();
  const past = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const future = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // --- TASKS for Project 1 ---
  const t1_1 = await createTask(project1.id, 1, 'Setup project repository', 'Initialize monorepo, configure ESLint, Prettier, and CI pipeline.', TaskStatus.DONE, Priority.HIGH, dev1.id, pm1.id, past(20));
  const t1_2 = await createTask(project1.id, 2, 'Design system — homepage', 'Create Figma mockups for homepage with new brand colours.', TaskStatus.DONE, Priority.HIGH, dev2.id, pm1.id, past(15));
  const t1_3 = await createTask(project1.id, 3, 'Implement product listing page', 'Build React components for product grid, filters, and pagination.', TaskStatus.IN_PROGRESS, Priority.HIGH, dev1.id, pm1.id, future(3));
  const t1_4 = await createTask(project1.id, 4, 'Shopping cart functionality', 'Implement add/remove/update cart state with persistence via localStorage.', TaskStatus.TODO, Priority.MEDIUM, dev2.id, pm1.id, future(7));
  const t1_5 = await createTask(project1.id, 5, 'Integrate payment gateway', 'Connect Stripe for checkout flow, handle webhooks.', TaskStatus.TODO, Priority.CRITICAL, dev1.id, pm1.id, future(14));
  const t1_6 = await createTask(project1.id, 6, 'Write API integration tests', 'Cover all product and cart endpoints with Jest + Supertest.', TaskStatus.IN_REVIEW, Priority.MEDIUM, dev3.id, pm1.id, past(2), true);

  // --- TASKS for Project 2 ---
  const t2_1 = await createTask(project2.id, 1, 'Setup React Native project', 'Configure Expo, navigation, and state management.', TaskStatus.DONE, Priority.HIGH, dev3.id, pm1.id, past(12));
  const t2_2 = await createTask(project2.id, 2, 'Implement auth screens', 'Login, register, forgot password screens with form validation.', TaskStatus.IN_PROGRESS, Priority.HIGH, dev4.id, pm1.id, future(2));
  const t2_3 = await createTask(project2.id, 3, 'Dashboard home screen', 'Build the main dashboard with stats cards and chart components.', TaskStatus.TODO, Priority.MEDIUM, dev3.id, pm1.id, future(8));
  const t2_4 = await createTask(project2.id, 4, 'Push notification integration', 'Setup Expo push notifications for task reminders.', TaskStatus.TODO, Priority.LOW, dev4.id, pm1.id, future(15));
  const t2_5 = await createTask(project2.id, 5, 'Fix camera permission crash', 'App crashes on Android 12 when requesting camera permission.', TaskStatus.TODO, Priority.CRITICAL, dev3.id, pm1.id, past(1), true);

  // --- TASKS for Project 3 ---
  const t3_1 = await createTask(project3.id, 1, 'CMS architecture design', 'Document the content model, taxonomy, and API contract.', TaskStatus.DONE, Priority.HIGH, dev1.id, pm2.id, past(30));
  const t3_2 = await createTask(project3.id, 2, 'Rich text editor integration', 'Integrate TipTap editor with custom extensions for media embeds.', TaskStatus.IN_REVIEW, Priority.MEDIUM, dev2.id, pm2.id, past(5), true);
  const t3_3 = await createTask(project3.id, 3, 'Editorial workflow engine', 'Implement draft / review / publish workflow with notifications.', TaskStatus.TODO, Priority.HIGH, dev1.id, pm2.id, future(20));

  // --- ACTIVITY LOGS ---
  const activities = [
    { userId: pm1.id, projectId: project1.id, taskId: t1_1.id, action: 'STATUS_CHANGE', details: { from: 'IN_PROGRESS', to: 'DONE', taskTitle: t1_1.title, taskNumber: t1_1.taskNumber }, createdAt: past(18) },
    { userId: dev1.id, projectId: project1.id, taskId: t1_3.id, action: 'STATUS_CHANGE', details: { from: 'TODO', to: 'IN_PROGRESS', taskTitle: t1_3.title, taskNumber: t1_3.taskNumber }, createdAt: past(4) },
    { userId: dev3.id, projectId: project1.id, taskId: t1_6.id, action: 'STATUS_CHANGE', details: { from: 'IN_PROGRESS', to: 'IN_REVIEW', taskTitle: t1_6.title, taskNumber: t1_6.taskNumber }, createdAt: past(3) },
    { userId: pm1.id, projectId: project1.id, taskId: t1_4.id, action: 'TASK_CREATED', details: { taskTitle: t1_4.title, taskNumber: t1_4.taskNumber }, createdAt: past(6) },
    { userId: pm1.id, projectId: project2.id, taskId: t2_1.id, action: 'STATUS_CHANGE', details: { from: 'IN_PROGRESS', to: 'DONE', taskTitle: t2_1.title, taskNumber: t2_1.taskNumber }, createdAt: past(10) },
    { userId: dev4.id, projectId: project2.id, taskId: t2_2.id, action: 'STATUS_CHANGE', details: { from: 'TODO', to: 'IN_PROGRESS', taskTitle: t2_2.title, taskNumber: t2_2.taskNumber }, createdAt: past(2) },
    { userId: pm2.id, projectId: project3.id, taskId: t3_1.id, action: 'STATUS_CHANGE', details: { from: 'IN_REVIEW', to: 'DONE', taskTitle: t3_1.title, taskNumber: t3_1.taskNumber }, createdAt: past(25) },
    { userId: dev2.id, projectId: project3.id, taskId: t3_2.id, action: 'STATUS_CHANGE', details: { from: 'IN_PROGRESS', to: 'IN_REVIEW', taskTitle: t3_2.title, taskNumber: t3_2.taskNumber }, createdAt: past(4) },
    { userId: admin.id, projectId: project1.id, action: 'PROJECT_CREATED', details: { projectName: project1.name }, createdAt: past(25) },
    { userId: pm1.id, projectId: project2.id, action: 'PROJECT_CREATED', details: { projectName: project2.name }, createdAt: past(15) },
    { userId: pm1.id, projectId: project1.id, taskId: t1_5.id, action: 'TASK_ASSIGNED', details: { taskTitle: t1_5.title, taskNumber: t1_5.taskNumber, assigneeName: dev1.name }, createdAt: past(3) },
    { userId: pm1.id, projectId: project2.id, taskId: t2_5.id, action: 'TASK_ASSIGNED', details: { taskTitle: t2_5.title, taskNumber: t2_5.taskNumber, assigneeName: dev3.name }, createdAt: past(1) },
    { userId: dev1.id, projectId: project1.id, taskId: t1_2.id, action: 'STATUS_CHANGE', details: { from: 'TODO', to: 'DONE', taskTitle: t1_2.title, taskNumber: t1_2.taskNumber }, createdAt: past(14) },
    { userId: pm2.id, projectId: project3.id, taskId: t3_3.id, action: 'TASK_CREATED', details: { taskTitle: t3_3.title, taskNumber: t3_3.taskNumber }, createdAt: past(10) },
    { userId: dev3.id, projectId: project2.id, taskId: t2_1.id, action: 'STATUS_CHANGE', details: { from: 'TODO', to: 'IN_PROGRESS', taskTitle: t2_1.title, taskNumber: t2_1.taskNumber }, createdAt: past(12) },
  ];

  for (const act of activities) {
    await prisma.activityLog.create({ data: act as any });
  }

  // --- NOTIFICATIONS ---
  await prisma.notification.createMany({
    data: [
      { userId: dev1.id, actorId: pm1.id, taskId: t1_3.id, type: NotificationType.TASK_ASSIGNED, message: `Priya Mehta assigned you to Task #${t1_3.taskNumber}: ${t1_3.title}`, read: true },
      { userId: dev1.id, actorId: pm1.id, taskId: t1_5.id, type: NotificationType.TASK_ASSIGNED, message: `Priya Mehta assigned you to Task #${t1_5.taskNumber}: ${t1_5.title}`, read: false },
      { userId: pm1.id, actorId: dev3.id, taskId: t1_6.id, type: NotificationType.TASK_IN_REVIEW, message: `Dev Chen moved Task #${t1_6.taskNumber} to IN_REVIEW`, read: false },
      { userId: dev4.id, actorId: pm1.id, taskId: t2_2.id, type: NotificationType.TASK_ASSIGNED, message: `Priya Mehta assigned you to Task #${t2_2.taskNumber}: ${t2_2.title}`, read: false },
      { userId: dev3.id, actorId: pm1.id, taskId: t2_3.id, type: NotificationType.TASK_ASSIGNED, message: `Priya Mehta assigned you to Task #${t2_3.taskNumber}: ${t2_3.title}`, read: true },
      { userId: dev3.id, actorId: pm1.id, taskId: t2_5.id, type: NotificationType.TASK_ASSIGNED, message: `Priya Mehta assigned you to Task #${t2_5.taskNumber}: ${t2_5.title}`, read: false },
      { userId: pm2.id, actorId: dev2.id, taskId: t3_2.id, type: NotificationType.TASK_IN_REVIEW, message: `Sara Kim moved Task #${t3_2.taskNumber} to IN_REVIEW`, read: false },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('\n--- Test Credentials (all passwords: Password123!) ---');
  console.log('Admin:  admin@velozity.com');
  console.log('PM 1:   pm1@velozity.com');
  console.log('PM 2:   pm2@velozity.com');
  console.log('Dev 1:  dev1@velozity.com');
  console.log('Dev 2:  dev2@velozity.com');
  console.log('Dev 3:  dev3@velozity.com');
  console.log('Dev 4:  dev4@velozity.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
