import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.paymentRequest.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const alice = await prisma.user.create({
    data: { id: "usr_alice", email: "alice@demo.lovie.co", name: "Alice Johnson", emailVerified: new Date() },
  });
  const bob = await prisma.user.create({
    data: { id: "usr_bob", email: "bob@demo.lovie.co", name: "Bob Smith", emailVerified: new Date() },
  });
  const carol = await prisma.user.create({
    data: { id: "usr_carol", email: "carol@demo.lovie.co", name: "Carol Williams", emailVerified: new Date() },
  });
  const dave = await prisma.user.create({
    data: { id: "usr_dave", email: "dave@demo.lovie.co", name: "Dave Brown", emailVerified: new Date() },
  });

  console.log(`Created ${4} users`);

  // Wallets
  await prisma.wallet.createMany({
    data: [
      { userId: alice.id, balanceCents: 25000 },   // $250.00
      { userId: bob.id, balanceCents: 50000 },      // $500.00
      { userId: carol.id, balanceCents: 15000 },    // $150.00
      { userId: dave.id, balanceCents: 75000 },     // $750.00
    ],
  });

  console.log("Created wallets");

  // Payment Requests — various statuses
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const requests = await Promise.all([
    // PENDING — Alice requests $25 from Bob (2 days ago)
    prisma.paymentRequest.create({
      data: {
        id: "req_1", amountCents: 2500, note: "Dinner split last Friday",
        status: "PENDING", senderId: alice.id, recipientId: bob.id,
        recipientEmail: bob.email, shareableToken: "share_1",
        createdAt: new Date(now.getTime() - 2 * day),
        expiresAt: new Date(now.getTime() + 5 * day),
      },
    }),
    // PAID — Alice requests $50 from Carol (5 days ago, paid)
    prisma.paymentRequest.create({
      data: {
        id: "req_2", amountCents: 5000, note: "Concert tickets",
        status: "PAID", senderId: alice.id, recipientId: carol.id,
        recipientEmail: carol.email, shareableToken: "share_2",
        createdAt: new Date(now.getTime() - 5 * day),
        expiresAt: new Date(now.getTime() + 2 * day),
        paidAt: new Date(now.getTime() - 4 * day),
      },
    }),
    // PENDING — Bob requests $15 from Alice (1 day ago)
    prisma.paymentRequest.create({
      data: {
        id: "req_3", amountCents: 1500, note: "Coffee and pastries",
        status: "PENDING", senderId: bob.id, recipientId: alice.id,
        recipientEmail: alice.email, shareableToken: "share_3",
        createdAt: new Date(now.getTime() - 1 * day),
        expiresAt: new Date(now.getTime() + 6 * day),
      },
    }),
    // DECLINED — Carol requests $100 from Alice (3 days ago)
    prisma.paymentRequest.create({
      data: {
        id: "req_4", amountCents: 10000, note: "Rent share for March",
        status: "DECLINED", senderId: carol.id, recipientId: alice.id,
        recipientEmail: alice.email, shareableToken: "share_4",
        createdAt: new Date(now.getTime() - 3 * day),
        expiresAt: new Date(now.getTime() + 4 * day),
        declinedAt: new Date(now.getTime() - 2 * day),
      },
    }),
    // PENDING — Dave requests $75 from Alice (6 days ago, expires tomorrow!)
    prisma.paymentRequest.create({
      data: {
        id: "req_5", amountCents: 7500, note: "Group gift contribution",
        status: "PENDING", senderId: dave.id, recipientId: alice.id,
        recipientEmail: alice.email, shareableToken: "share_5",
        createdAt: new Date(now.getTime() - 6 * day),
        expiresAt: new Date(now.getTime() + 1 * day),
      },
    }),
    // EXPIRED — Alice requests $200 from Dave (10 days ago)
    prisma.paymentRequest.create({
      data: {
        id: "req_6", amountCents: 20000, note: "Freelance work payment",
        status: "EXPIRED", senderId: alice.id, recipientId: dave.id,
        recipientEmail: dave.email, shareableToken: "share_6",
        createdAt: new Date(now.getTime() - 10 * day),
        expiresAt: new Date(now.getTime() - 3 * day),
      },
    }),
    // CANCELLED — Bob requests $30 from Carol (2 days ago, cancelled)
    prisma.paymentRequest.create({
      data: {
        id: "req_7", amountCents: 3000, note: "Movie night snacks",
        status: "CANCELLED", senderId: bob.id, recipientId: carol.id,
        recipientEmail: carol.email, shareableToken: "share_7",
        createdAt: new Date(now.getTime() - 2 * day),
        expiresAt: new Date(now.getTime() + 5 * day),
        cancelledAt: new Date(now.getTime() - 1 * day),
      },
    }),
    // PENDING — Alice requests $8.50 from Bob (12 hours ago)
    prisma.paymentRequest.create({
      data: {
        id: "req_8", amountCents: 850, note: "Lunch yesterday",
        status: "PENDING", senderId: alice.id, recipientId: bob.id,
        recipientEmail: bob.email, shareableToken: "share_8",
        createdAt: new Date(now.getTime() - 0.5 * day),
        expiresAt: new Date(now.getTime() + 6.5 * day),
      },
    }),
    // PAID — Dave requests $150 from Bob (4 days ago, paid)
    prisma.paymentRequest.create({
      data: {
        id: "req_9", amountCents: 15000, note: "Weekend trip expenses",
        status: "PAID", senderId: dave.id, recipientId: bob.id,
        recipientEmail: bob.email, shareableToken: "share_9",
        createdAt: new Date(now.getTime() - 4 * day),
        expiresAt: new Date(now.getTime() + 3 * day),
        paidAt: new Date(now.getTime() - 3 * day),
      },
    }),
    // PENDING — Carol requests $45 from Dave (1 day ago)
    prisma.paymentRequest.create({
      data: {
        id: "req_10", amountCents: 4500, note: "Uber ride split",
        status: "PENDING", senderId: carol.id, recipientId: dave.id,
        recipientEmail: dave.email, shareableToken: "share_10",
        createdAt: new Date(now.getTime() - 1 * day),
        expiresAt: new Date(now.getTime() + 6 * day),
      },
    }),
  ]);

  console.log(`Created ${requests.length} payment requests`);

  // Transactions — matching paid requests + topups
  await prisma.transaction.createMany({
    data: [
      // Alice topup
      { type: "TOPUP", amountCents: 30000, balanceAfter: 30000, description: "Initial funds", userId: alice.id, createdAt: new Date(now.getTime() - 7 * day) },
      // Alice payment sent (req_2: Concert tickets, Carol paid)
      { type: "PAYMENT_RECEIVED", amountCents: 5000, balanceAfter: 35000, description: "Concert tickets from Carol", userId: alice.id, requestId: "req_2", createdAt: new Date(now.getTime() - 4 * day) },
      // Alice spent some
      { type: "PAYMENT_SENT", amountCents: -10000, balanceAfter: 25000, description: "Rent share to Carol", userId: alice.id, createdAt: new Date(now.getTime() - 2 * day) },

      // Bob topup
      { type: "TOPUP", amountCents: 50000, balanceAfter: 50000, description: "Initial funds", userId: bob.id, createdAt: new Date(now.getTime() - 7 * day) },
      // Bob paid Dave (req_9)
      { type: "PAYMENT_SENT", amountCents: -15000, balanceAfter: 35000, description: "Weekend trip to Dave", userId: bob.id, requestId: "req_9", createdAt: new Date(now.getTime() - 3 * day) },
      // Bob topup again
      { type: "TOPUP", amountCents: 15000, balanceAfter: 50000, description: "Funds added", userId: bob.id, createdAt: new Date(now.getTime() - 2 * day) },

      // Carol topup
      { type: "TOPUP", amountCents: 20000, balanceAfter: 20000, description: "Initial funds", userId: carol.id, createdAt: new Date(now.getTime() - 7 * day) },
      // Carol paid Alice (req_2)
      { type: "PAYMENT_SENT", amountCents: -5000, balanceAfter: 15000, description: "Concert tickets to Alice", userId: carol.id, requestId: "req_2", createdAt: new Date(now.getTime() - 4 * day) },

      // Dave topup
      { type: "TOPUP", amountCents: 60000, balanceAfter: 60000, description: "Initial funds", userId: dave.id, createdAt: new Date(now.getTime() - 7 * day) },
      // Dave received from Bob (req_9)
      { type: "PAYMENT_RECEIVED", amountCents: 15000, balanceAfter: 75000, description: "Weekend trip from Bob", userId: dave.id, requestId: "req_9", createdAt: new Date(now.getTime() - 3 * day) },
    ],
  });

  console.log("Created transactions");

  // Sessions for dev login
  await prisma.session.createMany({
    data: [
      { sessionToken: "demo-alice", userId: alice.id, expires: new Date(now.getTime() + 30 * day) },
      { sessionToken: "demo-bob", userId: bob.id, expires: new Date(now.getTime() + 30 * day) },
      { sessionToken: "demo-carol", userId: carol.id, expires: new Date(now.getTime() + 30 * day) },
      { sessionToken: "demo-dave", userId: dave.id, expires: new Date(now.getTime() + 30 * day) },
    ],
  });

  console.log("Created demo sessions");
  console.log("\nSeed complete! Demo logins:");
  console.log("  Alice: /api/dev-login?email=alice@demo.lovie.co");
  console.log("  Bob:   /api/dev-login?email=bob@demo.lovie.co");
  console.log("  Carol: /api/dev-login?email=carol@demo.lovie.co");
  console.log("  Dave:  /api/dev-login?email=dave@demo.lovie.co");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
