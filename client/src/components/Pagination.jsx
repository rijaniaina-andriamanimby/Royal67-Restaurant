import React from 'react'

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center gap-2 mt-6">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === i + 1
              ? 'bg-emerald-600 text-white'
              : 'border hover:bg-gray-100'
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  )
}

export default Pagination
