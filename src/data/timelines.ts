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
  {
    id: 'universe',
    title: 'A Timeline of the Cosmos',
    subtitle:
      'From the first instant of the Big Bang to the far future of the Sun — 13.8 billion years of cosmic history.',
    events: [
      {
        id: 'big-bang',
        year: -13_800_000_000,
        title: 'The Big Bang',
        description:
          'Space, time, matter and energy emerge from a state hotter and denser than anything since. Within three minutes the first atomic nuclei are forged.',
        era: 'First Light',
        factStatus: 'verified',
      },
      {
        id: 'recombination',
        year: -13_799_620_000,
        title: 'The First Light Breaks Free',
        description:
          'About 380,000 years in, the universe cools enough for atoms to form and light to stream freely — the glow we now detect as the cosmic microwave background.',
        era: 'Recombination',
        factStatus: 'verified',
      },
      {
        id: 'cosmic-dawn',
        year: -13_600_000_000,
        title: 'The Cosmic Dawn',
        description:
          'After a long dark age, gravity gathers hydrogen into the first stars, which switch on and begin to forge the heavier elements.',
        era: 'Cosmic Dawn',
        factStatus: 'theory',
      },
      {
        id: 'first-galaxies',
        year: -13_400_000_000,
        title: 'The First Galaxies',
        description:
          'Stars gather into the earliest galaxies — some now being captured by the James Webb Space Telescope as they were in the universe’s infancy.',
        era: 'Cosmic Dawn',
        factStatus: 'verified',
      },
      {
        id: 'solar-system',
        year: -4_600_000_000,
        title: 'Birth of the Solar System',
        description:
          'A collapsing cloud of gas and dust forms the Sun and, from the surrounding disk, the planets, moons, asteroids and comets.',
        era: 'Solar System',
        factStatus: 'verified',
      },
      {
        id: 'moon-forms',
        year: -4_500_000_000,
        title: 'The Moon is Born',
        description:
          'A Mars-sized body strikes the young Earth; debris flung into orbit coalesces into the Moon — the leading giant-impact hypothesis.',
        era: 'Solar System',
        factStatus: 'theory',
      },
      {
        id: 'galileo',
        year: 1610,
        title: 'Galileo Turns a Telescope Skyward',
        description:
          'Galileo sees craters on the Moon, the moons of Jupiter and the phases of Venus — the birth of telescopic astronomy.',
        era: 'Telescope Age',
        factStatus: 'verified',
      },
      {
        id: 'sputnik',
        year: 1957,
        title: 'The Space Age Begins',
        description:
          'The Soviet Union launches Sputnik 1, the first artificial satellite, opening the era of spaceflight.',
        era: 'Space Age',
        factStatus: 'verified',
      },
      {
        id: 'apollo-11',
        year: 1969,
        title: 'Humans Walk on the Moon',
        description:
          'Apollo 11 lands and Neil Armstrong steps onto the lunar surface — the farthest humans have ever travelled from Earth.',
        era: 'Space Age',
        factStatus: 'verified',
      },
      {
        id: 'hubble',
        year: 1990,
        title: 'Hubble Opens a New Eye',
        description:
          'The Hubble Space Telescope rises above the atmosphere, helping pin down the age of the universe and imaging its most distant galaxies.',
        era: 'Space Age',
        factStatus: 'verified',
      },
      {
        id: 'first-black-hole-image',
        year: 2019,
        title: 'First Image of a Black Hole',
        description:
          'The Event Horizon Telescope reveals a ring of fire around the giant black hole in galaxy M87 — the first direct image of one.',
        era: 'Modern',
        factStatus: 'verified',
      },
      {
        id: 'jwst',
        year: 2021,
        title: 'The James Webb Space Telescope',
        description:
          'Launched on Christmas Day, Webb unfolds a million miles from Earth to study the first galaxies and the atmospheres of distant worlds.',
        era: 'Modern',
        factStatus: 'verified',
      },
      {
        id: 'sun-red-giant',
        year: 5_000_000_000,
        title: 'The Sun Becomes a Red Giant',
        description:
          'In roughly five billion years the Sun will swell and brighten, scorching the inner planets before shedding its layers and fading to a white dwarf.',
        era: 'Far Future',
        factStatus: 'theory',
      },
    ],
  },
]

const timelineById = new Map(timelines.map((t) => [t.id, t]))

export function getTimeline(id: string | null | undefined): Timeline | undefined {
  if (!id) return undefined
  return timelineById.get(id)
}
