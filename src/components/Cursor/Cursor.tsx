import { useEffect, useRef } from 'react'
import './Cursor.css'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  const mouse = useRef({ x: 0, y: 0 })
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canUseCustomCursor =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canUseCustomCursor) return

    let animationFrame = 0
    let visible = false
    const hideCursor = () => {
      visible = false
      if (cursorRef.current) cursorRef.current.style.opacity = '0'
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }
    const animate = () => {
      const speed = 0.05

      pos.current.x += (mouse.current.x - pos.current.x) * speed
      pos.current.y += (mouse.current.y - pos.current.y) * speed

      if (cursorRef.current) {
        cursorRef.current.style.left = `${pos.current.x}px`
        cursorRef.current.style.top = `${pos.current.y}px`
      }

      if (Math.abs(mouse.current.x - pos.current.x) > 0.5 ||
          Math.abs(mouse.current.y - pos.current.y) > 0.5) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        animationFrame = 0
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) {
        hideCursor()
        return
      }
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      if (!visible) {
        pos.current = { ...mouse.current }
        visible = true
        if (cursorRef.current) {
          cursorRef.current.style.left = `${e.clientX}px`
          cursorRef.current.style.top = `${e.clientY}px`
          cursorRef.current.style.opacity = '1'
        }
      }
      if (!animationFrame) animationFrame = requestAnimationFrame(animate)
    }
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Tab') hideCursor() }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('blur', hideCursor)
    document.documentElement.addEventListener('mouseleave', hideCursor)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('blur', hideCursor)
      document.documentElement.removeEventListener('mouseleave', hideCursor)
      document.removeEventListener('keydown', onKeyDown)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <div ref={cursorRef} className="cursor-dot" aria-hidden="true" />
}
