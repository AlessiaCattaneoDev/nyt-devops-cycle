export default function Loader() {
  return (
    <div className="flex justify-center py-16">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100"
        role="status"
        aria-label="Caricamento"
      />
    </div>
  )
}
