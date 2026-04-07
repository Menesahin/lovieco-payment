# Entity-Relationship Diagram

> Database schema for Lovie.co P2P Payment Request Application
> PostgreSQL 16 + Prisma 7

---

## ER Diagram

```
┌──────────────────────────────────┐
│              User                │
├──────────────────────────────────┤
│ id            String    PK       │
│ name          String?            │
│ email         String    UNIQUE   │
│ emailVerified DateTime?          │
│ image         String?            │
│ createdAt     DateTime           │
│ updatedAt     DateTime           │
├──────────────────────────────────┤
│ accounts      Account[]          │
│ sessions      Session[]          │
│ sentRequests  PaymentRequest[]   │
│ receivedReqs  PaymentRequest[]   │
│ wallet        Wallet?            │
│ transactions  Transaction[]      │
└──────────┬───────────────────────┘
           │
           │ 1:N                    1:1
           │                         │
     ┌─────┼─────────────────────────┼──────────────────┐
     │     │                         │                   │
     ▼     ▼                         ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐
│   Account    │  │   Session    │  │            Wallet            │
├──────────────┤  ├──────────────┤  ├──────────────────────────────┤
│ id       PK  │  │ id       PK  │  │ id            String    PK   │
│ userId   FK  │  │ sessionToken │  │ userId        String    FK   │
│ type         │  │ userId   FK  │  │               UNIQUE         │
│ provider     │  │ expires      │  │ balanceCents  Int            │
│ providerAcct │  └──────────────┘  │               CHECK >= 0    │
│ refresh_token│                    │ createdAt     DateTime       │
│ access_token │                    │ updatedAt     DateTime       │
│ expires_at   │                    └──────────────────────────────┘
└──────────────┘

           │
           │ User sends (1:N)           User receives (1:N)
           │                             │
           ▼                             ▼
┌─────────────────────────────────────────────────────┐
│                   PaymentRequest                     │
├─────────────────────────────────────────────────────┤
│ id              String         PK                    │
│ amountCents     Int            (integer cents)       │
│ note            String?                              │
│ status          RequestStatus  DEFAULT PENDING       │
│ shareableToken  String         UNIQUE                │
│                                                      │
│ senderId        String         FK → User             │
│ recipientId     String?        FK → User (nullable)  │
│ recipientEmail  String                               │
│                                                      │
│ createdAt       DateTime                             │
│ updatedAt       DateTime                             │
│ expiresAt       DateTime       (createdAt + 7 days)  │
│ paidAt          DateTime?                            │
│ declinedAt      DateTime?                            │
│ cancelledAt     DateTime?                            │
├─────────────────────────────────────────────────────┤
│ IDX: [senderId, status]                              │
│ IDX: [recipientId, status]                           │
│ IDX: [recipientEmail]                                │
│ IDX: [status, expiresAt]                             │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ 1:N
                      ▼
┌─────────────────────────────────────────────────────┐
│                   Transaction                        │
├─────────────────────────────────────────────────────┤
│ id              String           PK                  │
│ type            TransactionType                      │
│                 (TOPUP | PAYMENT_SENT | RECEIVED)    │
│ amountCents     Int              (+/- cents)         │
│ balanceAfter    Int                                  │
│ description     String                               │
│                                                      │
│ userId          String           FK → User           │
│ requestId       String?          FK → PaymentRequest │
│                                                      │
│ createdAt       DateTime                             │
├─────────────────────────────────────────────────────┤
│ IDX: [userId, createdAt]                             │
│ IDX: [requestId]                                     │
└─────────────────────────────────────────────────────┘


┌──────────────────────────────┐
│      VerificationToken       │
├──────────────────────────────┤
│ identifier  String           │
│ token       String    UNIQUE │
│ expires     DateTime         │
├──────────────────────────────┤
│ UNIQUE: [identifier, token]  │
└──────────────────────────────┘
```

---

## Relationships

```
User ─────┬──── 1:N ────► Account          (NextAuth OAuth)
          ├──── 1:N ────► Session          (NextAuth sessions)
          ├──── 1:1 ────► Wallet           (balance tracking)
          ├──── 1:N ────► Transaction      (audit trail)
          ├──── 1:N ────► PaymentRequest   (as sender)
          └──── 1:N ────► PaymentRequest   (as recipient, nullable)

PaymentRequest ── 1:N ──► Transaction      (payment audit trail)
```

---

## Enums

```
RequestStatus          TransactionType
─────────────          ───────────────
PENDING                TOPUP
PAID                   PAYMENT_SENT
DECLINED               PAYMENT_RECEIVED
CANCELLED
EXPIRED
```

---

## Key Constraints

| Table | Constraint | Purpose |
|-------|-----------|---------|
| Wallet | `CHECK (balanceCents >= 0)` | DB-level negative balance protection |
| PaymentRequest | `recipientId` nullable | Orphan claim: request exists before recipient signs up |
| PaymentRequest | `shareableToken` UNIQUE | Public URL uses token, not internal ID |
| Transaction | `amountCents` signed | Positive = received/topup, Negative = sent |
