# Routing Implementation Plan

## Overview

Migrate the app from state-based navigation (`AppNavigator.tsx`) to URL-based routing using **React Router v6**. This will enable:
- ✅ Browser back/forward button support
- ✅ Deep linking (shareable URLs)
- ✅ Preserved scroll position on navigation
- ✅ Better user experience with bookmarkable states

## URL Structure

```
/learn/                                          → Category selector
/learn/:category                                 → Subcategory selector
/learn/:category/:subcategory                    → Topic grid
/learn/:category/:subcategory/:topic             → Topic intro (lessons + quiz selector)
/learn/:category/:subcategory/:topic/lesson/:id  → Individual lesson view
/learn/:category/:subcategory/:topic/quiz        → Quiz (difficulty via query param: ?level=beginner|intermediate|advanced)
/learn/:category/:subcategory/:topic/results     → Quiz results page
```

### Parameter Encoding

- `category`: `spoken-languages` (from categories JSON)
- `subcategory`: `french` (topic ID)
- `topic`: `numbers` (topic ID)
- `lesson`: `numbers-1-10` (lesson ID)
- `level`: Query param `?level=easy|medium|hard` (maps to beginner|intermediate|advanced)

## Migration Phases

### Phase 1: Setup & Infrastructure (Week 1)
**Goal:** Install React Router, create route structure, set up layout wrapper

#### Tasks:
1. Install dependencies
   - `npm install react-router-dom`
   - Update package.json with new version

2. Create route structure in `src/routes/`
   ```
   src/routes/
   ├── index.tsx                  (root layout)
   ├── categories.tsx             (CategorySelector component)
   ├── subcategories.tsx          (SubcategorySelector component)
   ├── topics.tsx                 (TopicGrid component)
   ├── topic-intro.tsx            (TopicIntro component with lessons)
   ├── lesson.tsx                 (Individual lesson view)
   ├── quiz.tsx                   (Quiz component)
   └── results.tsx                (ResultsScreen component)
   ```

3. Create `RootLayout.tsx`
   - Header with DarkModeToggle
   - SkipToContentLink
   - Route outlet for content
   - Scroll restoration on route change

4. Update `src/App.tsx` to use BrowserRouter
   - Wrap App with `<BrowserRouter basename="/learn">`
   - Replace AppNavigator with RouterProvider setup

5. **Tests:** Create route structure tests (routing-phase-1.test.ts)

#### Files to Create/Modify:
- `src/routes/index.tsx` (new)
- `src/routes/categories.tsx` (new)
- `src/routes/subcategories.tsx` (new)
- `src/routes/topics.tsx` (new)
- `src/routes/topic-intro.tsx` (new)
- `src/routes/lesson.tsx` (new)
- `src/routes/quiz.tsx` (new)
- `src/routes/results.tsx` (new)
- `src/components/RootLayout.tsx` (new)
- `src/App.tsx` (modify)
- `package.json` (add react-router-dom)

#### Estimated Time: 2-3 hours

---

### Phase 2: Category & Subcategory Routes (Week 1-2)
**Goal:** Migrate category and subcategory selection to URL-based navigation

#### Tasks:
1. Update `CategorySelector` component
   - Remove `onSelectCategory` callback
   - Use `useNavigate()` to navigate to `/learn/:category`
   - Keep existing UI/styling

2. Update `SubcategorySelector` component
   - Use `useParams()` to get category from URL
   - Remove `onSelectSubcategory` callback
   - Use `useNavigate()` to navigate to `/learn/:category/:subcategory`

3. Create `useCategory()` and `useSubcategory()` custom hooks
   - Extract route params
   - Handle loading/error states
   - Validate params against available data

4. Add "back" button that uses `useNavigate(-1)` for browser back behavior

5. **Tests:** Update component tests to use MemoryRouter
   - Test navigation URLs
   - Test param extraction
   - Test back button behavior

#### Files to Modify:
- `src/routes/categories.tsx` (update with useNavigate)
- `src/routes/subcategories.tsx` (update with useParams, useNavigate)
- `src/components/navigation/CategorySelector.tsx` (replace callbacks with routing)
- `src/components/navigation/SubcategorySelector.tsx` (replace callbacks with routing)
- `tests/routing-phase-2.test.ts` (new)

#### Estimated Time: 2-3 hours

---

### Phase 3: Topic Grid & Intro Routes (Week 2)
**Goal:** Migrate topic selection and topic intro page to routing

#### Tasks:
1. Update `TopicGrid` component
   - Use `useNavigate()` to navigate to `/learn/:category/:subcategory/:topic`
   - Use `useParams()` to get category/subcategory from URL

2. Update `TopicIntro` component
   - Use `useParams()` to get category/subcategory/topic from URL
   - Extract difficulty level from query params: `?level=easy|medium|hard`
   - Use `useNavigate()` to navigate to quiz or lessons
   - Handle loading state for topic data

3. Create `useTopic()` custom hook
   - Fetch topic data based on URL params
   - Handle loading/error states
   - Validate topic exists

4. Handle quiz navigation
   - "Start Quiz" button navigates to `/learn/:category/:subcategory/:topic/quiz?level=easy|medium|hard`
   - Keep in-memory state or pass level through context

5. **Tests:** Update TopicIntro tests
   - Test URL param extraction
   - Test quiz navigation with query params
   - Test lesson loading

#### Files to Modify:
- `src/routes/topics.tsx` (update with useParams, useNavigate)
- `src/routes/topic-intro.tsx` (update with useParams, useNavigate, query params)
- `src/components/navigation/TopicGrid.tsx` (replace callback with useNavigate)
- `src/components/navigation/TopicIntro.tsx` (major refactor)
- `src/hooks/useTopic.ts` (new)
- `tests/routing-phase-3.test.ts` (new)

#### Estimated Time: 3-4 hours

---

### Phase 4: Lesson Routes (Week 2-3)
**Goal:** Make individual lessons have their own routes and views

#### Tasks:
1. Create new `LessonView` route component
   - URL: `/learn/:category/:subcategory/:topic/lesson/:lessonId`
   - Extract lesson ID from URL param
   - Fetch lesson content
   - Display lesson with navigation

2. Update `LessonTabs` component
   - Convert "Lessons" tab content to use routing
   - Make lesson links point to `/lesson/:id` URL
   - Update "back to topic" to navigate to topic intro

3. Create `useLesson()` custom hook
   - Fetch lesson based on URL params
   - Handle loading/error states

4. Add breadcrumb navigation
   - Show path: Category > Subcategory > Topic > Lesson
   - All breadcrumbs are clickable and navigate

5. **Tests:** Create lesson routing tests
   - Test lesson URL params
   - Test lesson data loading
   - Test back navigation

#### Files to Modify:
- `src/routes/lesson.tsx` (new)
- `src/components/learning/LessonTabs.tsx` (update)
- `src/hooks/useLesson.ts` (new)
- `tests/routing-phase-4.test.ts` (new)

#### Estimated Time: 3-4 hours

---

### Phase 5: Quiz & Results Routes (Week 3)
**Goal:** Migrate quiz to URL-based routing with results page

#### Tasks:
1. Update `Quiz` component
   - Use `useParams()` and `useSearchParams()` for route/query params
   - Get difficulty level from `?level=easy|medium|hard`
   - Use context/state for quiz state (current question index, answers)
   - Navigate to results on quiz completion

2. Create `ResultsScreen` route
   - URL: `/learn/:category/:subcategory/:topic/results`
   - Use context/state to access quiz results
   - Display score, percentage, review options
   - "Try again" button navigates back to quiz with `?level=` param
   - "Different level" button navigates to topic intro

3. Create `QuizContext` for managing quiz state
   - Store quiz questions, current index, answers, results
   - Persist across route changes
   - Clear on navigation away

4. Handle scroll restoration
   - Scroll to top when entering quiz
   - Preserve scroll when navigating within results

5. **Tests:** Create quiz routing tests
   - Test quiz URL params and query params
   - Test results navigation
   - Test context state management
   - Test back/forward browser buttons

#### Files to Modify:
- `src/routes/quiz.tsx` (major refactor)
- `src/routes/results.tsx` (major refactor)
- `src/components/learning/Quiz.tsx` (update for routing)
- `src/components/learning/ResultsScreen.tsx` (update for routing)
- `src/context/QuizContext.tsx` (new)
- `tests/routing-phase-5.test.ts` (new)

#### Estimated Time: 4-5 hours

---

### Phase 6: Cleanup & Optimization (Week 3-4)
**Goal:** Remove old state-based code, optimize, and finalize

#### Tasks:
1. Remove `AppNavigator.tsx`
   - No longer needed
   - Delete file

2. Update `App.tsx`
   - Clean up temporary imports
   - Finalize Router setup

3. Remove state management from components
   - Components should only read from URL/context
   - No more useState for navigation state

4. Add 404 page
   - Create error boundary for invalid routes
   - Show "Not Found" page for invalid URLs

5. Test scroll restoration
   - Test with browser back/forward
   - Test scroll position preservation

6. Performance optimization
   - Use React.lazy() for route components
   - Add Suspense boundaries
   - Measure load times

7. Update documentation
   - Update README with routing info
   - Add routing examples
   - Update LEARNINGS.md with routing lessons

8. Full integration tests
   - Test complete user journeys
   - Test browser back/forward
   - Test deep linking
   - Test scroll restoration

#### Files to Modify:
- `src/App.tsx` (final cleanup)
- `src/AppNavigator.tsx` (DELETE)
- `docs/LEARNINGS.md` (add routing section)
- `tests/integration.test.ts` (new comprehensive tests)

#### Estimated Time: 3-4 hours

---

## Implementation Details

### Route Configuration

```typescript
// src/main.tsx or src/routes/index.tsx
const router = createBrowserRouter([
  {
    path: '/learn',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <CategoriesRoute />
      },
      {
        path: ':category',
        element: <SubcategoriesRoute />
      },
      {
        path: ':category/:subcategory',
        element: <TopicsRoute />
      },
      {
        path: ':category/:subcategory/:topic',
        element: <TopicIntroRoute />
      },
      {
        path: ':category/:subcategory/:topic/lesson/:lessonId',
        element: <LessonRoute />
      },
      {
        path: ':category/:subcategory/:topic/quiz',
        element: <QuizRoute />
      },
      {
        path: ':category/:subcategory/:topic/results',
        element: <ResultsRoute />
      }
    ]
  }
], {
  basename: '/learn'
});
```

### Custom Hooks

```typescript
// src/hooks/useCategory.ts
export function useCategory() {
  const { category } = useParams();
  // Validate and return category data
}

// src/hooks/useSubcategory.ts
export function useSubcategory() {
  const { category, subcategory } = useParams();
  // Validate and return subcategory data
}

// Similar for useTopic, useLesson
```

### Context for Quiz State

```typescript
// src/context/QuizContext.tsx
interface QuizContextType {
  questions: Question[] | null;
  currentIndex: number;
  answers: Record<number, string[]>;
  results: QuizResults | null;
  setQuestions: (questions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  setAnswers: (answers: Record<number, string[]>) => void;
  setResults: (results: QuizResults) => void;
  clearQuiz: () => void;
}

export const QuizContext = createContext<QuizContextType>(/* ... */);
```

## Parallel Work: Maintaining Both Systems

During transition, both AppNavigator and Router can coexist:
- Routes can be implemented one at a time
- Old AppNavigator components can render new Route components
- Tests can use MemoryRouter for new routes
- Gradual migration reduces risk

## Testing Strategy

### Unit Tests (Phase by Phase)
- Route component rendering
- URL param extraction
- Navigation behavior
- Query param handling

### Integration Tests (Phase 6)
- Complete user journeys
- Browser back/forward
- Deep linking
- Scroll restoration
- Form state preservation

### Test Setup
```typescript
// Example: Testing with MemoryRouter
import { MemoryRouter } from 'react-router-dom';

describe('CategorySelector with routing', () => {
  it('navigates to subcategories on selection', () => {
    render(
      <MemoryRouter initialEntries={['/learn']}>
        <CategorySelector />
      </MemoryRouter>
    );
    // Test navigation behavior
  });
});
```

## Rollback Plan

If issues arise:
1. Keep AppNavigator.tsx until Phase 6
2. Switch between old and new navigation via feature flag
3. Or revert specific phase if needed
4. Tests allow quick validation of issues

## Timeline Summary

| Phase | Duration | Priority | Risk |
|-------|----------|----------|------|
| 1: Setup | 2-3h | High | Low |
| 2: Categories/Subcategories | 2-3h | High | Low |
| 3: Topics | 3-4h | High | Medium |
| 4: Lessons | 3-4h | High | Medium |
| 5: Quiz/Results | 4-5h | High | Medium |
| 6: Cleanup | 3-4h | Medium | Low |
| **Total** | **18-23h** | | |

**Estimated completion:** 2-4 weeks (depending on time available per week)

## Success Criteria

- ✅ All URLs follow `/learn/:category/:subcategory/:topic` pattern
- ✅ Browser back/forward buttons work correctly
- ✅ Deep links are shareable and work when revisited
- ✅ Scroll position preserved on back navigation
- ✅ All existing tests pass (with routing updates)
- ✅ No AppNavigator.tsx code remaining
- ✅ No state-based navigation callbacks
- ✅ New routing tests for each phase
- ✅ Quiz difficulty level works with `?level=` query param
- ✅ Results page works as separate route

## Known Considerations

1. **Quiz State Persistence:** Using Context to maintain quiz state across route changes. Consider using useReducer for complex state.

2. **Scroll Restoration:** React Router v6 has built-in scroll restoration via `useScrollRestoration()`, but custom implementation may be needed for specific scroll targets.

3. **Search Engines:** With `/learn/` base path, URLs won't be visible to external search engines, which is fine for an app-like experience.

4. **Lazy Loading:** Future optimization: use React.lazy() for route components to reduce initial bundle size.

5. **Deep Link Validation:** URLs are only valid if:
   - Category exists in categories.json
   - Subcategory exists in that category
   - Topic exists in that subcategory
   - Current implementation: show error or redirect to root

---

**Next Step:** Begin Phase 1 setup when ready. Document learnings in LEARNINGS.md as we progress.
