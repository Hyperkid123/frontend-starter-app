# Chat Panel Resizing Requirements

## Overview
This document outlines the requirements for implementing resizable chat panels in the layout.

## Current State Description
Based on the current implementation visible in the interface:

### Empty State (No Messages)
- **Two-panel layout**: The interface consists of two main areas arranged vertically
  - **Top panel (Components area)**: Large white card containing the empty state with animated rings and "Ready when you are" text
  - **Bottom panel (Chat area)**: Smaller white card containing the input field with placeholder "Enter AI command..."

### Visual Design (Empty State)
- **Empty State Display**: 
  - Centered animated blue ring system (outer ring, middle ring, core circle)
  - "Ready when you are" heading text
  - "Ask me anything below" subtitle text
- **Input Interface**: 
  - Clean input field with rounded corners
  - Send button with paper plane icon
  - Modern, minimalist styling

### Current Proportions (Empty State)
- Components area takes approximately 80% of the vertical space
- Chat area takes approximately 20% of the vertical space
- Both areas are contained within white cards with subtle shadows
- Clear visual separation between the two panels

### Message State (With Active Conversation)
- **Two-panel layout maintains**: Same vertical arrangement but with different content and proportions
  - **Top panel (Components area)**: Contains generated components/charts based on AI responses
  - **Bottom panel (Chat area)**: Contains message carousel with navigation and input field

### Visual Design (Message State)
- **Components Display**:
  - Generated visualizations, charts, or data components
  - Scrollable area to accommodate multiple components
- **Message Area**:
  - Horizontal carousel with left/right navigation arrows
  - AI response messages displayed in carousel slides
  - Small AI indicator icon with blue dot
  - Input field remains at bottom of chat area

### Current Proportions (Message State)
- Components area takes approximately 75% of the vertical space
- Chat area takes approximately 25% of the vertical space
- Message carousel takes up most of the chat area height
- Input field gets minimal space at bottom

### State Transitions
- **Empty to Message**: Layout transitions from 80/20 to 75/25 split when first message is received
- **Message Navigation**: Horizontal carousel allows browsing through AI responses
- **Component Generation**: Top area populates with relevant components based on conversation

### Current Limitations
- Fixed height distribution that cannot be adjusted by user
- Message area may be too small for longer messages or conversation threads
- No ability to expand message display area when needed

## Scope
- Changes limited to `src/GenUI` components only
- No modifications outside of this directory structure

## Requirements

### Functional Requirements
1. **Dynamic Gap Management**
   - Add visual gap between components area and chat area when messages are present
   - Remove gap in empty state to allow full-screen utilization
   - Gap should respond to window resize events

2. **State-Based Layout Behavior**
   - **Empty State**: Single unified interface spanning full available space
   - **Message State**: Two distinct areas with clear visual separation via gap

3. **Message Detection**
   - Layout changes should trigger specifically on bot messages (not user messages)
   - System should detect presence of AI responses to determine layout state

4. **Resizable Chat Area**
   - Chat area should have fixed pixel height (not percentage-based)
   - Components area should fill remaining space using `1fr` grid value
   - Provide user control to expand/collapse chat area to different fixed heights
   - Triggered when bot messages are too long for current chat area
   - Prevent message overflow from carousel container

5. **Specific Height Requirements**
   - **Empty State**: 87px total height (including all paddings), positioned at bottom of screen
   - **Message State - Normal**: 200px height for chat area
   - **Message State - Expanded**: 500px height for chat area

### Technical Requirements
1. **Resize Event Handling**
   - Implement resize event listener for dynamic gap calculation
   - Gap size should be calculated based on viewport dimensions
   - Ensure proper cleanup of event listeners

2. **CSS Grid Integration**
   - Modify existing grid system to accommodate dynamic gaps
   - Use CSS custom properties or inline styles for gap values
   - Maintain current transition animations between states

3. **Component Detection Logic**
   - Check for bot messages specifically (role === 'bot' and has answer)
   - Trigger layout recalculation when message state changes

4. **Resize Button Integration**
   - Embed resize button into chat area border (not floating)
   - Button should be part of the chat container's visual design
   - Toggle between expand/collapse states with appropriate icons
   - **Visible in all states**: Show button in both empty state and message states
   - **Always Visible**: Use absolute/fixed positioning and z-index to ensure button stays on top
   - Prevent button from being hidden by content overflow or other elements

### UI/UX Requirements
1. **Visual Hierarchy**
   - **Empty State**: Seamless, unified experience with minimal chrome
   - **Message State**: Clear separation between functional areas
   - Maintain consistent margins from application shell in both states

2. **Responsive Behavior**
   - Gap size should scale appropriately with viewport size
   - Maintain usable proportions across different screen sizes
   - Smooth transitions when toggling between states

3. **Resize Button Design**
   - Integrate seamlessly into chat area border design
   - Use chevron icons (up/down) to indicate expand/collapse action
   - Match existing visual design language (colors, shadows, etc.)
   - Provide clear visual feedback on hover/active states
   - Position centrally in top border of chat area
   - **High Z-Index**: Ensure button renders above all other content including scrolled content
   - Maintain visibility regardless of chat content or scroll position

### Implementation Notes
- Leverage existing resize event listener in Layout component
- Extend current message detection logic (hasMessages) to specifically check for bot messages
- **Grid Proportion Management**: Use inline styling to configure grid area proportions dynamically
  - Replace static CSS percentages with fixed pixel heights for chat area
  - Use `grid-template-rows: 1fr ${chatHeight}px` pattern where chat gets fixed height
  - **Height Values**: Empty (87px), Normal (200px), Expanded (500px)
  - Resize button toggles between Normal (200px) and Expanded (500px) states
  - Components area automatically fills remaining space using `1fr`
  - Maintain responsive behavior across different viewport sizes
- Use CSS Grid gap property or margin/padding for visual separation

### Acceptance Criteria
- [ ] Empty state shows unified interface with no visual gap between areas
- [ ] Empty state chat area is exactly 87px height (including padding) and positioned at bottom
- [ ] Message state shows clear gap between components and chat areas
- [ ] Normal message state has 200px chat area height
- [ ] Expanded message state has 500px chat area height
- [ ] Gap size responds to window resize events
- [ ] Layout changes trigger only when bot messages are present
- [ ] Smooth transitions maintained between layout states
- [ ] Consistent spacing from application shell in both states
- [ ] Resize button appears integrated into chat area border in all states (empty and message)
- [ ] Button toggles between Normal (200px) and Expanded (500px) with appropriate chevron icons
- [ ] Components area automatically fills remaining space in all states
- [ ] Message carousel prevents overflow in both normal and expanded states
- [ ] Resize button matches existing design language and provides hover feedback
