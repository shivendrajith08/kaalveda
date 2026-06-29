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
  {
    id: 'universe',
    title: 'Test Your Knowledge: The Universe',
    description: 'Seven questions spanning the cosmos — from the Big Bang to the planets next door. Each answer comes with an explanation.',
    questions: [
      {
        id: 'q1',
        prompt: 'Roughly how long ago did the Big Bang occur?',
        options: [
          { id: 'a', text: 'About 13.8 billion years ago' },
          { id: 'b', text: 'About 4.6 billion years ago' },
          { id: 'c', text: 'About 1 million years ago' },
          { id: 'd', text: 'About 100 billion years ago' },
        ],
        answerId: 'a',
        explanation:
          'Measurements of the expanding universe and the cosmic microwave background put the age of the cosmos at about 13.8 billion years. The Solar System, by contrast, is only 4.6 billion years old.',
      },
      {
        id: 'q2',
        prompt: 'What is the cosmic microwave background?',
        options: [
          { id: 'a', text: 'The oldest light in the universe, released about 380,000 years after the Big Bang' },
          { id: 'b', text: 'Radio noise from distant galaxies colliding today' },
          { id: 'c', text: 'Light reflected off interstellar dust' },
          { id: 'd', text: 'The glow of the Sun scattered through the atmosphere' },
        ],
        answerId: 'a',
        explanation:
          'When the universe cooled enough for atoms to form, light streamed free for the first time. Stretched by 13.8 billion years of expansion, it now fills the sky as faint microwaves — the strongest evidence for the Big Bang.',
      },
      {
        id: 'q3',
        prompt: 'Where were nearly all the elements heavier than helium — like the carbon and iron in your body — forged?',
        options: [
          { id: 'a', text: 'Inside stars, and in their deaths' },
          { id: 'b', text: 'In the first second of the Big Bang' },
          { id: 'c', text: 'On the surfaces of planets' },
          { id: 'd', text: 'In the empty space between galaxies' },
        ],
        answerId: 'a',
        explanation:
          'The Big Bang made almost only hydrogen and helium. Heavier elements were built by nuclear fusion inside stars and scattered by supernovae — which is why we are, quite literally, made of star stuff.',
      },
      {
        id: 'q4',
        prompt: 'What is the boundary of a black hole called — the point of no return beyond which nothing, not even light, can escape?',
        options: [
          { id: 'a', text: 'The event horizon' },
          { id: 'b', text: 'The accretion disk' },
          { id: 'c', text: 'The singularity' },
          { id: 'd', text: 'The photosphere' },
        ],
        answerId: 'a',
        explanation:
          'The event horizon marks where escape velocity reaches the speed of light. The singularity lies at the centre, and the accretion disk is the glowing gas spiralling in from outside.',
      },
      {
        id: 'q5',
        prompt: 'How many planets does the Solar System have under the current definition?',
        options: [
          { id: 'a', text: 'Eight' },
          { id: 'b', text: 'Nine' },
          { id: 'c', text: 'Seven' },
          { id: 'd', text: 'Twelve' },
        ],
        answerId: 'a',
        explanation:
          'There are eight planets. Pluto was reclassified as a dwarf planet in 2006 because it has not cleared its orbit of other icy bodies in the Kuiper Belt.',
      },
      {
        id: 'q6',
        prompt: 'Which planet is the "Red Planet" and the leading target for future human exploration?',
        options: [
          { id: 'a', text: 'Mars' },
          { id: 'b', text: 'Venus' },
          { id: 'c', text: 'Jupiter' },
          { id: 'd', text: 'Mercury' },
        ],
        answerId: 'a',
        explanation:
          'Mars is reddened by iron oxide in its soil. With a day length and seasons much like Earth’s, plus water ice and ancient riverbeds, it is the most plausible world for humans to one day visit.',
      },
      {
        id: 'q7',
        prompt: 'What event in 1957 is usually said to have begun the Space Age?',
        options: [
          { id: 'a', text: 'The launch of Sputnik 1, the first artificial satellite' },
          { id: 'b', text: 'The first human walking on the Moon' },
          { id: 'c', text: 'The launch of the Hubble Space Telescope' },
          { id: 'd', text: 'The first image of a black hole' },
        ],
        answerId: 'a',
        explanation:
          'The Soviet Union’s Sputnik 1 was the first object placed in orbit, in October 1957. The Moon landing came in 1969, Hubble in 1990, and the first black-hole image in 2019.',
      },
    ],
  },
]

const quizById = new Map(quizzes.map((q) => [q.id, q]))

export function getQuiz(id: string | null | undefined): Quiz | undefined {
  if (!id) return undefined
  return quizById.get(id)
}
