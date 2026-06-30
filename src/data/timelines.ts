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
  {
    id: 'rome',
    title: 'A Thousand Years of Rome',
    subtitle:
      'From a village on the Tiber to the fall of the West — the founding, the Republic, the Empire and its long unravelling.',
    events: [
      {
        id: 'founding',
        year: -753,
        title: 'The Founding of Rome',
        description:
          'Tradition dates the founding of the city to Romulus, who according to legend killed his twin Remus and named Rome for himself.',
        era: 'Monarchy',
        factStatus: 'theory',
      },
      {
        id: 'republic',
        year: -509,
        title: 'Birth of the Republic',
        description:
          'The Romans expel the last king, Tarquin the Proud, and swear off monarchy — founding a republic of consuls, Senate and assemblies.',
        era: 'Republic',
        factStatus: 'verified',
      },
      {
        id: 'twelve-tables',
        year: -451,
        title: 'The Twelve Tables',
        description:
          'Rome publishes its first written law code, a milestone in the plebeians’ long struggle for rights against the patrician elite.',
        era: 'Republic',
        factStatus: 'verified',
      },
      {
        id: 'punic-wars',
        year: -264,
        title: 'The Punic Wars Begin',
        description:
          'A century of struggle with Carthage opens; despite Hannibal’s invasion of Italy, Rome emerges master of the western Mediterranean.',
        era: 'Republic',
        factStatus: 'verified',
      },
      {
        id: 'cannae',
        year: -216,
        title: 'Catastrophe at Cannae',
        description:
          'Hannibal annihilates a far larger Roman army in a single afternoon — the worst defeat Rome ever survived, and learned from.',
        era: 'Republic',
        factStatus: 'verified',
      },
      {
        id: 'rubicon',
        year: -49,
        title: 'Caesar Crosses the Rubicon',
        description:
          'Julius Caesar leads his army against Rome itself, plunging the Republic into the civil war that will end it.',
        era: 'Republic',
        factStatus: 'verified',
      },
      {
        id: 'ides',
        year: -44,
        title: 'The Ides of March',
        description:
          'Caesar, dictator for life, is assassinated by senators hoping to save the Republic — and instead unleash its final collapse.',
        era: 'Republic',
        factStatus: 'verified',
      },
      {
        id: 'augustus',
        year: -27,
        title: 'Augustus Founds the Empire',
        description:
          'Octavian becomes Augustus, ruling as "first citizen" — a monarchy in republican dress that opens two centuries of peace.',
        era: 'Empire',
        factStatus: 'verified',
      },
      {
        id: 'colosseum',
        year: 80,
        title: 'The Colosseum Opens',
        description:
          'The great amphitheatre is inaugurated with a hundred days of games — the architectural symbol of imperial Rome at its height.',
        era: 'Empire',
        factStatus: 'verified',
      },
      {
        id: 'trajan-peak',
        year: 117,
        title: 'The Empire at its Greatest Extent',
        description:
          'Under Trajan the Roman world reaches from the Atlantic to the Persian Gulf — the high-water mark of Roman power.',
        era: 'Empire',
        factStatus: 'verified',
      },
      {
        id: 'caracalla',
        year: 212,
        title: 'Citizenship for All',
        description:
          'The emperor Caracalla extends Roman citizenship to nearly every free inhabitant of the empire — the city makes its whole world Roman.',
        era: 'Empire',
        factStatus: 'verified',
      },
      {
        id: 'constantine',
        year: 313,
        title: 'Constantine and the Cross',
        description:
          'The Edict of Milan legalises Christianity; within a century the faith Rome once persecuted becomes the empire’s official religion.',
        era: 'Late Empire',
        factStatus: 'verified',
      },
      {
        id: 'sack-410',
        year: 410,
        title: 'The Sack of Rome',
        description:
          'Alaric’s Visigoths plunder Rome for three days — the first foreign army to take the city in 800 years, a shock felt across the world.',
        era: 'Late Empire',
        factStatus: 'verified',
      },
      {
        id: 'fall-476',
        year: 476,
        title: 'Fall of the Western Empire',
        description:
          'The general Odoacer deposes the last western emperor, Romulus Augustulus. The Latin West ends; the Greek East lives on as Byzantium.',
        era: 'Late Empire',
        factStatus: 'verified',
      },
    ],
  },
  {
    id: 'greece',
    title: 'The Greek Age',
    subtitle:
      'From the Bronze-Age citadels of the Mycenaeans to the Roman conquest — the rise of the polis, the classical golden age and the empire of Alexander.',
    events: [
      {
        id: 'mycenaeans',
        year: -1600,
        title: 'The Mycenaean Civilization',
        description:
          'The first great Greek-speaking civilization rises in fortified citadels like Mycenae and Pylos — the warrior world later remembered in Homer’s epics.',
        era: 'Bronze Age',
        factStatus: 'verified',
      },
      {
        id: 'trojan-war',
        year: -1200,
        title: 'The Trojan War',
        description:
          'Around the time the Mycenaean world begins to collapse, legend places the ten-year Greek siege of Troy — a war whose historical reality is still debated.',
        era: 'Bronze Age',
        factStatus: 'theory',
      },
      {
        id: 'homer',
        year: -800,
        title: 'Homer and the Epics',
        description:
          'The Iliad and Odyssey take their lasting form, fixing the founding stories of Greek literature after centuries of oral telling.',
        era: 'Archaic',
        factStatus: 'theory',
      },
      {
        id: 'first-olympics',
        year: -776,
        title: 'The First Olympic Games',
        description:
          'The Greeks date the first Games at Olympia, held in honour of Zeus, to this year — and begin counting time in four-year Olympiads.',
        era: 'Archaic',
        factStatus: 'verified',
      },
      {
        id: 'democracy',
        year: -508,
        title: 'The Birth of Athenian Democracy',
        description:
          'Cleisthenes reorganises Athens and hands power to the assembly of citizens — the world’s first democracy, rule by the demos.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'persian-wars',
        year: -490,
        title: 'The Persian Wars',
        description:
          'Against overwhelming odds the Greek cities throw back two Persian invasions, from Marathon (490) to Salamis and Plataea (480–479) — saving their independence.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'golden-age',
        year: -461,
        title: 'The Golden Age of Athens',
        description:
          'Under Pericles, Athens builds the Parthenon, invents tragic theatre and democracy reaches its height — the brief, dazzling peak of classical culture.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'peloponnesian-war',
        year: -431,
        title: 'The Peloponnesian War',
        description:
          'Athens and Sparta lead the Greek world into a long, ruinous civil war that ends in 404 BCE with Athens defeated and the cities exhausted.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'socrates',
        year: -399,
        title: 'The Death of Socrates',
        description:
          'The Athenian democracy condemns the philosopher Socrates to drink hemlock for impiety — making him philosophy’s first martyr.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'philip-macedon',
        year: -359,
        title: 'The Rise of Macedon',
        description:
          'Philip II becomes king of Macedon, forges the deadly phalanx and brings the quarrelling Greek cities under his control.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'alexander-conquests',
        year: -334,
        title: 'Alexander’s Conquests Begin',
        description:
          'Alexander the Great crosses into Asia and in a decade overthrows the Persian Empire, reaching Egypt and India and spreading Greek culture across three continents.',
        era: 'Hellenistic',
        factStatus: 'verified',
      },
      {
        id: 'alexander-death',
        year: -323,
        title: 'The Death of Alexander',
        description:
          'Alexander dies at Babylon aged thirty-two. His generals carve the empire into the Hellenistic kingdoms, with Greek as the language of the East.',
        era: 'Hellenistic',
        factStatus: 'verified',
      },
      {
        id: 'roman-conquest',
        year: -146,
        title: 'Rome Conquers Greece',
        description:
          'Rome sacks Corinth and absorbs Greece. The conquered Greeks conquer their conquerors in turn, as Rome takes Greek art, learning and gods as its own.',
        era: 'Roman',
        factStatus: 'verified',
      },
    ],
  },
  {
    id: 'hinduism',
    title: 'The Eternal Way Through Time',
    subtitle:
      'More than three thousand years of the world’s oldest living religion — from the cities of the Indus and the hymns of the Vedas to the temples, philosophies and billion believers of today.',
    events: [
      {
        id: 'indus-valley',
        year: -3000,
        title: 'The Indus Valley Civilization',
        description:
          'One of the world’s first great urban cultures flourishes along the Indus, its seals showing figures in meditative postures and motifs later woven into Hindu tradition.',
        era: 'Pre-Vedic',
        factStatus: 'verified',
      },
      {
        id: 'rigveda',
        year: -1500,
        title: 'Composition of the Rigveda',
        description:
          'The oldest of the Vedas takes shape — more than a thousand hymns to the gods, preserved by flawless oral recitation for a thousand years before being written.',
        era: 'Vedic',
        factStatus: 'verified',
      },
      {
        id: 'upanishads',
        year: -800,
        title: 'The Upanishads',
        description:
          'The closing pages of the Vedas turn inward, asking what lies behind the self and the cosmos — and declare the inner self (atman) one with the absolute (Brahman).',
        era: 'Vedic',
        factStatus: 'verified',
      },
      {
        id: 'buddha',
        year: -500,
        title: 'The Life of the Buddha',
        description:
          'Siddhartha Gautama teaches in the same Ganges plain — a reforming movement that reshapes Indian thought and, in turn, sharpens Hindu philosophy. (A sidelight to the Hindu story.)',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'ramayana',
        year: -300,
        title: 'The Ramayana Takes Form',
        description:
          'Valmiki’s epic of Prince Rama, the “first poem,” crystallises the ideal of dharma and becomes the most beloved story of the Hindu world.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'bhagavad-gita',
        year: -200,
        title: 'The Bhagavad Gita',
        description:
          'Krishna’s battlefield counsel to Arjuna is set down within the Mahabharata — seven hundred verses that become Hinduism’s best-loved scripture.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'mahabharata',
        year: 100,
        title: 'The Mahabharata Completed',
        description:
          'The longest poem ever composed reaches its final form after centuries of growth — a hundred thousand verses on duty, war and the soul.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'gupta-golden-age',
        year: 350,
        title: 'The Gupta Golden Age',
        description:
          'Under the Gupta emperors classical Hindu culture flowers — in temple-building, Sanskrit poetry, mathematics and the codifying of philosophy and law.',
        era: 'Classical',
        factStatus: 'verified',
      },
      {
        id: 'shankara',
        year: 788,
        title: 'Adi Shankaracharya',
        description:
          'The philosopher of non-dualism (Advaita Vedanta) travels all India, debates every rival school, and founds four monastic seats that endure to this day.',
        era: 'Medieval',
        factStatus: 'verified',
      },
      {
        id: 'chola-temples',
        year: 1010,
        title: 'The Great Chola Temples',
        description:
          'The Chola dynasty raises the towering Brihadisvara Temple at Thanjavur, the masterpiece of South Indian stone architecture and bronze casting.',
        era: 'Medieval',
        factStatus: 'verified',
      },
      {
        id: 'bhakti-movement',
        year: 1400,
        title: 'The Bhakti Movement',
        description:
          'A wave of devotional poet-saints sweeps India in its own languages, teaching that loving surrender to a personal God is open to all, beyond caste and learning.',
        era: 'Medieval',
        factStatus: 'verified',
      },
      {
        id: 'hinduism-today',
        year: 2025,
        title: 'Hinduism Today',
        description:
          'The world’s oldest living religion counts some 1.2 billion followers — roughly one in seven people alive — its scriptures still chanted and its temples still thronged.',
        era: 'Modern',
        factStatus: 'verified',
      },
    ],
  },
  {
    id: 'christianity',
    title: 'Two Thousand Years of the Cross',
    subtitle:
      'From a birth in Roman Judea to the largest faith on Earth — the life of Jesus, the rise of the church, the breaking of Christendom and a global religion of 2.4 billion.',
    events: [
      {
        id: 'jesus-birth',
        year: -4,
        title: 'The Birth of Jesus',
        description:
          'Jesus is born in Roman-ruled Judea in the last years of Herod the Great — the event from which, centuries later, the Western calendar would be counted.',
        era: 'Roman Judea',
        factStatus: 'verified',
      },
      {
        id: 'crucifixion',
        year: 30,
        title: 'The Crucifixion',
        description:
          'Jesus is crucified in Jerusalem under the prefect Pontius Pilate. His followers soon proclaim that he has risen — the conviction from which Christianity is born.',
        era: 'Apostolic Age',
        factStatus: 'verified',
      },
      {
        id: 'paul-missions',
        year: 49,
        title: 'Paul’s Missionary Journeys',
        description:
          'The former persecutor Paul of Tarsus carries the gospel across the Greek-speaking cities of the empire and writes the letters that become the oldest books of the New Testament.',
        era: 'Apostolic Age',
        factStatus: 'verified',
      },
      {
        id: 'gospels-written',
        year: 75,
        title: 'The Gospels Are Written',
        description:
          'Between roughly 70 and 100 CE the four gospels are set down, fixing the story of Jesus’s life and teaching for all later generations.',
        era: 'Apostolic Age',
        factStatus: 'verified',
      },
      {
        id: 'edict-of-milan',
        year: 313,
        title: 'The Edict of Milan',
        description:
          'Constantine grants Christians freedom of worship, ending three centuries of persecution and beginning the faith’s rise to power within the Roman world.',
        era: 'Imperial Church',
        factStatus: 'verified',
      },
      {
        id: 'nicaea',
        year: 325,
        title: 'The Council of Nicaea',
        description:
          'Bishops from across the empire gather at Constantine’s summons to define the faith, affirming in the Nicene Creed — still recited today — that Christ is fully God.',
        era: 'Imperial Church',
        factStatus: 'verified',
      },
      {
        id: 'theodosius',
        year: 380,
        title: 'Christianity Becomes Rome’s Official Religion',
        description:
          'The emperor Theodosius makes Nicene Christianity the official religion of the Roman Empire, and the old gods are pushed to the margins of public life.',
        era: 'Imperial Church',
        factStatus: 'verified',
      },
      {
        id: 'fall-of-west',
        year: 476,
        title: 'Fall of the Western Roman Empire',
        description:
          'The last western emperor is deposed; as Roman power collapses, the church becomes the one institution to survive, carrying learning and order into the medieval West.',
        era: 'Late Antiquity',
        factStatus: 'verified',
      },
      {
        id: 'great-schism',
        year: 1054,
        title: 'The Great Schism',
        description:
          'Centuries of growing estrangement between the Latin West and the Greek East break into open rupture, dividing Christianity into the Catholic and Orthodox churches.',
        era: 'Medieval',
        factStatus: 'verified',
      },
      {
        id: 'first-crusade',
        year: 1095,
        title: 'Pope Urban II Calls the First Crusade',
        description:
          'At Clermont, Urban II summons the knights of Europe to recover Jerusalem, launching two centuries of holy war between Christendom and Islam.',
        era: 'Medieval',
        factStatus: 'verified',
      },
      {
        id: 'gutenberg-bible',
        year: 1455,
        title: 'The Gutenberg Bible',
        description:
          'Johannes Gutenberg prints the Bible with movable type — the first great book of the printing age, which will soon carry scripture from the monastery to the multitude.',
        era: 'Medieval',
        factStatus: 'verified',
      },
      {
        id: 'ninety-five-theses',
        year: 1517,
        title: 'Luther’s Ninety-Five Theses',
        description:
          'Martin Luther’s protest against indulgences ignites the Reformation, shattering the unity of Western Christianity and helping usher in the modern world.',
        era: 'Reformation',
        factStatus: 'verified',
      },
      {
        id: 'christianity-today',
        year: 2025,
        title: 'Christianity Today',
        description:
          'The world’s largest religion counts some 2.4 billion followers — about a third of humanity — its centre of gravity now shifting to Africa, Latin America and Asia.',
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
