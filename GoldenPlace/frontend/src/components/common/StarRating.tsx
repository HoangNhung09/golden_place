import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxStars?: number
  onRatingChange?: (rating: number) => void
  interactive?: boolean
  size?: number
}

export default function StarRating({
  rating,
  maxStars = 5,
  onRatingChange,
  interactive = false,
  size = 20
}: StarRatingProps) {
  return (
    <div className="flex space-x-1">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= rating
        
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-[#e8c96d] text-[#e8c96d]'
                  : 'text-[#a0a8c0]/40'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
