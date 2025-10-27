# Uploads Directory

This directory is for storing locally uploaded images.

## Structure

```
public/uploads/
├── carousel/      # Carousel slide images
├── articles/      # Article images
├── news/          # News images
└── avatars/       # User avatars
```

## Image Guidelines

### Carousel Images
- **Recommended Size**: 1920x1080px (16:9 aspect ratio)
- **Formats**: JPG, PNG, WebP
- **Max File Size**: 2MB
- **Naming**: Use descriptive names (e.g., `hero-investment-2024.jpg`)

### Article Images
- **Recommended Size**: 1200x630px (1.91:1 aspect ratio)
- **Formats**: JPG, PNG, WebP
- **Max File Size**: 1MB

### User Avatars
- **Recommended Size**: 400x400px (square)
- **Formats**: JPG, PNG
- **Max File Size**: 500KB

## Usage in Database

### Remote URLs (Unsplash, CDN, etc.)
```json
{
  "image": "https://images.unsplash.com/photo-xxxxx?w=1920&h=1080"
}
```

### Local Uploads
```json
{
  "image": "/uploads/carousel/hero-slide-1.jpg"
}
```

### Relative Path (auto-prepends /)
```json
{
  "image": "uploads/carousel/hero-slide-1.jpg"
}
```

## Component Handling

The carousel component automatically detects and handles:
- ✅ Absolute URLs (starting with `http://` or `https://`)
- ✅ Root-relative paths (starting with `/`)
- ✅ Relative paths (auto-prepends `/`)

## Best Practices

1. **Optimize images before upload**
   - Use tools like TinyPNG, ImageOptim
   - Compress without losing quality

2. **Use descriptive filenames**
   - Good: `royal-dansity-main-hero.jpg`
   - Bad: `image1.jpg`

3. **Maintain aspect ratios**
   - Carousel: 16:9 (1920x1080)
   - Articles: ~2:1 (1200x630)
   - Avatars: 1:1 (square)

4. **Test both formats**
   - Test with remote URLs
   - Test with local uploads
   - Ensure images load properly

## Security Notes

- Never store sensitive information in filenames
- Validate file types on upload
- Scan uploaded files for malware
- Set appropriate file permissions


