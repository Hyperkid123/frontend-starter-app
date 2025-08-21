# Components Container Grid Layout Requirements

## Overview
Replace the current stacked component layout with react-grid-layout to allow users to arrange components in a flexible single grid with drag-and-drop functionality and local storage persistence.

## Current State Description
Based on the current implementation:

### Components Container (Current)
- **Simple Stack Layout**: Components are stacked vertically using PatternFly Stack component
- **Fixed Layout**: All components have the same width and appear in a single column
- **No Flexibility**: Users cannot reposition or customize component placement
- **Animation**: Basic Framer Motion animations for component appearance (staggered entrance)

### Current Implementation
- Uses `@patternfly/react-core` Stack and StackItem for layout
- Each component renders in a ScalprumComponent wrapper
- Components appear in order they're received from messages
- Fixed padding and spacing between components

### Current Limitations
- No ability to rearrange components
- Poor space utilization on larger screens
- No customization of component layouts
- All components forced into single-column layout

## Scope
- Changes limited to `src/GenUI/ComponentsContainer.tsx` and related files
- Maintain existing component loading states and animations
- Preserve ScalprumComponent integration
- Keep existing empty state and loading overlay functionality

## Requirements

### 1. React Grid Layout Integration
- [ ] Install `react-grid-layout` package and types
- [ ] Replace PatternFly Stack with ReactGridLayout component
- [ ] Implement basic grid system with columns
- [ ] Maintain existing component loading animations

### 2. Grid Layout Features
- [ ] **Draggable Components**: Allow users to drag components to new positions
- [ ] **Grid Columns**: Use column-based layout for better organization
- [ ] **Collision Detection**: Prevent component overlap with automatic repositioning
- [ ] **Snap to Grid**: Ensure components align to grid boundaries

### 3. Component Layout
- [ ] **Auto-Layout**: Default positioning for new components
- [ ] **New Component Placement**: New components appear at top of grid (y: 0) with full width (12 columns)
- [ ] **Existing Component Repositioning**: Push existing components down when new ones are added

### 4. Component Integration
- [ ] **ScalprumComponent Compatibility**: Ensure existing components work in grid cells
- [ ] **Dynamic Addition**: Handle new components being added at top position
- [ ] **Component Removal**: Clean layout when components are removed
- [ ] **Loading States**: Maintain loading overlays and animations
- [ ] **Component Insertion**: New components take full width and appear at top to grab user attention
- [ ] **Layout Reflow**: Automatically shift existing components down when new ones are added

### 5. Grid Configuration
- [ ] **Grid Parameters**: 
  - Columns: 12 (fixed column count)
  - Column Width: Dynamic based on container width
  - Row Height: 60px base unit
  - Margins: 16px between components
- [ ] **Dynamic Width Calculation**:
  - Use MutationObserver to watch components container width changes
  - Recalculate column widths when container resizes
  - Column width = (containerWidth - margins) / 12
- [ ] **Component Sizing**:
  - Default: 6 columns wide, 4 rows tall
  - New components: 12 columns wide (full width), auto height
  - Allow natural component sizing within grid cells


### Technical Requirements

#### 1. Package Installation
```bash
npm install react-grid-layout
npm install --save-dev @types/react-grid-layout
```

#### 2. Component Structure
- Wrap existing components in grid layout items
- Maintain component loading and error states
- Preserve Framer Motion entrance animations
- Keep empty state functionality

#### 3. Layout Data Structure
```typescript
interface LayoutItem {
  i: string;           // Component ID
  x: number;           // Grid column position
  y: number;           // Grid row position  
  w: number;           // Width in grid units
  h: number;           // Height in grid units
}
```

#### 4. Dynamic Width Management
- Use MutationObserver to monitor components container size changes
- Implement width calculation: `(containerWidth - totalMargins) / 12`
- Update grid layout when container width changes
- Handle responsive behavior automatically based on container size
- Clean up observers on component unmount

```typescript
// Example width calculation logic
const calculateColumnWidth = (containerWidth: number) => {
  const totalMargins = 16 * 11; // 16px margin * 11 gaps between 12 columns
  const availableWidth = containerWidth - totalMargins;
  return Math.floor(availableWidth / 12);
};

// MutationObserver setup
const observer = new MutationObserver(() => {
  const newWidth = containerRef.current?.getBoundingClientRect().width;
  if (newWidth !== previousWidth) {
    setColumnWidth(calculateColumnWidth(newWidth));
    previousWidth = newWidth;
  }
});

// New component placement logic
const addNewComponent = (componentId: string) => {
  // Shift existing components down by finding max y position needed
  const shiftExistingComponents = (existingLayout: LayoutItem[]) => {
    return existingLayout.map(item => ({
      ...item,
      y: item.y + 4 // Shift down by default component height
    }));
  };

  // Create new component at top with full width
  const newComponent: LayoutItem = {
    i: componentId,
    x: 0,        // Start at leftmost position
    y: 0,        // Top position
    w: 12,       // Full width (all 12 columns)
    h: 4         // Default height
  };

  // Update layout with new component at top and shifted existing components
  const updatedLayout = [newComponent, ...shiftExistingComponents(currentLayout)];
  setLayout(updatedLayout);
};
```

### Implementation Strategy

#### Phase 1: Basic Grid Setup
1. Install react-grid-layout dependencies
2. Replace Stack with ReactGridLayout
3. Implement MutationObserver for dynamic width calculation
4. Convert components to grid items
5. Implement basic drag/drop functionality

#### Phase 2: Component Management
1. Implement new component insertion at top position
2. Add automatic repositioning of existing components
3. Test component addition and removal workflow

### Acceptance Criteria
- [ ] Components can be dragged to new positions smoothly
- [ ] New components appear at top of grid with full width (12 columns) for visibility
- [ ] Existing components automatically shift down when new ones are added
- [ ] All existing functionality (loading, empty state) still works
- [ ] Visual design integrates seamlessly with existing interface
- [ ] Grid system uses 12-column layout with dynamic width calculation
- [ ] Column widths adapt automatically to container size changes
- [ ] MutationObserver properly monitors and responds to container width changes
- [ ] ScalprumComponent loading and animations preserved