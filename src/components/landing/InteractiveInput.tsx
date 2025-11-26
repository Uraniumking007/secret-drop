import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy, Lock } from 'lucide-react'
import { toast } from 'sonner'

const MATRIX_CHARS = '01'

export function InteractiveInput() {
  const [inputState, setInputState] = useState<'idle' | 'typing' | 'generated'>(
    'idle',
  )
  const [text, setText] = useState('')
  const [matrixText, setMatrixText] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    setText(newText)
    if (newText.length > 0 && inputState === 'idle') {
      setInputState('typing')
    } else if (newText.length === 0) {
      setInputState('idle')
    }

    // Matrix effect logic
    const matrix = newText
      .split('')
      .map((char) => {
        if (Math.random() > 0.5)
          return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        return char
      })
      .join('')
    setMatrixText(matrix)
  }

  const generateLink = () => {
    if (!text) return

    // Simulate API call/generation
    setTimeout(() => {
      setGeneratedLink(
        `secretdrop.bhaveshp.dev/v/${Math.random().toString(36).substring(7)}`,
      )
      setInputState('generated')
      toast.success('Secret link generated!')
    }, 600)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-12 perspective-1000">
      <AnimatePresence mode="wait">
        {inputState !== 'generated' ? (
          <motion.div
            key="input-box"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className="relative group"
          >
            {/* Glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

            <div className="relative bg-card rounded-xl border border-border p-2 flex items-center shadow-2xl">
              <div className="pl-4 pr-2 text-primary">
                <Lock className="w-5 h-5" />
              </div>

              <div className="relative flex-1 h-12">
                {/* Matrix Text Overlay */}
                {inputState === 'typing' && (
                  <div className="absolute inset-0 flex items-center text-green-500/50 font-mono pointer-events-none overflow-hidden whitespace-pre">
                    {matrixText}
                  </div>
                )}

                <input
                  type="text"
                  value={text}
                  onChange={handleInputChange}
                  placeholder="Paste a secret to see magic..."
                  className={`w-full h-full bg-transparent border-none outline-none text-foreground placeholder-muted-foreground font-medium px-2 ${inputState === 'typing' ? 'text-transparent caret-primary' : ''}`}
                  autoComplete="off"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateLink}
                disabled={!text}
                className={`ml-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${text
                    ? 'bg-primary text-primary-foreground shadow-[0_0_20px_var(--color-primary)] hover:shadow-[0_0_30px_var(--color-primary)]'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
                  }`}
              >
                {inputState === 'typing' ? 'Encrypt' : 'Generate'}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result-box"
            initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-primary rounded-xl blur opacity-40"></div>
            <div className="relative bg-card rounded-xl border border-green-500/30 p-2 flex items-center shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>

              <div className="pl-4 pr-3 text-green-500">
                <Check className="w-5 h-5" />
              </div>

              <div className="flex-1 font-mono text-foreground text-sm truncate px-2 select-all">
                {generatedLink}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="ml-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-medium text-sm flex items-center gap-2 border border-border transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-4"
            >
              <button
                onClick={() => {
                  setInputState('idle')
                  setText('')
                  setGeneratedLink('')
                }}
                className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Create another secret
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
