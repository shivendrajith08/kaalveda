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
  {
    id: 'rome',
    title: 'Test Your Knowledge: Ancient Rome',
    description:
      'Eight questions across a thousand years of Rome — from the founding to the fall. Each answer comes with an explanation.',
    questions: [
      {
        id: 'q1',
        prompt: 'According to tradition, who founded Rome in 753 BCE?',
        options: [
          { id: 'a', text: 'Romulus' },
          { id: 'b', text: 'Aeneas' },
          { id: 'c', text: 'Julius Caesar' },
          { id: 'd', text: 'Augustus' },
        ],
        answerId: 'a',
        explanation:
          'Legend credits Romulus, who is said to have killed his twin Remus and named the city for himself. Aeneas was the earlier Trojan ancestor of the Roman line.',
      },
      {
        id: 'q2',
        prompt: 'What replaced the monarchy when the Romans expelled their last king in 509 BCE?',
        options: [
          { id: 'a', text: 'The Republic' },
          { id: 'b', text: 'The Empire' },
          { id: 'c', text: 'A military dictatorship' },
          { id: 'd', text: 'Direct democracy' },
        ],
        answerId: 'a',
        explanation:
          'The Romans founded the Republic — a balance of elected consuls, the Senate and citizen assemblies — and swore never again to be ruled by a king.',
      },
      {
        id: 'q3',
        prompt: 'Two officials shared the highest office of the Republic, each able to veto the other. What were they called?',
        options: [
          { id: 'a', text: 'Consuls' },
          { id: 'b', text: 'Tribunes' },
          { id: 'c', text: 'Senators' },
          { id: 'd', text: 'Emperors' },
        ],
        answerId: 'a',
        explanation:
          'Two consuls were elected jointly for a single year, each holding a veto over the other so that no one man could seize total power.',
      },
      {
        id: 'q4',
        prompt: 'Against which rival city did Rome fight the Punic Wars, facing the general Hannibal?',
        options: [
          { id: 'a', text: 'Carthage' },
          { id: 'b', text: 'Athens' },
          { id: 'c', text: 'Alexandria' },
          { id: 'd', text: 'Troy' },
        ],
        answerId: 'a',
        explanation:
          'The three Punic Wars were fought against Carthage in North Africa. Despite Hannibal’s devastating invasion of Italy, Rome won and took the western Mediterranean.',
      },
      {
        id: 'q5',
        prompt: 'What did Julius Caesar do in 49 BCE that began a civil war and signalled the end of the Republic?',
        options: [
          { id: 'a', text: 'He crossed the Rubicon with his army' },
          { id: 'b', text: 'He was crowned king' },
          { id: 'c', text: 'He burned the Senate house' },
          { id: 'd', text: 'He conquered Egypt' },
        ],
        answerId: 'a',
        explanation:
          'By leading his army across the Rubicon — the river a general was forbidden to cross under arms — Caesar declared war on the Senate. "The die is cast," he is said to have remarked.',
      },
      {
        id: 'q6',
        prompt: 'Who became Rome’s first emperor, ruling as "first citizen" from 27 BCE?',
        options: [
          { id: 'a', text: 'Augustus' },
          { id: 'b', text: 'Nero' },
          { id: 'c', text: 'Constantine' },
          { id: 'd', text: 'Marcus Aurelius' },
        ],
        answerId: 'a',
        explanation:
          'Octavian, Caesar’s adopted heir, took the name Augustus and ruled as princeps — a monarch in republican dress — founding the Empire and the Pax Romana.',
      },
      {
        id: 'q7',
        prompt: 'What volcanic-ash building material let the Romans cast structures like the Pantheon’s dome?',
        options: [
          { id: 'a', text: 'Concrete made with pozzolana' },
          { id: 'b', text: 'Reinforced steel' },
          { id: 'c', text: 'Polished granite' },
          { id: 'd', text: 'Sun-dried mud brick' },
        ],
        answerId: 'a',
        explanation:
          'Roman concrete mixed lime and rubble with pozzolana, a volcanic ash, producing a material that could be poured into any shape and even set underwater — the Pantheon’s dome is still the largest unreinforced concrete dome on Earth.',
      },
      {
        id: 'q8',
        prompt: 'In what year is the Western Roman Empire traditionally said to have fallen?',
        options: [
          { id: 'a', text: '476 CE' },
          { id: 'b', text: '44 BCE' },
          { id: 'c', text: '1453 CE' },
          { id: 'd', text: '117 CE' },
        ],
        answerId: 'a',
        explanation:
          'In 476 CE the general Odoacer deposed the last western emperor, Romulus Augustulus. The Eastern (Byzantine) Empire, however, endured until 1453.',
      },
    ],
  },
  {
    id: 'greece',
    title: 'Test Your Knowledge: Ancient Greece',
    description:
      'Eight questions on the Greek world — from the polis to Alexander. Each answer comes with an explanation.',
    questions: [
      {
        id: 'q1',
        prompt: 'What was the Greek word for the independent self-governing city-state?',
        options: [
          { id: 'a', text: 'Polis' },
          { id: 'b', text: 'Demos' },
          { id: 'c', text: 'Agora' },
          { id: 'd', text: 'Acropolis' },
        ],
        answerId: 'a',
        explanation:
          'The polis was the fundamental unit of Greek life — a community of citizens who governed themselves. The demos was the people, the agora the marketplace, and the acropolis the fortified high point of a city.',
      },
      {
        id: 'q2',
        prompt: 'In which Greek city was democracy born around 508 BCE?',
        options: [
          { id: 'a', text: 'Athens' },
          { id: 'b', text: 'Sparta' },
          { id: 'c', text: 'Corinth' },
          { id: 'd', text: 'Thebes' },
        ],
        answerId: 'a',
        explanation:
          'The reforms of Cleisthenes in 508 BCE handed power to the assembly of Athenian citizens — demokratia, rule by the people. Sparta, by contrast, was a militarized state ruled by a warrior elite.',
      },
      {
        id: 'q3',
        prompt: 'Which two Greek powers led the long, ruinous Peloponnesian War?',
        options: [
          { id: 'a', text: 'Athens and Sparta' },
          { id: 'b', text: 'Athens and Persia' },
          { id: 'c', text: 'Sparta and Macedon' },
          { id: 'd', text: 'Thebes and Corinth' },
        ],
        answerId: 'a',
        explanation:
          'From 431 to 404 BCE the sea power of Athens and the land power of Sparta led the Greek world into a civil war that exhausted both and ended with Athens defeated.',
      },
      {
        id: 'q4',
        prompt: 'Which Athenian philosopher was condemned to drink hemlock in 399 BCE?',
        options: [
          { id: 'a', text: 'Socrates' },
          { id: 'b', text: 'Plato' },
          { id: 'c', text: 'Aristotle' },
          { id: 'd', text: 'Pythagoras' },
        ],
        answerId: 'a',
        explanation:
          'Socrates, who wrote nothing but transformed philosophy through relentless questioning, was condemned for impiety and corrupting the youth. His pupil Plato preserved his teaching, and Plato in turn taught Aristotle.',
      },
      {
        id: 'q5',
        prompt: 'Who tutored the young Alexander the Great?',
        options: [
          { id: 'a', text: 'Aristotle' },
          { id: 'b', text: 'Socrates' },
          { id: 'c', text: 'Homer' },
          { id: 'd', text: 'Archimedes' },
        ],
        answerId: 'a',
        explanation:
          'Alexander was tutored for three years by Aristotle, the greatest thinker of the age. Socrates had died decades earlier, and Homer’s epics — which Alexander loved — were already centuries old.',
      },
      {
        id: 'q6',
        prompt: 'Where were the ancient Olympic Games held, in honour of which god?',
        options: [
          { id: 'a', text: 'At Olympia, in honour of Zeus' },
          { id: 'b', text: 'At Athens, in honour of Athena' },
          { id: 'c', text: 'At Delphi, in honour of Apollo' },
          { id: 'd', text: 'At Sparta, in honour of Ares' },
        ],
        answerId: 'a',
        explanation:
          'The Games were a religious festival held every four years at the sanctuary of Zeus at Olympia, beginning traditionally in 776 BCE. Victors won only a crown of wild olive — and undying glory.',
      },
      {
        id: 'q7',
        prompt: 'What is the name of the era after Alexander, when Greek culture spread across three continents?',
        options: [
          { id: 'a', text: 'The Hellenistic Age' },
          { id: 'b', text: 'The Classical Age' },
          { id: 'c', text: 'The Archaic Age' },
          { id: 'd', text: 'The Bronze Age' },
        ],
        answerId: 'a',
        explanation:
          'The Hellenistic Age followed Alexander’s death in 323 BCE, when his generals ruled vast kingdoms in which Greek became the common language from Egypt to Afghanistan — the era of Alexandria and its great Library.',
      },
      {
        id: 'q8',
        prompt: 'According to legend, how did the Greeks finally capture the city of Troy?',
        options: [
          { id: 'a', text: 'By hiding warriors inside a hollow wooden horse' },
          { id: 'b', text: 'By burning its harbour fleet' },
          { id: 'c', text: 'By starving it in a ten-year blockade' },
          { id: 'd', text: 'By bribing its gatekeepers' },
        ],
        answerId: 'a',
        explanation:
          'The Greeks left a great wooden horse filled with hidden soldiers as a false offering. Once the Trojans dragged it inside their walls, the warriors crept out by night and opened the gates — the origin of the warning to "fear the Greeks, even bearing gifts."',
      },
    ],
  },
  {
    id: 'hinduism',
    title: 'Test Your Knowledge: Hinduism',
    description: 'Eight questions on the world’s oldest living religion — its scriptures, gods, epics and ideas. Each answer comes with an explanation.',
    questions: [
      {
        id: 'q1',
        prompt: 'What is the name of the oldest and most important of the four Vedas?',
        options: [
          { id: 'a', text: 'The Rigveda' },
          { id: 'b', text: 'The Atharvaveda' },
          { id: 'c', text: 'The Samaveda' },
          { id: 'd', text: 'The Yajurveda' },
        ],
        answerId: 'a',
        explanation:
          'The Rigveda, a collection of more than a thousand hymns composed around 1500 BCE, is the oldest of the four Vedas and among the oldest scriptures of any living religion.',
      },
      {
        id: 'q2',
        prompt: 'Which three gods make up the Trimurti, the great triad of the Hindu pantheon?',
        options: [
          { id: 'a', text: 'Brahma, Vishnu and Shiva' },
          { id: 'b', text: 'Indra, Agni and Varuna' },
          { id: 'c', text: 'Rama, Krishna and Hanuman' },
          { id: 'd', text: 'Ganesha, Lakshmi and Saraswati' },
        ],
        answerId: 'a',
        explanation:
          'The Trimurti is Brahma the creator, Vishnu the preserver and Shiva the destroyer — three rhythms of one endless cosmic process of creation, sustaining and dissolution.',
      },
      {
        id: 'q3',
        prompt: 'In which epic does the Bhagavad Gita appear, spoken by Krishna to the warrior Arjuna?',
        options: [
          { id: 'a', text: 'The Mahabharata' },
          { id: 'b', text: 'The Ramayana' },
          { id: 'c', text: 'The Rigveda' },
          { id: 'd', text: 'The Upanishads' },
        ],
        answerId: 'a',
        explanation:
          'The Bhagavad Gita sits within the Mahabharata, the longest poem ever composed. On the eve of battle Krishna — an avatar of Vishnu — counsels the despairing Arjuna in seven hundred verses.',
      },
      {
        id: 'q4',
        prompt: 'In the Ramayana, who abducts Sita and carries her across the sea to the island of Lanka?',
        options: [
          { id: 'a', text: 'The demon king Ravana' },
          { id: 'b', text: 'The monkey-god Hanuman' },
          { id: 'c', text: 'Rama’s brother Lakshmana' },
          { id: 'd', text: 'The god Indra' },
        ],
        answerId: 'a',
        explanation:
          'The demon king Ravana, lord of Lanka, abducts Sita, setting off the war in which Rama — aided by the monkey army of Hanuman — builds a bridge to the island and rescues her.',
      },
      {
        id: 'q5',
        prompt: 'The Upanishads teach that the inner self (atman) is one with which ultimate reality?',
        options: [
          { id: 'a', text: 'Brahman' },
          { id: 'b', text: 'Maya' },
          { id: 'c', text: 'Karma' },
          { id: 'd', text: 'Dharma' },
        ],
        answerId: 'a',
        explanation:
          'The central insight of the Upanishads, summed up as "tat tvam asi" (that thou art), is that the innermost self, atman, is identical with Brahman, the infinite reality underlying the whole cosmos.',
      },
      {
        id: 'q6',
        prompt: 'What does the Sanskrit word "yoga" originally mean?',
        options: [
          { id: 'a', text: 'To yoke or to join (union with the divine)' },
          { id: 'b', text: 'To stretch the body' },
          { id: 'c', text: 'To breathe deeply' },
          { id: 'd', text: 'To renounce the world' },
        ],
        answerId: 'a',
        explanation:
          'Yoga comes from a root meaning "to yoke" or "to join" — the disciplined union of the individual self with ultimate reality. Patanjali defined it as the stilling of the fluctuations of the mind.',
      },
      {
        id: 'q7',
        prompt: 'What is the small, dark inner sanctum of a Hindu temple, housing the image of the god, called?',
        options: [
          { id: 'a', text: 'The garbhagriha (womb-chamber)' },
          { id: 'b', text: 'The gopuram (gateway tower)' },
          { id: 'c', text: 'The shikhara (spire)' },
          { id: 'd', text: 'The mandala (sacred grid)' },
        ],
        answerId: 'a',
        explanation:
          'The garbhagriha, or "womb-chamber," is the small, dark, windowless cell at the heart of the temple that houses the central image — the destination of the worshipper’s inward journey from the bright exterior.',
      },
      {
        id: 'q8',
        prompt: 'In Hindu cosmology, time is understood to move in what fashion?',
        options: [
          { id: 'a', text: 'In endless repeating cycles, with no beginning or end' },
          { id: 'b', text: 'In a single straight line from one creation to one end' },
          { id: 'c', text: 'Backwards, from the future into the past' },
          { id: 'd', text: 'It does not exist at all' },
        ],
        answerId: 'a',
        explanation:
          'Hindu cosmology imagines time as cyclical — turning through the four yugas and the vast days and nights of Brahma, a universe made and unmade and made again across billions of years, with no first beginning and no final end.',
      },
    ],
  },
  {
    id: 'christianity',
    title: 'Test Your Knowledge: Christianity',
    description:
      'Eight questions on the world’s largest religion — its founder, scriptures, councils, conflicts and global life today. Each answer comes with an explanation.',
    questions: [
      {
        id: 'q1',
        prompt: 'In which Roman province did Jesus of Nazareth live, teach and die?',
        options: [
          { id: 'a', text: 'Judea (in the region of Galilee and Jerusalem)' },
          { id: 'b', text: 'Egypt' },
          { id: 'c', text: 'Greece' },
          { id: 'd', text: 'Italy' },
        ],
        answerId: 'a',
        explanation:
          'Jesus grew up in Nazareth in Galilee and was crucified in Jerusalem, both within Roman-ruled Judea, under the prefect Pontius Pilate around the year 30 CE.',
      },
      {
        id: 'q2',
        prompt: 'What are the two main divisions of the Christian Bible called?',
        options: [
          { id: 'a', text: 'The Old Testament and the New Testament' },
          { id: 'b', text: 'The Torah and the Gospels' },
          { id: 'c', text: 'The Law and the Prophets' },
          { id: 'd', text: 'The Psalms and the Epistles' },
        ],
        answerId: 'a',
        explanation:
          'The Old Testament is the Hebrew scripture Jesus himself knew; the New Testament gathers the four gospels, the Acts, the letters of Paul and others, and Revelation — the writings of the first Christian generations.',
      },
      {
        id: 'q3',
        prompt: 'Which former persecutor became the great missionary to the Gentiles, writing the oldest books of the New Testament?',
        options: [
          { id: 'a', text: 'Paul of Tarsus' },
          { id: 'b', text: 'Peter the fisherman' },
          { id: 'c', text: 'John the Baptist' },
          { id: 'd', text: 'Constantine' },
        ],
        answerId: 'a',
        explanation:
          'Paul, once a persecutor of the church, was converted and travelled the Roman roads founding congregations. His letters, written in the 50s CE, are the earliest Christian writings we possess.',
      },
      {
        id: 'q4',
        prompt: 'What did the Council of Nicaea in 325 CE affirm about Jesus Christ?',
        options: [
          { id: 'a', text: 'That he is fully God, "of one being with the Father"' },
          { id: 'b', text: 'That he was only a great human teacher' },
          { id: 'c', text: 'That he never truly died' },
          { id: 'd', text: 'That there are many gods' },
        ],
        answerId: 'a',
        explanation:
          'Against the teaching of Arius that the Son was a lesser, created being, Nicaea affirmed that Christ is fully divine. Its declaration lives on in the Nicene Creed recited by Christians worldwide.',
      },
      {
        id: 'q5',
        prompt: 'Who called the First Crusade in 1095, urging Europe’s knights to recover Jerusalem?',
        options: [
          { id: 'a', text: 'Pope Urban II' },
          { id: 'b', text: 'Saladin' },
          { id: 'c', text: 'Richard the Lionheart' },
          { id: 'd', text: 'Emperor Constantine' },
        ],
        answerId: 'a',
        explanation:
          'At the Council of Clermont, Pope Urban II called for a holy war to take Jerusalem. The crowd is said to have answered "Deus vult!" — "God wills it!" Saladin and Richard were figures of the later Third Crusade.',
      },
      {
        id: 'q6',
        prompt: 'What did Christian mystics such as Teresa of Ávila and Julian of Norwich primarily seek?',
        options: [
          { id: 'a', text: 'A direct, experiential union with God through contemplative prayer' },
          { id: 'b', text: 'Political power over the church' },
          { id: 'c', text: 'The military conquest of the Holy Land' },
          { id: 'd', text: 'The abolition of all ritual' },
        ],
        answerId: 'a',
        explanation:
          'The mystics sought to know God directly, in the silence of contemplation, rather than through argument. Teresa mapped the soul as an "interior castle," and Julian wrote that "all shall be well."',
      },
      {
        id: 'q7',
        prompt: 'What did Martin Luther’s Ninety-Five Theses of 1517 protest, sparking the Reformation?',
        options: [
          { id: 'a', text: 'The sale of indulgences' },
          { id: 'b', text: 'The use of stained glass' },
          { id: 'c', text: 'The celebration of Christmas' },
          { id: 'd', text: 'The translation of the Bible' },
        ],
        answerId: 'a',
        explanation:
          'Luther attacked the sale of indulgences — papers promising to shorten time in purgatory. His protest grew into a challenge to papal authority itself, built on the principles of "faith alone" and "scripture alone."',
      },
      {
        id: 'q8',
        prompt: 'Where is Christianity growing fastest in the twenty-first century?',
        options: [
          { id: 'a', text: 'The global South — Africa, Latin America and parts of Asia' },
          { id: 'b', text: 'Western Europe' },
          { id: 'c', text: 'Antarctica' },
          { id: 'd', text: 'It is not growing anywhere' },
        ],
        answerId: 'a',
        explanation:
          'Christianity’s centre of gravity has shifted south. Most of the world’s 2.4 billion Christians now live in Africa, Latin America and Asia, while attendance has fallen sharply in its old European heartland.',
      },
    ],
  },
]

const quizById = new Map(quizzes.map((q) => [q.id, q]))

export function getQuiz(id: string | null | undefined): Quiz | undefined {
  if (!id) return undefined
  return quizById.get(id)
}
