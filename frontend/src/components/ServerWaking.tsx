import { useEffect, useState } from 'react'

// L'API est hébergée sur une offre gratuite : elle peut mettre jusqu'à une minute à se réveiller
export default function ServerWaking({ label = 'Chargement…' }: { label?: string }) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-accent" aria-hidden="true" />
      <p className="text-sm font-medium text-text">{slow ? 'Réveil du serveur…' : label}</p>
      {slow && (
        <p className="max-w-xs text-xs text-muted">
          L’API est hébergée gratuitement et se met en veille : le premier chargement peut prendre jusqu’à une minute.
        </p>
      )}
    </div>
  )
}
