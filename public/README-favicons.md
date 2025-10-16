# Favicon Files Needed

The following favicon files should be added to the `/public` directory for optimal browser support:

## Required Files:
- `favicon.ico` ✅ (already exists)
- `favicon-16x16.png` (16x16 pixels)
- `favicon-32x32.png` (32x32 pixels) 
- `apple-touch-icon.png` (180x180 pixels)

## Design Suggestions:
- Use a simple, recognizable icon related to lying/deception
- Consider using a mask emoji 🎭 or similar
- Keep it simple for small sizes
- Use high contrast colors for visibility

## Current Setup:
- The favicon.ico is already configured and working
- Metadata in layout.tsx references all the PNG files
- Web manifest is configured for PWA support

## To Generate Favicons:
You can use online tools like:
- https://favicon.io/
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/

Upload your main icon (preferably 512x512 or larger) and generate all the required sizes.
