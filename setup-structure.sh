#!/bin/bash
# Sehati CRM — Project Structure Setup Script
# Jalankan dari root folder project: bash setup-structure.sh

echo "🏥 Setting up Sehati CRM project structure..."

# ── App Router folders ────────────────────────────────────
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/register
mkdir -p src/app/\(patient\)/home
mkdir -p src/app/\(patient\)/chat
mkdir -p src/app/\(patient\)/booking
mkdir -p src/app/\(patient\)/history
mkdir -p src/app/\(staff\)/inbox
mkdir -p src/app/\(staff\)/calendar
mkdir -p src/app/\(staff\)/dashboard
mkdir -p src/app/\(admin\)/kb/qa/\[id\]
mkdir -p src/app/\(admin\)/kb/documents
mkdir -p src/app/\(admin\)/doctors
mkdir -p src/app/\(admin\)/staff

# ── API Routes ────────────────────────────────────────────
mkdir -p src/app/api/chat
mkdir -p src/app/api/ai/gatekeeper
mkdir -p src/app/api/ai/smart-reply
mkdir -p src/app/api/ai/triage
mkdir -p src/app/api/ai/routing
mkdir -p src/app/api/kb/search
mkdir -p src/app/api/kb/embed
mkdir -p src/app/api/booking

# ── Components ────────────────────────────────────────────
mkdir -p src/components/ui
mkdir -p src/components/chat
mkdir -p src/components/inbox
mkdir -p src/components/kb
mkdir -p src/components/booking
mkdir -p src/components/dashboard
mkdir -p src/components/layout
mkdir -p src/components/shared

# ── Lib ───────────────────────────────────────────────────
mkdir -p src/lib/supabase
mkdir -p src/lib/ai

# ── Other folders ─────────────────────────────────────────
mkdir -p src/types
mkdir -p src/hooks
mkdir -p src/store
mkdir -p supabase/migrations
mkdir -p public/fonts
mkdir -p public/icons

# ── Create placeholder files ──────────────────────────────

# App pages
touch src/app/\(auth\)/login/page.tsx
touch src/app/\(auth\)/register/page.tsx
touch src/app/\(patient\)/layout.tsx
touch src/app/\(patient\)/home/page.tsx
touch src/app/\(patient\)/chat/page.tsx
touch src/app/\(patient\)/booking/page.tsx
touch src/app/\(patient\)/history/page.tsx
touch src/app/\(staff\)/layout.tsx
touch src/app/\(staff\)/inbox/page.tsx
touch src/app/\(staff\)/calendar/page.tsx
touch src/app/\(staff\)/dashboard/page.tsx
touch src/app/\(admin\)/layout.tsx
touch src/app/\(admin\)/kb/page.tsx
touch src/app/\(admin\)/kb/qa/page.tsx
touch src/app/\(admin\)/kb/qa/\[id\]/page.tsx
touch src/app/\(admin\)/kb/documents/page.tsx
touch src/app/\(admin\)/doctors/page.tsx
touch src/app/\(admin\)/staff/page.tsx

# API routes
touch src/app/api/chat/route.ts
touch src/app/api/ai/gatekeeper/route.ts
touch src/app/api/ai/smart-reply/route.ts
touch src/app/api/ai/triage/route.ts
touch src/app/api/ai/routing/route.ts
touch src/app/api/kb/search/route.ts
touch src/app/api/kb/embed/route.ts
touch src/app/api/booking/route.ts

# Components
touch src/components/chat/ChatBubble.tsx
touch src/components/chat/ChatInput.tsx
touch src/components/chat/SmartReplyPanel.tsx
touch src/components/chat/TypingIndicator.tsx
touch src/components/chat/UrgentBanner.tsx
touch src/components/inbox/ChatList.tsx
touch src/components/inbox/ChatListItem.tsx
touch src/components/inbox/ConversationView.tsx
touch src/components/inbox/PatientDetail.tsx
touch src/components/inbox/TriagePanel.tsx
touch src/components/kb/QAEditor.tsx
touch src/components/kb/QAList.tsx
touch src/components/kb/DocumentUpload.tsx
touch src/components/kb/KBGapsPanel.tsx
touch src/components/kb/AIPreview.tsx
touch src/components/booking/BookingForm.tsx
touch src/components/booking/BookingCalendar.tsx
touch src/components/booking/SlotPicker.tsx
touch src/components/booking/AIBookingCard.tsx
touch src/components/dashboard/KPICard.tsx
touch src/components/dashboard/VolumeChart.tsx
touch src/components/dashboard/AIPerformanceSection.tsx
touch src/components/dashboard/AnomalyBanner.tsx
touch src/components/layout/StaffSidebar.tsx
touch src/components/layout/AdminSidebar.tsx
touch src/components/layout/PatientBottomNav.tsx
touch src/components/layout/AppHeader.tsx
touch src/components/shared/StatusPill.tsx
touch src/components/shared/Avatar.tsx
touch src/components/shared/EmptyState.tsx
touch src/components/shared/ErrorBoundary.tsx

# Lib
touch src/lib/supabase/client.ts
touch src/lib/supabase/server.ts
touch src/lib/supabase/middleware.ts
touch src/lib/ai/anthropic.ts
touch src/lib/ai/gatekeeper.ts
touch src/lib/ai/smart-reply.ts
touch src/lib/ai/triage.ts
touch src/lib/ai/routing.ts
touch src/lib/ai/prompts.ts
touch src/lib/voyage.ts
touch src/lib/kb.ts
touch src/lib/utils.ts
touch src/lib/constants.ts

# Types
touch src/types/database.ts
touch src/types/chat.ts
touch src/types/ai.ts
touch src/types/index.ts

# Hooks
touch src/hooks/useRealtimeChat.ts
touch src/hooks/useConversations.ts
touch src/hooks/useSmartReply.ts
touch src/hooks/useCurrentUser.ts

# Store
touch src/store/chatStore.ts
touch src/store/inboxStore.ts
touch src/store/uiStore.ts

# Supabase migrations
touch supabase/migrations/001_core_tables.sql
touch supabase/migrations/002_kb_tables.sql
touch supabase/migrations/003_audit_tables.sql
touch supabase/migrations/004_rls_policies.sql
touch supabase/migrations/005_match_kb_rpc.sql

# .env.example
cat > .env.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Voyage AI
VOYAGE_API_KEY=pa-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo ""
echo "✅ Project structure created!"
echo ""
echo "📁 Folders created:"
echo "   src/app/ — Next.js App Router (auth, patient, staff, admin)"
echo "   src/components/ — UI components (chat, inbox, kb, booking, dashboard)"
echo "   src/lib/ — Core utilities (supabase, ai, voyage, kb)"
echo "   src/types/ — TypeScript types"
echo "   src/hooks/ — Custom React hooks"
echo "   src/store/ — Zustand stores"
echo "   supabase/migrations/ — SQL migration files"
echo ""
echo "📝 Next steps:"
echo "   1. Copy globals.css → src/app/globals.css"
echo "   2. Copy tailwind.config.ts → tailwind.config.ts"
echo "   3. Copy constants.ts → src/lib/constants.ts"
echo "   4. Fill in .env.local dengan credentials kamu"
echo "   5. Run: npm run dev"
echo ""
echo "🚀 Ready to code Sehati CRM!"
