# Partner & Client Logos

This directory contains logos for business partners and clients displayed in the LogoCloud component.

## Adding a New Partner Logo

### Step 1: Add the Logo File
1. Place the logo image in this directory (`public/partners/`)
2. Recommended formats: PNG (with transparent background) or SVG
3. Recommended size: 200x80px to 400x160px (width x height)
4. File naming: Use lowercase with hyphens (e.g., `company-name-logo.png`)

### Step 2: Update LogoCloud Component
1. Open `client/website/components/LogoCloud.tsx`
2. Find the `partners` array (around line 20)
3. Add a new entry:

```typescript
{
  name: "Company Name",
  logo: "/partners/company-name-logo.png", // Path to the logo
  initials: "CN", // Fallback initials (optional)
  website: "https://company-website.com" // Optional: makes logo clickable
}
```

### Step 3: That's It!
The logo will automatically appear in the scrolling partner showcase on the homepage.

## Using Placeholders (No Logo Yet)

If you don't have a logo yet, you can use initials instead:

```typescript
{
  name: "Company Name",
  logo: "", // Empty = use initials
  initials: "CN", // These will display in a gold circle
  website: "" // Optional
}
```

## Tips

- **Logo Size**: Logos are automatically resized to fit the card (160x160px)
- **Transparent Background**: PNG with transparent background looks best
- **High Quality**: Use high-resolution images for sharp display
- **Consistent Style**: Try to keep logos similar in size/style for visual harmony

## Current Partners

Edit the list in `client/website/components/LogoCloud.tsx` to add, remove, or reorder partners.

No backend or API needed - this is intentionally kept simple! 🎯


