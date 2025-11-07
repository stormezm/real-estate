import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash passwords
  const hashedPassword = await argon2.hash('password123');

  // Create Admin
  console.log('👤 Creating admin...');
  let admin = await prisma.admin.findUnique({
    where: { email: 'admin@realestate.com' },
  });
  if (!admin) {
    admin = await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'admin@realestate.com',
        password: hashedPassword,
      },
    });
    console.log('✅ Admin created:', admin.email);
  } else {
    console.log('✅ Admin already exists:', admin.email);
  }

  // Create Users
  console.log('👥 Creating users...');
  const userData = [
    {
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: hashedPassword,
    },
    {
      username: 'janesmith',
      email: 'jane.smith@example.com',
      password: hashedPassword,
    },
    {
      username: 'bobwilson',
      email: 'bob.wilson@example.com',
      password: hashedPassword,
    },
  ];

  const users = await Promise.all(
    userData.map(async (data) => {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        return existing;
      }
      return prisma.user.create({ data });
    }),
  );
  console.log(`✅ Processed ${users.length} users`);

  // Create Funds
  console.log('💰 Creating funds...');
  const fundData = [
    {
      name: 'Prime Real Estate Fund I',
      description: 'A diversified real estate fund focusing on prime commercial properties',
      startDate: new Date('2023-01-15'),
      status: 'Active' as const,
      fundType: 'MixedUse' as const,
    },
    {
      name: 'Residential Development Fund II',
      description: 'Focused on residential development projects in growing markets',
      startDate: new Date('2023-06-01'),
      status: 'Active' as const,
      fundType: 'Residential' as const,
    },
    {
      name: 'Urban Living Fund',
      description: 'Mixed-use urban development projects',
      startDate: new Date('2022-03-10'),
      status: 'Closed' as const,
      fundType: 'MixedUse' as const,
    },
  ];

  const funds = await Promise.all(
    fundData.map(async (data) => {
      const existing = await prisma.fund.findFirst({
        where: { name: data.name },
      });
      if (existing) {
        return existing;
      }
      return prisma.fund.create({ data });
    }),
  );
  console.log(`✅ Created ${funds.length} funds`);

  // Create UserFunds
  console.log('🔗 Creating user-fund relationships...');
  const userFundData = [
    {
      userId: users[0].id,
      fundId: funds[0].id,
      investmentDate: new Date('2023-02-01'),
      commitmentAmount: 500000,
      status: 'Active' as const,
    },
    {
      userId: users[0].id,
      fundId: funds[1].id,
      investmentDate: new Date('2023-07-15'),
      commitmentAmount: 300000,
      status: 'Active' as const,
    },
    {
      userId: users[1].id,
      fundId: funds[0].id,
      investmentDate: new Date('2023-03-01'),
      commitmentAmount: 750000,
      status: 'Active' as const,
    },
    {
      userId: users[1].id,
      fundId: funds[2].id,
      investmentDate: new Date('2022-04-01'),
      commitmentAmount: 1000000,
      status: 'Closed' as const,
    },
    {
      userId: users[2].id,
      fundId: funds[0].id,
      investmentDate: new Date('2023-04-15'),
      commitmentAmount: 250000,
      status: 'Active' as const,
    },
  ];

  const userFunds = await Promise.all(
    userFundData.map(async (data) => {
      const existing = await prisma.userFund.findFirst({
        where: {
          userId: data.userId,
          fundId: data.fundId,
        },
      });
      if (existing) {
        return existing;
      }
      return prisma.userFund.create({ data });
    }),
  );
  console.log(`✅ Created ${userFunds.length} user-fund relationships`);

  // Create Capital Calls (skip if already exist)
  console.log('📞 Creating capital calls...');
  const capitalCallData = [
    {
      userFundId: userFunds[0].id,
      amountCalled: 100000,
      callDate: new Date('2023-03-01'),
      dueDate: new Date('2023-03-31'),
      status: 'Paid' as const,
    },
    {
      userFundId: userFunds[0].id,
      amountCalled: 150000,
      callDate: new Date('2023-06-01'),
      dueDate: new Date('2023-06-30'),
      status: 'Paid' as const,
    },
    {
      userFundId: userFunds[1].id,
      amountCalled: 75000,
      callDate: new Date('2023-08-01'),
      dueDate: new Date('2023-08-31'),
      status: 'Pending' as const,
    },
    {
      userFundId: userFunds[2].id,
      amountCalled: 200000,
      callDate: new Date('2023-04-01'),
      dueDate: new Date('2023-04-30'),
      status: 'Paid' as const,
    },
    {
      userFundId: userFunds[3].id,
      amountCalled: 250000,
      callDate: new Date('2022-05-01'),
      dueDate: new Date('2022-05-31'),
      status: 'LatePayment' as const,
    },
  ];

  const capitalCalls = await Promise.all(
    capitalCallData.map(async (data) => {
      const existing = await prisma.capitalCall.findFirst({
        where: {
          userFundId: data.userFundId,
          callDate: data.callDate,
          amountCalled: data.amountCalled,
        },
      });
      if (existing) {
        return existing;
      }
      return prisma.capitalCall.create({ data });
    }),
  );
  console.log(`✅ Created ${capitalCalls.length} capital calls`);

  // Create Distributions (skip if already exist)
  console.log('💸 Creating distributions...');
  const distributionData = [
    {
      userFundId: userFunds[0].id,
      distributionDate: new Date('2023-09-15'),
      amountPaid: 50000,
      paymentMethod: 'Wire Transfer',
      statementUrl: '/uploads/distributions/sample-statement-1.pdf',
    },
    {
      userFundId: userFunds[2].id,
      distributionDate: new Date('2023-10-01'),
      amountPaid: 125000,
      paymentMethod: 'Wire Transfer',
      statementUrl: '/uploads/distributions/sample-statement-2.pdf',
    },
    {
      userFundId: userFunds[3].id,
      distributionDate: new Date('2023-08-20'),
      amountPaid: 300000,
      paymentMethod: 'Check',
      statementUrl: '/uploads/distributions/sample-statement-3.pdf',
    },
  ];

  const distributions = await Promise.all(
    distributionData.map(async (data) => {
      const existing = await prisma.distribution.findFirst({
        where: {
          userFundId: data.userFundId,
          distributionDate: data.distributionDate,
          amountPaid: data.amountPaid,
        },
      });
      if (existing) {
        return existing;
      }
      return prisma.distribution.create({ data });
    }),
  );
  console.log(`✅ Created ${distributions.length} distributions`);

  // Create Performance Metrics (skip if already exist)
  console.log('📊 Creating performance metrics...');
  const performanceMetricsData = [
    {
      userFundId: userFunds[0].id,
      period: 'Q3 2023',
      irr: 12.5,
      moic: 1.15,
      nav: 575000,
    },
    {
      userFundId: userFunds[2].id,
      period: 'Q3 2023',
      irr: 15.2,
      moic: 1.20,
      nav: 900000,
    },
    {
      userFundId: userFunds[3].id,
      period: 'Q2 2023',
      irr: 18.7,
      moic: 1.35,
      nav: 1350000,
    },
  ];

  const performanceMetrics = await Promise.all(
    performanceMetricsData.map(async (data) => {
      const existing = await prisma.performanceMetrics.findUnique({
        where: { userFundId: data.userFundId },
      });
      if (existing) {
        return existing;
      }
      return prisma.performanceMetrics.create({ data });
    }),
  );
  console.log(`✅ Created ${performanceMetrics.length} performance metrics`);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Summary:');
  console.log(`   - 1 Admin`);
  console.log(`   - ${users.length} Users`);
  console.log(`   - ${funds.length} Funds`);
  console.log(`   - ${userFunds.length} User-Fund relationships`);
  console.log(`   - ${capitalCalls.length} Capital Calls`);
  console.log(`   - ${distributions.length} Distributions`);
  console.log(`   - ${performanceMetrics.length} Performance Metrics`);
  console.log('\n🔐 Default password for all users and admin: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

