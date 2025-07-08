# Nunuza Project Brief

## Mission
Create a modern, multilingual digital marketplace for East Africa connecting buyers and sellers across Uganda, Kenya, Tanzania, Rwanda, and Burundi.

## Target Markets & Languages
**CRITICAL: All development MUST target East African markets with English as the primary language**

### Target Countries
- Uganda (primary market)
- Kenya 
- Tanzania
- Rwanda
- Burundi

### Supported Languages
1. **English** (Primary) - Main language for all interfaces
2. **French** - For francophone regions
3. **Swahili** - Regional lingua franca

**⚠️ IMPORTANT: All UI text, messages, and content MUST be in English by default with translation support for French and Swahili. NEVER use Hebrew or any other language.**

## Translation Requirements
Every feature and component must:
- Use the translation system (`useTranslation` hook)
- Have complete translations in all three languages
- Default to English
- Follow the existing translation patterns in `/src/locales/`

## Technology Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Database, Auth, Storage)
- React i18next for translations

## Core Features
1. User authentication and profiles
2. Post creation and management
3. Image upload and management
4. Category-based browsing
5. Search and filtering
6. Real-time dashboard
7. Multilingual support

## Business Rules
- Free to post and browse
- User-generated content
- Community-driven marketplace
- Mobile-first design
- Focus on local trade and commerce

**Last Updated:** January 2025 