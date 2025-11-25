.
├── app
│   ├── actions
│   │   ├── debate-request.ts
│   │   ├── debates.ts
│   │   ├── notifications.ts
│   │   └── users.ts
│   ├── api
│   │   ├── arguments
│   │   │   ├── submit
│   │   │   │   └── route.ts
│   │   │   └── vote
│   │   │       └── route.ts
│   │   ├── auth
│   │   │   ├── forgot-password
│   │   │   │   └── route.ts
│   │   │   ├── [...nextauth]
│   │   │   │   └── route.ts
│   │   │   ├── reset-password
│   │   │   │   └── route.ts
│   │   │   └── signup
│   │   │       └── route.ts
│   │   ├── debates
│   │   │   └── route.ts
│   │   ├── definitions
│   │   │   ├── accept
│   │   │   │   └── route.ts
│   │   │   ├── endorse
│   │   │   │   └── route.ts
│   │   │   ├── submit
│   │   │   │   └── route.ts
│   │   │   ├── supersede
│   │   │   │   └── route.ts
│   │   │   └── vote
│   │   │       └── route.ts
│   │   ├── health
│   │   │   └── route.ts
│   │   └── profile
│   │       └── route.ts
│   ├── auth
│   │   ├── error
│   │   │   └── page.tsx
│   │   ├── forgot-password
│   │   │   └── page.tsx
│   │   ├── new-user
│   │   │   └── page.tsx
│   │   ├── reset-password
│   │   │   └── page.tsx
│   │   ├── signin
│   │   │   └── page.tsx
│   │   ├── signup
│   │   │   └── page.tsx
│   │   └── verify-request
│   │       └── page.tsx
│   ├── dashboard
│   │   └── page.tsx
│   ├── debates
│   │   ├── create
│   │   │   ├── create-debate-client.tsx
│   │   │   └── page.tsx
│   │   ├── [id]
│   │   │   ├── loading.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── generated
│   │   └── prisma
│   │       ├── runtime
│   │       │   ├── edge-esm.js
│   │       │   ├── edge.js
│   │       │   ├── index-browser.d.ts
│   │       │   ├── index-browser.js
│   │       │   ├── library.d.ts
│   │       │   ├── library.js
│   │       │   ├── react-native.js
│   │       │   ├── wasm-compiler-edge.js
│   │       │   └── wasm-engine-edge.js
│   │       ├── client.d.ts
│   │       ├── client.js
│   │       ├── default.d.ts
│   │       ├── default.js
│   │       ├── edge.d.ts
│   │       ├── edge.js
│   │       ├── index-browser.js
│   │       ├── index.d.ts
│   │       ├── index.js
│   │       ├── libquery_engine-rhel-openssl-3.0.x.so.node
│   │       ├── package.json
│   │       ├── query_engine_bg.js
│   │       ├── query_engine_bg.wasm
│   │       ├── schema.prisma
│   │       ├── wasm.d.ts
│   │       ├── wasm-edge-light-loader.mjs
│   │       ├── wasm.js
│   │       └── wasm-worker-loader.mjs
│   ├── profile
│   │   └── [userId]
│   │       └── page.tsx
│   ├── styles
│   │   └── tiptap.css
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── auth
│   │   ├── protected-route.tsx
│   │   └── user-nav.tsx
│   ├── debate
│   │   ├── argument
│   │   │   ├── argument-list
│   │   │   │   ├── argument-definition-references.tsx
│   │   │   │   ├── argument-references.tsx
│   │   │   │   ├── argument-stats.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── participant-header.tsx
│   │   │   │   ├── response-indicator.tsx
│   │   │   │   ├── safe-content-renderer.tsx
│   │   │   │   └── single-argument.tsx
│   │   │   └── arguments-submitter.tsx
│   │   ├── browse
│   │   │   ├── debate-card.tsx
│   │   │   ├── debate-filters-client.tsx
│   │   │   └── debate-filters.tsx
│   │   ├── create
│   │   │   ├── basic-info-section.tsx
│   │   │   ├── create-debate-form.tsx
│   │   │   ├── debate-parameters-section.tsx
│   │   │   ├── opening-statement-section.tsx
│   │   │   ├── reference-section.tsx
│   │   │   └── submit-button.tsx
│   │   ├── definition
│   │   │   ├── definitions-list
│   │   │   │   ├── definition-actions.tsx
│   │   │   │   ├── definition-header.tsx
│   │   │   │   ├── definition-references.tsx
│   │   │   │   ├── definitions-empty-state.tsx
│   │   │   │   ├── definition-status-badge.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── status-alerts.tsx
│   │   │   │   └── version-selector.tsx
│   │   │   └── definitions-submitter.tsx
│   │   ├── details
│   │   │   ├── debate-info
│   │   │   │   ├── creator-inviter.tsx
│   │   │   │   ├── current-participants.tsx
│   │   │   │   ├── debate-metadata.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── invitations-tab.tsx
│   │   │   │   ├── join-requests-tab.tsx
│   │   │   │   ├── join-request.tsx
│   │   │   │   ├── role-selection.tsx
│   │   │   │   ├── status-summary.tsx
│   │   │   │   └── user-requests.tsx
│   │   │   ├── arguments-response-section.tsx
│   │   │   ├── debate-content-section.tsx
│   │   │   └── definitions-response-section.tsx
│   │   ├── reference
│   │   │   └── reference-section.tsx
│   │   ├── shared
│   │   │   └── voting-buttons.tsx
│   │   └── submission
│   │       ├── shared
│   │       │   ├── accordion-item-wrapper.tsx
│   │       │   ├── accordion-section-header.tsx
│   │       │   ├── disabled-state.tsx
│   │       │   └── status-indicators.tsx
│   │       └── debate-submission-form.tsx
│   ├── notification
│   │   ├── notification-bell.tsx
│   │   └── notification-list.tsx
│   ├── profile
│   │   ├── DebateList.tsx
│   │   ├── EditProfileForm.tsx
│   │   ├── ProfileStats.tsx
│   │   └── SettingsForm.tsx
│   ├── providers
│   │   ├── session-provider.tsx
│   │   └── theme-provider.tsx
│   └── ui
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── collapsible.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── hover-card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── nav-bar.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── theme-toggle.tsx
│       ├── tiptap-editor.tsx
│       └── tooltip.tsx
├── .github
│   └── ci.yml
├── hooks
│   ├── use-accordion-items.ts
│   └── use-auth.ts
├── lib
│   ├── auth
│   │   ├── auth-guard.ts
│   │   ├── cleanup-tokens.ts
│   │   └── options.ts
│   ├── debate
│   │   ├── formatters.ts
│   │   └── stats.ts
│   ├── email
│   │   ├── service.ts
│   │   └── templates.tsx
│   ├── prisma
│   │   └── client.ts
│   ├── rate-limit
│   │   ├── headers.ts
│   │   ├── limiter.ts
│   │   └── middleware.ts
│   ├── utils
│   │   └── reference-types.ts
│   ├── vote
│   │   ├── config.ts
│   │   └── handler.ts
│   └── utils.ts
├── prisma
│   ├── migrations
│   │   ├── 20251018010317_init
│   │   │   └── migration.sql
│   │   ├── 20251020134228_add_password_reset_token
│   │   │   └── migration.sql
│   │   ├── 20251029023415_multiple_topics
│   │   │   └── migration.sql
│   │   ├── 20251029234619_add_notifications_system
│   │   │   └── migration.sql
│   │   ├── 20251030021223_add_debate_requests
│   │   │   └── migration.sql
│   │   ├── 20251031001227_add_turn_fields_to_debate
│   │   │   └── migration.sql
│   │   ├── 20251101024247_replace_rebuttals_with_responses
│   │   │   └── migration.sql
│   │   ├── 20251104153656_remove_neutral_role
│   │   │   └── migration.sql
│   │   ├── 20251106143910_definition_model_added
│   │   │   └── migration.sql
│   │   ├── 20251108025618_definition_references_addes
│   │   │   └── migration.sql
│   │   ├── 20251113022909_add_definition_vote_notification_type
│   │   │   └── migration.sql
│   │   ├── 20251117215905_add_notification_preferences
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── types
│   ├── debate-requests.ts
│   ├── debate.ts
│   ├── definitions.ts
│   ├── email.ts
│   ├── next-auth.d.ts
│   ├── notifications.ts
│   ├── reference.ts
│   └── submitters.ts
├── .vercel
│   ├── project.json
│   └── README.txt
├── biome.json
├── components.json
├── .env
├── .env.example
├── .env.production.example
├── .env.staging.example
├── .gitignore
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── prisma.config.ts
├── README.md
├── STRUCTURE.md
└── tsconfig.json

85 directories, 214 files
