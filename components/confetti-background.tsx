"use client"

export default function ConfettiBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Generate confetti pieces with different colors, sizes, and animations */}
      {Array.from({ length: 30 }).map((_, i) => {
        // Randomize confetti properties
        const colors = [
          "bg-festive-yellow",
          "bg-festive-blue",
          "bg-festive-green",
          "bg-festive-pink",
          "bg-festive-purple",
        ]
        const sizes = ["h-2 w-2", "h-3 w-3", "h-4 w-4"]
        const opacities = ["opacity-20", "opacity-30", "opacity-40"]
        const delays = ["delay-0", "delay-1000", "delay-2000", "delay-3000", "delay-4000"]
        const animations = ["animate-confetti-slow", "animate-confetti-medium", "animate-confetti-fast"]

        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = sizes[Math.floor(Math.random() * sizes.length)]
        const opacity = opacities[Math.floor(Math.random() * opacities.length)]
        const delay = delays[Math.floor(Math.random() * delays.length)]
        const animation = animations[Math.floor(Math.random() * animations.length)]

        // Random position
        const left = `${Math.random() * 100}%`
        const top = `${Math.random() * 30}%`

        // Random shape (circle or square)
        const shape = Math.random() > 0.5 ? "rounded-full" : "rotate-45"

        return (
          <div
            key={i}
            className={`absolute ${color} ${size} ${opacity} ${shape} ${animation} ${delay}`}
            style={{ left, top }}
          />
        )
      })}
    </div>
  )
}
