import { useRef, useEffect } from 'react'

type Options = {
  strength?: number
  damping?: number
}

export function useMagneticMove(options: Options = {}) {
  const ref = useRef<HTMLElement>(null)

  const strength = options.strength ?? 0.15
  const damping = options.damping ?? 0.75

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let posX = 0,
        posY = 0,
        velX = 0,
        velY = 0,
        mouseX = 0,
        mouseY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const dx = mouseX - centerX
      const dy = mouseY - centerY

      velX += (dx * strength)
      velY += (dy * strength)

      posX += velX
      posY += velY

      velX *= damping
      velY *= damping

      el.style.transform = `translate(${posX}px, ${posY}px)`

      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    animate()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [strength, damping])

  return ref
}
