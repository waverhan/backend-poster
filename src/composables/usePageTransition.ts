/**
 * Page Transition Composable
 * Provides smooth page transitions and animations
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'

export function usePageTransition() {
  const router = useRouter()
  const isTransitioning = ref(false)
  const transitionName = ref('fade')

  // Navigate with transition
  const navigateWithTransition = async (
    to: string | { name: string; params?: any; query?: any },
    transition: 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' = 'fade'
  ) => {
    isTransitioning.value = true
    transitionName.value = transition

    try {
      if (typeof to === 'string') {
        await router.push(to)
      } else {
        await router.push(to)
      }
    } finally {
      // Reset after transition completes
      setTimeout(() => {
        isTransitioning.value = false
      }, 300)
    }
  }

  return {
    isTransitioning,
    transitionName,
    navigateWithTransition
  }
}

/**
 * Scroll to top with smooth animation
 */
export function smoothScrollToTop(duration: number = 300) {
  const start = window.pageYOffset
  const startTime = performance.now()

  const scroll = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)

    window.scrollTo(0, start * (1 - easeOut))

    if (progress < 1) {
      requestAnimationFrame(scroll)
    }
  }

  requestAnimationFrame(scroll)
}

/**
 * Scroll to element with smooth animation
 */
export function smoothScrollToElement(
  element: HTMLElement | string,
  offset: number = 0,
  duration: number = 300
) {
  const targetElement = typeof element === 'string'
    ? document.querySelector(element) as HTMLElement
    : element

  if (!targetElement) return

  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset
  const startPosition = window.pageYOffset
  const distance = targetPosition - startPosition
  const startTime = performance.now()

  const scroll = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-in-out)
    const easeInOut = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2

    window.scrollTo(0, startPosition + distance * easeInOut)

    if (progress < 1) {
      requestAnimationFrame(scroll)
    }
  }

  requestAnimationFrame(scroll)
}

/**
 * Animate number counting
 */
export function animateNumber(
  from: number,
  to: number,
  duration: number = 1000,
  callback: (value: number) => void
) {
  const startTime = performance.now()
  const difference = to - from

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)

    const currentValue = from + difference * easeOut
    callback(Math.round(currentValue))

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

/**
 * Stagger animation for lists
 */
export function staggerAnimation(
  elements: HTMLElement[],
  delay: number = 50,
  animationClass: string = 'fade-in'
) {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add(animationClass)
    }, index * delay)
  })
}

/**
 * Parallax scroll effect
 */
export function useParallax(speed: number = 0.5) {
  const handleScroll = (element: HTMLElement) => {
    const scrolled = window.pageYOffset
    const offset = element.offsetTop
    const height = element.offsetHeight

    // Only apply parallax when element is in viewport
    if (scrolled + window.innerHeight > offset && scrolled < offset + height) {
      const yPos = (scrolled - offset) * speed
      element.style.transform = `translateY(${yPos}px)`
    }
  }

  return {
    handleScroll
  }
}

