import type { Quiz } from '@/types'

/**
 * Hand-authored quizzes, keyed by id and referenced from an article's
 * `media.quiz` frontmatter field.
 */

export const quizzes: Quiz[] = [
  {
    id: 'ancient-egypt',
    title: 'Test Your Knowledge: Ancient Egypt',
    description: 'Six questions on the civilization of the Nile. Each answer comes with an explanation.',
    questions: [
      {
        id: 'q1',
        prompt: 'What did the annual flooding of the Nile deposit across the valley, renewing its soil?',
        options: [
          { id: 'a', text: 'Fertile black silt' },
          { id: 'b', text: 'Red desert sand' },
          { id: 'c', text: 'Volcanic ash' },
          { id: 'd', text: 'Sea salt' },
        ],
        answerId: 'a',
        explanation:
          'Each summer the flood laid down a fresh layer of black silt — so central to Egyptian life that they called their land Kemet, "the Black Land."',
      },
      {
        id: 'q2',
        prompt: 'Around what date were Upper and Lower Egypt first unified into one kingdom?',
        options: [
          { id: 'a', text: 'c. 3100 BCE' },
          { id: 'b', text: 'c. 1500 BCE' },
          { id: 'c', text: 'c. 500 BCE' },
          { id: 'd', text: 'c. 30 BCE' },
        ],
        answerId: 'a',
        explanation:
          'Tradition credits the southern king Narmer (Menes) with uniting the two lands around 3100 BCE, beginning the dynastic age.',
      },
      {
        id: 'q3',
        prompt: 'Which monument is the only surviving Wonder of the Ancient World?',
        options: [
          { id: 'a', text: 'The Great Pyramid of Khufu' },
          { id: 'b', text: 'The Lighthouse of Alexandria' },
          { id: 'c', text: 'The Temple of Karnak' },
          { id: 'd', text: 'The Great Sphinx' },
        ],
        answerId: 'a',
        explanation:
          'Of the seven classical wonders, only the Great Pyramid of Khufu at Giza still stands — and it held the height record for nearly 3,800 years.',
      },
      {
        id: 'q4',
        prompt: 'What was the Egyptian principle of truth, balance and cosmic order?',
        options: [
          { id: 'a', text: 'Maat' },
          { id: 'b', text: 'Ka' },
          { id: 'c', text: 'Duat' },
          { id: 'd', text: 'Isfet' },
        ],
        answerId: 'a',
        explanation:
          'Maat was the order that held the universe together; isfet was the chaos it held back. Ka is the life-force, and the Duat is the underworld.',
      },
      {
        id: 'q5',
        prompt: 'A living pharaoh was regarded as the earthly embodiment of which god?',
        options: [
          { id: 'a', text: 'Horus' },
          { id: 'b', text: 'Anubis' },
          { id: 'c', text: 'Thoth' },
          { id: 'd', text: 'Set' },
        ],
        answerId: 'a',
        explanation:
          'The reigning king was the living Horus; on death he became Osiris, and his heir took up the falcon god’s role.',
      },
      {
        id: 'q6',
        prompt: 'What made the modern decipherment of hieroglyphs possible?',
        options: [
          { id: 'a', text: 'The Rosetta Stone' },
          { id: 'b', text: 'The Dead Sea Scrolls' },
          { id: 'c', text: 'The Book of the Dead' },
          { id: 'd', text: 'The Narmer Palette' },
        ],
        answerId: 'a',
        explanation:
          'The Rosetta Stone carried the same decree in hieroglyphic, demotic and Greek, letting Champollion crack the script in 1822.',
      },
    ],
  },
]

const quizById = new Map(quizzes.map((q) => [q.id, q]))

export function getQuiz(id: string | null | undefined): Quiz | undefined {
  if (!id) return undefined
  return quizById.get(id)
}
