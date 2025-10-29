.
├── app
│   ├── actions
│   │   └── debates.ts
│   ├── api
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
│   │   │   └── page.tsx
│   │   └── [id]
│   │       ├── loading.tsx
│   │       ├── not-found.tsx
│   │       └── page.tsx
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
│   │   ├── arguments-list.tsx
│   │   └── debate-metadata.tsx
│   ├── profile
│   │   ├── DebateList.tsx
│   │   ├── EditProfileForm.tsx
│   │   └── ProfileStats.tsx
│   ├── providers
│   │   ├── session-provider.tsx
│   │   └── theme-provider.tsx
│   └── ui
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── nav-bar.tsx
│       ├── radio-group.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── theme-toggle.tsx
│       └── tiptap-editor.tsx
├── .github
│   └── ci.yml
├── hooks
│   └── use-auth.ts
├── lib
│   ├── auth
│   │   ├── auth-guard.ts
│   │   ├── cleanup-tokens.ts
│   │   └── options.ts
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
│   └── utils.ts
├── prisma
│   ├── migrations
│   │   ├── 20251018010317_init
│   │   │   └── migration.sql
│   │   ├── 20251020134228_add_password_reset_token
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
│   ├── debate.ts
│   └── next-auth.d.ts
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

51 directories, 122 files
