# Step 2.3: Cart Page Redesign - Native App Style

## Overview
Redesign the cart page to feel like a native mobile app with better touch targets, bigger images, and modern UX patterns.

## Key Features

### 1. Bigger Product Images
- **Mobile**: 80x80px product images (currently 40x40px)
- **Desktop**: 120x120px product images
- Rounded corners with shadow
- Better visual hierarchy

### 2. Larger Quantity Controls
- **Touch Target Size**: 56px (--touch-target-large)
- Bigger +/- buttons with clear visual feedback
- Larger quantity display
- Better spacing between controls

### 3. Native List Style
- Card-based layout for each item
- Subtle shadows and borders
- Proper spacing and padding
- Swipe-to-delete gesture (future enhancement)

### 4. Sticky Checkout Button
- Fixed at bottom above mobile nav
- Always visible and accessible
- Large touch target (56px height)
- Clear CTA with total price

### 5. Better Empty Cart State
- Illustration or large icon
- Friendly message
- Clear CTA to shop
- Suggested products

## Implementation Plan

1. Update cart item layout with bigger images
2. Increase touch target sizes for all interactive elements
3. Add sticky checkout button for mobile
4. Improve empty cart state
5. Add smooth animations and transitions
6. Test on mobile devices

## Design Tokens Used
- `--touch-target-large`: 56px
- `--radius-lg`: 1rem
- `--color-primary`: #FF6B35
- Native shadows and spacing

