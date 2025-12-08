# Complete Styling Architecture for /groups Page

## Global Styles (globals.css)
```css
* {
  margin: 0;
  box-sizing: border-box;
}

body {
  background-color: #460C58;
  color: #F8F4F0;
  font-family: 'Inter', sans-serif;
  font-size: 1.4rem;
}

p {
  font-size: 1.4rem;
  margin: 1.5rem 0 2rem 0;
  line-height: 1.6;
}
```

## Component Hierarchy & Styles

### 1. layout.tsx (Root Layout)
```tsx
<html lang="en">
  <body className="pt-20">{children}</body>
</html>
```
**Applied styles:**
- `pt-20` = padding-top: 5rem (80px)
- Global body styles from globals.css

### 2. groups/page.tsx
```tsx
<PageContainer>
  <ContentContainer className="pt-12">
    <PageHeader>My Groups</PageHeader>
    <p>View and manage your dinner groups</p>
    <div className="space-y-4 mb-8">
      <GroupCard group={group} />
    </div>
  </ContentContainer>
  <Footer />
</PageContainer>
```

### 3. PageContainer.tsx
```tsx
<div className="min-h-screen bg-[#460C58] flex flex-col items-center justify-center">
```
**Applied styles:**
- `min-h-screen` = min-height: 100vh
- `bg-[#460C58]` = background: #460C58 (dark purple)
- `flex flex-col` = display: flex, flex-direction: column
- `items-center` = align-items: center (centers children horizontally)
- `justify-center` = justify-content: center (centers children vertically)

### 4. ContentContainer.tsx
```tsx
<div className="flex-1 flex flex-col items-center justify-start md:justify-center px-4 py-4 md:py-8 w-full max-w-[500px] pt-10 mx-auto"
     style={{ paddingBottom: '150px' }}>
```
**Applied styles:**
- `flex-1` = flex: 1 (grows to fill space)
- `flex flex-col` = display: flex, flex-direction: column
- `items-center` = align-items: center (centers children horizontally)
- `justify-start` = justify-content: flex-start (mobile)
- `md:justify-center` = justify-content: center (desktop)
- `px-4` = padding-left: 1rem (16px), padding-right: 1rem (16px) ← HORIZONTAL PADDING
- `py-4` = padding-top/bottom: 1rem (16px) on mobile
- `md:py-8` = padding-top/bottom: 2rem (32px) on desktop
- `w-full` = width: 100%
- `max-w-[500px]` = max-width: 500px
- `pt-10` = padding-top: 2.5rem (40px) ← ADDS TO py-4
- `mx-auto` = margin-left/right: auto (centers the container)
- INLINE STYLE: `paddingBottom: 150px`

**TOTAL PADDING FROM CONTENTCONTAINER:**
- Left/Right: 16px on ALL screen sizes
- Top: 40px + 16px = 56px (mobile), 40px + 32px = 72px (desktop)
- Bottom: 150px

### 5. div with space-y-4
```tsx
<div className="space-y-4 mb-8">
```
**Applied styles:**
- `space-y-4` = margin-bottom: 1rem (16px) on all children except last
- `mb-8` = margin-bottom: 2rem (32px)

### 6. GroupCard.tsx
```tsx
<Card>
  <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-3">
    <h3 className="col-span-2 text-[#FBE6A6] font-bold text-2xl">
    <div className="flex items-center text-[#F8F4F0] text-sm">
      <span className="text-lg mr-4">📍</span>
```

### 7. Card.tsx (THE KEY COMPONENT)
```tsx
<div className="bg-[#460C58]/50 border border-[#FBE6A6] rounded-lg px-8 py-6 md:px-6">
```
**Applied styles:**
- `bg-[#460C58]/50` = background: rgba(70, 12, 88, 0.5) (semi-transparent purple)
- `border border-[#FBE6A6]` = border: 1px solid #FBE6A6 (gold border)
- `rounded-lg` = border-radius: 0.5rem (8px)
- `px-8` = padding-left/right: 2rem (32px) ← ON MOBILE
- `py-6` = padding-top/bottom: 1.5rem (24px)
- `md:px-6` = padding-left/right: 1.5rem (24px) ← ON DESKTOP (768px+)

**TOTAL PADDING INSIDE CARD:**
- Mobile (< 768px): 32px left/right, 24px top/bottom
- Desktop (≥ 768px): 24px left/right, 24px top/bottom

### 8. Grid inside Card
```tsx
<div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-3">
```
**Applied styles:**
- `grid` = display: grid
- `grid-cols-[1fr_auto]` = 2 columns (left flexible, right auto-sized)
- `gap-x-6` = column-gap: 1.5rem (24px) ← SPACE BETWEEN COLUMNS
- `gap-y-3` = row-gap: 0.75rem (12px) ← SPACE BETWEEN ROWS

### 9. Group Name (h3)
```tsx
<h3 className="col-span-2 text-[#FBE6A6] font-bold text-2xl">
```
**Applied styles:**
- `col-span-2` = spans both columns
- `text-[#FBE6A6]` = color: #FBE6A6 (gold)
- `font-bold` = font-weight: 700
- `text-2xl` = font-size: 1.5rem (24px)

### 10. City/Member info divs
```tsx
<div className="flex items-center text-[#F8F4F0] text-sm">
  <span className="text-lg mr-4">📍</span>
  <span>City text</span>
</div>
```
**Applied styles:**
- `flex items-center` = display: flex, align-items: center
- `text-[#F8F4F0]` = color: #F8F4F0 (off-white)
- `text-sm` = font-size: 0.875rem (14px)
- ON EMOJI: `text-lg mr-4` = font-size: 1.125rem (18px), margin-right: 1rem (16px)

## TOTAL PADDING FROM SCREEN EDGE TO CONTENT

### Mobile (< 768px):
1. ContentContainer px-4: 16px
2. Card px-8: 32px
**TOTAL: 48px from screen edge to content**

### Desktop (≥ 768px):
1. ContentContainer px-4: 16px
2. Card md:px-6: 24px
**TOTAL: 40px from screen edge to content**

## Potential Issues

1. **ContentContainer has `items-center`** which centers child elements horizontally
2. **ContentContainer has `max-w-[500px]`** which limits the width
3. **Card padding SHOULD be working** - the classes are correct
4. **Emoji spacing (`mr-4`)** SHOULD create 16px gap between emoji and text

## Next Steps to Debug

Check in browser DevTools:
1. Inspect the Card element - does it have `px-8` class applied?
2. Check computed styles - what is the actual padding-left value?
3. Is Tailwind generating these classes? (Check Network tab for CSS file)
4. Is there a CSS specificity issue overriding these styles?
