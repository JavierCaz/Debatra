import { PrismaClient } from "@prisma";
import { hash } from "bcryptjs";
import { DebateTopicEnum, ParticipantRole } from "@/app/generated/prisma";

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
  await prisma.debateTopic.deleteMany();
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
      status: "IN_PROGRESS",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      turnTimeLimit: 72,
      minReferences: 1,
      currentTurnSide: ParticipantRole.PROPOSER,
      currentTurnNumber: 4,
      creatorId: alice.id,
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
      // Note: topics are added separately via the DebateTopic relation
    },
  });

  // Add multiple topics to the debate
  await prisma.debateTopic.createMany({
    data: [
      { debateId: ubiDebate.id, topic: DebateTopicEnum.ECONOMICS },
      { debateId: ubiDebate.id, topic: DebateTopicEnum.POLITICS },
      { debateId: ubiDebate.id, topic: DebateTopicEnum.SOCIETY_CULTURE },
    ],
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
      responseToId: aliceTurn1Arg1.id, // SAME-TURN counter to Alice's bureaucracy argument
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
      responseToId: bobTurn1Arg1.id, // Direct counter to Bob's fiscal argument
    },
  });

  const aliceTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Counter to Inflation Concerns:</strong> Historical evidence from Alaska's Permanent Fund (which provides universal oil revenue dividends) shows no significant inflationary effects. When money is distributed broadly rather than concentrated, it stimulates real economic activity rather than just raising prices.</p>`,
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      responseToId: bobTurn1Arg2.id, // Direct counter to Bob's inflation argument
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
      responseToId: bobTurn1Arg3.id, // Direct counter to Bob's work disincentive argument
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
      responseToId: aliceTurn1Arg1.id, // Direct counter to Alice's bureaucracy argument
    },
  });

  const bobTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Counter to Pilot Program Evidence:</strong> The Finland experiment involved only 2,000 people for two years - too small and short-term to draw meaningful conclusions. When Ontario cancelled its larger UBI pilot, they found participants weren't transitioning to self-sufficiency as predicted.</p>`,
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      responseToId: aliceTurn1Arg2.id, // Direct counter to Alice's pilot evidence
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
      responseToId: aliceTurn2Arg1.id, // SAME-TURN counter to Alice's Turn 2 funding argument
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
      responseToId: bobTurn2Arg1.id, // Countering Bob's bureaucracy counterargument
    },
  });

  const aliceTurn3Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Final Counter on Evidence:</strong> While individual pilots have limitations, the <em>consistency</em> of positive outcomes across dozens of experiments worldwide creates a compelling pattern. From Namibia to India to Alaska, the results consistently show benefits that outweigh costs.</p>`,
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      responseToId: bobTurn2Arg2.id, // Countering Bob's pilot evidence counter
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
      responseToId: bobTurn2Arg3.id, // SAME-TURN counter to Bob's environmental trade-off argument
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
      responseToId: aliceTurn2Arg1.id, // Countering Alice's funding counterargument
    },
  });

  const bobTurn3Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Final Economic Principle:</strong> Basic economics teaches that when you subsidize something, you get more of it. By subsidizing non-work, we'd get more non-work. This fundamental principle has held true across centuries and cannot be wished away with optimistic pilot studies.</p>`,
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      responseToId: aliceTurn2Arg3.id, // Countering Alice's work disincentive counter
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
      responseToId: aliceTurn3Arg3.id, // SAME-TURN counter to Alice's environmental synergy argument
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

  // Create additional debates with multiple topics
  const aiDebate = await prisma.debate.create({
    data: {
      title: "Should AI development be regulated internationally?",
      description:
        "Debate on the need for global governance frameworks for artificial intelligence development and deployment.",
      status: "OPEN",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      minReferences: 1,
      currentTurnSide: ParticipantRole.OPPOSER, // NEW: Current turn side
      currentTurnNumber: 1, // NEW: Current turn number
      creatorId: charlie.id,
    },
  });

  await prisma.debateTopic.createMany({
    data: [
      { debateId: aiDebate.id, topic: DebateTopicEnum.TECHNOLOGY },
      { debateId: aiDebate.id, topic: DebateTopicEnum.INTERNATIONAL_RELATIONS },
      { debateId: aiDebate.id, topic: DebateTopicEnum.LAW_JUSTICE },
    ],
  });

  const climateDebate = await prisma.debate.create({
    data: {
      title: "Is nuclear energy essential for addressing climate change?",
      description:
        "Examining the role of nuclear power in the transition to clean energy and climate change mitigation.",
      status: "OPEN",
      format: "ONE_VS_MANY",
      maxParticipants: 4,
      turnsPerSide: 2,
      minReferences: 1,
      currentTurnSide: ParticipantRole.OPPOSER,
      currentTurnNumber: 1,
      creatorId: diana.id,
    },
  });

  await prisma.debateTopic.createMany({
    data: [
      {
        debateId: climateDebate.id,
        topic: DebateTopicEnum.ENVIRONMENT_CLIMATE,
      },
      { debateId: climateDebate.id, topic: DebateTopicEnum.SCIENCE },
      { debateId: climateDebate.id, topic: DebateTopicEnum.TECHNOLOGY },
    ],
  });

  console.log(
    "👥 Creating enriched Many vs Many debate with RESPONSES system...",
  );

  // Create a Many vs Many debate about Remote Work
  const remoteWorkDebate = await prisma.debate.create({
    data: {
      title: "Is remote work ultimately beneficial or harmful for society?",
      description:
        "A multi-sided debate examining the comprehensive impacts of remote work on productivity, mental health, urban development, social cohesion, and economic structures. This format allows for multiple perspectives beyond simple for/against positions.",
      status: "IN_PROGRESS",
      format: "MULTI_SIDED",
      maxParticipants: 6,
      turnsPerSide: 2,
      turnTimeLimit: 48,
      minReferences: 1,
      currentTurnSide: ParticipantRole.NEUTRAL,
      currentTurnNumber: 2,
      creatorId: charlie.id,
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Started 3 days ago
    },
  });

  // Add multiple topics to the remote work debate
  await prisma.debateTopic.createMany({
    data: [
      { debateId: remoteWorkDebate.id, topic: DebateTopicEnum.ECONOMICS },
      { debateId: remoteWorkDebate.id, topic: DebateTopicEnum.SOCIETY_CULTURE },
      { debateId: remoteWorkDebate.id, topic: DebateTopicEnum.TECHNOLOGY },
      {
        debateId: remoteWorkDebate.id,
        topic: DebateTopicEnum.PSYCHOLOGY_BEHAVIOR,
      },
    ],
  });

  // Add multiple participants with different roles for the Many vs Many debate
  const remoteWorkParticipants = await Promise.all([
    // PROPOSER - Strongly in favor
    prisma.debateParticipant.create({
      data: {
        debateId: remoteWorkDebate.id,
        userId: alice.id,
        role: "PROPOSER",
        status: "ACTIVE",
      },
    }),
    // OPPOSER - Strongly against
    prisma.debateParticipant.create({
      data: {
        debateId: remoteWorkDebate.id,
        userId: bob.id,
        role: "OPPOSER",
        status: "ACTIVE",
      },
    }),
    // NEUTRAL - Balanced/mixed perspective 1
    prisma.debateParticipant.create({
      data: {
        debateId: remoteWorkDebate.id,
        userId: charlie.id,
        role: "NEUTRAL",
        status: "ACTIVE",
      },
    }),
    // NEUTRAL - Balanced/mixed perspective 2 (Diana)
    prisma.debateParticipant.create({
      data: {
        debateId: remoteWorkDebate.id,
        userId: diana.id,
        role: "NEUTRAL",
        status: "ACTIVE",
      },
    }),
  ]);

  // Create two additional users for the Many vs Many debate
  const erin = await prisma.user.create({
    data: {
      name: "Erin Chen",
      email: "erin@example.com",
      password: hashedPassword,
      bio: "Urban planner and community development specialist focused on sustainable cities.",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    },
  });

  const frank = await prisma.user.create({
    data: {
      name: "Frank Williams",
      email: "frank@example.com",
      password: hashedPassword,
      bio: "Tech company CEO with experience managing both remote and in-office teams.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  });

  // Add the new users as participants
  const additionalParticipants = await Promise.all([
    prisma.debateParticipant.create({
      data: {
        debateId: remoteWorkDebate.id,
        userId: erin.id,
        role: "NEUTRAL",
        status: "ACTIVE",
      },
    }),
    prisma.debateParticipant.create({
      data: {
        debateId: remoteWorkDebate.id,
        userId: frank.id,
        role: "PROPOSER", // Another supporter
        status: "ACTIVE",
      },
    }),
  ]);

  const allRemoteParticipants = [
    ...remoteWorkParticipants,
    ...additionalParticipants,
  ];

  // === TURN 1: MULTIPLE OPENING ARGUMENTS FROM EACH PARTICIPANT ===

  // Alice (PROPOSER) - 3 Turn 1 arguments
  const aliceRemoteTurn1Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Productivity and Efficiency Benefits:</strong> Multiple studies show remote workers are 13-35% more productive than their office counterparts. The elimination of commute time, reduced office distractions, and flexible scheduling allow for deeper focus and better work-life integration.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[0].id,
      authorId: alice.id,
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title: "Remote Work Productivity Study 2023",
            author: "Stanford University Research",
            publication: "Journal of Labor Economics",
            url: "https://example.com/remote-productivity",
            publishedAt: new Date("2023-05-20"),
            notes: "Shows 13-35% productivity increase in remote workers",
          },
        ],
      },
    },
  });

  const aliceRemoteTurn1Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Environmental and Sustainability Impact:</strong> Remote work significantly reduces carbon emissions by eliminating daily commutes. Studies estimate that if all knowledge workers worked remotely half the time, it would reduce transportation emissions by 20-30% while also reducing office energy consumption.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[0].id,
      authorId: alice.id,
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title: "Environmental Impact of Remote Work",
            author: "Environmental Research Institute",
            publication: "Sustainability Journal",
            url: "https://example.com/remote-environment",
            publishedAt: new Date("2022-11-10"),
            notes: "Estimates 20-30% reduction in transportation emissions",
          },
        ],
      },
    },
  });

  const aliceRemoteTurn1Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Global Talent Access and Economic Redistribution:</strong> Remote work enables companies to access the best talent globally while allowing workers in lower-cost areas to earn competitive salaries. This creates economic redistribution opportunities and reduces geographic inequality.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[0].id,
      authorId: alice.id,
    },
  });

  // Bob (OPPOSER) - 3 Turn 1 arguments
  const bobRemoteTurn1Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Innovation and Collaboration Costs:</strong> Remote work severely damages spontaneous collaboration and innovation. The 'water cooler conversations' that generate breakthrough ideas are lost, and digital communication cannot replicate the creative energy of in-person brainstorming sessions.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[1].id,
      authorId: bob.id,
    },
  });

  const bobRemoteTurn1Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Mental Health and Isolation Risks:</strong> Prolonged remote work leads to increased loneliness, depression, and burnout. The lack of social interaction and blurred work-life boundaries create psychological strain that outweighs any flexibility benefits for many workers.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[1].id,
      authorId: bob.id,
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title: "Mental Health Impacts of Remote Work",
            author: "American Psychological Association",
            publication: "Journal of Occupational Health",
            url: "https://example.com/remote-mental-health",
            publishedAt: new Date("2023-02-15"),
            notes:
              "Documents increased loneliness and burnout in remote workers",
          },
        ],
      },
    },
  });

  const bobRemoteTurn1Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Career Development and Mentorship Challenges:</strong> Junior employees suffer most from remote work, missing crucial informal learning opportunities, mentorship, and visibility that accelerate career growth in office environments.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[1].id,
      authorId: bob.id,
    },
  });

  // Charlie (NEUTRAL) - 3 Turn 1 arguments
  const charlieRemoteTurn1Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Hybrid as the Optimal Solution:</strong> The evidence suggests a balanced hybrid approach maximizes benefits while minimizing drawbacks. 2-3 days in office maintains collaboration and mentorship, while remote days provide focus time and flexibility.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[2].id,
      authorId: charlie.id,
    },
  });

  const charlieRemoteTurn1Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Work-Type Dependent Outcomes:</strong> The effectiveness of remote work varies dramatically by industry and role. Creative and collaborative roles suffer more than individual contributor roles, suggesting we need role-specific policies rather than universal mandates.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[2].id,
      authorId: charlie.id,
    },
  });

  const charlieRemoteTurn1Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Management Skill Evolution Required:</strong> Many remote work failures stem from managers applying office-based techniques to remote contexts. Successful remote organizations invest in training managers for distributed leadership and digital collaboration.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[2].id,
      authorId: charlie.id,
    },
  });

  // Diana (NEUTRAL) - 3 Turn 1 arguments focusing on social impacts
  const dianaRemoteTurn1Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Urban-Rural Rebalancing Opportunity:</strong> Remote work enables geographic redistribution away from overcrowded, expensive cities toward smaller communities. This could help address housing affordability crises in major metros while revitalizing rural and suburban areas.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[3].id,
      authorId: diana.id,
      references: {
        create: [
          {
            type: "GOVERNMENT_DOCUMENT",
            title: "Geographic Mobility and Remote Work Trends",
            author: "U.S. Census Bureau",
            url: "https://example.com/remote-migration",
            publishedAt: new Date("2023-08-15"),
            notes: "Documents migration patterns from urban to rural areas",
          },
        ],
      },
    },
  });

  const dianaRemoteTurn1Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Family and Caregiver Benefits:</strong> Remote work provides crucial flexibility for parents, caregivers, and people with disabilities. It enables better work-life integration and reduces the 'second shift' burden that disproportionately affects women.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[3].id,
      authorId: diana.id,
    },
  });

  const dianaRemoteTurn1Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Social Capital Erosion Concerns:</strong> While remote work offers individual benefits, it may erode community social capital. Local businesses, community organizations, and civic engagement could suffer if people become more physically isolated.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[3].id,
      authorId: diana.id,
    },
  });

  // Erin (NEUTRAL) - 3 Turn 1 arguments from urban planning perspective
  const erinRemoteTurn1Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Infrastructure and Transportation Benefits:</strong> Widespread remote work reduces traffic congestion, public transportation strain, and carbon emissions. Cities could repurpose office space and parking lots for housing and green spaces.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[4].id,
      authorId: erin.id,
    },
  });

  const erinRemoteTurn1Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Commercial Real Estate Transformation:</strong> The shift to remote work creates opportunity to convert underutilized office spaces into much-needed housing, addressing affordability crises while creating more mixed-use, walkable neighborhoods.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[4].id,
      authorId: erin.id,
    },
  });

  const erinRemoteTurn1Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Municipal Budget Challenges:</strong> Cities face significant revenue losses from reduced downtown activity, commercial property devaluation, and transportation fees. This requires fundamental rethinking of municipal finance and service delivery models.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[4].id,
      authorId: erin.id,
    },
  });

  // Frank (PROPOSER) - 3 Turn 1 arguments from management perspective
  const frankRemoteTurn1Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Talent Access and Retention Advantages:</strong> Remote work enables access to global talent pools and dramatically improves employee retention. Our company reduced turnover by 45% after implementing remote-first policies, saving millions in recruitment costs.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[5].id,
      authorId: frank.id,
    },
  });

  const frankRemoteTurn1Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Cost Structure Optimization:</strong> Companies can significantly reduce real estate costs, office maintenance, and overhead expenses. These savings can be reinvested in employee benefits, technology infrastructure, and competitive compensation.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[5].id,
      authorId: frank.id,
    },
  });

  const frankRemoteTurn1Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Digital Transformation Acceleration:</strong> Remote work forces organizations to modernize their technology stack, collaboration tools, and digital processes. This creates long-term competitive advantages beyond the immediate remote work context.</p>`,
      turnNumber: 1,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[5].id,
      authorId: frank.id,
    },
  });

  // === TURN 2: MIXED RESPONSES - BOTH CRITICAL AND SUPPORTIVE ===

  // Alice (PROPOSER) - Mixed responses: 2 critical, 1 supportive
  const aliceRemoteTurn2Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Response to Innovation Concerns:</strong> Modern collaboration tools actually enhance innovation by allowing asynchronous brainstorming and documentation. The myth of 'water cooler innovation' isn't supported by data - most breakthrough ideas come from deep focused work.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[0].id,
      authorId: alice.id,
      responseToId: bobRemoteTurn1Arg1.id, // Critical response to Bob's innovation argument
    },
  });

  const aliceRemoteTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Response to Mental Health Risks:</strong> The mental health impacts depend entirely on implementation. Well-structured remote work with regular virtual social events, mental health support, and clear boundaries actually improves well-being compared to stressful commutes and office politics.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[0].id,
      authorId: alice.id,
      responseToId: bobRemoteTurn1Arg2.id, // Critical response to Bob's mental health argument
    },
  });

  const aliceRemoteTurn2Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Supportive Response to Infrastructure Benefits:</strong> I want to build on Erin's excellent point about infrastructure. Beyond just reducing congestion, remote work enables more efficient energy use through distributed home offices rather than energy-intensive centralized office buildings.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[0].id,
      authorId: alice.id,
      responseToId: erinRemoteTurn1Arg1.id, // SUPPORTIVE response to Erin's infrastructure argument
    },
  });

  // Bob (OPPOSER) - Mixed responses: 2 critical, 1 supportive
  const bobRemoteTurn2Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Response to Productivity Claims:</strong> The productivity studies often measure output quantity but ignore quality and innovation. While remote workers may complete more routine tasks, they generate fewer innovative solutions that drive long-term business success.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[1].id,
      authorId: bob.id,
      responseToId: aliceRemoteTurn1Arg1.id, // Critical response to Alice's productivity argument
    },
  });

  const bobRemoteTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Response to Environmental Benefits:</strong> The environmental gains from reduced commuting are partially offset by increased home energy use and the carbon footprint of everyone maintaining separate home offices rather than sharing centralized spaces.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[1].id,
      authorId: bob.id,
      responseToId: aliceRemoteTurn1Arg2.id, // Critical response to Alice's environmental argument
    },
  });

  const bobRemoteTurn2Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Supportive Response to Social Capital Concerns:</strong> Diana raises a crucial point about social capital erosion. The decline in local business patronage and community engagement represents real social costs that remote work advocates often overlook.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[1].id,
      authorId: bob.id,
      responseToId: dianaRemoteTurn1Arg3.id, // SUPPORTIVE response to Diana's social capital argument
    },
  });

  // Charlie (NEUTRAL) - Mixed responses: 1 critical, 2 supportive
  const charlieRemoteTurn2Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Response to Universal Productivity Claims:</strong> While Alice cites productivity studies, these often fail to account for the coordination costs and communication overhead that emerge in fully remote teams over time. The initial productivity boost may not be sustainable.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[2].id,
      authorId: charlie.id,
      responseToId: aliceRemoteTurn1Arg1.id, // Critical response to Alice's productivity argument
    },
  });

  const charlieRemoteTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Supportive Response to Management Evolution:</strong> Frank makes an excellent point about management evolution. The transition to remote work forces necessary organizational development that benefits companies regardless of their eventual work arrangement decisions.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[2].id,
      authorId: charlie.id,
      responseToId: frankRemoteTurn1Arg3.id, // SUPPORTIVE response to Frank's digital transformation
    },
  });

  const charlieRemoteTurn2Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Supportive Response to Geographic Redistribution:</strong> Diana's point about urban-rural rebalancing is crucial. This could help address decades of regional inequality and create more resilient, distributed economic networks.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[2].id,
      authorId: charlie.id,
      responseToId: dianaRemoteTurn1Arg1.id, // SUPPORTIVE response to Diana's redistribution argument
    },
  });

  // Diana (NEUTRAL) - Mixed responses: 1 critical, 1 supportive, 1 self-reflection
  const dianaRemoteTurn2Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Response to Infrastructure Simplification:</strong> While Erin highlights infrastructure benefits, we must consider the strain on suburban and rural infrastructure as populations shift. The net infrastructure impact requires comprehensive analysis.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[3].id,
      authorId: diana.id,
      responseToId: erinRemoteTurn1Arg1.id, // Critical response to Erin's infrastructure argument
    },
  });

  const dianaRemoteTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Supportive Response to Family Benefits:</strong> Building on my earlier point about caregiver benefits, I want to emphasize that this flexibility is particularly transformative for people with disabilities and chronic illnesses who face barriers in traditional office settings.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[3].id,
      authorId: diana.id,
      responseToId: dianaRemoteTurn1Arg2.id, // SUPPORTIVE response to her own earlier argument
    },
  });

  const dianaRemoteTurn2Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Self-Reflection on Redistribution:</strong> While I highlighted redistribution benefits, Bob's supportive point about social capital erosion is valid. We need solutions that preserve community ties while enabling geographic mobility.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[3].id,
      authorId: diana.id,
      responseToId: dianaRemoteTurn1Arg1.id, // Critical reflection on her own redistribution argument
    },
  });

  // Erin (NEUTRAL) - Mixed responses: 1 critical, 2 supportive
  const erinRemoteTurn2Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Supportive Response to Environmental Benefits:</strong> Alice's environmental point is well-taken. The reduction in transportation emissions is substantial, and when combined with renewable energy for home offices, the net environmental benefit becomes even clearer.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[4].id,
      authorId: erin.id,
      responseToId: aliceRemoteTurn1Arg2.id, // SUPPORTIVE response to Alice's environmental argument
    },
  });

  const erinRemoteTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Response to Municipal Budget Oversimplification:</strong> While I raised budget challenges, Alice is right that these are transitional. However, the transition period could last decades and requires careful policy planning to avoid municipal bankruptcies.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[4].id,
      authorId: erin.id,
      responseToId: erinRemoteTurn1Arg3.id, // Critical reflection on her own budget argument
    },
  });

  const erinRemoteTurn2Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Supportive Response to Career Development Innovation:</strong> Frank's management perspective is crucial here. Remote work forces more intentional, structured career development that can actually be more equitable than office-based informal networks.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[4].id,
      authorId: erin.id,
      responseToId: frankRemoteTurn1Arg3.id, // SUPPORTIVE response to Frank's management argument
    },
  });

  // Frank (PROPOSER) - Mixed responses: 2 critical, 1 supportive
  const frankRemoteTurn2Arg1 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Response to Innovation Concerns:</strong> The claim that remote work harms innovation reflects outdated management practices. Companies that successfully transition implement structured innovation processes that surpass office-based serendipity.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[5].id,
      authorId: frank.id,
      responseToId: bobRemoteTurn1Arg1.id, // Critical response to Bob's innovation argument
    },
  });

  const frankRemoteTurn2Arg2 = await prisma.argument.create({
    data: {
      content: `<p><strong>Supportive Response to Hybrid Approach:</strong> Charlie's hybrid model suggestion is practical. In our experience, the optimal balance varies by team function, and flexible hybrid policies allow for this necessary customization.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[5].id,
      authorId: frank.id,
      responseToId: charlieRemoteTurn1Arg1.id, // SUPPORTIVE response to Charlie's hybrid argument
    },
  });

  const frankRemoteTurn2Arg3 = await prisma.argument.create({
    data: {
      content: `<p><strong>Critical Response to Timezone Coordination Concerns:</strong> Modern async collaboration tools and overlapping core hours effectively solve timezone challenges. Many global companies have operated successfully across time zones for decades.</p>`,
      turnNumber: 2,
      debateId: remoteWorkDebate.id,
      participantId: allRemoteParticipants[5].id,
      authorId: frank.id,
      responseToId: bobRemoteTurn2Arg1.id, // Critical response to Bob's coordination argument
    },
  });

  // Add comprehensive cross-participant votes
  const remoteWorkVotes = [
    // Turn 1 votes
    { argumentId: aliceRemoteTurn1Arg1.id, userId: erin.id, type: "UPVOTE" },
    { argumentId: aliceRemoteTurn1Arg1.id, userId: frank.id, type: "UPVOTE" },
    { argumentId: aliceRemoteTurn1Arg2.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: aliceRemoteTurn1Arg3.id, userId: diana.id, type: "UPVOTE" },

    { argumentId: bobRemoteTurn1Arg1.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: bobRemoteTurn1Arg2.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: bobRemoteTurn1Arg3.id, userId: erin.id, type: "UPVOTE" },

    { argumentId: charlieRemoteTurn1Arg1.id, userId: alice.id, type: "UPVOTE" },
    { argumentId: charlieRemoteTurn1Arg1.id, userId: bob.id, type: "UPVOTE" },
    { argumentId: charlieRemoteTurn1Arg2.id, userId: frank.id, type: "UPVOTE" },
    { argumentId: charlieRemoteTurn1Arg3.id, userId: diana.id, type: "UPVOTE" },

    { argumentId: dianaRemoteTurn1Arg1.id, userId: erin.id, type: "UPVOTE" },
    { argumentId: dianaRemoteTurn1Arg2.id, userId: alice.id, type: "UPVOTE" },
    { argumentId: dianaRemoteTurn1Arg3.id, userId: bob.id, type: "UPVOTE" },

    { argumentId: erinRemoteTurn1Arg1.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: erinRemoteTurn1Arg2.id, userId: frank.id, type: "UPVOTE" },
    { argumentId: erinRemoteTurn1Arg3.id, userId: charlie.id, type: "UPVOTE" },

    { argumentId: frankRemoteTurn1Arg1.id, userId: alice.id, type: "UPVOTE" },
    { argumentId: frankRemoteTurn1Arg2.id, userId: erin.id, type: "UPVOTE" },
    { argumentId: frankRemoteTurn1Arg3.id, userId: bob.id, type: "UPVOTE" },

    // Turn 2 votes showing complex alignment patterns
    { argumentId: aliceRemoteTurn2Arg1.id, userId: frank.id, type: "UPVOTE" },
    { argumentId: aliceRemoteTurn2Arg2.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: aliceRemoteTurn2Arg3.id, userId: erin.id, type: "UPVOTE" },

    { argumentId: bobRemoteTurn2Arg1.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: bobRemoteTurn2Arg2.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: bobRemoteTurn2Arg3.id, userId: erin.id, type: "UPVOTE" },

    { argumentId: charlieRemoteTurn2Arg1.id, userId: bob.id, type: "UPVOTE" },
    { argumentId: charlieRemoteTurn2Arg2.id, userId: alice.id, type: "UPVOTE" },
    { argumentId: charlieRemoteTurn2Arg3.id, userId: frank.id, type: "UPVOTE" },

    { argumentId: dianaRemoteTurn2Arg1.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: dianaRemoteTurn2Arg2.id, userId: bob.id, type: "UPVOTE" },
    { argumentId: dianaRemoteTurn2Arg3.id, userId: alice.id, type: "UPVOTE" },

    { argumentId: erinRemoteTurn2Arg1.id, userId: alice.id, type: "UPVOTE" },
    { argumentId: erinRemoteTurn2Arg2.id, userId: bob.id, type: "UPVOTE" },
    { argumentId: erinRemoteTurn2Arg3.id, userId: frank.id, type: "UPVOTE" },

    { argumentId: frankRemoteTurn2Arg1.id, userId: erin.id, type: "UPVOTE" },
    { argumentId: frankRemoteTurn2Arg2.id, userId: alice.id, type: "UPVOTE" },
    { argumentId: frankRemoteTurn2Arg3.id, userId: charlie.id, type: "UPVOTE" },
  ];

  for (const vote of remoteWorkVotes) {
    await prisma.vote.create({
      data: {
        argumentId: vote.argumentId,
        userId: vote.userId,
        type: vote.type as any,
      },
    });
  }

  // Add nuanced concessions showing complex positions
  await prisma.concession.create({
    data: {
      argumentId: bobRemoteTurn2Arg1.id,
      userId: alice.id,
      reason:
        "I concede that measuring innovation quality in remote settings requires more sophisticated metrics beyond simple productivity output.",
    },
  });

  await prisma.concession.create({
    data: {
      argumentId: dianaRemoteTurn2Arg1.id,
      userId: erin.id,
      reason:
        "Valid point about potential strain on suburban infrastructure - the geographic redistribution does require comprehensive infrastructure planning.",
    },
  });

  await prisma.concession.create({
    data: {
      argumentId: charlieRemoteTurn2Arg1.id,
      userId: frank.id,
      reason:
        "The team-specific hybrid approach is a reasonable compromise that acknowledges different work types have different optimal arrangements.",
    },
  });

  await prisma.concession.create({
    data: {
      argumentId: aliceRemoteTurn2Arg3.id,
      userId: erin.id,
      reason:
        "You're right that combining remote work with renewable energy for home offices could amplify the environmental benefits.",
    },
  });

  await prisma.concession.create({
    data: {
      argumentId: frankRemoteTurn2Arg2.id,
      userId: charlie.id,
      reason:
        "Your management perspective on flexible hybrid policies accounting for different team functions is a practical approach we should consider.",
    },
  });

  console.log("✅ Created ENRICHED Many vs Many debate with RESPONSES system");
  console.log("📊 RESPONSES SYSTEM Features:");
  console.log(
    "   - Mixed response types: Critical, Supportive, and Self-Reflective",
  );
  console.log(
    "   - Cross-role supportive responses (e.g., Alice supporting Erin's point)",
  );
  console.log(
    "   - Self-reflective responses critiquing own earlier arguments",
  );
  console.log("   - Complex response networks beyond simple pro/con rebuttals");
  console.log("   - 18 supportive/critical responses creating rich dialogue");
  console.log(
    "   - Demonstrates how responses can build on or challenge any argument",
  );

  console.log("🔔 Creating notifications for Alice...");

  // 1. Debate invitation notification
  await prisma.notification.create({
    data: {
      type: "DEBATE_INVITATION",
      status: "UNREAD",
      title: "New Debate Invitation",
      message:
        "You've been invited to participate in 'Is nuclear energy essential for addressing climate change?'",
      link: `/debates/${climateDebate.id}`,
      userId: alice.id,
      actorId: diana.id,
      debateId: climateDebate.id,
      metadata: {
        debateTitle: climateDebate.title,
        inviterName: diana.name,
        format: climateDebate.format,
      },
    },
  });

  // 2. Notification when Bob accepts debate invitation (for UBI debate)
  await prisma.notification.create({
    data: {
      type: "DEBATE_ACCEPTED",
      status: "READ",
      title: "Participant Joined Your Debate",
      message:
        "Bob Smith has accepted your invitation and joined 'Should governments implement Universal Basic Income (UBI)?'",
      link: `/debates/${ubiDebate.id}`,
      userId: alice.id,
      actorId: bob.id,
      debateId: ubiDebate.id,
      metadata: {
        debateTitle: ubiDebate.title,
        participantRole: "OPPOSER",
      },
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  // 3. Notifications when people vote on Alice's arguments
  await prisma.notification.create({
    data: {
      type: "ARGUMENT_VOTE",
      status: "UNREAD",
      title: "New Vote on Your Argument",
      message:
        "Charlie Davis upvoted your argument about economic efficiency in the UBI debate",
      link: `/debates/${ubiDebate.id}/arguments/${aliceTurn1Arg1.id}`,
      userId: alice.id,
      actorId: charlie.id,
      debateId: ubiDebate.id,
      argumentId: aliceTurn1Arg1.id,
      metadata: {
        voteType: "UPVOTE",
        argumentPreview:
          "UBI eliminates bureaucratic overhead associated with means-tested welfare programs...",
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  await prisma.notification.create({
    data: {
      type: "ARGUMENT_VOTE",
      status: "UNREAD",
      title: "New Vote on Your Argument",
      message:
        "Diana Martinez upvoted your argument about poverty reduction evidence",
      link: `/debates/${ubiDebate.id}/arguments/${aliceTurn1Arg2.id}`,
      userId: alice.id,
      actorId: diana.id,
      debateId: ubiDebate.id,
      argumentId: aliceTurn1Arg2.id,
      metadata: {
        voteType: "UPVOTE",
        argumentPreview:
          "Pilot programs in Finland and Canada demonstrated significant improvements...",
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  // 4. Notification when Bob concedes to Alice's argument
  await prisma.notification.create({
    data: {
      type: "CONCESSION",
      status: "UNREAD",
      title: "Argument Concession",
      message:
        "Bob Smith conceded to your point about the Alaska Permanent Fund and inflation management",
      link: `/debates/${ubiDebate.id}/arguments/${aliceTurn2Arg2.id}`,
      userId: alice.id,
      actorId: bob.id,
      debateId: ubiDebate.id,
      argumentId: aliceTurn2Arg2.id,
      metadata: {
        concessionReason:
          "The Alaska Permanent Fund example is a valid point about inflation management in resource-rich economies.",
        argumentPreview:
          "Historical evidence from Alaska's Permanent Fund... shows no significant inflationary effects.",
      },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  });

  // 5. Notification for new argument in her debate
  await prisma.notification.create({
    data: {
      type: "NEW_ARGUMENT",
      status: "UNREAD",
      title: "New Argument in Your Debate",
      message: "Bob Smith posted a new argument in your UBI debate",
      link: `/debates/${ubiDebate.id}/arguments/${bobTurn3Arg1.id}`,
      userId: alice.id,
      actorId: bob.id,
      debateId: ubiDebate.id,
      argumentId: bobTurn3Arg1.id,
      metadata: {
        turnNumber: 3,
        argumentPreview:
          "The political feasibility remains the ultimate obstacle...",
      },
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
  });

  // 6. Debate completion reminder notification
  await prisma.notification.create({
    data: {
      type: "DEBATE_COMPLETED",
      status: "UNREAD",
      title: "Debate Nearing Completion",
      message:
        "Your UBI debate is in its final turn. Remember to cast your final votes!",
      link: `/debates/${ubiDebate.id}`,
      userId: alice.id,
      debateId: ubiDebate.id,
      metadata: {
        currentTurn: 3,
        totalTurns: 3,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
  });

  // 7. Mention notification (simulating Bob mentioning Alice in an argument)
  await prisma.notification.create({
    data: {
      type: "MENTION",
      status: "UNREAD",
      title: "You Were Mentioned",
      message:
        "Bob Smith mentioned you in their argument about environmental trade-offs",
      link: `/debates/${ubiDebate.id}/arguments/${bobTurn2Arg3.id}`,
      userId: alice.id,
      actorId: bob.id,
      debateId: ubiDebate.id,
      argumentId: bobTurn2Arg3.id,
      metadata: {
        mentionContext: "discussing environmental funding priorities",
        argumentPreview:
          "Your proposed funding sources like carbon taxes are already allocated...",
      },
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  });

  // 8. Archived notification (older, already read)
  await prisma.notification.create({
    data: {
      type: "DEBATE_INVITATION",
      status: "ARCHIVED",
      title: "AI Regulation Debate Invitation",
      message:
        "You were invited to participate in 'Should AI development be regulated internationally?'",
      link: `/debates/${aiDebate.id}`,
      userId: alice.id,
      actorId: charlie.id,
      debateId: aiDebate.id,
      metadata: {
        debateTitle: aiDebate.title,
        inviterName: charlie.name,
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      readAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    },
  });

  console.log("✅ Created 8 diverse notifications for Alice");

  console.log(
    "💰 Created comprehensive UBI debate with multiple arguments per turn including SAME-TURN counterarguments",
  );
  console.log("🤖 Created AI regulation debate with multiple topics");
  console.log("🌍 Created climate change debate with multiple topics");
  console.log("\n📊 UBI Debate Structure Summary:");
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
  console.log("   - Multiple topics per debate using DebateTopic relation");
  console.log("   - Multiple arguments per user per turn (3 in each turn)");
  console.log("   - Cross-turn counterarguments using responseToId");
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
