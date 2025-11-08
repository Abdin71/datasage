# DataSage Extension - Testing & Debugging Guide

## 🔧 Changes Made to Fix Toggle Functionality

### Issue Identified
The `toggleSection()` function wasn't properly finding the chevron elements because:
1. Chevrons are inside `.card-header`, not directly in `.card`
2. Different structures for collapsible triggers (advanced settings) vs card sections
3. Initial chevron states weren't being set on page load

### Fixes Applied

1. **Enhanced `toggleSection()` function**:
   - Added null check for section element
   - Distinguished between collapsible-content and card-content sections
   - Updated chevron selector to look in `.card-header`
   - Added support for `.chevron-small` in collapsible triggers

2. **Added `initializeChevrons()` function**:
   - Runs on page load
   - Sets initial chevron rotation based on section state
   - Handles all toggle sections consistently

## 🧪 How to Test

### Step 1: Reload Extension

1. Open Chrome and go to `chrome://extensions`
2. Find the **DataSage** extension
3. Click the **reload icon** (circular arrow)
4. Check for any errors in the extension console

### Step 2: Open Extension Popup

1. Click the DataSage icon in Chrome toolbar
2. Open Chrome DevTools for the popup:
   - Right-click the extension icon
   - Select "Inspect popup"
   - Or use the "Inspect" button in `chrome://extensions`

### Step 3: Test Each Toggle

Test these sections by clicking their headers:

✅ **Target Configuration** (should be open by default)
- Click header → should collapse
- Chevron should rotate from down to right

✅ **Authentication** (collapsed by default)
- Click header → should expand
- Chevron should rotate from right to down

✅ **Data Extraction Rules** (open by default)
- Click header → should collapse/expand
- Chevron rotates correctly

✅ **Execution Results** (always visible, no toggle)

✅ **Execution Logs** (collapsed by default)
- Click header → should expand
- Chevron rotates correctly

✅ **Advanced Execution Settings** (inside Target Configuration)
- Click "Advanced Execution Settings" trigger
- Should expand/collapse smoothly
- Small chevron rotates correctly

## 🐛 Debugging Tips

### Check Console for Errors

In the popup DevTools console, you should see:
```javascript
// No errors about sections not found
// If you see: "Section with id 'xxx' not found" → check HTML IDs
```

### Test Toggle Function Manually

In the popup console, try:
```javascript
// Test toggle function
toggleSection('targetSection');

// Check section state
document.getElementById('targetSection').classList.contains('hidden');

// Check chevron rotation
document.querySelector('.card-header .chevron').style.transform;
```

### Verify HTML Structure

Check that these IDs exist in popup.html:
- `targetSection` ✓
- `authSection` ✓
- `extractionSection` ✓
- `logsSection` ✓
- `advancedSettings` ✓

### Check CSS Classes

Verify these classes are applied:
- `.card` - Main card container
- `.card-header` - Clickable header area
- `.card-content` - Content area (can have `hidden` class)
- `.chevron` - Arrow icon in card headers
- `.chevron-small` - Arrow icon in collapsible triggers
- `.collapsed` - Applied to card when content is hidden
- `.hidden` - Applied to content when collapsed

## 🎯 Expected Behavior

### On Page Load
- Target Configuration: **OPEN** (chevron down ↓)
- Authentication: **CLOSED** (chevron right →)
- Data Extraction Rules: **OPEN** (chevron down ↓)
- Execution Logs: **CLOSED** (chevron right →)
- Advanced Settings: **CLOSED** (small chevron right →)

### On Click
- Header clicked → Section toggles
- Chevron rotates smoothly (0.2s transition)
- Content slides in/out
- Card gets/removes `.collapsed` class
- Section gets/removes `.hidden` class

## 🔍 Common Issues & Solutions

### Issue: Chevron doesn't rotate
**Solution**: Check that the chevron element has `transition: transform 0.2s` in CSS

### Issue: Section doesn't toggle
**Solution**: 
- Check that `onclick="toggleSection('id')"` is on the header
- Verify the section ID matches exactly
- Check browser console for JavaScript errors

### Issue: Multiple sections toggle at once
**Solution**: Each section should have a unique ID

### Issue: Chevron points wrong direction initially
**Solution**: The `initializeChevrons()` function should fix this on page load

## 📝 Code Reference

### Toggle Function
```javascript
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) {
    console.error(`Section with id "${sectionId}" not found`);
    return;
  }
  
  const card = section.closest('.card');
  const isCollapsibleContent = section.classList.contains('collapsible-content');
  
  // Toggle visibility
  if (section.classList.contains('hidden')) {
    section.classList.remove('hidden');
    card?.classList.remove('collapsed');
  } else {
    section.classList.add('hidden');
    card?.classList.add('collapsed');
  }
  
  // Rotate chevron
  let chevron;
  if (isCollapsibleContent) {
    const trigger = section.previousElementSibling;
    chevron = trigger?.querySelector('.chevron-small');
  } else {
    chevron = card?.querySelector('.card-header .chevron');
  }
  
  if (chevron) {
    chevron.style.transform = section.classList.contains('hidden') 
      ? 'rotate(0deg)' 
      : 'rotate(180deg)';
  }
}
```

## ✅ Testing Checklist

Before marking as complete:

- [ ] Extension loads without errors
- [ ] All chevrons point correct direction on load
- [ ] Clicking "Target Configuration" header toggles section
- [ ] Clicking "Authentication" header toggles section
- [ ] Clicking "Data Extraction Rules" header toggles section
- [ ] Clicking "Execution Logs" header toggles section
- [ ] Clicking "Advanced Execution Settings" toggles subsection
- [ ] Chevrons rotate smoothly (animation visible)
- [ ] No console errors when toggling
- [ ] Sections stay in correct state after page reload (if saved)

## 🚀 Quick Reload Command

To quickly test changes:
1. Edit popup.js
2. Go to `chrome://extensions`
3. Click reload on DataSage
4. Click extension icon to test

Or use keyboard shortcut:
- Mac: `Cmd + R` (while focused on extensions page)
- Windows/Linux: `Ctrl + R`

---

**Changes are complete!** The toggle functionality should now work perfectly. 
Test it out and let me know if you encounter any issues! 🎉
