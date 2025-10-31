# Opportunities & Engagement Module - Development Plan

## Overview
This module will manage opportunities including Scholarships, Postdocs, Seminars, Forums, Workshops, and Conferences. It will provide both public (limited) and authenticated (full) views of opportunity details.

## Module Structure

```
src/modules/opportunities/
├── opportunities.module.ts
├── constants.ts
├── controller/
│   └── opportunities.controller.ts
├── persistencies/
│   ├── opportunity.entity.ts
│   └── opportunity.repository.ts
├── usecase/
│   ├── opportunity.command.ts
│   ├── opportunity.response.ts
│   └── opportunity.service.ts
└── dto/
    └── opportunity-filter.dto.ts
```

## Database Schema

### Opportunity Entity
```typescript
- id: UUID (Primary Key)
- category: enum (SCHOLARSHIP | POSTDOC | SEMINAR | FORUM | WORKSHOP | CONFERENCE)
- title: string
- organizer: string
- summary: string (Public view - max 60 words)
- eligibility: string (Authenticated view)
- requirements: string (Authenticated view)
- benefits: string (Authenticated view)
- deadline: Date (Application deadline or event date)
- eventDate: Date (For events like seminars, workshops, conferences)
- officialLink: string (URL)
- location: string (Local, Regional, or Global)
- locationType: enum (LOCAL | REGIONAL | GLOBAL)
- isActive: boolean
- isFeatured: boolean
- viewCount: number
- createdAt: Date
- updatedAt: Date
- deletedAt: Date (Soft delete)
```

## Features

### 1. Public API Endpoints (No Authentication Required)
- `GET /api/opportunities` - List all active opportunities (public summary only)
- `GET /api/opportunities/:id/public` - Get public details of a specific opportunity
- `GET /api/opportunities/category/:category` - Filter by category
- `GET /api/opportunities/featured` - Get featured opportunities

### 2. Authenticated API Endpoints (Authentication Required)
- `GET /api/opportunities/:id` - Get full details (eligibility, requirements, benefits)
- `POST /api/opportunities` - Create new opportunity (Admin only)
- `PUT /api/opportunities/:id` - Update opportunity (Admin only)
- `DELETE /api/opportunities/:id` - Delete opportunity (Admin only)
- `POST /api/opportunities/:id/view` - Track view count

### 3. Response Structure

**Public Response:**
```json
{
  "id": "uuid",
  "category": "POSTDOC",
  "title": "Postdoctoral Fellowship in Renewable Energy Systems",
  "organizer": "Addis Ababa University & African Research Council",
  "summary": "Fully funded postdoctoral research opportunity... Login to explore full details and apply.",
  "deadline": "2026-02-28",
  "location": "Local / Africa-wide",
  "locationType": "REGIONAL",
  "isFeatured": true
}
```

**Authenticated Response:**
```json
{
  "id": "uuid",
  "category": "POSTDOC",
  "title": "Postdoctoral Fellowship in Renewable Energy Systems",
  "organizer": "Addis Ababa University & African Research Council",
  "summary": "Fully funded postdoctoral research opportunity... Login to explore full details and apply.",
  "eligibility": "Open to PhD holders in engineering or environmental sciences.",
  "requirements": "Research proposal, academic CV, and two references.",
  "benefits": "Monthly stipend, research funding, and access to advanced laboratories.",
  "deadline": "2026-02-28",
  "eventDate": null,
  "officialLink": "https://aau.edu.et/postdoc2026",
  "location": "Local / Africa-wide",
  "locationType": "REGIONAL",
  "isFeatured": true,
  "viewCount": 150
}
```

## Implementation Steps

### Phase 1: Core Infrastructure
1. Create module structure
2. Define constants (enums for category, locationType, status)
3. Create entity with all fields
4. Create repository
5. Create module file and register in app.module.ts

### Phase 2: DTOs & Commands
1. Create opportunity.command.ts (Create, Update DTOs)
2. Create opportunity.response.ts (Public & Authenticated responses)
3. Create filter DTOs for search/filtering

### Phase 3: Service Layer
1. Create opportunity.service.ts with CRUD operations
2. Implement public vs authenticated view logic
3. Add filtering and search functionality
4. Add view count tracking

### Phase 4: Controller Layer
1. Create opportunities.controller.ts
2. Implement public endpoints (no auth required)
3. Implement authenticated endpoints (auth required)
4. Add Swagger documentation
5. Add proper error handling

### Phase 5: Integration
1. Register module in app.module.ts
2. Add entity to TypeORM entities array
3. Test all endpoints
4. Add validation and error handling

## Validation Rules

1. **Summary (Public View):**
   - Required
   - Max 60 words
   - Must end with call-to-action: "Login to explore full details and apply."

2. **Category:**
   - Required
   - Must be one of: SCHOLARSHIP, POSTDOC, SEMINAR, FORUM, WORKSHOP, CONFERENCE

3. **Title:**
   - Required
   - Min 10 characters, Max 200 characters

4. **Organizer:**
   - Required
   - Max 200 characters

5. **Deadline/EventDate:**
   - Required
   - Must be future date

6. **Official Link:**
   - Required
   - Must be valid URL

## Security Considerations

1. Public endpoints return limited data (summary only)
2. Authenticated endpoints return full details
3. Admin endpoints (create/update/delete) require admin role
4. Input validation on all endpoints
5. SQL injection prevention (TypeORM parameterized queries)
6. XSS prevention (sanitize user inputs)

## Database Migration

Will use TypeORM synchronization (synchronize: true) as per existing pattern in the codebase.

## Testing Strategy

1. Unit tests for service methods
2. Integration tests for API endpoints
3. Test public vs authenticated views
4. Test filtering and search
5. Test validation rules

## Future Enhancements

1. User favorites/bookmarks for opportunities
2. Email notifications for new opportunities matching user profile
3. Application tracking for opportunities
4. Admin dashboard for opportunity management
5. Analytics and reporting
6. Bulk import functionality
7. Opportunity recommendations based on user profile

## File Naming Conventions

Following existing patterns:
- Entity: `opportunity.entity.ts`
- Repository: `opportunity.repository.ts`
- Command: `opportunity.command.ts`
- Response: `opportunity.response.ts`
- Service: `opportunity.service.ts`
- Controller: `opportunities.controller.ts`
- Module: `opportunities.module.ts`
- Constants: `constants.ts`

## Dependencies

No new external dependencies required. Will use:
- @nestjs/common
- @nestjs/typeorm
- typeorm
- class-validator
- @nestjs/swagger

## Estimated Implementation Time

- Phase 1: 1-2 hours
- Phase 2: 1 hour
- Phase 3: 2-3 hours
- Phase 4: 2 hours
- Phase 5: 1 hour

**Total: 7-9 hours**

