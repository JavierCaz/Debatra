import { type Prisma, PrismaClient } from "@prisma";
import { hash } from "bcryptjs";
import {
  DebateTopicEnum,
  DefinitionStatus,
  NotificationStatus,
  NotificationType,
  ParticipantRole,
  ReferenceType,
  RequestStatus,
  RequestType,
  WinConditionType,
} from "@/app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data in dependency order
  await prisma.definitionReference.deleteMany();
  await prisma.definitionVote.deleteMany();
  await prisma.definition.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userNotificationPreference.deleteMany();
  await prisma.report.deleteMany();
  await prisma.concession.deleteMany();
  await prisma.argumentQuote.deleteMany();
  await prisma.argumentVote.deleteMany();
  await prisma.reference.deleteMany();
  await prisma.argument.deleteMany();
  await prisma.winCondition.deleteMany();
  await prisma.debateTopic.deleteMany();
  await prisma.debateParticipant.deleteMany();
  await prisma.debateRequest.deleteMany();
  await prisma.debate.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data");

  // ============================================================
  // USERS
  // ============================================================
  const hashedPassword = await hash("password123", 12);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: hashedPassword,
      bio: "Environmental scientist passionate about climate policy and sustainable development.",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      password: hashedPassword,
      bio: "Economics researcher interested in policy analysis and market regulation.",
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
      bio: "Political science professor specializing in democratic institutions and public policy.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  });

  const eve = await prisma.user.create({
    data: {
      name: "Eve Williams",
      email: "eve@example.com",
      password: hashedPassword,
      bio: "Civil rights lawyer focused on free speech law and digital privacy.",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
  });

  const frank = await prisma.user.create({
    data: {
      name: "Frank Garcia",
      email: "frank@example.com",
      password: hashedPassword,
      bio: "Data scientist and tech entrepreneur. Building the future of decentralized web.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  });

  console.log("Created 6 users");

  // Notification preferences
  await prisma.userNotificationPreference.createMany({
    data: [
      { userId: alice.id, inApp: true, email: true, push: false },
      { userId: bob.id, inApp: true, email: false, push: true },
      { userId: charlie.id, inApp: true, email: true, push: true },
      { userId: diana.id, inApp: false, email: true, push: false },
      { userId: eve.id, inApp: true, email: true, push: false },
      { userId: frank.id, inApp: true, email: false, push: false },
    ],
  });

  console.log("Created notification preferences");

  // ============================================================
  // DEBATE 1: COMPLETED (VOTE_COUNT) - Universal Basic Income
  // ============================================================
  const ubiDebate = await prisma.debate.create({
    data: {
      title: "Should we implement Universal Basic Income?",
      description:
        "A debate on whether governments should provide a universal basic income to all citizens. Topics include poverty reduction, economic efficiency, and fiscal sustainability.",
      status: "COMPLETED",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      minReferences: 1,
      creatorId: alice.id,
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.debateTopic.createMany({
    data: [
      { debateId: ubiDebate.id, topic: DebateTopicEnum.ECONOMICS },
      { debateId: ubiDebate.id, topic: DebateTopicEnum.SOCIETY_CULTURE },
    ],
  });

  const ubiAlice = await prisma.debateParticipant.create({
    data: {
      debateId: ubiDebate.id,
      userId: alice.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });
  const ubiBob = await prisma.debateParticipant.create({
    data: {
      debateId: ubiDebate.id,
      userId: bob.id,
      role: "OPPOSER",
      status: "ACTIVE",
    },
  });

  const ubiA1 = await prisma.argument.create({
    data: {
      content:
        "<p>UBI would eliminate extreme poverty and simplify the welfare state by replacing multiple targeted programs with a single universal payment. Administrative costs would plummet, and no one would fall through the cracks of complex bureaucracy.</p>",
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: ubiAlice.id,
      authorId: alice.id,
    },
  });
  const ubiB1 = await prisma.argument.create({
    data: {
      content:
        "<p>UBI is fiscally irresponsible. A $1000/month payment to every adult would cost over $3 trillion annually - more than the entire federal budget. We would need massive tax increases or unprecedented cuts to other essential programs.</p>",
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: ubiBob.id,
      authorId: bob.id,
    },
  });
  const ubiA2 = await prisma.argument.create({
    data: {
      content:
        "<p>The cost can be offset by eliminating existing welfare programs, implementing a wealth tax, and capturing economic growth from increased consumer spending. Studies from the Roosevelt Institute show that a UBI-funded economy would grow by 12% annually.</p>",
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: ubiAlice.id,
      authorId: alice.id,
      responseToId: ubiB1.id,
    },
  });
  const ubiB2 = await prisma.argument.create({
    data: {
      content:
        "<p>Eliminating welfare programs would hurt the most vulnerable who need targeted support. A one-size-fits-all approach ignores that different people have different needs. A single mother with disabled children needs more support than a healthy single adult.</p>",
      turnNumber: 2,
      debateId: ubiDebate.id,
      participantId: ubiBob.id,
      authorId: bob.id,
      responseToId: ubiA2.id,
    },
  });
  const ubiA3 = await prisma.argument.create({
    data: {
      content:
        "<p>Targeted programs create bureaucratic overhead and stigma that prevents uptake. Only 30% of eligible individuals actually receive food stamps due to complex application processes. UBI is more efficient - studies show administrative costs of welfare are 15-20% vs near-zero for UBI.</p>",
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: ubiAlice.id,
      authorId: alice.id,
      responseToId: ubiB2.id,
    },
  });
  const ubiB3 = await prisma.argument.create({
    data: {
      content:
        "<p>Pilot programs in Finland and Kenya show mixed results. While well-being and mental health improved, employment effects were minimal. We need more evidence before such a massive commitment. The stakes are too high for a large-scale experiment.</p>",
      turnNumber: 3,
      debateId: ubiDebate.id,
      participantId: ubiBob.id,
      authorId: bob.id,
      responseToId: ubiA3.id,
    },
  });

  // References for UBI
  await prisma.reference.createMany({
    data: [
      {
        argumentId: ubiA1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Universal Basic Income: A Systematic Review",
        author: "S. Standing",
        url: "https://example.edu/ubi-review",
        publication: "Journal of Economic Policy",
        publishedAt: new Date("2023"),
      },
      {
        argumentId: ubiB1.id,
        type: ReferenceType.STATISTICS,
        title: "CBO Report: Federal Budget Analysis 2024",
        author: "Congressional Budget Office",
        url: "https://example.gov/cbo-report",
      },
      {
        argumentId: ubiA2.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Macroeconomic Effects of Universal Basic Income",
        author: "Roosevelt Institute",
        url: "https://example.edu/ubi-macro",
        publication: "Economic Policy Review",
        publishedAt: new Date("2024"),
      },
      {
        argumentId: ubiA3.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Administrative Costs of Means-Tested Programs",
        author: "P. Roberts",
        publication: "Public Administration Review",
        publishedAt: new Date("2022"),
      },
      {
        argumentId: ubiB3.id,
        type: ReferenceType.VIDEO,
        title: "Finland's UBI Experiment: Two Years Later",
        url: "https://example.com/video/finland-ubi",
      },
      {
        argumentId: ubiB3.id,
        type: ReferenceType.NEWS_ARTICLE,
        title: "Kenya's Basic Income Pilot Shows Promising Results",
        author: "A. Ochieng",
        url: "https://example.com/news/kenya-ubi",
        publication: "Development Today",
        publishedAt: new Date("2024-08-15"),
      },
    ],
  });

  // Concession: Alice concedes that pilot results are mixed
  await prisma.concession.create({
    data: {
      argumentId: ubiB3.id,
      userId: alice.id,
      reason:
        "The pilot results are indeed mixed on employment, though well-being improvements are still valuable.",
    },
  });

  // Argument quote
  await prisma.argumentQuote.create({
    data: {
      quotedText:
        "A one-size-fits-all approach ignores that different people have different needs.",
      quotingArgumentId: ubiA3.id,
      quotedArgumentId: ubiB2.id,
      context:
        "Acknowledging the challenge but countering with efficiency gains",
      startPosition: 40,
      endPosition: 105,
    },
  });

  // Votes - Alice (proposer) wins
  const ubiVotes = [
    { argumentId: ubiA1.id, userId: charlie.id, support: true },
    { argumentId: ubiA1.id, userId: diana.id, support: true },
    { argumentId: ubiB1.id, userId: alice.id, support: false },
    { argumentId: ubiB1.id, userId: frank.id, support: true },
    { argumentId: ubiA2.id, userId: charlie.id, support: true },
    { argumentId: ubiA2.id, userId: diana.id, support: true },
    { argumentId: ubiB2.id, userId: alice.id, support: false },
    { argumentId: ubiA3.id, userId: bob.id, support: false },
    { argumentId: ubiA3.id, userId: charlie.id, support: true },
    { argumentId: ubiA3.id, userId: diana.id, support: true },
    { argumentId: ubiB3.id, userId: alice.id, support: false },
    { argumentId: ubiB3.id, userId: frank.id, support: true },
  ];
  for (const v of ubiVotes) {
    await prisma.argumentVote.create({ data: v });
  }

  // Win condition: Alice (PROPOSER) wins by vote count
  await prisma.winCondition.create({
    data: {
      debateId: ubiDebate.id,
      type: WinConditionType.VOTE_COUNT,
      description:
        "Proposer's arguments received more net votes across all turns.",
      winningRole: ParticipantRole.PROPOSER,
      decidedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // ============================================================
  // DEFINITIONS (on the UBI debate)
  // ============================================================
  const def1 = await prisma.definition.create({
    data: {
      term: "Universal Basic Income",
      definition:
        "A government program that provides every citizen with a regular, unconditional sum of money regardless of employment status or income level.",
      status: DefinitionStatus.ACCEPTED,
      debateId: ubiDebate.id,
      proposerId: alice.id,
      acceptedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
  });

  const def2 = await prisma.definition.create({
    data: {
      term: "Universal Basic Income",
      definition:
        "A periodic cash payment unconditionally delivered to all individuals, without means-testing or work requirements, intended to cover basic living expenses.",
      status: DefinitionStatus.PROPOSED,
      debateId: ubiDebate.id,
      proposerId: bob.id,
      supersededById: def1.id,
    },
  });

  await prisma.definition.update({
    where: { id: def1.id },
    data: { status: DefinitionStatus.DEPRECATED, supersededById: def2.id },
  });

  const def3 = await prisma.definition.create({
    data: {
      term: "Means-Testing",
      definition:
        "A process that determines eligibility for government benefits based on an individual's or household's income and assets.",
      status: DefinitionStatus.ACCEPTED,
      debateId: ubiDebate.id,
      proposerId: alice.id,
      acceptedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
  });

  const def4 = await prisma.definition.create({
    data: {
      term: "Fiscal Sustainability",
      definition:
        "The ability of a government to maintain its current spending, tax, and other policies in the long run without threatening its solvency.",
      status: DefinitionStatus.CONTESTED,
      debateId: ubiDebate.id,
      proposerId: bob.id,
    },
  });

  // Definition votes
  await prisma.definitionVote.createMany({
    data: [
      { definitionId: def1.id, userId: bob.id, support: false },
      { definitionId: def1.id, userId: charlie.id, support: true },
      { definitionId: def1.id, userId: diana.id, support: true },
      { definitionId: def2.id, userId: alice.id, support: false },
      { definitionId: def2.id, userId: charlie.id, support: true },
      { definitionId: def3.id, userId: bob.id, support: true },
      { definitionId: def3.id, userId: diana.id, support: true },
      { definitionId: def4.id, userId: alice.id, support: true },
      { definitionId: def4.id, userId: charlie.id, support: false },
    ],
  });

  // Definition endorsements
  await prisma.definitionEndorsement.createMany({
    data: [
      { definitionId: def1.id, userId: alice.id },
      { definitionId: def1.id, userId: charlie.id },
      { definitionId: def3.id, userId: diana.id },
      { definitionId: def3.id, userId: bob.id },
    ],
  });

  // Definition references to arguments
  await prisma.definitionReference.createMany({
    data: [
      { definitionId: def1.id, argumentId: ubiA1.id },
      { definitionId: def3.id, argumentId: ubiA3.id },
      { definitionId: def4.id, argumentId: ubiB1.id },
    ],
  });

  // References on definitions
  await prisma.reference.createMany({
    data: [
      {
        definitionId: def1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Basic Income: A Transformative Policy for the 21st Century",
        author: "P. Van Parijs",
        url: "https://example.edu/basic-income-def",
        publication: "Oxford Review of Economic Policy",
        publishedAt: new Date("2023"),
      },
      {
        definitionId: def3.id,
        type: ReferenceType.GOVERNMENT_DOCUMENT,
        title: "SNAP Program Access: A National Study",
        author: "USDA",
        url: "https://example.gov/snap-access",
        publishedAt: new Date("2024"),
      },
    ],
  });

  console.log(
    "Created completed UBI debate with concessions, quotes, and definitions",
  );

  // ============================================================
  // DEBATE 2: CANCELLED - Cryptocurrency Regulation
  // ============================================================
  const cryptoDebate = await prisma.debate.create({
    data: {
      title: "Should cryptocurrencies be regulated like traditional banks?",
      description:
        "A debate on whether cryptocurrencies and DeFi platforms should face the same regulations as traditional financial institutions. The debate was cancelled after the initial exchange became too polarized.",
      status: "CANCELLED",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      minReferences: 1,
      creatorId: frank.id,
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.debateTopic.createMany({
    data: [
      { debateId: cryptoDebate.id, topic: DebateTopicEnum.ECONOMICS },
      { debateId: cryptoDebate.id, topic: DebateTopicEnum.TECHNOLOGY },
      { debateId: cryptoDebate.id, topic: DebateTopicEnum.LAW_JUSTICE },
    ],
  });

  const cryptoFrank = await prisma.debateParticipant.create({
    data: {
      debateId: cryptoDebate.id,
      userId: frank.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });
  const cryptoBob = await prisma.debateParticipant.create({
    data: {
      debateId: cryptoDebate.id,
      userId: bob.id,
      role: "OPPOSER",
      status: "ACTIVE",
    },
  });

  // Frank's opening argument
  const cryptoA1 = await prisma.argument.create({
    data: {
      content:
        "<p>Cryptocurrencies must be regulated like traditional banks to protect consumers from fraud, money laundering, and market manipulation. The collapse of FTX showed what happens when crypto operates outside regulatory frameworks. Millions lost their life savings.</p>",
      turnNumber: 1,
      debateId: cryptoDebate.id,
      participantId: cryptoFrank.id,
      authorId: frank.id,
    },
  });

  // Bob's response
  const cryptoB1 = await prisma.argument.create({
    data: {
      content:
        "<p>Regulating crypto like banks would destroy its core innovation. Decentralized finance is about removing gatekeepers and giving people control over their own money. Bank-like regulations would effectively ban self-custody wallets and decentralized exchanges.</p>",
      turnNumber: 1,
      debateId: cryptoDebate.id,
      participantId: cryptoBob.id,
      authorId: bob.id,
      responseToId: cryptoA1.id,
    },
  });

  // Frank's rebuttal
  const cryptoA2 = await prisma.argument.create({
    data: {
      content:
        "<p>Innovation without oversight is reckless. Every other financial instrument is regulated precisely because money touches people's lives. The idea that crypto should be exempt from KYC/AML laws is not innovation - it's regulatory arbitrage that enables criminals.</p>",
      turnNumber: 2,
      debateId: cryptoDebate.id,
      participantId: cryptoFrank.id,
      authorId: frank.id,
      responseToId: cryptoB1.id,
    },
  });

  // Bob's heated response (last argument before cancellation)
  const cryptoB2 = await prisma.argument.create({
    data: {
      content:
        "<p>KYC/AML laws are a surveillance mechanism that the banking cartel uses to control financial flows. Crypto was created specifically to escape this. If you want bank regulation, use a bank. Don't force it on a technology you clearly don't understand.</p>",
      turnNumber: 2,
      debateId: cryptoDebate.id,
      participantId: cryptoBob.id,
      authorId: bob.id,
      responseToId: cryptoA2.id,
    },
  });

  // References
  await prisma.reference.createMany({
    data: [
      {
        argumentId: cryptoA1.id,
        type: ReferenceType.NEWS_ARTICLE,
        title: "The Collapse of FTX: A Timeline",
        author: "N. Popper",
        url: "https://example.com/news/ftx-collapse",
        publication: "Financial Times",
        publishedAt: new Date("2023-11-15"),
      },
      {
        argumentId: cryptoB1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Decentralization as a Design Principle",
        author: "V. Buterin",
        url: "https://example.edu/decentralization",
        publication: "Journal of Blockchain Research",
        publishedAt: new Date("2022"),
      },
      {
        argumentId: cryptoA2.id,
        type: ReferenceType.GOVERNMENT_DOCUMENT,
        title: "FATF Recommendations on Virtual Assets",
        author: "Financial Action Task Force",
        url: "https://example.gov/fatf-crypto",
        publishedAt: new Date("2024-06"),
      },
    ],
  });

  // Votes
  await prisma.argumentVote.createMany({
    data: [
      { argumentId: cryptoA1.id, userId: alice.id, support: true },
      { argumentId: cryptoA1.id, userId: eve.id, support: true },
      { argumentId: cryptoB1.id, userId: charlie.id, support: true },
      { argumentId: cryptoA2.id, userId: diana.id, support: true },
      { argumentId: cryptoB2.id, userId: charlie.id, support: true },
    ],
  });

  // Cancellation reason
  await prisma.debateRequest.create({
    data: {
      debateId: cryptoDebate.id,
      userId: frank.id,
      inviterId: null,
      type: RequestType.JOIN_REQUEST,
      status: RequestStatus.CANCELLED,
      role: ParticipantRole.PROPOSER,
      message:
        "This debate is going nowhere. The other side refuses to engage with basic regulatory realities.",
    },
  });

  // ============================================================
  // DEFINITIONS (on the crypto debate)
  // ============================================================
  const cryptoDef1 = await prisma.definition.create({
    data: {
      term: "Cryptocurrency",
      definition:
        "A digital or virtual currency that uses cryptography for security and operates on a decentralized network, typically blockchain technology, without a central authority.",
      status: DefinitionStatus.ACCEPTED,
      debateId: cryptoDebate.id,
      proposerId: frank.id,
      acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  const cryptoDef2 = await prisma.definition.create({
    data: {
      term: "Money Laundering",
      definition:
        "The process of concealing the origins of illegally obtained money by passing it through legitimate businesses or complex financial transactions.",
      status: DefinitionStatus.ACCEPTED,
      debateId: cryptoDebate.id,
      proposerId: bob.id,
      acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.definitionVote.createMany({
    data: [
      { definitionId: cryptoDef1.id, userId: bob.id, support: false },
      { definitionId: cryptoDef1.id, userId: alice.id, support: true },
      { definitionId: cryptoDef2.id, userId: frank.id, support: true },
      { definitionId: cryptoDef2.id, userId: eve.id, support: true },
    ],
  });

  await prisma.definitionReference.createMany({
    data: [
      { definitionId: cryptoDef1.id, argumentId: cryptoA1.id },
      { definitionId: cryptoDef2.id, argumentId: cryptoA2.id },
    ],
  });

  // References on definitions
  await prisma.reference.createMany({
    data: [
      {
        definitionId: cryptoDef1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Cryptocurrency: A Primer on Digital Money",
        author: "N. Szabo",
        url: "https://example.edu/crypto-primer",
        publication: "Journal of Digital Economics",
        publishedAt: new Date("2023"),
      },
      {
        definitionId: cryptoDef2.id,
        type: ReferenceType.GOVERNMENT_DOCUMENT,
        title: "FATF Guidance on Anti-Money Laundering",
        author: "Financial Action Task Force",
        url: "https://example.gov/fatf-aml",
        publishedAt: new Date("2024"),
      },
    ],
  });

  console.log("Created cancelled crypto debate with arguments and definitions");

  // ============================================================
  // DEBATE 3: COMPLETED (FORFEIT) - Sex Education
  // ============================================================
  const sexEdDebate = await prisma.debate.create({
    data: {
      title: "Should school curricula include comprehensive sex education?",
      description:
        "Debate on whether schools should teach comprehensive sex education covering contraception, STIs, consent, and LGBTQ+ topics, or stick to abstinence-only approaches. The opposer forfeited after two turns.",
      status: "COMPLETED",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      minReferences: 1,
      creatorId: diana.id,
      startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.debateTopic.createMany({
    data: [
      { debateId: sexEdDebate.id, topic: DebateTopicEnum.EDUCATION },
      { debateId: sexEdDebate.id, topic: DebateTopicEnum.HEALTH_MEDICINE },
      { debateId: sexEdDebate.id, topic: DebateTopicEnum.SOCIETY_CULTURE },
    ],
  });

  const sexEdDiana = await prisma.debateParticipant.create({
    data: {
      debateId: sexEdDebate.id,
      userId: diana.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });
  const sexEdFrank = await prisma.debateParticipant.create({
    data: {
      debateId: sexEdDebate.id,
      userId: frank.id,
      role: "OPPOSER",
      status: "FORFEITED",
    },
  });

  // Turn 1: Diana opens
  const sexEdA1 = await prisma.argument.create({
    data: {
      content:
        "<p>Comprehensive sex education reduces teen pregnancy by 50%, decreases STI rates, and promotes healthier relationships. Countries like the Netherlands that teach comprehensive sex ed have the lowest teen pregnancy rates in the world. Abstinence-only programs have repeatedly been shown to be ineffective.</p>",
      turnNumber: 1,
      debateId: sexEdDebate.id,
      participantId: sexEdDiana.id,
      authorId: diana.id,
    },
  });

  // Turn 1: Frank responds
  const sexEdB1 = await prisma.argument.create({
    data: {
      content:
        "<p>Sex education should be taught at home by parents, not in schools. Schools overstep their role when they teach values-based content about sexuality. Parents have the right to determine when and how their children learn about these sensitive topics.</p>",
      turnNumber: 1,
      debateId: sexEdDebate.id,
      participantId: sexEdFrank.id,
      authorId: frank.id,
      responseToId: sexEdA1.id,
    },
  });

  // Turn 2: Diana rebuts Frank's parent-based argument
  const sexEdA2 = await prisma.argument.create({
    data: {
      content:
        "<p>Not all parents provide sex education at home. Studies show that only 40% of teens report having meaningful conversations about sex with their parents. Relying solely on parents leaves millions of young people without accurate information, disproportionately affecting low-income and conservative households.</p>",
      turnNumber: 2,
      debateId: sexEdDebate.id,
      participantId: sexEdDiana.id,
      authorId: diana.id,
      responseToId: sexEdB1.id,
    },
  });

  // At this point, Frank forfeits - unable to respond

  // References
  await prisma.reference.createMany({
    data: [
      {
        argumentId: sexEdA1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Comprehensive Sex Education: A Meta-Analysis",
        author: "D. Kirby",
        url: "https://example.edu/sex-ed-meta",
        publication: "Journal of Adolescent Health",
        publishedAt: new Date("2023"),
      },
      {
        argumentId: sexEdA1.id,
        type: ReferenceType.STATISTICS,
        title: "Teen Pregnancy Rates: International Comparison",
        author: "WHO",
        url: "https://example.org/who-teen-pregnancy",
        publishedAt: new Date("2024"),
      },
      {
        argumentId: sexEdB1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Parental Rights in Education",
        author: "J. Somerville",
        publication: "Family Values Review",
        publishedAt: new Date("2022"),
      },
      {
        argumentId: sexEdA2.id,
        type: ReferenceType.STATISTICS,
        title: "National Survey of Family Growth",
        author: "CDC",
        url: "https://example.gov/cdc-family-growth",
        publishedAt: new Date("2024"),
      },
    ],
  });

  await prisma.winCondition.create({
    data: {
      debateId: sexEdDebate.id,
      type: WinConditionType.FORFEIT,
      description:
        "Opposer forfeited after two turns, unable to defend the position that sex ed belongs only at home.",
      winningRole: ParticipantRole.PROPOSER,
      decidedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // ============================================================
  // DEFINITIONS (on the sex ed debate)
  // ============================================================
  const sexEdDef1 = await prisma.definition.create({
    data: {
      term: "Comprehensive Sex Education",
      definition:
        "An age-appropriate curriculum that covers human development, relationships, consent, contraception, STI prevention, and LGBTQ+ topics alongside abstinence.",
      status: DefinitionStatus.ACCEPTED,
      debateId: sexEdDebate.id,
      proposerId: diana.id,
      acceptedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.definitionVote.createMany({
    data: [
      { definitionId: sexEdDef1.id, userId: frank.id, support: false },
      { definitionId: sexEdDef1.id, userId: alice.id, support: true },
      { definitionId: sexEdDef1.id, userId: eve.id, support: true },
    ],
  });

  await prisma.definitionReference.createMany({
    data: [{ definitionId: sexEdDef1.id, argumentId: sexEdA1.id }],
  });

  // References on definitions
  await prisma.reference.createMany({
    data: [
      {
        definitionId: sexEdDef1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Defining Comprehensive Sexuality Education: An International Framework",
        author: "UNESCO",
        url: "https://example.org/unesco-cse-def",
        publication: "International Journal of Sexual Health",
        publishedAt: new Date("2023"),
      },
    ],
  });

  console.log("Created completed sex ed debate with rebuttal and forfeit");

  // ============================================================
  // DEBATE 4: COMPLETED (VOTE_COUNT) - Spanish: Bullfighting
  // ============================================================
  const torosDebate = await prisma.debate.create({
    data: {
      title: "¿Deberían prohibirse las corridas de toros?",
      description:
        "Un debate sobre la prohibición de las corridas de toros en España. Se discuten argumentos sobre bienestar animal, tradición cultural, impacto económico y libertad cultural.",
      status: "COMPLETED",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      minReferences: 1,
      creatorId: diana.id,
      startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.debateTopic.createMany({
    data: [
      {
        debateId: torosDebate.id,
        topic: DebateTopicEnum.SOCIETY_CULTURE,
      },
      {
        debateId: torosDebate.id,
        topic: DebateTopicEnum.LAW_JUSTICE,
      },
    ],
  });

  const torosDiana = await prisma.debateParticipant.create({
    data: {
      debateId: torosDebate.id,
      userId: diana.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });
  const torosCharlie = await prisma.debateParticipant.create({
    data: {
      debateId: torosDebate.id,
      userId: charlie.id,
      role: "OPPOSER",
      status: "ACTIVE",
    },
  });

  const torosA1 = await prisma.argument.create({
    data: {
      content:
        "<p>Las corridas de toros son una forma de maltrato animal que no tiene cabida en una sociedad moderna. El toro sufre una muerte lenta y agonizante en público. Países como Cataluña ya las han prohibido y la sociedad evoluciona hacia un mayor respeto por los animales.</p>",
      turnNumber: 1,
      debateId: torosDebate.id,
      participantId: torosDiana.id,
      authorId: diana.id,
    },
  });

  const torosB1 = await prisma.argument.create({
    data: {
      content:
        "<p>Las corridas de toros son una tradición cultural centenaria que forma parte de la identidad española. Prohibirlas sería un ataque a nuestra cultura y libertad. El toro de lidia vive en condiciones naturales privilegiadas y la tauromaquia genera miles de empleos.</p>",
      turnNumber: 1,
      debateId: torosDebate.id,
      participantId: torosCharlie.id,
      authorId: charlie.id,
    },
  });

  const torosA2 = await prisma.argument.create({
    data: {
      content:
        "<p>La tradición no justifica el sufrimiento animal. Antes también eran tradición las peleas de gallos y el sacrificio de perros, y fueron prohibidas porque la sociedad avanzó. El argumento económico es débil: los toros reciben más subvenciones que los empleos que generan.</p>",
      turnNumber: 2,
      debateId: torosDebate.id,
      participantId: torosDiana.id,
      authorId: diana.id,
      responseToId: torosB1.id,
    },
  });

  const torosB2 = await prisma.argument.create({
    data: {
      content:
        "<p>Comparar las corridas con peleas de gallos es ignorar la diferencia cultural y artística. La tauromaquia ha inspirado a artistas como Picasso y Hemingway. Además, el toro de lidia es una raza única que solo existe gracias a la tradición taurina. Sin corridas, esta especie desaparecería.</p>",
      turnNumber: 2,
      debateId: torosDebate.id,
      participantId: torosCharlie.id,
      authorId: charlie.id,
      responseToId: torosA2.id,
    },
  });

  const torosA3 = await prisma.argument.create({
    data: {
      content:
        "<p>Preservar una raza para torturarla no es ético. Existen santuarios para toros bravos donde pueden vivir sin ser asesinados. El arte no necesita la muerte de un animal para existir. Una cultura que necesita causar dolor para expresarse es una cultura que debe evolucionar.</p>",
      turnNumber: 3,
      debateId: torosDebate.id,
      participantId: torosDiana.id,
      authorId: diana.id,
      responseToId: torosB2.id,
    },
  });

  const torosB3 = await prisma.argument.create({
    data: {
      content:
        "<p>Los santuarios no son sostenibles sin financiación pública masiva. La realidad es que la prohibición no beneficia a nadie: ni a los toros (que dejarían de existir), ni a los trabajadores (que perderían sus empleos), ni a la cultura (que perdería una expresión única). La solución no es prohibir, sino regular para reducir el sufrimiento.</p>",
      turnNumber: 3,
      debateId: torosDebate.id,
      participantId: torosCharlie.id,
      authorId: charlie.id,
      responseToId: torosA3.id,
    },
  });

  await prisma.reference.createMany({
    data: [
      {
        argumentId: torosA1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Ética animal y tauromaquia: un análisis filosófico",
        author: "M. Nussbaum",
        publication: "Revista de Filosofía Aplicada",
        publishedAt: new Date("2023"),
      },
      {
        argumentId: torosB1.id,
        type: ReferenceType.NEWS_ARTICLE,
        title: "El impacto económico de la tauromaquia en España",
        author: "E. García",
        url: "https://example.com/noticias/tauromaquia-economia",
        publication: "El País",
        publishedAt: new Date("2024-03-10"),
      },
      {
        argumentId: torosA2.id,
        type: ReferenceType.GOVERNMENT_DOCUMENT,
        title: "Informe sobre subvenciones a la tauromaquia",
        author: "Ministerio de Cultura",
        url: "https://example.gov/subvenciones-toros",
        publishedAt: new Date("2024"),
      },
      {
        argumentId: torosB2.id,
        type: ReferenceType.BOOK,
        title: "Death in the Afternoon",
        author: "E. Hemingway",
        publication: "Scribner",
        publishedAt: new Date("1932"),
      },
    ],
  });

  const torosVotes = [
    { argumentId: torosA1.id, userId: alice.id, support: true },
    { argumentId: torosA1.id, userId: eve.id, support: true },
    { argumentId: torosB1.id, userId: bob.id, support: true },
    { argumentId: torosB1.id, userId: frank.id, support: true },
    { argumentId: torosA2.id, userId: alice.id, support: true },
    { argumentId: torosA2.id, userId: eve.id, support: true },
    { argumentId: torosB2.id, userId: bob.id, support: true },
    { argumentId: torosA3.id, userId: frank.id, support: false },
    { argumentId: torosA3.id, userId: eve.id, support: true },
    { argumentId: torosB3.id, userId: bob.id, support: true },
    { argumentId: torosB3.id, userId: alice.id, support: false },
  ];
  for (const v of torosVotes) {
    await prisma.argumentVote.create({ data: v });
  }

  await prisma.winCondition.create({
    data: {
      debateId: torosDebate.id,
      type: WinConditionType.VOTE_COUNT,
      description: "La proponente de la prohibición ganó por mayoría de votos.",
      winningRole: ParticipantRole.PROPOSER,
      decidedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  });

  // ============================================================
  // DEFINITIONS (on the bullfighting debate)
  // ============================================================
  const torosDef1 = await prisma.definition.create({
    data: {
      term: "Tauromaquia",
      definition:
        "El arte y la práctica de lidiar toros en una corrida, considerada por algunos como una expresión cultural y por otros como una forma de maltrato animal.",
      status: DefinitionStatus.ACCEPTED,
      debateId: torosDebate.id,
      proposerId: diana.id,
      acceptedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    },
  });

  const torosDef2 = await prisma.definition.create({
    data: {
      term: "Bienestar Animal",
      definition:
        "El estado de un animal que puede expresar sus comportamientos naturales, está libre de dolor, miedo y estrés, y goza de buena salud física y mental.",
      status: DefinitionStatus.ACCEPTED,
      debateId: torosDebate.id,
      proposerId: charlie.id,
      acceptedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.definitionVote.createMany({
    data: [
      { definitionId: torosDef1.id, userId: charlie.id, support: true },
      { definitionId: torosDef1.id, userId: alice.id, support: false },
      { definitionId: torosDef2.id, userId: diana.id, support: true },
      { definitionId: torosDef2.id, userId: eve.id, support: true },
    ],
  });

  await prisma.definitionReference.createMany({
    data: [
      { definitionId: torosDef1.id, argumentId: torosA1.id },
      { definitionId: torosDef2.id, argumentId: torosB1.id },
    ],
  });

  // References on definitions
  await prisma.reference.createMany({
    data: [
      {
        definitionId: torosDef1.id,
        type: ReferenceType.NEWS_ARTICLE,
        title: "¿Qué es la tauromaquia? Definición y controversia",
        author: "M. Pérez",
        url: "https://example.com/noticias/definicion-tauromaquia",
        publication: "El Mundo",
        publishedAt: new Date("2024-01-15"),
      },
      {
        definitionId: torosDef2.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "Bienestar animal: definiciones y estándares internacionales",
        author: "F. García",
        publication: "Revista de Ética Animal",
        publishedAt: new Date("2023"),
      },
    ],
  });

  console.log("Created completed Spanish bullfighting debate with definitions");

  // ============================================================
  // DEBATE 5: COMPLETED (FORFEIT) - Spanish: Siesta
  // ============================================================
  const siestaDebate = await prisma.debate.create({
    data: {
      title: "¿Debería eliminarse la siesta en el trabajo?",
      description:
        "Un debate sobre la eliminación de la siesta como parte de la jornada laboral española. Se discuten productividad, tradición, salud y adaptación a horarios europeos.",
      status: "COMPLETED",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      minReferences: 1,
      creatorId: alice.id,
      startedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.debateTopic.createMany({
    data: [
      {
        debateId: siestaDebate.id,
        topic: DebateTopicEnum.SOCIETY_CULTURE,
      },
      {
        debateId: siestaDebate.id,
        topic: DebateTopicEnum.HEALTH_MEDICINE,
      },
    ],
  });

  const siestaAlice = await prisma.debateParticipant.create({
    data: {
      debateId: siestaDebate.id,
      userId: alice.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });
  const siestaEve = await prisma.debateParticipant.create({
    data: {
      debateId: siestaDebate.id,
      userId: eve.id,
      role: "OPPOSER",
      status: "FORFEITED",
    },
  });

  const siestaA1 = await prisma.argument.create({
    data: {
      content:
        "<p>La siesta interrumpe la jornada laboral y reduce la productividad. España tiene horarios más largos que el resto de Europa pero menor productividad. Eliminar la siesta permitiría jornadas continuas que terminan antes y mejoran la conciliación familiar.</p>",
      turnNumber: 1,
      debateId: siestaDebate.id,
      participantId: siestaAlice.id,
      authorId: alice.id,
    },
  });

  const siestaB1 = await prisma.argument.create({
    data: {
      content:
        "<p>La siesta no es solo una tradición, tiene beneficios científicamente probados. Una siesta corta de 20-30 minutos mejora la concentración, la memoria y reduce el estrés. En lugar de eliminarla, deberíamos optimizar los horarios laborales para que la siesta sea efectiva.</p>",
      turnNumber: 1,
      debateId: siestaDebate.id,
      participantId: siestaEve.id,
      authorId: eve.id,
      responseToId: siestaA1.id,
    },
  });

  const siestaA2 = await prisma.argument.create({
    data: {
      content:
        "<p>La siesta moderna es un mito: solo el 16% de los españoles duerme la siesta regularmente. Lo que realmente tenemos es una pausa de dos horas para comer que alarga la jornada hasta las 7 u 8 de la tarde. Esto es incompatible con la vida familiar y la conciliación. Países sin siesta tienen mejor productividad y calidad de vida.</p>",
      turnNumber: 2,
      debateId: siestaDebate.id,
      participantId: siestaAlice.id,
      authorId: alice.id,
      responseToId: siestaB1.id,
    },
  });

  // Eve forfeits here - unable to respond with data

  await prisma.reference.createMany({
    data: [
      {
        argumentId: siestaA1.id,
        type: ReferenceType.STATISTICS,
        title: "Productividad laboral en la UE: comparativa por países",
        author: "Eurostat",
        url: "https://example.eu/eurostat-productividad",
        publishedAt: new Date("2024"),
      },
      {
        argumentId: siestaB1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "The Power of Napping: Cognitive Benefits of Short Sleep",
        author: "S. Mednick",
        publication: "Sleep Research Journal",
        publishedAt: new Date("2023"),
      },
      {
        argumentId: siestaA2.id,
        type: ReferenceType.STATISTICS,
        title: "Encuesta Nacional de Horarios Laborales",
        author: "INE",
        url: "https://example.gov/ine-horarios",
        publishedAt: new Date("2024"),
      },
    ],
  });

  await prisma.winCondition.create({
    data: {
      debateId: siestaDebate.id,
      type: WinConditionType.FORFEIT,
      description:
        "La oponente no pudo defender la siesta ante los datos sobre productividad y horarios reales.",
      winningRole: ParticipantRole.PROPOSER,
      decidedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  // ============================================================
  // DEFINITIONS (on the siesta debate)
  // ============================================================
  const siestaDef1 = await prisma.definition.create({
    data: {
      term: "Siesta",
      definition:
        "Una pausa tradicional en la jornada laboral española que originalmente incluía una breve siesta después de la comida, aunque en la práctica moderna suele ser una pausa para almorzar de dos horas.",
      status: DefinitionStatus.ACCEPTED,
      debateId: siestaDebate.id,
      proposerId: alice.id,
      acceptedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.definitionVote.createMany({
    data: [
      { definitionId: siestaDef1.id, userId: eve.id, support: false },
      { definitionId: siestaDef1.id, userId: charlie.id, support: true },
      { definitionId: siestaDef1.id, userId: diana.id, support: true },
    ],
  });

  await prisma.definitionReference.createMany({
    data: [{ definitionId: siestaDef1.id, argumentId: siestaA1.id }],
  });

  // References on definitions
  await prisma.reference.createMany({
    data: [
      {
        definitionId: siestaDef1.id,
        type: ReferenceType.ACADEMIC_PAPER,
        title: "La siesta en España: evolución histórica y definición cultural",
        author: "L. Martínez",
        publication: "Revista de Antropología Social",
        publishedAt: new Date("2022"),
      },
    ],
  });

  console.log("Created completed Spanish siesta debate with definitions");

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  const notifications: {
    userId: string;
    type: NotificationType;
    status: NotificationStatus;
    title: string;
    message?: string;
    debateId?: string;
    actorId?: string;
    metadata?: Record<string, unknown>;
    readAt?: Date;
  }[] = [
    {
      userId: eve.id,
      type: NotificationType.DEBATE_COMPLETED,
      status: NotificationStatus.UNREAD,
      title: "Debate completed",
      message: "The UBI debate has concluded. The Proposer won by vote count.",
      debateId: ubiDebate.id,
      metadata: {
        winningRole: ParticipantRole.PROPOSER,
        winType: WinConditionType.VOTE_COUNT,
      },
    },
    {
      userId: alice.id,
      type: NotificationType.DEBATE_ACCEPTED,
      status: NotificationStatus.READ,
      title: "Invitation accepted",
      message: "Bob accepted your invitation to the UBI debate.",
      readAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const n of notifications) {
    await prisma.notification.create({
      data: {
        userId: n.userId,
        type: n.type,
        status: n.status,
        title: n.title,
        message: n.message,
        debateId: n.debateId ?? null,
        actorId: n.actorId ?? null,
        metadata: n.metadata as Prisma.InputJsonValue,
        readAt: n.readAt ?? null,
      },
    });
  }

  console.log("Created notifications");

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n--- Seed Summary ---");
  console.log("6 users");
  console.log(
    "5 debates (3 English COMPLETED, 2 Spanish COMPLETED, 1 CANCELLED)",
  );
  console.log("1 format (ONE_VS_ONE)");
  console.log("~24 arguments with references");
  console.log("Debate requests (cancelled)");
  console.log("Notifications (2 types)");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
