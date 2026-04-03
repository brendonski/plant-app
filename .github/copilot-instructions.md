# Copilot Instructions for plant-app

## Project Overview

This is a garden bed management app that records the location, details and photo of plants that are planted in a garden. The garden is divided into beds (e.g. bed 1, 2, 3) and each bed is divided into rows (e.g. row A, B). Each row is divided into positions (e.g. position 1, 2, 3). The number of rows and positions is configurable per bed

### Bed management 

The user should be able to 
- add and remove beds
- add and remove rows in each bed
- set the number of positions per row

### Recording plant details

The user should be able to
- add details of a plant in a particular position. Details to record are
	- name
	- dominant colour
	- photo
	- location (bed, row, position)
- upload an existing photo and attach to the plant details. If using a device equipped with a camera, take a photo and attach to the details

An example plant details is

- name: Dahlia "Winkie Chevron"
- dominant colour: pink
- photo: (attached photo)
- location: bed 3, row A, position 10

This is a **SvelteKit** application using:
- **Svelte 5** with runes mode enabled (new reactive syntax)
- **TypeScript** with strict type checking
- **Vite** as the build tool
- **adapter-auto** for deployment flexibility

## Build, Test, and Lint Commands

```bash
# Development server
npm run dev                    # Start dev server at http://localhost:5173
npm run dev -- --open          # Start dev server and open in browser

# Type checking
npm run check                  # Run svelte-check once
npm run check:watch            # Run svelte-check in watch mode

# Production build
npm run build                  # Create production build in .svelte-kit/
npm run preview                # Preview production build locally
```

**Note:** There are currently no test or lint scripts configured in this project.

## Architecture

### SvelteKit Routing

- **File-based routing**: Files in `src/routes/` map to URL paths
  - `+page.svelte` = page component (e.g., `src/routes/+page.svelte` → `/`)
  - `+layout.svelte` = layout wrapping child routes
  - `+page.ts` / `+page.server.ts` = data loading (not present yet)
  - `+error.svelte` = error boundary (not present yet)

### Key Directories

- `src/routes/` - Pages and layouts (SvelteKit routing)
- `src/lib/` - Reusable components, utilities, and assets
  - Importable via `$lib` alias (e.g., `import favicon from '$lib/assets/favicon.svg'`)
- `static/` - Static assets served at root (e.g., `static/robots.txt` → `/robots.txt`)
- `.svelte-kit/` - Generated files (gitignored, auto-created by `svelte-kit sync`)

### Configuration

- **svelte.config.js**: Runes mode enabled by default for all files except `node_modules`
- **tsconfig.json**: Extends `.svelte-kit/tsconfig.json` (generated)
- **vite.config.ts**: Uses the SvelteKit plugin

## Key Conventions

### Svelte 5 Runes

This project uses **Svelte 5's runes mode**. Use the new reactive syntax:

```svelte
<script lang="ts">
  // Props
  let { myProp, children } = $props();
  
  // State
  let count = $state(0);
  
  // Derived state
  let doubled = $derived(count * 2);
  
  // Effects
  $effect(() => {
    console.log('count changed:', count);
  });
</script>

{@render children()}
```

**Do not use** legacy Svelte 3/4 syntax:
- ❌ `export let myProp` (use `let { myProp } = $props()`)
- ❌ `$: doubled = count * 2` (use `$derived()`)
- ❌ `<slot />` (use `{@render children()}`)

### Import Aliases

- `$lib` → `src/lib/`
- `$app/*` → SvelteKit app modules (e.g., `$app/environment`, `$app/navigation`)

### TypeScript

- Strict mode enabled
- Type definitions in `src/app.d.ts` for global types (e.g., `App.Locals`, `App.PageData`)
