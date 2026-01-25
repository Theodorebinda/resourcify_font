# Design System Audit & Formalization

## Color System

### Palette Definition

#### Primary (60% Usage)
- **Light Mode**: `210 40% 25%` - Navy Blue / Petroleum Blue
- **Dark Mode**: `210 50% 60%` - Lighter navy for better contrast
- **Usage**: Primary actions, navigation, headers
- **Foreground**: `0 0% 98%` (light) / `210 40% 15%` (dark)

#### Secondary (30% Usage)
- **Light Mode**: `45 20% 96%` - Paper Beige / Off-white
- **Dark Mode**: `210 20% 20%` - Darker paper beige
- **Usage**: Backgrounds, cards, secondary elements
- **Foreground**: `210 40% 25%` (light) / `45 20% 96%` (dark)

#### Accent (10% Usage - CTA Only)
- **Light & Dark**: `45 85% 55%` - Matte Gold / Mustard
- **Usage**: **ONLY** for primary CTAs (call-to-action buttons)
- **Foreground**: `210 40% 15%`
- **Restriction**: Never use for backgrounds, borders, or secondary elements

### Color Usage Rules

1. ✅ **60/30/10 Rule**: Primary 60%, Secondary 30%, Accent 10%
2. ✅ **Accent Restriction**: Accent color ONLY for CTA buttons
3. ⚠️ **Validation Needed**: Audit all components to ensure accent is not overused
4. ✅ **Contrast**: Dark mode variants ensure WCAG AA compliance

### Current Implementation Status

- ✅ Colors defined in `globals.css`
- ✅ CSS variables properly scoped
- ✅ Dark mode variants exist
- ⚠️ **Action Required**: Verify accent usage across all components

---

## Dark Mode Strategy

### Supported Values
- `"light"` - Force light mode
- `"dark"` - Force dark mode
- `"system"` - Follow `prefers-color-scheme` (default)

### Implementation

#### Zustand Store
- **Location**: `src/stores/use-ui-store.ts`
- **Persistence**: localStorage via Zustand persist
- **Default**: `"system"`

#### Theme Provider
- **Location**: `src/providers/theme-provider.tsx`
- **Features**:
  - Applies theme to document root
  - Listens to system theme changes
  - Reacts to `prefers-color-scheme` media query

### Critical Rule (Documented)

**The theme is a LOCAL UI PREFERENCE.**

- ✅ It is NOT tied to authentication
- ✅ It is NOT stored on the backend
- ✅ It works for visitors and authenticated users alike
- ✅ Theme state is completely decoupled from auth state

### Issues Found

1. ⚠️ **Old useTheme Hook**: `src/hooks/use-theme.ts` exists but conflicts with Zustand store
   - **Action**: Remove if unused, or document why both exist

### Validation Checklist

- [x] Theme provider exists
- [x] Zustand store for theme
- [x] System theme support
- [x] Persistence via localStorage
- [x] Documentation of decoupling
- [ ] Remove conflicting hooks (if any)

---

## shadcn/ui Wrapping Strategy

### Current State

- ✅ Components exist in `src/components/ui/`
- ⚠️ **Direct Usage**: Some components may be used directly
- ⚠️ **No Semantic Wrappers**: No feature-specific wrappers

### Wrapping Rules

1. **Never use shadcn components directly in features**
2. **Wrap in semantic components**:
   - `Button` → `PrimaryButton`, `SecondaryButton`, `CTAButton`
   - `Card` → `AuthCard`, `DashboardCard`
   - `Input` → `EmailInput`, `PasswordInput`
3. **Local wrappers define semantics**, not just styling

### Required Wrappers (Phase 2.1+)

#### Auth Components
- `AuthCard` - Wrapper for Card in auth flows
- `AuthButton` - Primary action button in auth
- `AuthInput` - Input with auth-specific styling

#### Feature Components
- `CTAButton` - Uses accent color, for primary actions only
- `PrimaryButton` - Uses primary color
- `SecondaryButton` - Uses secondary color

### Implementation Status

- ⚠️ **Action Required**: Create semantic wrappers
- ⚠️ **Action Required**: Audit direct shadcn usage
- ⚠️ **Action Required**: Document wrapping strategy

---

## Design System Validation

### Checklist

#### Colors
- [x] Primary color defined
- [x] Secondary color defined
- [x] Accent color defined
- [x] Dark mode variants exist
- [ ] Accent usage validated (only CTAs)
- [ ] Contrast validated (WCAG AA)

#### Dark Mode
- [x] Theme system implemented
- [x] System theme support
- [x] Persistence working
- [x] Decoupling documented
- [ ] Conflicting hooks removed

#### Component Wrapping
- [x] shadcn components exist
- [ ] Semantic wrappers created
- [ ] Direct usage audited
- [ ] Wrapping strategy documented

---

## Action Items

### Immediate (Phase 2.1)
1. ✅ Validate accent color usage (audit only)
2. ✅ Document color usage rules
3. ✅ Verify dark mode implementation
4. ⚠️ Remove conflicting `useTheme` hook if unused

### Post Phase 2.1
1. Create semantic component wrappers
2. Audit and replace direct shadcn usage
3. Add contrast validation tests
4. Create design system documentation

---

## Design System Principles

1. **Consistency**: Same colors, same usage patterns
2. **Accessibility**: WCAG AA compliance
3. **Scalability**: Easy to extend without breaking
4. **Decoupling**: Theme independent of auth/business logic
5. **Semantics**: Components have meaning, not just style
