import { motion } from 'motion/react'
import { InteractiveInput } from './InteractiveInput'

const BackgroundMesh = () => {
  // Generate random nodes
  const nodes = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 10,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <svg className="w-full h-full opacity-30">
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size}
            fill="#4c89b6"
            animate={{
              cx: [`${node.x}%`, `${(node.x + 10) % 100}%`, `${node.x}%`],
              cy: [`${node.y}%`, `${(node.y + 15) % 100}%`, `${node.y}%`],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
        {/* Connections could be complex to animate performantly in SVG with React state, 
            so we'll stick to floating nodes for the "constellation" feel or use a simple overlay */}
      </svg>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20 overflow-hidden bg-[#0f1216]">
      <BackgroundMesh />

      {/* Radial gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1216]/50 to-[#0f1216] pointer-events-none z-10"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#4c89b6] opacity-[0.08] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-20 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#e6e9ee] mb-6 leading-tight">
            <span className="block mb-2">Stop Sending Secrets</span>
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-[#4c89b6] to-white blur-xl opacity-20"></span>
              <span className="relative bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-clip-text text-transparent bg-[length:200%_auto] animate-shine">
                in Slack.
              </span>
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The end-to-end encrypted way to share environment variables, API keys,
          and passwords with your team.{' '}
          <span className="text-[#4c89b6]">Secure. Ephemeral. Traceable.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <InteractiveInput />
        </motion.div>
      </div>
    </section>
  )
}
