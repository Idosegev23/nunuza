# Technical Context - Nunuza Technology Stack

## Core Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router, SSR, and static generation
- **TypeScript**: Full type safety across the application
- **React 18**: Modern React with concurrent features and hooks

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL database
  - Project ID: `efzperffqmwfuflulokk`
  - URL: `https://efzperffqmwfuflulokk.supabase.co`
  - Authentication, real-time subscriptions, and storage
- **PostgreSQL**: Relational database with advanced features
- **Row-Level Security (RLS)**: Database-level security policies

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Comprehensive icon library
- **Custom CSS Variables**: Brand color system
- **Headless UI**: Unstyled, accessible UI components

### State Management
- **Zustand**: Lightweight state management for global state
- **React Query Pattern**: Server state management with custom hooks
- **React Hook Form**: Form state management with validation

### Authentication
- **Supabase Auth**: User authentication and session management
- **Google OAuth**: Third-party authentication integration
- **JWT Tokens**: Secure token-based authentication

### Internationalization
- **React i18next**: Internationalization framework
- **JSON Translation Files**: Organized by language and namespace
- **Dynamic Language Switching**: Real-time language changes

### Development Tools
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Static type checking
- **Git**: Version control
- **Node.js**: Development environment

## Environment Configuration

### Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://efzperffqmwfuflulokk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Analytics, monitoring, etc.
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

### Development Setup
```bash
# Node.js version requirement
Node.js 18.0.0 or higher

# Package manager
npm (included with Node.js)

# Development server
npm run dev

# Production build
npm run build
npm start
```

## Database Schema

### Core Tables
- **countries**: 5 East African countries with currency/language settings
- **cities**: Major cities with geographic coordinates
- **categories**: 15 product categories with multilingual names
- **users**: User profiles with authentication and preferences
- **posts**: Marketplace listings with rich metadata
- **admins**: Admin role management with hierarchy
- **favorites**: User-saved posts relationship table
- **reports**: Content reporting and moderation
- **notifications**: User notification system

### Database Features
- **Custom Enums**: User roles, post statuses, languages, currencies
- **Triggers**: Automatic timestamp updates and count maintenance
- **Functions**: Slug generation, view tracking, search optimization
- **Indexes**: Performance optimization for common queries
- **RLS Policies**: Row-level security for data protection

## API Architecture

### Supabase Client Configuration
```typescript
// Client-side configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

### Data Fetching Patterns
```typescript
// Custom hook pattern for data fetching
export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setData(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, loading, error };
}
```

## Security Implementation

### Authentication Flow
1. **User Registration**: Email verification required
2. **Session Management**: Automatic token refresh
3. **Role-Based Access**: Database-level permission checks
4. **Admin System**: Separate admin table with hierarchy

### Data Protection
- **RLS Policies**: Database-level access control
- **Input Validation**: Zod schema validation
- **XSS Prevention**: React's built-in protection
- **CSRF Protection**: Supabase's built-in security

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Lazy loading for route components
- **Image Optimization**: Next.js Image component
- **Static Generation**: Pre-rendered pages where possible
- **Caching**: Browser caching for static assets

### Database Optimization
- **Indexed Queries**: Proper database indexing
- **Query Optimization**: Efficient data fetching
- **Connection Pooling**: Supabase connection management
- **Real-time Subscriptions**: Efficient live updates

## Deployment Architecture

### Vercel Configuration
```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['efzperffqmwfuflulokk.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
```

### Build Process
```bash
# Build optimization
npm run build

# Static export (if needed)
npm run export

# Start production server
npm start
```

## Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Code review and merge
# Deploy to production
```

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code style enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

## Testing Strategy

### Unit Testing (Future)
- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing
- **MSW**: API mocking for tests

### Integration Testing (Future)
- **Cypress**: End-to-end testing
- **Playwright**: Cross-browser testing
- **Supabase Testing**: Database testing utilities

## Monitoring & Analytics

### Error Tracking (Future)
- **Sentry**: Error monitoring and reporting
- **LogRocket**: Session replay and debugging
- **Supabase Logs**: Database and API monitoring

### Performance Monitoring
- **Core Web Vitals**: Page performance metrics
- **Lighthouse**: Performance auditing
- **Vercel Analytics**: Deployment and usage analytics

## Scalability Considerations

### Database Scalability
- **Connection Pooling**: Efficient database connections
- **Read Replicas**: Horizontal scaling for read operations
- **Indexing Strategy**: Optimized query performance
- **Caching Layer**: Redis for frequently accessed data

### Application Scalability
- **Serverless Functions**: Auto-scaling compute
- **CDN**: Global content delivery
- **Image Optimization**: Automatic image processing
- **Load Balancing**: Distributed request handling

## Third-Party Integrations

### Current Integrations
- **Google OAuth**: Authentication provider
- **Supabase**: Backend services
- **Vercel**: Hosting and deployment

### Future Integrations
- **Payment Gateways**: Stripe, PayPal, local payment methods
- **SMS Services**: User verification and notifications
- **Email Services**: Automated email campaigns
- **Analytics**: Google Analytics, Mixpanel
- **Chat Systems**: Real-time messaging

## Development Dependencies

### Core Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "@supabase/supabase-js": "^2.0.0",
  "tailwindcss": "^3.0.0",
  "react-i18next": "^13.0.0",
  "zustand": "^4.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0"
}
```

### Development Dependencies
```json
{
  "eslint": "^8.0.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "postcss": "^8.0.0",
  "autoprefixer": "^10.0.0"
}
```

This technical context provides the foundation for all development decisions and ensures consistent technology choices across the Nunuza marketplace platform. 