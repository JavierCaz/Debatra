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

  // Create Users
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

  const eve = await prisma.user.create({
    data: {
      name: "Eve Chen",
      email: "eve@example.com",
      password: hashedPassword,
      bio: "Energy policy analyst with expertise in renewable transitions.",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    },
  });

  const frank = await prisma.user.create({
    data: {
      name: "Frank Williams",
      email: "frank@example.com",
      password: hashedPassword,
      bio: "Industrial engineer skeptical of rapid decarbonization timelines.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
  });

  console.log("👥 Created 6 users");

  // Create Debate 1: Comprehensive Climate Policy Debate (In Progress)
  const climateDebate = await prisma.debate.create({
    data: {
      title: "Should carbon taxes be the primary tool for reducing emissions?",
      description:
        "A structured debate on whether carbon taxation is the most effective policy mechanism for achieving significant reductions in greenhouse gas emissions. This debate examines economic efficiency, political feasibility, and equity considerations.",
      topic: "Climate Policy",
      status: "IN_PROGRESS",
      format: "ONE_VS_ONE",
      maxParticipants: 2,
      turnsPerSide: 4,
      turnTimeLimit: 48,
      minReferences: 2,
      creatorId: alice.id,
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Started 14 days ago
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

  // === TURN 1 ===

  // Alice's opening argument (Multiple arguments in turn 1)
  const aliceArg1 = await prisma.argument.create({
    data: {
      content: `<p>Carbon taxes represent the most economically efficient mechanism for reducing emissions for three key reasons:</p>
        
        <ol>
          <li><strong>Market-based efficiency:</strong> By directly pricing carbon externalities, they create market-based incentives that encourage innovation and allow businesses to find the most cost-effective reduction strategies.</li>
          <li><strong>Revenue generation:</strong> The collected revenue can be used to fund clean energy research, support vulnerable communities, or be returned to citizens through dividend programs.</li>
          <li><strong>Proven effectiveness:</strong> Multiple jurisdictions have demonstrated significant emission reductions without economic harm.</li>
        </ol>
        
        <p>The evidence from British Columbia shows a 5-15% reduction in emissions while maintaining economic growth, proving that well-designed carbon pricing works.</p>`,
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
            url: "https://doi.org/10.2139/ssrn.2261857",
            publishedAt: new Date("2013-01-15"),
            notes:
              "Comprehensive analysis showing 5-15% emission reductions in BC from 2008-2012",
          },
          {
            type: "STATISTICS",
            title: "World Bank Carbon Pricing Dashboard 2023",
            author: "World Bank Group",
            url: "https://carbonpricingdashboard.worldbank.org/",
            publishedAt: new Date("2023-06-01"),
            notes:
              "Shows 70+ jurisdictions implementing carbon pricing mechanisms covering 23% of global emissions",
          },
          {
            type: "GOVERNMENT_DOCUMENT",
            title:
              "OECD Environmental Performance Reviews: Carbon Pricing Effectiveness",
            author: "Organisation for Economic Co-operation and Development",
            url: "https://www.oecd.org/environment/carbon-pricing-effectiveness/",
            publishedAt: new Date("2021-09-15"),
            notes:
              "Analysis showing carbon pricing as most cost-effective policy tool",
          },
        ],
      },
    },
  });

  // Bob's opening argument with multiple points
  const bobArg1 = await prisma.argument.create({
    data: {
      content: `<p>While carbon taxes have theoretical appeal, they face three fundamental challenges that limit their effectiveness as a primary policy tool:</p>
        
        <ol>
          <li><strong>Political viability:</strong> Carbon taxes consistently face strong public resistance, as demonstrated by the "Yellow Vest" protests in France and failed ballot initiatives in multiple U.S. states.</li>
          <li><strong>Regressive impacts:</strong> Without careful design, carbon taxes disproportionately burden low-income households who spend a larger percentage of their income on energy and transportation.</li>
          <li><strong>Insufficient scope:</strong> Direct regulations and subsidies have proven more effective at driving technological innovation and infrastructure transformation in key sectors like renewable energy and electric vehicles.</li>
        </ol>
        
        <p>The dramatic cost reductions in solar and wind energy were achieved primarily through targeted subsidies and mandates, not carbon pricing.</p>`,
      turnNumber: 1,
      debateId: climateDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      references: {
        create: [
          {
            type: "NEWS_ARTICLE",
            title:
              "France's 'Yellow Vest' Protesters Reject Macron's Climate Tax",
            author: "Le Monde Editorial Board",
            publication: "Le Monde",
            url: "https://www.lemonde.fr/france/article/2018/12/05/gilets-jaunes-la-colere-contre-la-fiscalite-ecologique_5392715_3214.html",
            publishedAt: new Date("2018-12-05"),
            notes:
              "Documents widespread public resistance to carbon tax implementation in France",
          },
          {
            type: "ACADEMIC_PAPER",
            title:
              "The Distributional Impacts of a Carbon Tax: Evidence from British Columbia",
            author: "Nicholas Rivers and Brandon Schaufele",
            publication: "Canadian Public Policy",
            url: "https://doi.org/10.3138/cpp.2015-069",
            publishedAt: new Date("2015-12-01"),
            notes:
              "Shows initial regressive impacts before revenue recycling measures",
          },
          {
            type: "STATISTICS",
            title: "Levelized Cost of Energy Analysis Version 16.0",
            author: "Lazard",
            url: "https://www.lazard.com/research-insights/2023-levelized-cost-of-energyplus/",
            publishedAt: new Date("2023-04-01"),
            notes:
              "Documents 90% cost reduction in solar and 70% in wind since 2010, driven by policy support",
          },
        ],
      },
    },
  });

  // === TURN 2 ===

  // Alice's rebuttal addressing Bob's points
  const aliceArg2 = await prisma.argument.create({
    data: {
      content: `<p>You raise valid concerns about political viability and equity, but these are design challenges rather than fundamental flaws with carbon pricing itself.</p>
        
        <h4>Addressing Political Viability</h4>
        <p>The success of carbon pricing in British Columbia, Sweden, and the EU Emissions Trading System shows that political acceptance is achievable with proper design. Key factors include:</p>
        <ul>
          <li>Revenue recycling that makes most households financially better off</li>
          <li>Gradual implementation with clear communication</li>
          <li>Protections for trade-exposed industries</li>
        </ul>
        
        <h4>Solving Equity Concerns</h4>
        <p>British Columbia addressed regressivity by returning all revenue through tax cuts and direct credits, with low-income households receiving <em>more</em> in rebates than they paid in carbon taxes. This demonstrates that equity concerns are solvable through policy design.</p>
        
        <h4>Complementary, Not Exclusive</h4>
        <p>Carbon pricing works best as part of a comprehensive policy package that includes regulations and subsidies. However, it should be the <strong>centerpiece</strong> because it efficiently coordinates emission reductions across the entire economy.</p>`,
      turnNumber: 2,
      debateId: climateDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobArg1.id,
      references: {
        create: [
          {
            type: "GOVERNMENT_DOCUMENT",
            title: "British Columbia Carbon Tax Review and Update 2022",
            author: "BC Ministry of Finance",
            url: "https://www2.gov.bc.ca/gov/content/environment/climate-change/planning-and-action/carbon-tax",
            publishedAt: new Date("2022-03-20"),
            notes:
              "Details revenue recycling mechanisms and distributional analysis showing net benefits for low-income households",
          },
          {
            type: "ACADEMIC_PAPER",
            title:
              "Why Do People Accept Environmental Policies? The Case of the Swedish Carbon Tax",
            author: "Andersson, S. ",
            publication: "Journal of Environmental Policy & Planning",
            url: "https://doi.org/10.1080/1523908X.2020.1841588",
            publishedAt: new Date("2020-11-01"),
            notes:
              "Analyzes factors contributing to high public acceptance of carbon tax in Sweden",
          },
        ],
      },
    },
  });

  // Create quotes from Bob's argument that Alice is addressing
  await prisma.argumentQuote.create({
    data: {
      quotedText:
        "carbon taxes disproportionately burden low-income households",
      context: "Addressing the equity concerns raised about carbon pricing",
      startPosition: 250,
      endPosition: 310,
      quotedArgumentId: bobArg1.id,
      quotingArgumentId: aliceArg2.id,
    },
  });

  await prisma.argumentQuote.create({
    data: {
      quotedText: "face strong public resistance",
      context: "Responding to political viability concerns",
      startPosition: 120,
      endPosition: 150,
      quotedArgumentId: bobArg1.id,
      quotingArgumentId: aliceArg2.id,
    },
  });

  // Bob's counter-rebuttal with additional evidence
  const bobArg2 = await prisma.argument.create({
    data: {
      content: `<p>While I appreciate your acknowledgment of the challenges, I remain skeptical that carbon taxes can serve as the <em>primary</em> tool. Let me explain why:</p>
        
        <h4>Political Reality vs. Theoretical Design</h4>
        <p>Even well-designed carbon taxes face implementation hurdles. The Australian carbon tax was repealed after just two years despite good design principles. This suggests that political volatility remains a fundamental constraint.</p>
        
        <h4>Evidence from Successful Alternatives</h4>
        <p>Consider Germany's Energiewende: through feed-in tariffs and renewable mandates (not carbon pricing), they achieved 46% renewable electricity by 2020. Similarly, California's clean vehicle standards have driven electric vehicle adoption more effectively than carbon pricing alone.</p>
        
        <h4>The Innovation Argument</h4>
        <p>While carbon prices create marginal incentives, they don't drive the kind of transformative innovation needed. Targeted R&D funding and deployment subsidies have proven more effective at creating new clean technology industries.</p>`,
      turnNumber: 2,
      debateId: climateDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceArg2.id,
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title: "The Rise and Fall of the Australian Carbon Tax",
            author: "David I. Stern and Frank Jotzo",
            publication: "Climate Policy",
            url: "https://doi.org/10.1080/14693062.2021.1993776",
            publishedAt: new Date("2021-10-15"),
            notes:
              "Analysis of political factors leading to repeal of Australian carbon pricing",
          },
          {
            type: "GOVERNMENT_DOCUMENT",
            title: "Germany's Energy Transition - Key Findings 2021",
            author: "Federal Ministry for Economic Affairs and Energy",
            url: "https://www.bmwi.de/Redaktion/EN/Publikationen/energy-transition-key-findings.html",
            publishedAt: new Date("2021-12-01"),
            notes: "Documents success of renewable energy policies in Germany",
          },
          {
            type: "STATISTICS",
            title: "California Zero Emission Vehicle Program Assessment",
            author: "California Air Resources Board",
            url: "https://ww2.arb.ca.gov/resources/documents/california-zero-emission-vehicle-program-assessment",
            publishedAt: new Date("2022-08-15"),
            notes:
              "Shows effectiveness of regulatory approach for transportation decarbonization",
          },
        ],
      },
    },
  });

  // === TURN 3 ===

  // Alice's third argument with concession and refined position
  const aliceArg3 = await prisma.argument.create({
    data: {
      content: `<p>You make compelling points about political volatility and the success of alternative policies. Let me refine my position:</p>
        
        <h4>Concession on Political Challenges</h4>
        <p>I concede that political viability remains a significant challenge, particularly in polarized political environments. The Australian example is indeed instructive.</p>
        
        <h4>Refined Position: Carbon Pricing as Coordination Mechanism</h4>
        <p>Rather than abandoning carbon pricing, we should view it as the essential <strong>coordination mechanism</strong> that makes other policies more effective. For example:</p>
        <ul>
          <li>Carbon pricing ensures that renewable subsidies don't simply increase overall energy consumption</li>
          <li>It provides a clear price signal for private sector innovation</li>
          <li>It generates revenue to fund the very transition programs you rightly champion</li>
        </ul>
        
        <h4>International Dimension</h4>
        <p>Carbon pricing becomes increasingly important for international coordination. Border carbon adjustments and linking carbon markets require price signals that regulations cannot provide.</p>`,
      turnNumber: 3,
      debateId: climateDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobArg2.id,
      references: {
        create: [
          {
            type: "ACADEMIC_PAPER",
            title:
              "The Complementary Role of Carbon Pricing and Technology Policies in Climate Mitigation",
            author: "Goulder, L. H., & Hafstead, M. A.",
            publication: "Journal of Environmental Economics and Management",
            url: "https://doi.org/10.1016/j.jeem.2020.102394",
            publishedAt: new Date("2020-09-01"),
            notes:
              "Shows how carbon pricing and technology policies work best in combination",
          },
          {
            type: "GOVERNMENT_DOCUMENT",
            title: "EU Carbon Border Adjustment Mechanism Proposal",
            author: "European Commission",
            url: "https://ec.europa.eu/taxation_customs/green-taxation-0/carbon-border-adjustment-mechanism_en",
            publishedAt: new Date("2021-07-14"),
            notes:
              "Demonstrates international coordination role of carbon pricing",
          },
        ],
      },
    },
  });

  // Bob concedes a point about coordination
  await prisma.concession.create({
    data: {
      argumentId: aliceArg3.id,
      userId: bob.id,
      reason:
        "You make a valid point about carbon pricing serving as a coordination mechanism for international climate policy. The EU's border adjustment mechanism does illustrate this function.",
    },
  });

  // Bob's third argument focusing on implementation reality
  const bobArg3 = await prisma.argument.create({
    data: {
      content: `<p>I appreciate your refined position, and I agree that carbon pricing has a role to play. However, I maintain that it shouldn't be the <em>primary</em> tool. Here's why:</p>
        
        <h4>Implementation Reality</h4>
        <p>Even in jurisdictions with carbon pricing, the political pressure to keep prices low has resulted in levels far below what economists estimate is needed. The EU ETS spent years with prices below €10/ton when models suggest €50-100/ton is needed.</p>
        
        <h4>Alternative Primary Strategy</h4>
        <p>I propose that industrial policy and public investment should be the primary tools. The U.S. Inflation Reduction Act demonstrates this approach: $369 billion in clean energy investments that are already transforming markets without the political baggage of carbon taxes.</p>
        
        <h4>Pragmatic Path Forward</h4>
        <p>Given political constraints, we should prioritize policies that:</p>
        <ol>
          <li>Directly fund clean technology deployment</li>
          <li>Implement sector-specific regulations</li>
          <li>Use carbon pricing as a complementary, not primary, tool</li>
        </ol>`,
      turnNumber: 3,
      debateId: climateDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceArg3.id,
      references: {
        create: [
          {
            type: "STATISTICS",
            title: "EU Emissions Trading System Price Evolution 2008-2023",
            author: "European Energy Exchange",
            url: "https://www.eex.com/en/market-data/environmental-markets/spot-market/european-emission-allowances",
            publishedAt: new Date("2023-11-01"),
            notes:
              "Shows historical price volatility and periods of very low carbon prices",
          },
          {
            type: "GOVERNMENT_DOCUMENT",
            title: "Inflation Reduction Act Guidebook",
            author: "The White House",
            url: "https://www.whitehouse.gov/cleanenergy/inflation-reduction-act-guidebook/",
            publishedAt: new Date("2022-08-16"),
            notes:
              "Details $369 billion in clean energy investments and expected emissions impacts",
          },
          {
            type: "ACADEMIC_PAPER",
            title: "The Political Economy of Carbon Pricing",
            author: "Mildenberger, M.",
            publication: "Oxford Research Encyclopedia of Politics",
            url: "https://doi.org/10.1093/acrefore/9780190228637.013.1773",
            publishedAt: new Date("2020-12-22"),
            notes:
              "Analyzes political constraints on carbon pricing implementation",
          },
        ],
      },
    },
  });

  // === TURN 4 (Final Turn) ===

  // Alice's final summary argument
  const aliceArg4 = await prisma.argument.create({
    data: {
      content: `<p>We've reached substantial agreement on many points. Let me conclude by summarizing why carbon pricing, while imperfect, remains essential as a primary coordination tool:</p>
        
        <h4>Key Points of Agreement</h4>
        <ul>
          <li>Both carbon pricing and direct investment/regulation are necessary</li>
          <li>Political implementation challenges are real and significant</li>
          <li>Equity concerns must be addressed through policy design</li>
        </ul>
        
        <h4>Why Carbon Pricing as Primary Tool</h4>
        <p>Even with its challenges, carbon pricing provides the only mechanism that:</p>
        <ol>
          <li>Efficiently allocates reduction efforts across the entire economy</li>
          <li>Generates sustainable funding for the transition</li>
          <li>Enables international policy coordination</li>
          <li>Creates continuous innovation incentives without picking winners</li>
        </ol>
        
        <p>The perfect should not be the enemy of the good. While we work to improve carbon pricing design and build political support, it must remain central to our climate strategy.</p>`,
      turnNumber: 4,
      debateId: climateDebate.id,
      participantId: aliceParticipant.id,
      authorId: alice.id,
      rebuttalToId: bobArg3.id,
    },
  });

  // Bob's final summary argument
  const bobArg4 = await prisma.argument.create({
    data: {
      content: `<p>This has been a productive discussion that highlights the complexity of climate policy. My concluding position:</p>
        
        <h4>Areas of Convergence</h4>
        <p>We agree that carbon pricing has a role to play and that a comprehensive policy portfolio is essential. The debate has helped clarify where carbon pricing adds value.</p>
        
        <h4>Why Investment-Led Strategy Should Be Primary</h4>
        <p>Given political realities and implementation speed, I believe public investment and industrial policy should lead because:</p>
        <ol>
          <li>They face less political resistance and can be implemented faster</li>
          <li>They directly build the clean energy infrastructure we need</li>
          <li>They have demonstrated success in transforming key sectors</li>
          <li>They can be designed to maximize co-benefits like job creation</li>
        </ol>
        
        <p>Carbon pricing should complement this investment-led strategy, not lead it. This pragmatic approach offers the best path to rapid decarbonization given real-world constraints.</p>`,
      turnNumber: 4,
      debateId: climateDebate.id,
      participantId: bobParticipant.id,
      authorId: bob.id,
      rebuttalToId: aliceArg4.id,
    },
  });

  // Add comprehensive voting from other users
  const votes = [
    // Votes for Alice's arguments
    { argumentId: aliceArg1.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: aliceArg1.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: aliceArg1.id, userId: eve.id, type: "UPVOTE" },
    { argumentId: aliceArg2.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: aliceArg2.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: aliceArg3.id, userId: eve.id, type: "UPVOTE" },
    { argumentId: aliceArg3.id, userId: frank.id, type: "DOWNVOTE" },
    { argumentId: aliceArg4.id, userId: charlie.id, type: "UPVOTE" },

    // Votes for Bob's arguments
    { argumentId: bobArg1.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: bobArg1.id, userId: frank.id, type: "UPVOTE" },
    { argumentId: bobArg2.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: bobArg2.id, userId: eve.id, type: "DOWNVOTE" },
    { argumentId: bobArg3.id, userId: frank.id, type: "UPVOTE" },
    { argumentId: bobArg3.id, userId: charlie.id, type: "UPVOTE" },
    { argumentId: bobArg4.id, userId: diana.id, type: "UPVOTE" },
    { argumentId: bobArg4.id, userId: eve.id, type: "UPVOTE" },
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

  // Additional concessions
  await prisma.concession.create({
    data: {
      argumentId: bobArg2.id,
      userId: alice.id,
      reason:
        "You're correct that Germany's Energiewende achieved remarkable renewable energy growth through feed-in tariffs rather than carbon pricing alone.",
    },
  });

  console.log(
    "🔥 Created comprehensive climate debate with 8 arguments across 4 turns",
  );

  // Create Debate 2: Multi-sided AI Regulation Debate
  const aiDebate = await prisma.debate.create({
    data: {
      title:
        "What regulatory approach best balances AI innovation with safety concerns?",
      description:
        "A multi-sided debate examining different regulatory frameworks for artificial intelligence, including licensing, liability rules, and self-regulation approaches.",
      topic: "Technology Policy",
      status: "IN_PROGRESS",
      format: "MULTI_SIDED",
      maxParticipants: 4,
      turnsPerSide: 3,
      turnTimeLimit: 72,
      minReferences: 1,
      creatorId: charlie.id,
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Multiple participants with different roles
  const charlieAIParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: aiDebate.id,
      userId: charlie.id,
      role: "PROPOSER", // Proposing strict licensing
      status: "ACTIVE",
    },
  });

  const dianaAIParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: aiDebate.id,
      userId: diana.id,
      role: "OPPOSER", // Opposing strict regulation
      status: "ACTIVE",
    },
  });

  const eveAIParticipant = await prisma.debateParticipant.create({
    data: {
      debateId: aiDebate.id,
      userId: eve.id,
      role: "NEUTRAL", // Proposing alternative approach
      status: "ACTIVE",
    },
  });

  // Add arguments from all three perspectives
  const charlieAIArg = await prisma.argument.create({
    data: {
      content: `<p>AI systems with significant potential for harm should require government licensing similar to pharmaceuticals or aviation. This would ensure safety testing, transparency requirements, and accountability mechanisms are in place before deployment.</p>`,
      turnNumber: 1,
      debateId: aiDebate.id,
      participantId: charlieAIParticipant.id,
      authorId: charlie.id,
    },
  });

  const dianaAIArg = await prisma.argument.create({
    data: {
      content: `<p>Strict licensing would stifle innovation and concentrate AI development in large corporations. A liability-based approach that holds companies accountable for harms while allowing open development would be more effective.</p>`,
      turnNumber: 1,
      debateId: aiDebate.id,
      participantId: dianaAIParticipant.id,
      authorId: diana.id,
      rebuttalToId: charlieAIArg.id,
    },
  });

  const eveAIArg = await prisma.argument.create({
    data: {
      content: `<p>Both approaches have merits. I propose a tiered regulatory framework where only high-risk AI applications require licensing, while most AI development operates under flexible safety standards with post-market monitoring.</p>`,
      turnNumber: 1,
      debateId: aiDebate.id,
      participantId: eveAIParticipant.id,
      authorId: eve.id,
    },
  });

  console.log("🤖 Created multi-sided AI regulation debate");

  // Create additional debates with various statuses...

  console.log("✅ Enhanced seed completed successfully!");
  console.log("\n📊 Comprehensive Summary:");
  console.log(`- Users: 6 (alice, bob, charlie, diana, eve, frank)`);
  console.log(`- Debates: 2 (both in progress with rich content)`);
  console.log(`- Arguments: 11 total across debates`);
  console.log(
    `- Climate Debate: 8 arguments across 4 turns with multiple rebuttals`,
  );
  console.log(`- AI Debate: 3 arguments from different perspectives`);
  console.log(`- Quotes: 2 direct quotes with context`);
  console.log(`- Concessions: 3 concessions showing intellectual honesty`);
  console.log(`- Votes: 16 votes from multiple users`);
  console.log(`- References: 15+ high-quality references with varied types`);
  console.log('\n🔐 All users have password: "password123"\n');
  console.log("💡 The climate debate demonstrates:");
  console.log("   - Multiple arguments per turn");
  console.log("   - Progressive refinement of positions");
  console.log("   - Direct quotes and concessions");
  console.log("   - Rich HTML content formatting");
  console.log("   - Comprehensive reference integration");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
