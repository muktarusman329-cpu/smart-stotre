# SMART-SORE Enterprise Architecture

## Overview
SMART-SORE has been refactored to enterprise-grade architecture with fault isolation, following patterns from Shopify, SAP Business One, Microsoft Dynamics 365, Oracle NetSuite, Odoo, Stripe Dashboard, Vercel Dashboard, and Linear.

## Key Architectural Principles

### 1. Fault Isolation
- **No single point of failure**: Each module operates independently
- **Component-level error boundaries**: Errors don't cascade to other components
- **Route-level isolation**: Each dashboard page has its own loading.tsx and error.tsx
- **Independent data fetching**: Each component fetches its own data via dedicated API hooks

### 2. Data Fetching Architecture
- **TanStack Query**: Replaced manual fetch() logic with React Query
- **Dedicated API hooks**: Each module has its own hook (useUsers, useProducts, useCustomers, etc.)
- **Automatic caching and invalidation**: Built-in cache management
- **Retry logic**: Automatic retry on failures
- **Background refetch**: Keeps data fresh without blocking UI

### 3. Loading States
- **Skeleton UI**: Replaced all spinners with skeleton components
- **Context-aware skeletons**: DashboardSkeleton, TableSkeleton, CardSkeleton, ChartSkeleton, etc.
- **Match final layout**: Skeletons mirror the actual component structure

### 4. Error Handling
- **ErrorBoundary components**: Wrap risky components (charts, tables, widgets)
- **Graceful degradation**: Failed components show error UI, rest of app continues
- **Retry buttons**: Users can retry failed operations without page reload
- **Route-level error.tsx**: Isolated error handling per route

### 5. Form Architecture
- **Reusable form components**: Single form component supports create/edit/view modes
- **React Hook Form + Zod**: Type-safe form validation
- **Dialog-based forms**: Forms open in modals with independent data fetching
- **Optimistic updates**: UI updates immediately, rolls back on error

### 6. Safe Rendering
- **Optional chaining**: All property access uses `?.` operator
- **Nullish coalescing**: Fallback values with `??` operator
- **Type-safe defaults**: Never assume data exists

### 7. React Keys
- **Stable keys**: All lists use stable IDs (_id, id, uuid) instead of index
- **Prevents re-render issues**: Ensures React can track items correctly

### 8. API Standardization
- **Consistent response format**: All endpoints return `{ success, data, error, message }`
- **Error handling**: Graceful error responses with proper status codes
- **Validation**: Server-side validation with clear error messages

### 9. Toast Notifications
- **Sonner**: Replaced alert() with modern toast notifications
- **Context-aware**: Success, error, warning, and info toasts
- **Non-blocking**: Toasts don't interrupt user flow

### 10. Lazy Loading
- **Dynamic imports**: Expensive components (charts, analytics) loaded on demand
- **Code splitting**: Reduces initial bundle size
- **Skeleton fallbacks**: Loading states during lazy load

## Folder Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── dashboard/          # Dashboard-specific endpoints
│   │   │   ├── stats/          # Independent stats endpoint
│   │   │   └── sales/          # Independent sales data endpoint
│   │   ├── users/              # User management
│   │   ├── products/           # Product management
│   │   ├── customers/          # Customer management
│   │   └── ...
│   └── dashboard/              # Dashboard pages
│       ├── users/              # Users page
│       │   ├── page.tsx        # Main component
│       │   ├── loading.tsx     # Route-level loading state
│       │   └── error.tsx       # Route-level error boundary
│       ├── products/           # Products page
│       └── ...
├── components/
│   ├── common/                 # Shared components
│   │   └── ErrorBoundary.tsx   # Component-level error boundary
│   ├── dialogs/                # Form dialogs
│   │   ├── FormDialog.tsx      # Reusable dialog wrapper
│   │   └── UserForm.tsx        # User form with CRUD modes
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── LazyDashboardCharts.tsx
│   │   ├── LazyAlertCard.tsx
│   │   └── LazyExecutiveHero.tsx
│   ├── loading/                # Skeleton components
│   │   ├── DashboardSkeleton.tsx
│   │   ├── TableSkeleton.tsx
│   │   ├── CardSkeleton.tsx
│   │   ├── ChartSkeleton.tsx
│   │   ├── ListSkeleton.tsx
│   │   ├── FormSkeleton.tsx
│   │   ├── DialogSkeleton.tsx
│   │   └── DetailsSkeleton.tsx
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       └── ...
├── hooks/                      # Custom React hooks
│   ├── useUsers.ts             # User API hooks
│   ├── useProducts.ts          # Product API hooks
│   ├── useCustomers.ts         # Customer API hooks
│   ├── useInventory.ts         # Inventory API hooks
│   ├── useOrders.ts            # Order API hooks
│   ├── usePromotions.ts        # Promotion API hooks
│   ├── useSuppliers.ts         # Supplier API hooks
│   ├── useSales.ts             # Sales API hooks
│   └── useDashboard.ts         # Dashboard API hooks
├── lib/
│   ├── api-client.ts           # Standardized API client
│   ├── query-client.ts         # TanStack Query configuration
│   └── ...
├── models/                     # Mongoose models
├── types/                      # TypeScript types
└── ...
```

## API Hooks Pattern

Each module follows this pattern:

```typescript
// hooks/useUsers.ts
export function useUsers(params?: UsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiGet<User[]>(`/api/users?${queryParams}`),
    select: (data) => data.data ?? [],
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<User>) => apiPost<User>('/api/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.error || 'Failed to create user');
    },
  });
}
```

## Component Pattern

```typescript
// Page component
export default function UsersPage() {
  const { data: users, isLoading, error, refetch } = useUsers();
  const deleteUser = useDeleteUser();

  if (isLoading) {
    return <CardSkeleton />;
  }

  if (error) {
    return <ErrorCard onRetry={refetch} />;
  }

  return (
    <ErrorBoundary>
      {users?.map((user) => (
        <UserCard key={user._id} user={user} />
      ))}
    </ErrorBoundary>
  );
}
```

## Benefits

1. **Fault Tolerance**: Single module failures don't crash the entire application
2. **Better UX**: Skeleton loaders provide better perceived performance
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Easy to add new modules following established patterns
5. **Type Safety**: TypeScript throughout with proper interfaces
6. **Performance**: Lazy loading, caching, and code splitting
7. **Developer Experience**: Consistent patterns across the codebase
8. **Production Ready**: Error handling, validation, and retry logic built-in

## Migration Status

✅ TanStack Query and Sonner installed
✅ ErrorBoundary component created
✅ Skeleton loading components created
✅ Shared API hooks structure created
✅ Dashboard pages have loading.tsx and error.tsx
✅ Users page refactored with TanStack Query
✅ Dashboard page refactored with independent fetching
✅ Reusable form components with CRUD modes
✅ Safe rendering implemented across components
✅ React keys use stable IDs
✅ API response format standardized
✅ alert() calls replaced with Sonner toasts
✅ Lazy loading for expensive modules
✅ Folder structure organized to enterprise standards
