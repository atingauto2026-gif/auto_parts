export default defineNuxtPlugin((nuxtApp) => {
  document.documentElement.classList.add('js')

  let observer: IntersectionObserver | null = null

  function observe() {
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)')
    if (!targets.length) return

    if (!('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('is-revealed'))
      return
    }

    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('is-revealed')
            observer?.unobserve(entry.target)
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -48px 0px' },
      )
    }

    targets.forEach((element) => observer!.observe(element))
  }

  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(observe)
  })
})
