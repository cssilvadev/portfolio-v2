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

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    window.addEventListener('mousemove', onMouseMove)

    let animationFrame = 0
    const animate = () => {
      const speed = 0.05 // 👈 controla o arrasto

      pos.current.x += (mouse.current.x - pos.current.x) * speed
      pos.current.y += (mouse.current.y - pos.current.y) * speed

      if (cursorRef.current) {
        cursorRef.current.style.left = `${pos.current.x}px`
        cursorRef.current.style.top = `${pos.current.y}px`
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <div ref={cursorRef} className="cursor-dot" />
}
