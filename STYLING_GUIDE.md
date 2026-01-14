# Styling Guide - React + Tailwind CSS

## Overview

This project uses a **hybrid approach** combining Tailwind CSS utility classes with component-specific CSS files for optimal development experience and maintainability.

## Philosophy

### When to Use Tailwind Utilities

Use Tailwind utility classes for:
- ✅ Layout (flexbox, grid, spacing)
- ✅ Typography (font sizes, weights, colors)
- ✅ Common styling (borders, shadows, rounded corners)
- ✅ Responsive design (breakpoint modifiers)
- ✅ State variants (hover, focus, active)

**Example:**
```tsx
<button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
  Click me
</button>
```

### When to Use Custom CSS

Use separate CSS files for:
- ✅ Complex animations and transitions
- ✅ Pseudo-elements (::before, ::after)
- ✅ Complex selectors that would be verbose in Tailwind
- ✅ Component-specific styles that need CSS variables
- ✅ Styles with complex calculations

**Example:**
```css
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 200ms ease-in-out;
}

.nav-link:hover::after {
  width: 100%;
}
```

## Project Structure

```
src/
├── components/
│   ├── common/              # Shared, reusable components
│   │   ├── Button/
│   │   │   ├── Button.tsx   # Component logic + Tailwind classes
│   │   │   ├── Button.css   # Component-specific custom styles
│   │   │   └── index.ts     # Re-export for clean imports
│   │   └── Header/
│   │       ├── Header.tsx
│   │       ├── Header.css
│   │       └── index.ts
│   └── features/            # Feature-specific components
│
├── pages/                   # Page-level components
│   └── Home/
│       ├── HomePage.tsx
│       ├── HomePage.css
│       └── index.ts
│
└── styles/                  # Global styles
    └── index.css            # Tailwind directives + global styles
```

## Component Pattern

### File Organization

Each component follows this pattern:

```
ComponentName/
├── ComponentName.tsx        # Component code
├── ComponentName.css        # Component styles
└── index.ts                 # Clean exports
```

### Component Template

**ComponentName.tsx:**
```tsx
import './ComponentName.css'
import clsx from 'clsx'

export interface ComponentNameProps {
  variant?: 'primary' | 'secondary'
  className?: string
  children: React.ReactNode
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  variant = 'primary',
  className,
  children 
}) => {
  return (
    <div 
      className={clsx(
        'component-name',           // Base component class
        `component-name--${variant}`, // Variant class
        'flex items-center gap-4',  // Tailwind utilities
        className                    // User overrides
      )}
    >
      {children}
    </div>
  )
}
```

**ComponentName.css:**
```css
/* ComponentName Component Styles */

.component-name {
  /* Base styles that aren't easily expressed with Tailwind */
}

.component-name--primary {
  /* Variant-specific styles */
}

.component-name::before {
  /* Pseudo-element styles */
}
```

**index.ts:**
```ts
export { ComponentName } from './ComponentName'
export type { ComponentNameProps } from './ComponentName'
```

## Tailwind Configuration

### Custom Colors

Use custom colors defined in `tailwind.config.js`:

```tsx
// ✅ Good - Using theme colors
<div className="bg-primary-600 text-white">

// ❌ Avoid - Arbitrary values unless necessary
<div className="bg-[#3b82f6] text-white">
```

### Path Aliases

Import components using path aliases:

```tsx
// ✅ Good
import { Button } from '@components/common/Button'
import { Header } from '@components/common/Header'

// ❌ Avoid
import { Button } from '../../../components/common/Button'
```

## CSS Organization

### Global Styles (src/index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global CSS Variables */
:root {
  --transition-base: 200ms ease-in-out;
}

/* Base Layer - HTML element defaults */
@layer base {
  body {
    @apply bg-white text-gray-900;
  }
}

/* Components Layer - Reusable component classes */
@layer components {
  .card {
    @apply rounded-lg border bg-white p-6 shadow-sm;
  }
}

/* Utilities Layer - Custom utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### Component Styles

- Use BEM-like naming: `.component-name`, `.component-name__element`, `.component-name--modifier`
- Scope styles to component class to avoid conflicts
- Use CSS custom properties for dynamic values
- Leverage Tailwind's `@apply` for consistency

## Class Management

### Using clsx

Use `clsx` for conditional class management:

```tsx
import clsx from 'clsx'

<button
  className={clsx(
    'btn',                          // Always applied
    {
      'btn--loading': isLoading,    // Conditional
      'btn--disabled': disabled,    // Conditional
    },
    size === 'lg' && 'btn--lg',     // Dynamic
    className                        // User overrides (always last)
  )}
>
```

## Best Practices

### 1. Mobile-First Responsive Design

```tsx
// ✅ Good - Mobile first, then larger screens
<div className="text-sm md:text-base lg:text-lg">

// ❌ Avoid - Desktop first
<div className="text-lg md:text-base sm:text-sm">
```

### 2. Consistent Spacing

Use Tailwind's spacing scale consistently:

```tsx
// ✅ Good - Using spacing scale
<div className="p-4 gap-6 mt-8">

// ❌ Avoid - Arbitrary values
<div className="p-[15px] gap-[23px] mt-[33px]">
```

### 3. Color Consistency

```tsx
// ✅ Good - Using theme colors
<button className="bg-primary-600 hover:bg-primary-700">

// ❌ Avoid - Random color values
<button className="bg-blue-500 hover:bg-blue-600">
```

### 4. Component Composition

```tsx
// ✅ Good - Composable components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Avoid - Monolithic components
<Card title="Title" content="Content" />
```

### 5. Avoid Inline Styles

```tsx
// ✅ Good - Use Tailwind or CSS classes
<div className="w-full max-w-4xl">

// ❌ Avoid - Inline styles
<div style={{ width: '100%', maxWidth: '896px' }}>
```

## Performance Tips

1. **Keep CSS files scoped**: Only import CSS in the component that needs it
2. **Use Tailwind's JIT**: Automatically enabled in Tailwind v3
3. **Purge unused styles**: Configured automatically via `content` in tailwind.config.js
4. **Split large components**: Break down into smaller, focused components

## Example Components

Check these components for reference:

- **Button** (`src/components/common/Button/`) - Variants, sizes, props
- **Header** (`src/components/common/Header/`) - Navigation, hover effects
- **Hero** (`src/components/common/Hero/`) - Animations, gradients, responsive layout

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [clsx Documentation](https://github.com/lukeed/clsx)
