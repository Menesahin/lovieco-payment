# ADR-009: Email-Only Recipient Identification (Phone Deferred to v2)

- **Status**: Accepted
- **Date**: 2026-04-07
- **Deciders**: Engineering Team

---

## Context

The assignment states: "User enters recipient's **email/phone**, amount, and optional note." This implies the system should accept either an email address or phone number to identify the recipient.

We need to decide whether to support both identifiers in v1 or focus on email only.

## Decision

**v1 supports email only.** Phone number identification is explicitly deferred to v2.

### Rationale

1. **Auth is email-based**: Magic link authentication sends links via email. If we accept phone numbers as recipient identifiers, we'd need a separate SMS delivery channel for notifications and onboarding — adding Twilio/SMS integration.

2. **Orphan claim relies on email**: Our unregistered recipient pattern (ADR-004) links requests to accounts via `recipientEmail`. Adding phone would require a parallel `recipientPhone` field, dual lookup logic, and phone-to-account linking.

3. **Validation complexity**: Phone numbers require country code handling, formatting (E.164), and validation libraries (libphonenumber). Email validation is straightforward (RFC 5322 regex + Zod).

4. **Time constraint**: Adding phone support doubles the input validation, recipient resolution, and notification logic — significant overhead for a timed assignment.

### What v1 Delivers
- Recipient identified by email address
- Email validated with Zod (RFC 5322 format)
- Input field label: "Recipient Email" (clear, no ambiguity)
- Spec documents this decision transparently

### What v2 Would Add
- Phone number input field (optional, alongside email)
- E.164 format validation
- SMS notification for payment requests
- Phone-based orphan claim on sign-in
- Twilio or similar SMS provider integration

## Consequences

### Positive
- **Simpler implementation**: Single identifier type, single validation rule, single lookup pattern
- **Consistent with auth**: Email input for requests matches email input for sign-in — coherent UX
- **Faster delivery**: No phone parsing library, no SMS provider, no country code picker
- **Transparent**: Documented as a deliberate decision, not an oversight

### Negative
- **Incomplete task coverage**: Assignment mentions "email/phone" — we only implement email. Mitigated by documenting the decision and explaining the rationale in specs.
- **Less flexible**: Users who prefer phone-based identification cannot use it. Mitigated: most payment apps primarily use email or username for web.

## Alternatives Considered

### Support Both Email and Phone
- **Pros**: Fully matches the assignment requirement
- **Cons**: Requires: phone validation library, E.164 formatting, SMS provider (Twilio), phone-based orphan claim, dual input field with format detection, additional test coverage
- **Why rejected**: Approximately doubles the input handling complexity for a feature that depends on infrastructure (SMS) we don't have configured.

### Phone Only (No Email)
- **Pros**: Mobile-first, matches Cash App's model
- **Cons**: Our auth is email-based. Would require SMS auth (magic link via SMS) or separate auth flow.
- **Why rejected**: Contradicts our email-based auth stack.

### Smart Input (Auto-Detect Email vs Phone)
- **Pros**: Single input field, system detects format
- **Cons**: Ambiguous UX (what did the user intend?), complex validation logic, edge cases with international phone formats
- **Why rejected**: Over-complex for v1. Clear labeled fields are better UX than smart detection.
