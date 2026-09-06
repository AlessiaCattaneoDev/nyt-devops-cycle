import { useEffect, useState } from 'react'

/**
 * Rotta di debug per il monitoraggio: montandola lancia un'eccezione a runtime,
 * catturata dall'ErrorBoundary di Sentry in `main.tsx` e inviata come issue.
 *
 * Abilitata solo se VITE_APP_ENV !== 'production' oppure VITE_DEBUG_ENDPOINTS === 'true'
 * (vedi `App.tsx`). Serve per lo step "Simula autonomamente un errore".
 */
export default function DebugBoom() {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (armed) {
      throw new Error('Errore di test intenzionale dalla rotta frontend /debug/boom')
    }
  }, [armed])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Debug · genera un errore</h1>
      <p>
        Premendo il pulsante il frontend lancia un&apos;eccezione non gestita. Verrai reindirizzato
        al fallback dell&apos;ErrorBoundary e l&apos;evento comparira&apos; nella dashboard Sentry.
      </p>
      <button
        type="button"
        onClick={() => setArmed(true)}
        style={{
          padding: '0.6rem 1.2rem',
          fontSize: '1rem',
          cursor: 'pointer',
          border: '1px solid currentColor',
          borderRadius: 6,
          background: 'transparent',
        }}
      >
        Genera errore
      </button>
    </div>
  )
}
