# User Memory System — Implementation Plan

## Overview
Add a persistent memory system where the AI astrologer remembers key personal facts about the user across all chats (like Claude/ChatGPT memory). Facts are extracted after each conversation, merged with existing memory, kept under 2000 tokens, and injected into the system prompt.

---

## 1. Database: new `user_memories` table

**Migration file**: `supabase/migrations/005_user_memories.sql`

```sql
CREATE TABLE user_memories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  content    TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_memories_user_id ON user_memories(user_id);

ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memories" ON user_memories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON user_memories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON user_memories
  FOR DELETE USING (auth.uid() = user_id);
```

One row per user. `content` is a plain-text block of facts (bullet points), max ~2000 tokens.

**TypeScript types**: Add `user_memories` to `src/types/database.ts`.

---

## 2. Memory Extraction (in chat API route)

**File**: `src/app/api/chat/route.ts`

After the streaming response finishes (after saving the assistant message, around line 317), trigger memory extraction **asynchronously** (don't block the response — use `waitUntil` pattern or fire-and-forget):

1. Load existing memory from `user_memories` for this user
2. Call Claude Haiku with a special prompt:
   - Input: the user's message + assistant's reply + existing memory
   - Task: "Extract key personal facts worth remembering. Merge with existing facts. Remove duplicates. Keep concise bullet points. Max 2000 tokens. Output ONLY the updated memory block."
3. Upsert the result into `user_memories`

**Key design decisions**:
- Use `claude-haiku-4-5-20251001` (same model, cheap and fast)
- Fire-and-forget after `controller.close()` — don't slow down chat
- Only extract from the current exchange (user msg + assistant reply), not entire history
- Don't count memory extraction tokens against user's quota

---

## 3. System Prompt Injection

**File**: `src/app/api/chat/route.ts`

Before building `systemPrompt` (around line 204):

1. Load `user_memories.content` for the current user
2. If non-empty, append a `MEMORY` section to the system prompt:

```
USER MEMORY (facts you've learned about this person across conversations — reference naturally, don't list them):
- Loves astronomy since childhood
- Has a partner named Alex, Scorpio
- Works in marketing
- ...
```

Place it after chart context, before STYLE section.

---

## 4. Settings UI — Memory Section

**File**: `src/app/[locale]/(app)/app/settings/page.tsx`

Add a new `Section` between Notifications and Security:

- Title: "Memory" (translated)
- Shows the current memory content in a read-only view (or "No memories yet" placeholder)
- **Edit button**: opens inline textarea for editing memory text, with Save/Cancel
- **Clear button**: deletes all memory with confirmation

API calls:
- GET memory: fetch from `user_memories` table via Supabase client (already authenticated)
- UPDATE memory: update `user_memories.content` via Supabase client
- CLEAR memory: delete row from `user_memories` via Supabase client

---

## 5. API Route for Memory (for settings page)

**File**: `src/app/api/memory/route.ts`

- `GET` — returns user's memory content
- `PUT` — updates memory content (from settings edit)
- `DELETE` — clears memory

Actually, since Settings is a client component using Supabase client directly, we can use the Supabase client for reads/updates (RLS protects it). No separate API route needed. But for the clear action, we can also use Supabase client directly with `.delete()`.

---

## 6. Translations

Add keys to all 4 locale files (`messages/{en,ru,uk,pl}.json`) under `settings` namespace:

- `memoryTitle` — "Memory" / "Память" / "Пам'ять" / "Pamięć"
- `memoryDesc` — "Personal facts the astrologer remembers about you"
- `memoryEmpty` — "No memories yet. Chat with the astrologer and they'll start remembering key facts about you."
- `memoryEdit` — "Edit" / "Редактировать" / "Редагувати" / "Edytuj"
- `memorySave` — "Save" / "Сохранить" / "Зберегти" / "Zapisz"
- `memoryCancel` — "Cancel" (already exists as common)
- `memoryClear` — "Clear memory" / "Очистить память" / "Очистити пам'ять" / "Wyczyść pamięć"
- `memoryClearConfirm` — "Are you sure? The astrologer will forget everything about you."
- `memoryClearDone` — "Memory cleared"

---

## 7. Files to Create/Modify

### New files:
1. `supabase/migrations/005_user_memories.sql` — migration

### Modified files:
1. `src/types/database.ts` — add `user_memories` table types
2. `src/app/api/chat/route.ts` — load memory → inject into prompt → extract after response
3. `src/app/[locale]/(app)/app/settings/page.tsx` — Memory section UI
4. `messages/en.json` — memory translation keys
5. `messages/ru.json` — memory translation keys
6. `messages/uk.json` — memory translation keys
7. `messages/pl.json` — memory translation keys

---

## 8. Memory Extraction Prompt

```
You are a memory extraction assistant. Given a conversation exchange between a user and an AI astrologer, extract key personal facts worth remembering about the user.

EXISTING MEMORY:
{existing_memory}

NEW EXCHANGE:
User: {user_message}
Assistant: {assistant_response}

INSTRUCTIONS:
- Extract only concrete personal facts: name, relationships, zodiac signs, life events, preferences, goals, concerns
- Merge with existing memory — update contradicting facts, remove duplicates
- Keep as concise bullet points (one fact per line, starting with "- ")
- Maximum 30 bullet points
- If no new facts worth remembering, return existing memory unchanged
- Output ONLY the bullet list, nothing else
- If there are no facts at all, output empty string
```

---

## 9. Edge Cases

- **First chat ever**: No memory exists → extract from first exchange, insert new row
- **No new facts**: Memory extraction returns same content → skip update
- **Token limit**: The extraction prompt + response is ~500-1000 tokens — negligible cost
- **Concurrent chats**: Unlikely but possible race condition — last write wins (acceptable)
- **User edits memory**: Their edit is authoritative — next extraction merges with it
- **User clears memory**: Next chat starts fresh extraction
