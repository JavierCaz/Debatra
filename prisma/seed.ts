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

  console.log("✨ Cleared existing data");

  // Create Users
  const hashedPassword = await hash("password123", 12);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: hashedPassword,
      bio: "Environmental scientist passionate about climate policy and evidence-based discourse.",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      password: hashedPassword,
      bio: "Economics researcher interested in policy analysis and data-driven arguments.",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: "Charlie Davis",
      email: "charlie@example.com",
      password: hashedPassword,
      bio: "Technology ethicist focused on AI governance and digital rights.",
    },
  });

  const diana = await prisma.user.create({
    data: {
      name: "Diana Martinez",
      email: "diana@example.com",
      password: hashedPassword,
      bio: "Political science professor specializing in democratic institutions.",
    },
  });

  console.log("👥 Created users");

  // Create Debate 1: Climate Change Policy (In Progress)
  const climateDebate = await prisma.debate.create({
    data: {
      title: "Should carbon taxes be the primary tool for reducing emissions?",
      description:
        "A structured debate on whether carbon taxation is the most effective policy mechanism for achieving significant reductions in greenhouse gas emissions.",
      topic: "Climate Policy",
      status: "IN_PROGRESS",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 4,
      turnTimeLimit: 48,
      minReferences: 2,
      creatorId: alice.id,
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
    },
  });

  // Add participants to climate debate
  const aliceParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: climateDebate.id,
      userId: alice.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });

  const bobParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: climateDebate.id,
      userId: bob.id,
      role: "OPPOSER",
      status: "ACTIVE",
    },
  });

  // Alice's opening argument
  const aliceArg1 = await prisma.argument.create({
    data: {
      content:
        "Carbon taxes represent the most economically efficient mechanism for reducing emissions. By directly pricing carbon externalities, they create market-based incentives that encourage innovation and allow businesses to find the most cost-effective reduction strategies. The evidence from British Columbia shows a 5-15% reduction in emissions without harming economic growth.",
      turnNumber: 1,
      debateId: climateDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title:
              'The British Columbia Carbon Tax: A Review of the Latest "Grand Experiment" in Environmental Policy',
            author: "Stewart Elgie and Jessica McClay",
            publication:
              "McGill International Journal of Sustainable Development Law and Policy",
            url: "https://example.com/bc-carbon-tax-study",
            publishedAt: new Date("2013-01-15"),
            notes:
              "Demonstrates 5-15% emission reductions in BC from 2008-2012",
          },
          {
            type: "STATISTICS",
            title: "World Bank Carbon Pricing Dashboard",
            author: "World Bank Group",
            url: "https://example.com/carbon-pricing-dashboard",
            publishedAt: new Date("2023-06-01"),
            notes:
              "Shows 70+ jurisdictions implementing carbon pricing mechanisms",
          },
        ],
      },
    },
  });

  // Bob's rebuttal
  const bobArg1 = await prisma.argument.create({
    data: {
      content:
        'While carbon taxes have theoretical appeal, they face significant political challenges and may be regressive, disproportionately affecting low-income households. The "Yellow Vest" protests in France demonstrate how carbon tax proposals can trigger massive public backlash. Furthermore, direct regulations and subsidies for clean energy have proven more politically viable and have driven dramatic cost reductions in renewable energy technologies.',
      turnNumber: 1,
      debateId: climateDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceArg1.id,
      references: {
        create: [
          {
            type: "NEWS_ARTICLE",
            title:
              "France's \"Yellow Vest\" Protesters Reject Macron's Climate Tax",
            author: "Le Monde Editorial Board",
            publication: "Le Monde",
            url: "https://example.com/yellow-vest-protests",
            publishedAt: new Date("2018-12-05"),
            notes: "Documents public resistance to carbon tax implementation",
          },
          {
            type: "STATISTICS",
            title: "Levelized Cost of Energy Analysis",
            author: "Lazard",
            url: "https://example.com/lcoe-analysis",
            publishedAt: new Date("2023-04-01"),
            notes: "Shows 90% cost reduction in solar, 70% in wind since 2010",
          },
        ],
      },
    },
  });

  // Create quote from Bob's argument
  await prisma.argumentQuote.create({
    data: {
      quotedText:
        "may be regressive, disproportionately affecting low-income households",
      context: "Addressing the equity concerns raised",
      quotedArgumentId: bobArg1.id,
      quotingArgumentId: aliceArg1.id, // Will reference this in Alice's next argument
    },
  });

  // Alice's counter-rebuttal
  const aliceArg2 = await prisma.argument.create({
    data: {
      content:
        "I concede that regressivity is a legitimate concern. However, this is addressable through revenue recycling mechanisms. British Columbia returned all carbon tax revenue through tax cuts and credits, with low-income households receiving more in rebates than they paid in carbon taxes. The key is policy design, not abandoning the most efficient tool. Regarding political viability, carbon taxes have succeeded in multiple jurisdictions when implemented with proper public engagement and revenue recycling.",
      turnNumber: 2,
      debateId: climateDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobArg1.id,
      references: {
        create: [
          {
            type: "GOVERNMENT_DOCUMENT",
            title: "British Columbia Carbon Tax Review and Update",
            author: "BC Ministry of Finance",
            url: "https://example.com/bc-carbon-tax-review",
            publishedAt: new Date("2022-03-20"),
            notes:
              "Details revenue recycling mechanisms and distributional impacts",
          },
          {
            type: "ACADEMIC_PAPER",
            title:
              "Public Acceptability of Carbon Taxes: Lessons from British Columbia",
            author: "Kathryn Harrison",
            publication: "Annual Review of Environment and Resources",
            url: "https://example.com/public-acceptability-study",
            publishedAt: new Date("2012-11-15"),
            notes: "Analyzes factors contributing to policy acceptance",
          },
        ],
      },
    },
  });

  // Bob concedes the revenue recycling point
  await prisma.concession.create({
    data: {
      argumentId: aliceArg2.id,
      userId: bob.id,
      reason:
        "You make a valid point about revenue recycling addressing regressivity concerns. The BC model does show this can be done effectively.",
    },
  });

  // Add votes
  await prisma.vote.create({
    data: {
      argumentId: aliceArg1.id,
      userId: charlie.id,
      type: "UPVOTE",
    },
  });

  await prisma.vote.create({
    data: {
      argumentId: aliceArg1.id,
      userId: diana.id,
      type: "UPVOTE",
    },
  });

  await prisma.vote.create({
    data: {
      argumentId: bobArg1.id,
      userId: charlie.id,
      type: "UPVOTE",
    },
  });

  await prisma.vote.create({
    data: {
      argumentId: aliceArg2.id,
      userId: diana.id,
      type: "UPVOTE",
    },
  });

  console.log("🔥 Created climate debate with arguments");

  // Create Debate 2: AI Regulation (Open for participants)
  const aiDebate = await prisma.debate.create({
    data: {
      title:
        "Should AI development be subject to mandatory government licensing?",
      description:
        "A debate on whether advanced AI systems should require government approval before deployment, similar to pharmaceutical regulations.",
      topic: "Technology Policy",
      status: "OPEN",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      turnTimeLimit: 72,
      minReferences: 1,
      creatorId: charlie.id,
    },
  });

  await prisma.debateParticipant.create({
    data: {
      debateId: aiDebate.id,
      userId: charlie.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });

  await prisma.debateParticipant.create({
    data: {
      debateId: aiDebate.id,
      userId: diana.id,
      role: "OPPOSER",
      status: "INVITED",
    },
  });

  console.log("🤖 Created AI regulation debate");

  // Create Debate 3: Universal Basic Income (Completed)
  const ubiDebate = await prisma.debate.create({
    data: {
      title:
        "Would Universal Basic Income reduce poverty more effectively than current welfare programs?",
      description:
        "An analysis of whether replacing existing social safety nets with UBI would better address poverty and inequality.",
      topic: "Economic Policy",
      status: "COMPLETED",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 3,
      turnTimeLimit: 48,
      minReferences: 2,
      creatorId: bob.id,
      startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 30 days ago
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Completed 3 days ago
    },
  });

  const bobUbiParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: ubiDebate.id,
      userId: bob.id,
      role: "PROPOSER",
      status: "ACTIVE",
    },
  });

  const dianaUbiParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: ubiDebate.id,
      userId: diana.id,
      role: "OPPOSER",
      status: "ACTIVE",
    },
  });

  // Simple arguments for completed debate
  const bobUbiArg = await prisma.argument.create({
    data: {
      content:
        "UBI eliminates the poverty trap created by means-tested benefits and reduces administrative overhead. Evidence from pilot programs shows improved mental health and educational outcomes.",
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: bobUbiParticipant.id,
      authorId: bob.id,
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title: "The Finnish Basic Income Experiment",
            author: "Kela Research",
            url: "https://example.com/finland-ubi",
            publishedAt: new Date("2020-05-06"),
          },
        ],
      },
    },
  });

  const dianaUbiArg = await prisma.argument.create({
    data: {
      content:
        "While UBI has theoretical benefits, the cost is prohibitive and it may reduce work incentives. Targeted programs more efficiently direct resources to those most in need.",
      turnNumber: 1,
      debateId: ubiDebate.id,
      participantId: dianaUbiParticipant.id,
      authorId: diana.id,
      rebuttalToId: bobUbiArg.id,
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title: "The Costs and Benefits of a Universal Basic Income",
            author: "Hilary Hoynes and Jesse Rothstein",
            publication: "RSF: The Russell Sage Foundation Journal",
            url: "https://example.com/ubi-costs-benefits",
            publishedAt: new Date("2019-03-01"),
          },
        ],
      },
    },
  });

  // Add win condition for completed debate
  await prisma.winCondition.create({
    data: {
      debateId: ubiDebate.id,
      type: "VOTE_COUNT",
      winnerId: bob.id,
      decidedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      description: "Winner determined by community vote count",
    },
  });

  console.log("💰 Created UBI debate");

  // Create Debate 4: Draft debate
  await prisma.debate.create({
    data: {
      title: "Should social media platforms be classified as public utilities?",
      description:
        "Examining whether major social media platforms should be regulated as essential services with common carrier obligations.",
      topic: "Technology Policy",
      status: "DRAFT",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 4,
      turnTimeLimit: 48,
      minReferences: 2,
      creatorId: charlie.id,
    },
  });

  console.log("📱 Created draft social media debate");

  // Create a sample report
  await prisma.report.create({
    data: {
      reason: "INVALID_REFERENCE",
      description:
        "One of the cited sources appears to be a broken link and cannot be verified.",
      status: "PENDING",
      reportedArgumentId: bobArg1.id,
      reporterId: charlie.id,
    },
  });

  console.log("🚩 Created sample report");

  console.log("✅ Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- Users: 4 (alice, bob, charlie, diana)`);
  console.log(`- Debates: 4 (1 in progress, 1 open, 1 completed, 1 draft)`);
  console.log(`- Arguments: 5 with references`);
  console.log(`- Quotes: 1`);
  console.log(`- Concessions: 1`);
  console.log(`- Votes: 4`);
  console.log(`- Reports: 1`);
  console.log('\n🔐 All users have password: "password123"\n');
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
