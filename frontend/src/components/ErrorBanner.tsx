interface ErrorBannerProps {
  message: string
  onRetry: () => void
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="mx-auto my-8 flex max-w-xl flex-col items-center gap-3 rounded border border-red-300 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
      <p className="text-red-800 dark:text-red-200">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded bg-red-800 px-4 py-2 text-sm text-white hover:bg-red-900"
      >
        Riprova
      </button>
    </div>
  )
}
