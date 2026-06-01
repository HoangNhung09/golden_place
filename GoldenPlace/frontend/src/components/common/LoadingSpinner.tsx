import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ fullPage = false, className = '' }) {
  const spinner = <Loader2 className={`h-8 w-8 animate-spin text-[#c9a84c] ${className}`} />

  if (fullPage) {
    return (
      <div className="min-h-screen bg-[#1a1f36] flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-6">
      {spinner}
    </div>
  )
}
