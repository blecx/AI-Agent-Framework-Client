# UI Component Library

This repo includes a small, typed UI kit for shared styling and reusable building blocks.

## Location

- Source: [client/src/components/ui/](../client/src/components/ui/)
- Barrel exports: [client/src/components/ui/index.ts](../client/src/components/ui/index.ts)

## Demo / Examples

Run the client and visit `/ui` to see the components rendered together.

```bash
cd client
npm install
npm run dev
```

## Components

- `Button` — variants: `primary | secondary | danger | ghost`, sizes: `sm | md | lg`
- `Modal` — reusable dialog shell with Escape handling and body scroll lock
- `Badge` — lightweight status pill
- `Input`, `Select`, `Textarea` — basic form primitives with label/hint/error support
- `Table` — typed table with optional client-side sorting

## Usage

```tsx
import { Button, Modal } from './components/ui';

<Button variant="secondary">Cancel</Button>;
```

## Styling

All UI kit styles live in [client/src/components/ui/ui.css](../client/src/components/ui/ui.css) and are imported by each component.
