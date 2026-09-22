import { useEffect, useState } from 'react'

/** Below 768 wide. §6.9. */
export function useIsHandheld(): boolean {
  const [isHandheld, setIsHandheld] = useState(() => (typeof window === 'undefined' ? false : window.innerWidth < 768))

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsHandheld(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isHandheld
}
