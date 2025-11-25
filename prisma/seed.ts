import { PrismaClient } from "@prisma";
import { hash } from "bcryptjs";
import { DebateTopicEnum, ParticipantRole } from "@/app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.report.deleteMany();
  await prisma.concession.deleteMany();
  await prisma.argumentQuote.deleteMany();
  await prisma.argumentVote.deleteMany();
  await prisma.reference.deleteMany();
  await prisma.argument.deleteMany();
  await prisma.winCondition.deleteMany();
  await prisma.debateTopic.deleteMany();
  await prisma.debateParticipant.deleteMany();
  await prisma.debate.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.passwordResetToken.deleteMany();

  console.log("✨ Cleared existing data");

  // Create Users
  const hashedPassword = await hash("password123", 12);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: hashedPassword,
      bio: "Environmental scientist passionate about climate policy.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      password: hashedPassword,
      bio: "Economics researcher interested in policy analysis.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: "Charlie Davis",
      email: "charlie@example.com",
      password: hashedPassword,
      bio: "Technology ethicist focused on AI governance.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  });

  const diana = await prisma.user.create({
    data: {
      name: "Diana Martinez",
      email: "diana@example.com",
      password: hashedPassword,
      bio: "Political science professor specializing in democratic institutions.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  });

  console.log("👥 Created 4 users");

  // Create a debate specifically designed to test thread view with multiple branches
  const threadTestDebate = await prisma.debate.create({
    data: {
      title:
        "Thread Test: Should social media platforms be regulated for content moderation?",
      description:
        "A debate specifically designed to test the thread view feature with multiple response branches and complex conversation trees.",
      status: "IN_PROGRESS",
      format: "MULTI_SIDED",
      maxParticipants: 4,
      turnsPerSide: 3,
      turnTimeLimit: 72,
      minReferences: 1,
      currentTurnSide: ParticipantRole.PROPOSER,
      currentTurnNumber: 3,
      creatorId: alice.id,
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Add topics
  await prisma.debateTopic.createMany({
    data: [
      { debateId: threadTestDebate.id, topic: DebateTopicEnum.TECHNOLOGY },
      { debateId: threadTestDebate.id, topic: DebateTopicEnum.LAW_JUSTICE },
      { debateId: threadTestDebate.id, topic: DebateTopicEnum.SOCIETY_CULTURE },
    ],
  });

  // Add participants
  const aliceParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: threadTestDebate.id,
      userId: alice.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });

  const bobParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: threadTestDebate.id,
      userId: bob.id,
      role: "OPPOSER",
      status: "ACTIVE",
    },
  });

  const charlieParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: threadTestDebate.id,
      userId: charlie.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });

  const dianaParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: threadTestDebate.id,
      userId: diana.id,
      role: "OPPOSER",
      status: "ACTIVE",
    },
  });

  console.log("🎭 Created thread test debate with 4 participants");

  // === COMPLEX THREAD STRUCTURE FOR TESTING ===

  // TURN 1: Root arguments that will spawn multiple branches
  console.log("🔄 Creating complex thread structure...");

  // Alice's root argument
  const aliceRoot = await prisma.argument.create({
    data: {
      content: `<p><strong>Free Speech Foundation:</strong> Social media platforms have become the modern public square. Heavy regulation would undermine free speech principles that are fundamental to democratic societies. The cure of regulation could be worse than the disease of misinformation.</p>`,
      turnNumber: 1,
      debateId: threadTestDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
    },
  });

  // Bob's root argument
  const bobRoot = await prisma.argument.create({
    data: {
      content: `<p><strong>Public Harm Prevention:</strong> Unregulated content leads to real-world harm - from vaccine misinformation causing deaths to hate speech inciting violence. Platforms have a moral responsibility to moderate harmful content.</p>`,
      turnNumber: 1,
      debateId: threadTestDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
    },
  });

  // Charlie's root argument
  const charlieRoot = await prisma.argument.create({
    data: {
      content: `<p><strong>Market Power Concern:</strong> A few tech giants have unprecedented control over public discourse. Without regulation, they can arbitrarily silence voices and shape political outcomes without accountability.</p>`,
      turnNumber: 1,
      debateId: threadTestDebate.id,
      participantId: charlieParticipant.id,
      authorId: charlie.id,
    },
  });

  // Diana's root argument
  const dianaRoot = await prisma.argument.create({
    data: {
      content: `<p><strong>Practical Implementation:</strong> Content moderation at scale is impossible to do perfectly. Regulation would either be too vague to enforce or so strict it would crush innovation and free expression.</p>`,
      turnNumber: 1,
      debateId: threadTestDebate.id,
      participantId: dianaParticipant.id,
      authorId: diana.id,
    },
  });

  // === TURN 2: Multiple responses creating branches ===

  // BRANCH 1: Responses to Alice's free speech argument
  const response1ToAlice = await prisma.argument.create({
    data: {
      content: `<p><strong>Counter to Free Speech:</strong> Private platforms aren't bound by First Amendment obligations. They're companies, not governments, and can set their own rules without violating free speech principles.</p>`,
      turnNumber: 2,
      debateId: threadTestDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      responseToId: aliceRoot.id,
    },
  });

  const response2ToAlice = await prisma.argument.create({
    data: {
      content: `<p><strong>Support with Nuance:</strong> While I agree with free speech principles, we need to distinguish between political speech and demonstrably harmful misinformation. The latter doesn't deserve the same protections.</p>`,
      turnNumber: 2,
      debateId: threadTestDebate.id,
      participantId: charlieParticipant.id,
      authorId: charlie.id,
      responseToId: aliceRoot.id,
    },
  });

  // BRANCH 2: Responses to Bob's harm prevention argument
  const response1ToBob = await prisma.argument.create({
    data: {
      content: `<p><strong>Slippery Slope Concern:</strong> Once we accept regulation to prevent "harm," where do we draw the line? Today it's vaccine misinformation, tomorrow it could be legitimate political criticism.</p>`,
      turnNumber: 2,
      debateId: threadTestDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      responseToId: bobRoot.id,
    },
  });

  const response2ToBob = await prisma.argument.create({
    data: {
      content: `<p><strong>International Perspective:</strong> The EU's Digital Services Act shows regulation can be balanced. It requires transparency and accountability without imposing specific content rules.</p>`,
      turnNumber: 2,
      debateId: threadTestDebate.id,
      participantId: dianaParticipant.id,
      authorId: diana.id,
      responseToId: bobRoot.id,
    },
  });

  // BRANCH 3: Responses to Charlie's market power argument
  const response1ToCharlie = await prisma.argument.create({
    data: {
      content: `<p><strong>Competition Solution:</strong> Instead of content regulation, we should focus on antitrust measures to break up tech monopolies. More competition would naturally lead to diverse moderation policies.</p>`,
      turnNumber: 2,
      debateId: threadTestDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      responseToId: charlieRoot.id,
    },
  });

  const response2ToCharlie = await prisma.argument.create({
    data: {
      content: `<p><strong>Infrastructure Argument:</strong> These platforms aren't just companies - they're essential infrastructure. Like utilities, they should be regulated to ensure fair access and prevent abuse.</p>`,
      turnNumber: 2,
      debateId: threadTestDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      responseToId: charlieRoot.id,
    },
  });

  // === TURN 3: Nested responses creating deeper branches ===

  // SUB-BRANCH 1A: Responses to Bob's counter about private platforms
  const nested1ToResponse1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Infrastructure Status:</strong> When platforms reach a certain size and importance, they effectively become public infrastructure and should have corresponding responsibilities.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: charlieParticipant.id,
      authorId: charlie.id,
      responseToId: response1ToAlice.id,
    },
  });

  const nested2ToResponse1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Contractual Freedom:</strong> Users agree to terms of service. Platforms have every right to enforce those terms without government interference in their content decisions.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: dianaParticipant.id,
      authorId: diana.id,
      responseToId: response1ToAlice.id,
    },
  });

  // SUB-BRANCH 1B: Responses to Charlie's nuanced support
  const nested1ToResponse2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Definition Problem:</strong> Who gets to define "harmful misinformation"? This power could be abused by whatever party is in power to silence opponents.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      responseToId: response2ToAlice.id,
    },
  });

  // SUB-BRANCH 2A: Responses to slippery slope concern
  const nested1ToResponse3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Clear Boundaries:</strong> We already draw lines in other areas - you can't shout fire in a theater. Similar clear, narrow boundaries can be established for online speech.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      responseToId: response1ToBob.id,
    },
  });

  // SUB-BRANCH 2B: Responses to EU regulation example
  const nested1ToResponse4 = await prisma.argument.create({
    data: {
      content: `<p><strong>US Context Difference:</strong> The EU approach works in their legal context but may violate First Amendment protections in the US. We need solutions that respect our constitutional framework.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      responseToId: response2ToBob.id,
    },
  });

  // SUB-BRANCH 3A: Responses to competition solution
  const nested1ToResponse5 = await prisma.argument.create({
    data: {
      content: `<p><strong>Network Effects Reality:</strong> Antitrust alone won't work due to powerful network effects. Even if broken up, dominant platforms would likely re-emerge naturally.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      responseToId: response1ToCharlie.id,
    },
  });

  // SUB-BRANCH 3B: Responses to infrastructure argument
  const nested1ToResponse6 = await prisma.argument.create({
    data: {
      content: `<p><strong>Innovation Risk:</strong> Treating platforms as utilities would stifle the innovation that made them successful in the first place. Heavy-handed regulation kills dynamism.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      responseToId: response2ToCharlie.id,
    },
  });

  // === DEEPER NESTING: Level 4 responses ===

  // Response to the infrastructure status argument
  const deepNested1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Historical Precedent:</strong> We've regulated other transformative technologies like radio and television without killing innovation. The same balanced approach can work for social media.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      responseToId: nested1ToResponse1.id,
    },
  });

  // Response to the contractual freedom argument
  const deepNested2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Power Imbalance:</strong> Terms of service agreements are take-it-or-leave-it contracts where users have no real negotiating power. This isn't genuine contractual freedom.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: charlieParticipant.id,
      authorId: charlie.id,
      responseToId: nested2ToResponse1.id,
    },
  });

  // === CROSS-BRANCH RESPONSES: Connecting different branches ===

  // Connecting the slippery slope and definition problem threads
  const crossBranch1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Connecting Both Concerns:</strong> Both Alice's slippery slope and definition problem points highlight the same core issue: whoever controls the definitions wields enormous power over public discourse.</p>`,
      turnNumber: 3,
      debateId: threadTestDebate.id,
      participantId: dianaParticipant.id,
      authorId: diana.id,
      responseToId: nested1ToResponse3.id, // Response to clear boundaries
    },
  });

  // Add some votes to make it realistic
  const votes = [
    // Votes for root arguments
    { argumentId: aliceRoot.id, userId: bob.id, support: false },
    { argumentId: aliceRoot.id, userId: charlie.id, support: true },
    { argumentId: bobRoot.id, userId: alice.id, support: false },
    { argumentId: bobRoot.id, userId: diana.id, support: true },
    { argumentId: charlieRoot.id, userId: alice.id, support: true },
    { argumentId: charlieRoot.id, userId: bob.id, support: false },
    { argumentId: dianaRoot.id, userId: alice.id, support: true },
    { argumentId: dianaRoot.id, userId: charlie.id, support: false },

    // Votes for branch arguments
    { argumentId: response1ToAlice.id, userId: diana.id, support: true },
    { argumentId: response2ToAlice.id, userId: bob.id, support: false },
    { argumentId: response1ToBob.id, userId: charlie.id, support: true },
    { argumentId: response2ToBob.id, userId: alice.id, support: false },

    // Votes for nested arguments
    { argumentId: nested1ToResponse1.id, userId: bob.id, support: true },
    { argumentId: nested2ToResponse1.id, userId: alice.id, support: true },
    { argumentId: nested1ToResponse3.id, userId: diana.id, support: true },
  ];

  for (const vote of votes) {
    await prisma.argumentVote.create({
      data: {
        argumentId: vote.argumentId,
        userId: vote.userId,
        support: vote.support,
      },
    });
  }

  // Add some concessions
  await prisma.concession.create({
    data: {
      argumentId: response2ToBob.id,
      userId: alice.id,
      reason:
        "The EU's approach does show that some regulation is possible without complete censorship.",
    },
  });

  await prisma.concession.create({
    data: {
      argumentId: nested1ToResponse5.id,
      userId: charlie.id,
      reason:
        "Network effects are indeed a real challenge that antitrust alone may not solve.",
    },
  });

  console.log("🎯 Created complex thread structure with:");
  console.log("   - 4 root arguments");
  console.log("   - 6 second-level responses (creating multiple branches)");
  console.log("   - 7 third-level nested responses");
  console.log("   - 2 fourth-level deep nested responses");
  console.log("   - 1 cross-branch connection");
  console.log("   - Multiple bifurcations and conversation paths");

  // Create a simple UBI debate for comparison
  console.log("💰 Creating simple UBI debate for comparison...");

  const simpleDebate = await prisma.debate.create({
    data: {
      title: "Simple Test: Should we implement Universal Basic Income?",
      description:
        "A straightforward debate with linear responses for comparison.",
      status: "IN_PROGRESS",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      creatorId: alice.id,
    },
  });

  await prisma.debateTopic.createMany({
    data: [
      { debateId: simpleDebate.id, topic: DebateTopicEnum.ECONOMICS },
      { debateId: simpleDebate.id, topic: DebateTopicEnum.SOCIETY_CULTURE },
    ],
  });

  const simpleAlice = await prisma.debateParticipant.create({
    data: {
      debateId: simpleDebate.id,
      userId: alice.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });

  const simpleBob = await prisma.debateParticipant.create({
    data: {
      debateId: simpleDebate.id,
      userId: bob.id,
      role: "OPPOSER",
      status: "ACTIVE",
    },
  });

  // Simple linear thread
  const simpleArg1 = await prisma.argument.create({
    data: {
      content: `<p>UBI would reduce poverty and simplify welfare bureaucracy.</p>`,
      turnNumber: 1,
      debateId: simpleDebate.id,
      participantId: simpleAlice.id,
      authorId: alice.id,
    },
  });

  const simpleArg2 = await prisma.argument.create({
    data: {
      content: `<p>UBI is too expensive and would cause inflation.</p>`,
      turnNumber: 1,
      debateId: simpleDebate.id,
      participantId: simpleBob.id,
      authorId: bob.id,
    },
  });

  const simpleArg3 = await prisma.argument.create({
    data: {
      content: `<p>The cost could be covered by eliminating other welfare programs and new taxes.</p>`,
      turnNumber: 2,
      debateId: simpleDebate.id,
      participantId: simpleAlice.id,
      authorId: alice.id,
      responseToId: simpleArg2.id,
    },
  });

  const simpleArg4 = await prisma.argument.create({
    data: {
      content: `<p>Eliminating welfare programs would hurt the most vulnerable who need targeted help.</p>`,
      turnNumber: 2,
      debateId: simpleDebate.id,
      participantId: simpleBob.id,
      authorId: bob.id,
      responseToId: simpleArg3.id,
    },
  });

  console.log("📈 Created simple linear debate for comparison");

  console.log("🎉 Seed completed successfully!");
  console.log("\n🧪 TESTING INSTRUCTIONS:");
  console.log("1. Navigate to the thread test debate");
  console.log("2. Click 'Thread' on different arguments to see:");
  console.log("   - Multiple branches with different colors");
  console.log("   - Deep nesting (up to 4 levels)");
  console.log("   - Cross-branch connections");
  console.log("   - Both previous and posterior arguments");
  console.log("3. Compare with simple debate for linear threads");
  console.log("\n💡 Try clicking on:");
  console.log("   - " + aliceRoot.id + " (Alice's root - complex branch)");
  console.log(
    "   - " + response1ToAlice.id + " (Bob's response - multiple sub-branches)",
  );
  console.log(
    "   - " + nested1ToResponse1.id + " (Charlie's nested - deep thread)",
  );
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
