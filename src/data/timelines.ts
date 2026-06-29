import type { Timeline } from '@/types'

/**
 * Hand-authored timelines, keyed by id and referenced from an article's
 * `media.timeline` frontmatter field.
 */

export const timelines: Timeline[] = [
  {
    id: 'ancient-egypt',
    title: 'Three Thousand Years on the Nile',
    subtitle: 'The dynastic ages of ancient Egypt, from unification to Rome.',
    events: [
      {
        id: 'unification',
        year: -3100,
        title: 'Unification of the Two Lands',
        description:
          'A southern king remembered as Narmer (Menes) unites Upper and Lower Egypt, founding the dynastic state.',
        era: 'Early Dynastic',
        factStatus: 'verified',
      },
      {
        id: 'step-pyramid',
        year: -2630,
        title: 'The Step Pyramid of Djoser',
        description:
          'Imhotep designs the first monumental stone building in history at Saqqara — the prototype pyramid.',
        era: 'Old Kingdom',
        factStatus: 'verified',
      },
      {
        id: 'great-pyramid',
        year: -2560,
        title: 'The Great Pyramid of Khufu',
        description:
          'The largest pyramid is raised at Giza, remaining the tallest structure on Earth for nearly 3,800 years.',
        era: 'Old Kingdom',
        factStatus: 'verified',
      },
      {
        id: 'first-intermediate',
        year: -2181,
        title: 'Collapse of the Old Kingdom',
        description:
          'Central power fragments into the First Intermediate Period amid drought and weakening kingship.',
        era: 'First Intermediate',
        factStatus: 'verified',
      },
      {
        id: 'middle-kingdom',
        year: -2055,
        title: 'Reunification — the Middle Kingdom',
        description:
          'Mentuhotep II reunites Egypt, opening a golden age of literature and administration.',
        era: 'Middle Kingdom',
        factStatus: 'verified',
      },
      {
        id: 'new-kingdom',
        year: -1550,
        title: 'Birth of the New Kingdom',
        description:
          'Ahmose I expels the Hyksos and founds the imperial age of Egypt’s greatest wealth and power.',
        era: 'New Kingdom',
        factStatus: 'verified',
      },
      {
        id: 'hatshepsut',
        year: -1479,
        title: 'The Reign of Hatshepsut',
        description:
          'One of the few female pharaohs rules in her own right, launching trade expeditions and great building works.',
        era: 'New Kingdom',
        factStatus: 'verified',
      },
      {
        id: 'akhenaten',
        year: -1353,
        title: 'Akhenaten and the Aten',
        description:
          'The "heretic king" sidelines the old gods for the sun-disk Aten — an early experiment in single-god worship.',
        era: 'New Kingdom',
        factStatus: 'verified',
      },
      {
        id: 'tutankhamun',
        year: -1332,
        title: 'The Boy-King Tutankhamun',
        description:
          'A short reign that restores the old religion — and, millennia later, the most famous tomb ever found.',
        era: 'New Kingdom',
        factStatus: 'verified',
      },
      {
        id: 'ramesses',
        year: -1279,
        title: 'Ramesses the Great',
        description:
          'Ramesses II reigns for 66 years, building Abu Simbel and signing history’s first known peace treaty.',
        era: 'New Kingdom',
        factStatus: 'verified',
      },
      {
        id: 'alexander',
        year: -332,
        title: 'Alexander the Great Takes Egypt',
        description:
          'Egypt falls to Alexander without a fight; his general Ptolemy founds a Greek-speaking dynasty.',
        era: 'Ptolemaic',
        factStatus: 'verified',
      },
      {
        id: 'rosetta',
        year: -196,
        title: 'The Rosetta Stone Decree',
        description:
          'A priestly decree is carved in hieroglyphic, demotic and Greek — the future key to decipherment.',
        era: 'Ptolemaic',
        factStatus: 'verified',
      },
      {
        id: 'cleopatra',
        year: -30,
        title: 'Death of Cleopatra',
        description:
          'The last active pharaoh dies; Egypt becomes a province of the Roman Empire, ending three millennia of independence.',
        era: 'Roman',
        factStatus: 'verified',
      },
      {
        id: 'champollion',
        year: 1822,
        title: 'Hieroglyphs Deciphered',
        description:
          'Jean-François Champollion reads hieroglyphs again after 1,400 years of silence, founding Egyptology.',
        era: 'Modern',
        factStatus: 'verified',
      },
      {
        id: 'carter',
        year: 1922,
        title: 'Discovery of Tutankhamun’s Tomb',
        description:
          'Howard Carter opens the near-intact tomb (KV62), igniting a worldwide fascination with ancient Egypt.',
        era: 'Modern',
        factStatus: 'verified',
      },
    ],
  },
]

const timelineById = new Map(timelines.map((t) => [t.id, t]))

export function getTimeline(id: string | null | undefined): Timeline | undefined {
  if (!id) return undefined
  return timelineById.get(id)
}
