import { PrismaClient } from "@prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (be careful in production!)
  await prisma.report.deleteMany();
  await prisma.concession.deleteMany();
  await prisma.argumentQuote.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.reference.deleteMany();
  await prisma.argument.deleteMany();
  await prisma.winCondition.deleteMany();
  await prisma.debateParticipant.deleteMany();
  await prisma.debate.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.passwordResetToken.deleteMany();

  console.log("✨ Cleared existing data");

  // Create Users (same as before)
  const hashedPassword = await hash("password123", 12);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: hashedPassword,
      bio: "Environmental scientist passionate about climate policy and evidence-based discourse.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      password: hashedPassword,
      bio: "Economics researcher interested in policy analysis and data-driven arguments.",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: "Charlie Davis",
      email: "charlie@example.com",
      password: hashedPassword,
      bio: "Technology ethicist focused on AI governance and digital rights.",
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

  // Create a new debate focused on Universal Basic Income
  const ubiDebate = await prisma.debate.create({
    data: {
      title: "Should governments implement Universal Basic Income (UBI)?",
      description:
        "A comprehensive debate examining the economic, social, and practical implications of implementing a universal basic income program. This debate will explore evidence from pilot programs, economic theory, and implementation challenges.",
      topic: "Economic Policy",
      status: "IN_PROGRESS",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      turnTimeLimit: 72,
      minReferences: 1,
      creatorId: alice.id,
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
    },
  });

  // Add participants to UBI debate
  const aliceParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: ubiDebate.id,
      userId: alice.id,
      role: "PROPOSER", // Alice supports UBI
      status: "ACTIVE",
    },
  });

  const bobParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: ubiDebate.id,
      userId: bob.id,
      role: "OPPOSER", // Bob opposes UBI
      status: "ACTIVE",
    },
  });

  // === TURN 1: OPENING ARGUMENTS (Multiple arguments per user) ===

  // Alice's Turn 1 - Multiple opening arguments
  const aliceTurn1Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Economic Efficiency Argument:</strong> UBI eliminates bureaucratic overhead associated with means-tested welfare programs. Studies show that administrative costs for traditional welfare can consume 10-20% of total budgets, while UBI's universal approach reduces this to 1-2%.</p>`,
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title: "The Cost of Welfare Administration",
            author: "Institute for Economic Affairs",
            publication: "Economic Affairs Journal",
            url: "https://example.com/welfare-costs",
            publishedAt: new Date("2020-03-15"),
            notes:
              "Shows 10-20% administrative costs in traditional welfare systems",
          },
        ],
      },
    },
  });

  const aliceTurn1Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Poverty Reduction Evidence:</strong> Pilot programs in Finland and Canada demonstrated significant improvements in mental health, well-being, and trust in institutions. The Finland experiment showed reduced stress and increased confidence among recipients.</p>`,
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      references: {
        create: [
          {
            type: "GOVERNMENT_DOCUMENT",
            title: "Finnish Basic Income Experiment Results",
            author: "Finnish Social Security Institute",
            url: "https://example.com/finland-ubi",
            publishedAt: new Date("2019-02-28"),
            notes: "Documents mental health improvements and reduced stress",
          },
        ],
      },
    },
  });

  const aliceTurn1Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Automation Preparedness:</strong> With AI and automation projected to displace 20-30% of current jobs by 2030, UBI provides a necessary safety net that allows workers to retrain and adapt to the changing economy without facing destitution.</p>`,
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
    },
  });

  // Bob's Turn 1 - Multiple opening arguments with SAME-TURN counterarguments
  const bobTurn1Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Fiscal Impossibility:</strong> A meaningful UBI of $1,000/month for all US adults would cost approximately $3 trillion annually, nearly equaling the entire current federal budget. This level of taxation would cripple economic growth.</p>`,
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      references: {
        create: [
          {
            type: "STATISTICS",
            title: "Federal Budget Analysis 2023",
            author: "Congressional Budget Office",
            url: "https://example.com/cbo-budget",
            publishedAt: new Date("2023-01-15"),
            notes: "Shows total federal budget of $4.1 trillion for 2023",
          },
        ],
      },
    },
  });

  const bobTurn1Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Inflationary Pressures:</strong> Injecting massive amounts of cash into the economy without corresponding production increases would lead to significant inflation, effectively eroding the purchasing power of the UBI payments themselves.</p>`,
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
    },
  });

  // Bob's SAME-TURN counterargument to Alice's bureaucracy argument
  const bobTurn1Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Immediate Counter to Bureaucracy Savings:</strong> While UBI reduces administrative costs for <em>existing</em> programs, it creates massive new bureaucracy for tax collection and distribution. The IRS would need to double in size to handle the required taxation, offsetting any administrative savings you mentioned.</p>`,
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceTurn1Arg1.id, // SAME-TURN counter to Alice's bureaucracy argument
    },
  });

  // === TURN 2: COUNTERARGUMENTS (Multiple counterarguments pointing to specific opposing arguments) ===

  // Alice's Turn 2 - Multiple counterarguments targeting Bob's Turn 1 arguments
  const aliceTurn2Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Counter to Fiscal Argument:</strong> Your $3 trillion figure ignores that UBI would <em>replace</em> most existing welfare programs ($1.2 trillion), and could be funded through progressive taxation, carbon taxes, and technology dividends that wouldn't harm most households.</p>`,
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobTurn1Arg1.id, // Direct counter to Bob's fiscal argument
    },
  });

  const aliceTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Counter to Inflation Concerns:</strong> Historical evidence from Alaska's Permanent Fund (which provides universal oil revenue dividends) shows no significant inflationary effects. When money is distributed broadly rather than concentrated, it stimulates real economic activity rather than just raising prices.</p>`,
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobTurn1Arg2.id, // Direct counter to Bob's inflation argument
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title: "Economic Impacts of Alaska Permanent Fund",
            author: "University of Alaska Economic Research",
            publication: "Journal of Economic Equality",
            url: "https://example.com/alaska-fund",
            publishedAt: new Date("2018-07-20"),
            notes:
              "Shows no correlation between dividend payments and inflation in Alaska",
          },
        ],
      },
    },
  });

  const aliceTurn2Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Counter to Work Disincentive:</strong> The Finland experiment actually showed no significant reduction in employment. Participants used the financial security to find better-matched jobs, start businesses, or pursue education - all economically productive activities that aren't captured in simple employment metrics.</p>`,
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobTurn1Arg3.id, // Direct counter to Bob's work disincentive argument
    },
  });

  // Bob's Turn 2 - Multiple counterarguments with SAME-TURN responses
  const bobTurn2Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Counter to Bureaucracy Savings:</strong> Your digital governance examples like Estonia work for small homogeneous populations. Scaling to diverse nations like the US with complex tax systems and enforcement needs creates entirely different bureaucratic challenges that your examples don't address.</p>`,
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceTurn1Arg1.id, // Direct counter to Alice's bureaucracy argument
    },
  });

  const bobTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Counter to Pilot Program Evidence:</strong> The Finland experiment involved only 2,000 people for two years - too small and short-term to draw meaningful conclusions. When Ontario cancelled its larger UBI pilot, they found participants weren't transitioning to self-sufficiency as predicted.</p>`,
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceTurn1Arg2.id, // Direct counter to Alice's pilot evidence
      references: {
        create: [
          {
            type: "NEWS_ARTICLE",
            title: "Ontario Cancels Basic Income Pilot Project",
            author: "Canadian Press",
            publication: "The Globe and Mail",
            url: "https://example.com/ontario-cancelled",
            publishedAt: new Date("2018-08-31"),
            notes: "Reports on cancellation and preliminary findings",
          },
        ],
      },
    },
  });

  // Bob's SAME-TURN counterargument to Alice's Turn 2 funding argument
  const bobTurn2Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Immediate Counter to Funding Proposal:</strong> Your proposed funding sources like carbon taxes are already allocated to climate initiatives in most serious proposals. Redirecting them to UBI would mean defunding essential environmental programs, creating a zero-sum game between social welfare and environmental protection.</p>`,
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceTurn2Arg1.id, // SAME-TURN counter to Alice's Turn 2 funding argument
    },
  });

  // === TURN 3: FINAL ARGUMENTS WITH NESTED COUNTERARGUMENTS ===

  // Alice's Turn 3 - Countering Bob's Turn 2 arguments
  const aliceTurn3Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Final Counter on Implementation:</strong> Modern digital systems make UBI distribution remarkably efficient. Countries like Estonia demonstrate that digital governance can administer universal programs at minimal cost - the technology argument actually supports UBI, not undermines it.</p>`,
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobTurn2Arg1.id, // Countering Bob's bureaucracy counterargument
    },
  });

  const aliceTurn3Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Final Counter on Evidence:</strong> While individual pilots have limitations, the <em>consistency</em> of positive outcomes across dozens of experiments worldwide creates a compelling pattern. From Namibia to India to Alaska, the results consistently show benefits that outweigh costs.</p>`,
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobTurn2Arg2.id, // Countering Bob's pilot evidence counter
    },
  });

  // Alice's SAME-TURN counter to Bob's Turn 2 environmental argument
  const aliceTurn3Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Immediate Counter to Environmental Trade-off:</strong> Carbon taxes can be designed to fund multiple priorities simultaneously through revenue allocation. Moreover, UBI itself supports environmental goals by enabling people to make sustainable choices without economic desperation forcing environmentally harmful decisions.</p>`,
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobTurn2Arg3.id, // SAME-TURN counter to Bob's environmental trade-off argument
    },
  });

  // Bob's Turn 3 - Final counterarguments with SAME-TURN responses
  const bobTurn3Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Final Reality Check:</strong> The political feasibility remains the ultimate obstacle. No major country has implemented nationwide UBI because voters consistently reject the required tax increases when presented with concrete numbers rather than abstract principles.</p>`,
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceTurn2Arg1.id, // Countering Alice's funding counterargument
    },
  });

  const bobTurn3Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Final Economic Principle:</strong> Basic economics teaches that when you subsidize something, you get more of it. By subsidizing non-work, we'd get more non-work. This fundamental principle has held true across centuries and cannot be wished away with optimistic pilot studies.</p>`,
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceTurn2Arg3.id, // Countering Alice's work disincentive counter
    },
  });

  // Bob's SAME-TURN counter to Alice's Turn 3 environmental synergy argument
  const bobTurn3Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Immediate Counter to Environmental Synergy:</strong> There's no evidence that UBI recipients make more environmentally conscious choices. In fact, increased disposable income often leads to higher consumption and carbon footprints. Your environmental synergy claim is speculative at best.</p>`,
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceTurn3Arg3.id, // SAME-TURN counter to Alice's environmental synergy argument
    },
  });

  // Add some votes from other users
  const votes = [
    // Votes for Alice's arguments
    { argumentId: aliceTurn1Arg1.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: aliceTurn1Arg2.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: aliceTurn2Arg1.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: aliceTurn2Arg2.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: aliceTurn3Arg1.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: aliceTurn3Arg3.id, userId: diana.id, type: "UPVOTE" },

    // Votes for Bob's arguments
    { argumentId: bobTurn1Arg1.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: bobTurn1Arg2.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: bobTurn1Arg3.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: bobTurn2Arg1.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: bobTurn2Arg2.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: bobTurn2Arg3.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: bobTurn3Arg1.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: bobTurn3Arg3.id, userId: charlie.id, type: "UPVOTE" },
  ];

  for (const vote of votes) {
    await prisma.vote.create({
      data: {
        argumentId: vote.argumentId,
        userId: vote.userId,
        type: vote.type as any,
      },
    });
  }

  // Add some concessions to show intellectual honesty
  await prisma.concession.create({
    data: {
      argumentId: bobTurn1Arg1.id,
      userId: alice.id,
      reason:
        "I concede that the scale of funding required is substantial and requires careful consideration of tax policy.",
    },
  });

  await prisma.concession.create({
    data: {
      argumentId: aliceTurn2Arg2.id,
      userId: bob.id,
      reason:
        "The Alaska Permanent Fund example is a valid point about inflation management in resource-rich economies.",
    },
  });

  // Add a concession for a same-turn counterargument
  await prisma.concession.create({
    data: {
      argumentId: bobTurn2Arg3.id,
      userId: alice.id,
      reason:
        "You raise a valid concern about potential trade-offs between environmental funding and UBI that requires careful policy design.",
    },
  });

  console.log(
    "💰 Created comprehensive UBI debate with multiple arguments per turn including SAME-TURN counterarguments",
  );
  console.log("\n📊 Debate Structure Summary:");
  console.log("TURN 1:");
  console.log(
    "   - Alice: 3 opening arguments (efficiency, evidence, automation)",
  );
  console.log(
    "   - Bob: 3 arguments (fiscal, inflation, SAME-TURN counter to bureaucracy)",
  );
  console.log("TURN 2:");
  console.log(
    "   - Alice: 3 counterarguments (targeting each of Bob's Turn 1 arguments)",
  );
  console.log(
    "   - Bob: 3 arguments (2 counters to Alice's Turn 1, 1 SAME-TURN counter to Alice's Turn 2 funding argument)",
  );
  console.log("TURN 3:");
  console.log(
    "   - Alice: 3 arguments (2 counters to Bob's Turn 2, 1 SAME-TURN counter to Bob's Turn 2 environmental argument)",
  );
  console.log(
    "   - Bob: 3 arguments (2 final counters, 1 SAME-TURN counter to Alice's Turn 3 environmental argument)",
  );
  console.log("\n🎯 Key Features Demonstrated:");
  console.log("   - Multiple arguments per user per turn (3 in each turn)");
  console.log("   - Cross-turn counterarguments using rebuttalToId");
  console.log("   - SAME-TURN counterarguments within the same turn number");
  console.log(
    "   - Complex argument-rebuttal relationships throughout the debate",
  );
  console.log("   - Real-time responses creating more dynamic debate flow");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
