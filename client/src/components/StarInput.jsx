import React, { useState } from 'react'
import { FaStar } from 'react-icons/fa'

const labels = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời']

const StarInput = ({ rating, onChange }) => {
  const [hovered, setHovered] = useState(0)
  const display = hovered || rating

  return (
    <div className="flex flex-col items-start gap-1">
      {/* Hàng ngôi sao */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`cursor-pointer text-2xl transition-colors ${
              display >= star ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          />
        ))}
      </div>

      {/* Nhãn mô tả */}
      {display > 0 && (
        <span className="text-sm text-gray-600 italic">
          {labels[display - 1]}
        </span>
      )}
    </div>
  )
}

export default StarInput
