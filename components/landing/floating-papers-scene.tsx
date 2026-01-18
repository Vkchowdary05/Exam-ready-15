'use client'

// CSS-based floating papers scene - no Three.js dependencies
// This provides a reliable, performant animation that works across all browsers

export function FloatingPapersScene() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden opacity-80">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />

      {/* Floating paper elements */}
      <div className="absolute inset-0">
        {/* Paper 1 */}
        <div
          className="absolute rounded-lg bg-white/90 shadow-xl backdrop-blur-sm"
          style={{
            width: '70px',
            height: '95px',
            left: '10%',
            top: '20%',
            transform: 'rotate(-12deg)',
            animation: 'floatPaper 6s ease-in-out infinite',
            animationDelay: '0s',
          }}
        >
          <div className="absolute top-4 left-3 right-3 h-1 bg-slate-200 rounded" />
          <div className="absolute top-7 left-3 right-3 h-1 bg-slate-200 rounded" />
          <div className="absolute top-10 left-3 right-6 h-1 bg-slate-200 rounded" />
        </div>

        {/* Paper 2 */}
        <div
          className="absolute rounded-lg bg-amber-50/90 shadow-xl backdrop-blur-sm"
          style={{
            width: '80px',
            height: '105px',
            right: '15%',
            top: '15%',
            transform: 'rotate(8deg)',
            animation: 'floatPaper 7s ease-in-out infinite',
            animationDelay: '0.5s',
          }}
        >
          <div className="absolute top-4 left-3 right-3 h-1 bg-amber-200/60 rounded" />
          <div className="absolute top-7 left-3 right-3 h-1 bg-amber-200/60 rounded" />
          <div className="absolute top-10 left-3 right-5 h-1 bg-amber-200/60 rounded" />
        </div>

        {/* Paper 3 */}
        <div
          className="absolute rounded-lg bg-blue-50/90 shadow-xl backdrop-blur-sm"
          style={{
            width: '65px',
            height: '88px',
            left: '25%',
            top: '55%',
            transform: 'rotate(15deg)',
            animation: 'floatPaper 5.5s ease-in-out infinite',
            animationDelay: '1s',
          }}
        >
          <div className="absolute top-4 left-3 right-3 h-1 bg-blue-200/60 rounded" />
          <div className="absolute top-7 left-3 right-3 h-1 bg-blue-200/60 rounded" />
          <div className="absolute top-10 left-3 right-4 h-1 bg-blue-200/60 rounded" />
        </div>

        {/* Paper 4 */}
        <div
          className="absolute rounded-lg bg-green-50/90 shadow-xl backdrop-blur-sm"
          style={{
            width: '55px',
            height: '75px',
            right: '20%',
            top: '60%',
            transform: 'rotate(-6deg)',
            animation: 'floatPaper 6.5s ease-in-out infinite',
            animationDelay: '1.5s',
          }}
        >
          <div className="absolute top-3 left-2 right-2 h-1 bg-green-200/60 rounded" />
          <div className="absolute top-6 left-2 right-2 h-1 bg-green-200/60 rounded" />
          <div className="absolute top-9 left-2 right-4 h-1 bg-green-200/60 rounded" />
        </div>

        {/* Paper 5 */}
        <div
          className="absolute rounded-lg bg-pink-50/90 shadow-xl backdrop-blur-sm"
          style={{
            width: '72px',
            height: '98px',
            left: '50%',
            top: '35%',
            transform: 'rotate(3deg) translateX(-50%)',
            animation: 'floatPaper 5s ease-in-out infinite',
            animationDelay: '2s',
          }}
        >
          <div className="absolute top-4 left-3 right-3 h-1 bg-pink-200/60 rounded" />
          <div className="absolute top-7 left-3 right-3 h-1 bg-pink-200/60 rounded" />
          <div className="absolute top-10 left-3 right-5 h-1 bg-pink-200/60 rounded" />
        </div>

        {/* Paper 6 */}
        <div
          className="absolute rounded-lg bg-purple-50/90 shadow-xl backdrop-blur-sm"
          style={{
            width: '60px',
            height: '82px',
            left: '5%',
            top: '45%',
            transform: 'rotate(-18deg)',
            animation: 'floatPaper 7.5s ease-in-out infinite',
            animationDelay: '2.5s',
          }}
        >
          <div className="absolute top-3 left-2 right-2 h-1 bg-purple-200/60 rounded" />
          <div className="absolute top-6 left-2 right-2 h-1 bg-purple-200/60 rounded" />
          <div className="absolute top-9 left-2 right-3 h-1 bg-purple-200/60 rounded" />
        </div>

        {/* Paper 7 */}
        <div
          className="absolute rounded-lg bg-cyan-50/90 shadow-xl backdrop-blur-sm"
          style={{
            width: '75px',
            height: '100px',
            right: '8%',
            top: '35%',
            transform: 'rotate(10deg)',
            animation: 'floatPaper 6s ease-in-out infinite',
            animationDelay: '3s',
          }}
        >
          <div className="absolute top-4 left-3 right-3 h-1 bg-cyan-200/60 rounded" />
          <div className="absolute top-7 left-3 right-3 h-1 bg-cyan-200/60 rounded" />
          <div className="absolute top-10 left-3 right-6 h-1 bg-cyan-200/60 rounded" />
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/40"
            style={{
              left: `${5 + (i * 6.5)}%`,
              top: `${10 + (i % 4) * 22}%`,
              animation: `floatParticle ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes floatPaper {
          0%, 100% { 
            transform: translateY(0) rotate(var(--rotate, 0deg)); 
          }
          50% { 
            transform: translateY(-15px) rotate(var(--rotate, 0deg)); 
          }
        }
        @keyframes floatParticle {
          0%, 100% { 
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-25px) scale(1.2);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )
}
