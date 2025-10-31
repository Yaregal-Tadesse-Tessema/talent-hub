# UI Development Prompt: Opportunities & Engagement Module

## Overview
Create a complete, modern, and user-friendly UI for the **Opportunities & Engagement Module** that allows users to browse, search, and view opportunities (Scholarships, Postdocs, Seminars, Forums, Workshops, Conferences) with different access levels for public and authenticated users.

## API Base URL
```
Base URL: https://talent-hub.org/api/opportunities
```

## API Endpoints Reference

### Public Endpoints (No Authentication Required)
1. **GET `/api/opportunities`** - List all active opportunities (public summary only)
   - Query params: `category`, `locationType`, `isFeatured`, `isActive`, `page`, `limit`
   - Response: `OpportunityListResponse` with pagination

2. **GET `/api/opportunities/featured`** - Get featured opportunities
   - Response: Array of `OpportunityPublicResponse`

3. **GET `/api/opportunities/category/:category`** - Filter by category
   - Categories: `SCHOLARSHIP`, `POSTDOC`, `SEMINAR`, `FORUM`, `WORKSHOP`, `CONFERENCE`
   - Query params: `page`, `limit`, `locationType`, `isFeatured`

4. **GET `/api/opportunities/:id/public`** - Get public details of a specific opportunity
   - Response: `OpportunityPublicResponse`

### Authenticated Endpoints (Requires Bearer Token)
5. **GET `/api/opportunities/:id`** - Get full details (eligibility, requirements, benefits)
   - Headers: `Authorization: Bearer <token>`
   - Response: `OpportunityFullResponse`

6. **POST `/api/opportunities/:id/view`** - Track view count
   - Headers: `Authorization: Bearer <token>`

### Admin Endpoints (Requires Admin Role + Bearer Token)
7. **POST `/api/opportunities`** - Create new opportunity
   - Body: `CreateOpportunityCommand`
   - Response: `OpportunityFullResponse`

8. **GET `/api/opportunities/admin/all`** - Get all opportunities (admin view)
   - Query params: `category`, `locationType`, `isFeatured`, `isActive`, `page`, `limit`
   - Response: `DataResponseFormat<OpportunityFullResponse>`

9. **PUT `/api/opportunities/:id`** - Update opportunity
   - Body: `UpdateOpportunityCommand`
   - Response: `OpportunityFullResponse`

10. **DELETE `/api/opportunities/:id`** - Delete opportunity
    - Response: `{ success: boolean }`

## Data Models

### OpportunityPublicResponse (Public View)
```typescript
{
  id: string;
  category: 'SCHOLARSHIP' | 'POSTDOC' | 'SEMINAR' | 'FORUM' | 'WORKSHOP' | 'CONFERENCE';
  title: string;
  organizer: string;
  summary: string; // Max 60 words, ends with CTA
  deadline: Date;
  eventDate?: Date;
  location: string;
  locationType: 'LOCAL' | 'REGIONAL' | 'GLOBAL';
  isFeatured: boolean;
  createdAt: Date;
}
```

### OpportunityFullResponse (Authenticated View)
```typescript
{
  // All fields from PublicResponse +
  eligibility?: string;
  requirements?: string;
  benefits?: string;
  officialLink: string;
  isActive: boolean;
  viewCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DRAFT';
  updatedAt: Date;
}
```

## UI Requirements

### 1. Public Pages (No Login Required)

#### 1.1 Opportunities Listing Page (`/opportunities`)
**Features:**
- Hero section with search bar and category filters
- Featured opportunities carousel/section at the top
- Grid/List view toggle
- Filter sidebar:
  - Category filter (chips/tabs): All, Scholarship, Postdoc, Seminar, Forum, Workshop, Conference
  - Location filter: Local, Regional, Global
  - Featured toggle
- Opportunity cards showing:
  - Category badge with color coding
  - Title
  - Organizer
  - Summary (truncated)
  - Location badge
  - Deadline countdown ("5 days remaining")
  - "View Details" button → Opens public detail page
  - Featured badge (if featured)
- Pagination
- Empty state with illustration
- Loading skeletons

**Design:**
- Modern, clean design
- Responsive (mobile-first)
- Accessible (WCAG 2.1 AA)
- Card-based layout with hover effects
- Clear visual hierarchy

#### 1.2 Opportunity Public Detail Page (`/opportunities/:id`)
**Features:**
- Breadcrumb navigation
- Opportunity header:
  - Category badge
  - Title
  - Organizer name
  - Location badge
  - Deadline countdown
- Summary section (public summary)
- Call-to-action banner:
  - "Login to view full details and apply"
  - Login button (redirects to `/login?redirect=/opportunities/:id`)
  - "Apply Now" button (disabled until login)
- Related opportunities section
- Share buttons (social media)
- Back to list button

**Design:**
- Single column layout
- Prominent CTA banner
- Clear typography
- Mobile-responsive

### 2. Authenticated Pages (Login Required)

#### 2.1 Opportunity Full Detail Page (`/opportunities/:id` - after login)
**Features:**
- All public content PLUS:
  - Eligibility section (expandable/collapsible)
  - Requirements section (expandable/collapsible)
  - Benefits section (expandable/collapsible)
  - Official link button (external link)
  - "Apply Now" button (links to officialLink)
  - View count display
- Save/bookmark functionality (future)
- Share functionality
- Print/Export to PDF option

**Design:**
- Same layout as public page
- Additional sections clearly marked
- Smooth expand/collapse animations

### 3. Admin Pages (Admin Role Required)

#### 3.1 Admin Dashboard (`/admin/opportunities`)
**Features:**
- Statistics cards:
  - Total opportunities
  - Active opportunities
  - Featured opportunities
  - Total views
- Data table with:
  - All opportunities (full details)
  - Columns: Title, Category, Organizer, Deadline, Status, Views, Actions
  - Sortable columns
  - Row actions: Edit, Delete, Toggle Active, Toggle Featured
  - Bulk actions: Delete, Activate, Deactivate
- Filters:
  - Category dropdown
  - Status dropdown
  - Location type dropdown
  - Search by title/organizer
- Pagination
- Export to CSV/Excel

#### 3.2 Create/Edit Opportunity Form (`/admin/opportunities/create` or `/admin/opportunities/:id/edit`)
**Features:**
- Multi-step form or single form with sections:
  1. **Basic Information:**
     - Category (required, dropdown)
     - Title (required, max 200 chars)
     - Organizer (required, max 200 chars)
     - Location (required)
     - Location Type (dropdown: Local, Regional, Global)
  
  2. **Public Summary:**
     - Summary textarea (required, max 400 chars)
     - Character counter
     - Validation message: "Must end with 'Login to explore full details and apply.'"
     - Preview box showing word count
  
  3. **Authenticated Details:**
     - Eligibility (optional, rich text editor)
     - Requirements (optional, rich text editor)
     - Benefits (optional, rich text editor)
  
  4. **Dates & Links:**
     - Deadline (required, date picker, must be future date)
     - Event Date (optional, date picker, for events)
     - Official Link (required, URL input with validation)
  
  5. **Settings:**
     - Is Active (toggle)
     - Is Featured (toggle)
     - Status (dropdown: Active, Inactive, Draft, Expired)
  
- Form validation:
  - Real-time validation
  - Error messages below fields
  - Submit button disabled until valid
- Save as Draft functionality
- Preview mode
- Cancel button (with confirmation if unsaved changes)

**Design:**
- Clean form layout
- Clear section headers
- Helpful placeholder text
- Validation feedback
- Responsive design

## Component Structure

### Suggested Component Hierarchy

```
src/
├── pages/
│   ├── opportunities/
│   │   ├── OpportunitiesListPage.tsx
│   │   ├── OpportunityDetailPage.tsx
│   │   └── OpportunityCategoryPage.tsx
│   └── admin/
│       └── opportunities/
│           ├── AdminOpportunitiesPage.tsx
│           ├── CreateOpportunityPage.tsx
│           └── EditOpportunityPage.tsx
│
├── components/
│   ├── opportunities/
│   │   ├── OpportunityCard.tsx
│   │   ├── OpportunityFilters.tsx
│   │   ├── FeaturedOpportunities.tsx
│   │   ├── OpportunityDetailHeader.tsx
│   │   ├── OpportunityDetailContent.tsx
│   │   ├── EligibilitySection.tsx
│   │   ├── RequirementsSection.tsx
│   │   ├── BenefitsSection.tsx
│   │   └── OpportunityCTA.tsx
│   └── admin/
│       └── opportunities/
│           ├── OpportunityForm.tsx
│           ├── OpportunityStats.tsx
│           ├── OpportunitiesTable.tsx
│           └── OpportunityFormSteps.tsx
│
├── services/
│   └── api/
│       └── opportunitiesApi.ts
│
├── hooks/
│   ├── useOpportunities.ts
│   ├── useOpportunity.ts
│   └── useAdminOpportunities.ts
│
├── types/
│   └── opportunities.ts
│
└── utils/
    └── opportunityHelpers.ts
```

## Integration Details

### API Service Layer (`opportunitiesApi.ts`)
```typescript
// Example structure (adapt to your HTTP client - axios, fetch, etc.)

const API_BASE = '/api/opportunities';

export const opportunitiesApi = {
  // Public endpoints
  getAllPublic: (filters?: OpportunityFilterDto) => 
    GET(`${API_BASE}`, { params: filters }),
  
  getFeatured: () => 
    GET(`${API_BASE}/featured`),
  
  getByCategory: (category: string, filters?: OpportunityFilterDto) => 
    GET(`${API_BASE}/category/${category}`, { params: filters }),
  
  getPublicDetail: (id: string) => 
    GET(`${API_BASE}/${id}/public`),
  
  // Authenticated endpoints
  getFullDetail: (id: string, token: string) => 
    GET(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  
  trackView: (id: string, token: string) => 
    POST(`${API_BASE}/${id}/view`, {}, { headers: { Authorization: `Bearer ${token}` } }),
  
  // Admin endpoints
  getAllAdmin: (filters?: OpportunityFilterDto, token?: string) => 
    GET(`${API_BASE}/admin/all`, { params: filters, headers: { Authorization: `Bearer ${token}` } }),
  
  create: (data: CreateOpportunityCommand, token: string) => 
    POST(`${API_BASE}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  
  update: (id: string, data: UpdateOpportunityCommand, token: string) => 
    PUT(`${API_BASE}/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),
  
  delete: (id: string, token: string) => 
    DELETE(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
};
```

### React Query Hooks Example
```typescript
// useOpportunities.ts
import { useQuery } from '@tanstack/react-query';
import { opportunitiesApi } from '../services/api/opportunitiesApi';

export const useOpportunities = (filters?: OpportunityFilterDto) => {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => opportunitiesApi.getAllPublic(filters),
  });
};

export const useOpportunity = (id: string, authenticated = false) => {
  const token = useAuthToken(); // Your auth hook
  return useQuery({
    queryKey: ['opportunity', id, authenticated],
    queryFn: () => authenticated 
      ? opportunitiesApi.getFullDetail(id, token)
      : opportunitiesApi.getPublicDetail(id),
    enabled: !!id,
  });
};
```

## Design Specifications

### Color Coding by Category
- **Scholarship**: Blue (#3B82F6)
- **Postdoc**: Purple (#8B5CF6)
- **Seminar**: Green (#10B981)
- **Forum**: Orange (#F59E0B)
- **Conference**: Red (#EF4444)
- **Workshop**: Teal (#14B8A6)

### Typography
- Headings: Bold, clear hierarchy
- Body: Readable font size (16px minimum)
- Links: Underlined, color contrast

### Spacing
- Consistent padding/margins (8px grid system)
- Card padding: 24px
- Section spacing: 48px

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Alt text for images
- Screen reader friendly
- Color contrast ratio ≥ 4.5:1

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## User Flows

### Flow 1: Public User Browsing
1. User visits `/opportunities`
2. Sees featured opportunities carousel
3. Browses all opportunities or filters by category
4. Clicks on opportunity card
5. Views public detail page
6. Sees CTA to login
7. Clicks "Login" → Redirected to login page
8. After login → Redirected back to opportunity detail page with full details

### Flow 2: Authenticated User Viewing
1. User (logged in) visits `/opportunities/:id`
2. Sees full details including eligibility, requirements, benefits
3. Clicks "Apply Now" → Opens official link in new tab
4. Can share opportunity

### Flow 3: Admin Creating Opportunity
1. Admin navigates to `/admin/opportunities`
2. Clicks "Create New Opportunity"
3. Fills out form step by step
4. Validates summary ends with CTA
5. Sets deadline (must be future date)
6. Saves opportunity
7. Sees success message
8. Redirected to opportunities list

### Flow 4: Admin Managing Opportunities
1. Admin views opportunities table
2. Filters by category/status
3. Edits opportunity inline or via edit page
4. Toggles active/featured status
5. Deletes opportunity (with confirmation)

## Technical Requirements

### Frontend Framework
- React 18+ (or Next.js, Vue, Angular - adapt as needed)
- TypeScript for type safety
- State management: React Query / TanStack Query (recommended) or Redux
- Form handling: React Hook Form + Zod/Yup validation
- HTTP client: Axios or Fetch API
- UI library: Tailwind CSS, Material-UI, Chakra UI, or Ant Design

### Key Features to Implement
1. **Pagination**: Client-side or server-side pagination
2. **Filtering**: Real-time filter updates with URL query params
3. **Search**: Debounced search functionality
4. **Loading States**: Skeleton loaders during API calls
5. **Error Handling**: Toast notifications for errors
6. **Success Messages**: Confirmation toasts for actions
7. **Date Formatting**: Use date-fns or dayjs for date display
8. **Countdown Timer**: Show days remaining until deadline
9. **URL Management**: Use React Router for navigation
10. **Authentication**: Check auth status, redirect if needed

### State Management
- Query cache for API responses
- Optimistic updates for admin actions
- Form state management
- Filter state in URL params

### Performance Optimizations
- Lazy loading for images
- Virtual scrolling for long lists
- Code splitting for routes
- Memoization for expensive computations
- Debouncing for search/filters

## Validation Rules (Frontend)

### Summary Field
- Max 400 characters
- Must end with: "Login to explore full details and apply" (case-insensitive)
- Real-time character count
- Word count indicator (max 60 words)

### Deadline Field
- Required
- Must be future date
- Date picker with min date = today

### Official Link
- Required
- Must be valid URL (https://)
- URL validation on blur

### Title
- Required
- Min 10 characters
- Max 200 characters

## Error Handling

### API Error Scenarios
- 401 Unauthorized → Redirect to login
- 403 Forbidden → Show "Access Denied" message
- 404 Not Found → Show "Opportunity not found" page
- 400 Bad Request → Show validation errors
- 500 Server Error → Show generic error message

### User-Friendly Error Messages
- Network errors: "Unable to connect. Please check your internet."
- Validation errors: Show field-specific messages
- Not found: "This opportunity is no longer available."

## Success Messages
- "Opportunity created successfully!"
- "Opportunity updated successfully!"
- "Opportunity deleted successfully!"
- "Opportunity status updated!"

## Testing Requirements
- Unit tests for components
- Integration tests for API calls
- E2E tests for critical user flows
- Accessibility testing
- Cross-browser testing

## Additional Features (Optional)
1. **Favorites/Bookmarks**: Save opportunities for later
2. **Email Notifications**: Notify users of new opportunities
3. **Export to Calendar**: Add event dates to calendar
4. **Print-Friendly View**: Print opportunity details
5. **Share on Social Media**: Direct share buttons
6. **Related Opportunities**: Show similar opportunities
7. **Search Functionality**: Full-text search
8. **Sort Options**: Sort by deadline, date added, popularity

## Deliverables Checklist
- [ ] Public opportunities listing page
- [ ] Public opportunity detail page
- [ ] Authenticated opportunity detail page
- [ ] Admin dashboard page
- [ ] Admin create/edit form
- [ ] API integration service
- [ ] React Query hooks
- [ ] TypeScript types/interfaces
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Accessibility features
- [ ] Form validation
- [ ] Pagination
- [ ] Filtering
- [ ] Category badges
- [ ] Deadline countdown
- [ ] Share functionality
- [ ] Admin CRUD operations

## Notes
- Use consistent design system with existing TalentHub UI
- Follow existing code patterns and conventions
- Ensure mobile responsiveness
- Implement proper SEO meta tags for public pages
- Add analytics tracking for user interactions
- Consider implementing caching strategy for API calls
