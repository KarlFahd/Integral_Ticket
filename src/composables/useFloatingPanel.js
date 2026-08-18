import { ref, nextTick, onMounted, onUnmounted } from 'vue'

// Shared logic behind every click-to-open dropdown-style panel (BaseTimePicker,
// BaseWheelSelect). The panel itself is meant to be rendered via <Teleport
// to="body"> by the component using this composable — NOT as a normal
// absolutely-positioned child — because both time pickers live inside
// CalendarPage's `.events-panel`, which has `overflow: hidden` (for its own
// rounded corners). Any popover nested inside that gets silently clipped the
// moment it needs to extend past the panel's edge, no matter how carefully
// left/right it's aligned. Teleporting escapes that entirely; this composable
// then computes real viewport pixel coordinates (position: fixed) instead of
// relying on a CSS-only left/right/top/bottom relative to a parent.
export function useFloatingPanel() {
  const triggerRef = ref(null)
  const panelRef = ref(null)
  const isOpen = ref(false)
  const isPositioned = ref(false)
  const style = ref({})

  const GAP = 6
  const VIEWPORT_PADDING = 8

  // Applies the current measurement to `style` — does NOT touch
  // `isPositioned`. Used both for the initial open (see `open()`, which
  // controls reveal timing itself) and for keeping an already-open panel
  // anchored during scroll/resize.
  function position() {
    if (!triggerRef.value || !panelRef.value) return
    const field = triggerRef.value.getBoundingClientRect()
    const panel = panelRef.value.getBoundingClientRect()

    const overflowsRight = field.left + panel.width > window.innerWidth - VIEWPORT_PADDING
    const overflowsBottom = field.bottom + GAP + panel.height > window.innerHeight - VIEWPORT_PADDING

    const left = overflowsRight
      ? Math.max(VIEWPORT_PADDING, field.right - panel.width)
      : field.left
    const top = overflowsBottom
      ? field.top - GAP - panel.height
      : field.bottom + GAP

    style.value = { position: 'fixed', top: `${top}px`, left: `${left}px` }
  }

  async function open(onOpened) {
    isOpen.value = true
    isPositioned.value = false
    await nextTick()
    onOpened?.()
    position()
    // On a fresh page load, this first-ever measurement can occasionally
    // land one frame before the teleported panel's own layout has fully
    // settled (seen as the panel briefly opening on the wrong side of the
    // screen on the very first click after loading the page — correct
    // every time after that). The panel is still invisible at this point
    // (isPositioned is false), so re-measuring on the next frame before
    // revealing it fixes this without ever showing the wrong position.
    await new Promise(requestAnimationFrame)
    position()
    isPositioned.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle(onOpened) {
    if (isOpen.value) close()
    else open(onOpened)
  }

  // Since the panel is teleported to <body>, it's no longer a DOM descendant
  // of triggerRef — a click inside it (e.g. picking a wheel value) must be
  // checked against panelRef too, or every single selection would register
  // as an "outside" click and close the panel immediately.
  function handleClickOutside(event) {
    if (!isOpen.value) return
    const insideTrigger = triggerRef.value?.contains(event.target)
    const insidePanel = panelRef.value?.contains(event.target)
    if (!insideTrigger && !insidePanel) close()
  }

  function handleReposition() {
    if (isOpen.value) position()
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', handleReposition)
    // capture: true — catches scrolling on any nested scrollable ancestor,
    // not just the window itself.
    window.addEventListener('scroll', handleReposition, true)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', handleReposition)
    window.removeEventListener('scroll', handleReposition, true)
  })

  return { triggerRef, panelRef, isOpen, isPositioned, style, open, close, toggle }
}
