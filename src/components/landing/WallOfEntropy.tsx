import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

const CHARS = '0123456789ABCDEF'

export function WallOfEntropy() {
  const [hashes, setHashes] = useState<Array<string>>([])

  useEffect(() => {
    // Generate initial hashes
    const generateHash = () => {
      return Array.from({ length: 64 })
        .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
        .join('')
    }
    setHashes(Array.from({ length: 20 }).map(generateHash))

    const interval = setInterval(() => {
      setHashes((prev) => prev.map(() => generateHash()))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative py-24 bg-[#0f1216] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-10">
        {hashes.map((hash, i) => (
          <motion.div
            key={i}
            className="text-[#4c89b6] font-mono text-xs md:text-sm whitespace-nowrap overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 4, delay: i * 0.2, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {hash}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-[#e6e9ee] mb-4 tracking-tight">
          AES-256 Encryption
        </h2>
        <p className="text-[#4c89b6] text-lg md:text-xl font-light tracking-widest uppercase">
          Zero Knowledge Architecture
        </p>
      </div>
    </section>
  )
}
