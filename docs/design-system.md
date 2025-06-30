# Design System & Customization Guide

This guide explains how to use and customize the design system in the PWA POS admin panel.

## Overview

The design system provides a comprehensive set of customizable design tokens and components that allow you to:

- **Customize Colors**: Change primary, secondary, success, warning, and danger colors
- **Adjust Typography**: Modify fonts, sizes, and weights
- **Control Layout**: Adjust spacing, border radius, and shadows
- **Style Admin Components**: Customize tables, buttons, cards, and forms

## Accessing Design Customization

1. Go to the admin panel: `/admin`
2. Click the **🎨 Design** button in the header
3. Or navigate directly to: `/admin/design`

## Features

### 🎨 Color Customization

**Available Colors:**
- **Primary**: Main brand color used for buttons, links, and accents
- **Secondary**: Supporting color for secondary elements
- **Success**: Green color for success states and positive actions
- **Warning**: Orange/yellow color for warnings and cautions
- **Danger**: Red color for errors and destructive actions
- **Background**: Main background color for the application

**Color Presets:**
- Blue Ocean (Default)
- Purple Dream
- Green Nature
- Orange Sunset
- Pink Blossom
- Dark Mode

### 📝 Typography Customization

**Font Options:**
- Inter (Default)
- Roboto
- Open Sans
- Poppins
- Montserrat
- Lato
- Source Sans Pro
- System Default

**Size Controls:**
- **Heading Size**: 16px - 32px
- **Body Text Size**: 12px - 20px
- **Small Text Size**: 10px - 16px
- **Button Text Size**: 12px - 18px

**Font Weight Options:**
- Light (300)
- Normal (400)
- Medium (500)
- Semi Bold (600)
- Bold (700)

### 📐 Layout & Spacing

**Border Radius**: 0px - 20px
**Card Padding**: 12px - 32px
**Button Padding**: 8px - 20px
**Shadow Intensity**: None, Small, Medium, Large, Extra Large

### ⚙️ Admin Panel Specific

**Sidebar Styles:**
- Light
- Dark
- Colored (Primary)

**Table Styles:**
- Default
- Striped
- Bordered
- Minimal

**Button Styles:**
- Rounded
- Square
- Pill

**Card Styles:**
- Default
- Flat
- Elevated
- Outlined

## CSS Custom Properties

The design system uses CSS custom properties (variables) that can be accessed throughout the application:

```css
/* Color Variables */
--color-primary: #2563eb;
--color-secondary: #64748b;
--color-success: #16a34a;
--color-warning: #d97706;
--color-danger: #dc2626;
--color-background: #f9fafb;

/* Typography Variables */
--font-family: 'Inter', system-ui, sans-serif;
--font-size-heading: 24px;
--font-size-body: 16px;
--font-size-small: 14px;
--font-size-button: 14px;
--font-weight: 500;

/* Layout Variables */
--border-radius: 8px;
--card-padding: 24px;
--button-padding: 12px;
```

## Using Design System Classes

### Buttons
```html
<!-- Primary button -->
<button class="admin-btn admin-btn-primary">Primary Action</button>

<!-- Secondary button -->
<button class="admin-btn admin-btn-secondary">Secondary Action</button>

<!-- Outline button -->
<button class="admin-btn admin-btn-outline">Outline Button</button>
```

### Cards
```html
<!-- Basic card -->
<div class="admin-card">
  <div class="admin-card-header">
    <h3 class="admin-card-title">Card Title</h3>
  </div>
  <p>Card content goes here...</p>
</div>
```

### Tables
```html
<table class="admin-table">
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

### Forms
```html
<div class="admin-form-group">
  <label class="admin-label">Field Label</label>
  <input type="text" class="admin-input" placeholder="Enter value...">
</div>
```

### Badges
```html
<span class="admin-badge admin-badge-primary">Primary Badge</span>
<span class="admin-badge admin-badge-success">Success Badge</span>
<span class="admin-badge admin-badge-warning">Warning Badge</span>
<span class="admin-badge admin-badge-danger">Danger Badge</span>
```

## Persistence

Design configurations are automatically saved to localStorage and persist across browser sessions. The theme is applied immediately when the page loads.

## Export/Import

**Export Configuration:**
- Click "Export Config" to download your design settings as a JSON file
- Share configurations between different installations

**Import Configuration:**
- Click "Import Config" to upload a previously exported JSON file
- Instantly apply saved design configurations

## Live Preview

The design customization interface includes a live preview that shows how your changes will look in real-time. You can:

1. **Preview Changes**: See changes immediately without saving
2. **Save Design**: Make changes permanent
3. **Reset to Defaults**: Restore original design settings

## Best Practices

### Color Selection
- Ensure sufficient contrast for accessibility
- Test colors in both light and dark environments
- Consider color blindness when choosing color schemes

### Typography
- Keep font sizes readable on mobile devices
- Maintain consistent font weights throughout the interface
- Choose fonts that load quickly and are web-safe

### Layout
- Use consistent spacing throughout the interface
- Ensure touch targets are large enough for mobile use
- Test responsive behavior at different screen sizes

## Responsive Design

The design system includes responsive breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components automatically adapt to different screen sizes while maintaining the customized design tokens.

## Dark Mode Support

The design system includes automatic dark mode support based on user's system preferences. Dark mode styles are applied automatically when `prefers-color-scheme: dark` is detected.

## Browser Support

The design system uses modern CSS features:
- CSS Custom Properties (CSS Variables)
- CSS `color-mix()` function for color variations
- Flexbox and Grid layouts

**Supported Browsers:**
- Chrome 88+
- Firefox 88+
- Safari 14+
- Edge 88+

## Troubleshooting

**Changes not applying:**
- Clear browser cache and reload
- Check browser console for CSS errors
- Ensure localStorage is enabled

**Colors not showing correctly:**
- Verify color values are valid hex codes
- Check for CSS conflicts with existing styles
- Test in different browsers

**Performance issues:**
- Limit the number of custom properties
- Avoid complex CSS calculations
- Use browser dev tools to identify bottlenecks
