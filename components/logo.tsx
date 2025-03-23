import type { FC } from "react"

interface LogoProps {
  className?: string
}

export const Logo: FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-lg p-2 flex items-center justify-center">
        <span>DF</span>
      </div>
    </div>
  )
}

