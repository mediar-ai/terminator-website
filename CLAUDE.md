# Terminator Website

Landing page for the Terminator desktop automation framework.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: JetBrains Mono (headers/code) + Satoshi (body)

## Development

```bash
npm install    # Install dependencies
npm run dev    # Start dev server at http://localhost:3000
npm run build  # Production build
npm run start  # Start production server
```

## Design Principles

- **Aesthetic**: Industrial/technical meets minimal elegance
- **Colors**: Black/orange/white palette (no purple gradients)
- **Typography**: Monospace for headers and code, clean sans for body
- **Motion**: Subtle, purposeful animations using Framer Motion
- **Accessibility**: Semantic HTML, proper focus states

## Structure

```
src/
  app/
    layout.tsx    # Root layout with metadata
    page.tsx      # Main landing page
    globals.css   # Global styles, fonts, utilities
  components/     # Reusable components (add as needed)
public/           # Static assets
```

## Key Sections

1. **Hero** - Value prop, quick install command
2. **Actions** - Click, Type, See overview
3. **Features** - TypeScript SDK, MCP, Selectors, etc.
4. **Code Examples** - SDK and MCP configuration
5. **Comparison** - vs Playwright, Vision AI
6. **Quick Start** - Installation steps
7. **CTA** - GitHub, Discord links

## Skills Used

This site was created using:
- `frontend-design` - Distinctive, production-grade UI
- `lottie` - Available for animations (add as needed)
- `posthog` - Available for analytics (configure as needed)
- `abm-landing-page` - Landing page best practices
