import { useEffect, useRef, useState } from 'react'

/**
 * Freezes visible row order for `freezeMs` after the user last interacted, so a
 * score recompute never reorders rows under a moving cursor. §4.2: "Do not reorder
 * visible rows while the user interacted in the last 10 seconds." Surfaces `changed`
 * so the caller can show the "1 item changed place. Show it" bar.
 */
export function useStableOrder<T extends { id: string }>(freshOrder: T[], lastInteractionAt: number, freezeMs = 10000) {
  const frozenRef = useRef<T[]>(freshOrder)
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    const freshIds = freshOrder.map((x) => x.id).join(',')
    const frozenIds = frozenRef.current.map((x) => x.id).join(',')
    if (freshIds === frozenIds) {
      if (changed) setChanged(false)
      return
    }
    const isFrozen = Date.now() - lastInteractionAt < freezeMs
    if (isFrozen) {
      setChanged(true)
    } else {
      frozenRef.current = freshOrder
      setChanged(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshOrder, lastInteractionAt, freezeMs])

  function showFresh() {
    frozenRef.current = freshOrder
    setChanged(false)
  }

  return { order: changed ? frozenRef.current : freshOrder, changed, showFresh }
}
