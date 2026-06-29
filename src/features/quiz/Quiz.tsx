import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X, RotateCcw, ArrowRight, Trophy } from 'lucide-react'
import type { Quiz as QuizData } from '@/types'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnswerState {
  chosen: string
  correct: boolean
}

export function Quiz({ quiz }: { quiz: QuizData }) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({})
  const [finished, setFinished] = useState(false)

  const total = quiz.questions.length
  const question = quiz.questions[index]
  const score = useMemo(
    () => Object.values(answers).filter((a) => a.correct).length,
    [answers],
  )

  const reset = () => {
    setIndex(0)
    setSelected(null)
    setRevealed(false)
    setAnswers({})
    setFinished(false)
  }

  const choose = (optionId: string) => {
    if (revealed) return
    setSelected(optionId)
    setRevealed(true)
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { chosen: optionId, correct: optionId === question.answerId },
    }))
  }

  const next = () => {
    if (index + 1 >= total) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  if (finished) {
    const pct = Math.round((score / total) * 100)
    const verdict =
      pct === 100 ? 'A perfect path.' : pct >= 70 ? 'Well travelled.' : pct >= 40 ? 'A good start.' : 'Worth another journey.'
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card flex flex-col items-center p-8 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Trophy size={26} />
        </span>
        <p className="label mt-5 text-faint">Your result</p>
        <p className="mt-2 font-display text-4xl font-semibold text-fg">
          {score}
          <span className="text-muted"> / {total}</span>
        </p>
        <p className="mt-1 text-gold">{verdict}</p>
        <div className="mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-elevated">
          <motion.div
            className="h-full rounded-full bg-gold"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <button type="button" onClick={reset} className="btn btn-gold mt-7">
          <RotateCcw size={16} /> Try again
        </button>
      </motion.div>
    )
  }

  return (
    <div className="card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="label text-faint">
          Question {index + 1} / {total}
        </span>
        <span className="label text-gold">{score} correct</span>
      </div>

      {/* progress */}
      <div className="mt-3 flex gap-1.5">
        {quiz.questions.map((q, i) => (
          <span
            key={q.id}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < index ? 'bg-gold' : i === index ? 'bg-gold/60' : 'bg-elevated',
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="mt-6 font-display text-xl font-semibold text-fg">{question.prompt}</h3>

          <div className="mt-5 space-y-2.5">
            {question.options.map((opt) => {
              const isAnswer = opt.id === question.answerId
              const isChosen = opt.id === selected
              const showCorrect = revealed && isAnswer
              const showWrong = revealed && isChosen && !isAnswer
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(opt.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-[0.95rem] transition-all',
                    !revealed && 'border-border hover:border-border-strong hover:bg-gold/5',
                    showCorrect && 'border-verified/60 bg-verified/10 text-fg',
                    showWrong && 'border-speculation/60 bg-speculation/10 text-fg',
                    revealed && !showCorrect && !showWrong && 'border-border opacity-60',
                  )}
                >
                  <span>{opt.text}</span>
                  {showCorrect && <Check size={18} className="shrink-0 text-verified" />}
                  {showWrong && <X size={18} className="shrink-0 text-speculation" />}
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="mt-5 rounded-xl border border-border bg-elevated/60 p-4 text-sm leading-relaxed text-muted">
                  <span className="font-semibold text-gold">
                    {answers[question.id]?.correct ? 'Correct. ' : 'Not quite. '}
                  </span>
                  {question.explanation}
                </p>
                <div className="mt-5 flex justify-end">
                  <button type="button" onClick={next} className="btn btn-gold">
                    {index + 1 >= total ? 'See result' : 'Next question'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
