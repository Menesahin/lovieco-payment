// Test data constants — matches prisma/seed.ts
export const USERS = {
  alice: { email: "alice@demo.lovie.co", name: "Alice Johnson" },
  bob: { email: "bob@demo.lovie.co", name: "Bob Smith" },
  carol: { email: "carol@demo.lovie.co", name: "Carol Williams" },
  dave: { email: "dave@demo.lovie.co", name: "Dave Brown" },
} as const;

export const DEMO_REQUESTS = {
  pendingAliceToBob: { id: "req_1", amount: "$25.00", note: "Dinner split last Friday" },
  paidAliceToCarol: { id: "req_2", amount: "$50.00", note: "Concert tickets" },
  pendingBobToAlice: { id: "req_3", amount: "$15.00", note: "Coffee and pastries" },
  declinedCarolToAlice: { id: "req_4", amount: "$100.00", note: "Rent share for March" },
  nearExpiryDaveToAlice: { id: "req_5", amount: "$75.00", note: "Group gift contribution" },
} as const;
