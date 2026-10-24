import { MindMapData } from '../types/mindmap';

export const SAMPLE_TEXTBOOK_SNIPPETS = [
  {
    title: 'Operating Systems — Virtual Memory & Paging',
    subject: 'Computer Science',
    category: 'Engineering',
    text: `CHAPTER 9: VIRTUAL MEMORY ARCHITECTURE

9.1 Basic Concepts & Motivation
Virtual memory is a memory management capability of an operating system that uses hardware and software to allow a computer to compensate for physical memory shortages by temporarily transferring data from random access memory (RAM) to disk storage. It separates user logical memory from physical memory.

9.2 Demand Paging & Address Translation
With demand paging, pages are only loaded into physical memory when they are demanded during program execution.
Logical address space is divided into fixed-size blocks called 'pages' (typically 4 KB). Physical memory is divided into fixed-size blocks called 'frames'.
Address translation maps logical page number (p) and page offset (d) to frame number (f) via the Page Table.
Page Table Base Register (PTBR) points to the active page table in main memory.

9.3 Translation Lookaside Buffer (TLB)
Because page tables reside in memory, accessing any memory location requires two memory accesses (one for page table lookup, one for actual operand). To accelerate translation, a fast associative hardware cache called the Translation Lookaside Buffer (TLB) is employed.
Effective Access Time (EAT) formula:
EAT = hit_ratio * (t_TLB + t_mem) + (1 - hit_ratio) * (t_TLB + 2 * t_mem)
Where hit_ratio is the percentage of times that a particular page number is found in the TLB.

9.4 Page Fault Handling Sequence
When a process references a page that has its valid-invalid bit set to 'invalid', a page fault trap occurs:
1. The hardware traps to the OS kernel.
2. The OS checks internal process control block to verify if reference was valid.
3. If valid, the OS finds a free physical frame in memory.
4. An I/O disk request is scheduled to read the desired page into the newly allocated frame.
5. Once disk read completes, the page table entry is updated to 'valid'.
6. The faulted instruction is restarted transparently.

9.5 Page Replacement Algorithms
When no free frame is available, a page replacement algorithm selects a 'victim frame':
- FIFO (First-In, First-Out): Suffers from Belady's Anomaly where allocating more frames can cause more page faults.
- Optimal (OPT): Replaces page that will not be used for longest future period (benchmark theoretical).
- LRU (Least Recently Used): Replaces page that has not been used for longest past period. Requires hardware counter or stack.
- Clock / Second-Chance Algorithm: Uses a reference bit (0 or 1). Circular buffer inspection gives page a second chance if bit is 1.

9.6 Thrashing & Working-Set Model
If a process does not have enough frames, page fault rate becomes very high. Thrashing occurs when a process spends more time paging than executing.
The Working-Set Model based on locality of reference defines parameter Delta. The working set of a process is the set of pages in the most recent Delta page references. If sum of all working sets exceeds total physical memory, the OS suspends processes.`,
  },
  {
    title: 'Cellular Respiration & ATP Synthesis',
    subject: 'Biology / Biochemistry',
    category: 'Life Sciences',
    text: `UNIT 4: CELLULAR ENERGETICS & METABOLISM

Section 4.1: Overview of Cellular Respiration
Cellular respiration is the biochemical pathway by which cells harvest chemical energy stored in glucose molecules and convert it into adenosine triphosphate (ATP).
Overall stoichiometric equation:
C6H12O6 + 6O2 -> 6CO2 + 6H2O + 30-32 ATP (ΔG° = -686 kcal/mol)

Section 4.2: Glycolysis (Cytosol)
Glycolysis is an anaerobic 10-step enzymatic process occurring in the cytoplasm:
- Energy Investment Phase: 2 ATP molecules consumed to phosphorylate glucose into fructose-1,6-bisphosphate via hexokinase and phosphofructokinase (rate-limiting enzyme).
- Energy Payoff Phase: 4 ATP synthesized via substrate-level phosphorylation; 2 NAD+ reduced to 2 NADH; net yield = 2 ATP, 2 NADH, 2 Pyruvate (3-carbon).

Section 4.3: Pyruvate Oxidation & The Citric Acid (Krebs) Cycle
In aerobic conditions, pyruvate enters mitochondrial matrix via active transport:
- Pyruvate Dehydrogenase Complex converts pyruvate into Acetyl-CoA, releasing 1 CO2 and generating 1 NADH per pyruvate.
- Krebs Cycle: Acetyl-CoA (2C) condenses with Oxaloacetate (4C) to form Citrate (6C).
- Net output per glucose (2 turns): 4 CO2, 6 NADH, 2 FADH2, and 2 ATP (or GTP).

Section 4.4: Oxidative Phosphorylation & Chemiosmosis
Occurs along the folded inner mitochondrial membrane (cristae):
- Electron Transport Chain (ETC): Complexes I, II, III, and IV transfer high-energy electrons from NADH and FADH2 to molecular Oxygen (the terminal electron acceptor), forming H2O.
- Proton Gradient: Electron transport drives active pumping of H+ protons from mitochondrial matrix into the intermembrane space, establishing an electrochemical proton motive force.
- ATP Synthase & Chemiosmosis: Protons flow down their concentration gradient back into the matrix through the F0-F1 rotor of ATP Synthase, driving the rotational catalytic phosphorylation of ADP + Pi -> ATP.
Peter Mitchell's Chemiosmotic Hypothesis explains this fundamental bioenergetic coupling.`,
  },
  {
    title: 'Quantum Physics — Wave-Particle Duality',
    subject: 'Physics',
    category: 'STEM',
    text: `CHAPTER 3: QUANTUM NATURE OF LIGHT AND MATTER

3.1 The Photoelectric Effect
In 1905, Albert Einstein explained Heinrich Hertz's photoelectric observation by proposing that electromagnetic radiation is quantized into discrete packets of energy called photons.
Photon energy equation:
E = h * nu = (h * c) / lambda
where h is Planck's constant (6.626 x 10^-34 J*s), nu is frequency, and lambda is wavelength.
Einstein's Photoelectric Equation:
K_max = h * nu - Phi
where K_max is the maximum kinetic energy of emitted photoelectrons and Phi is the work function of the metal surface. Below threshold frequency nu_0 = Phi / h, no electrons are emitted regardless of light intensity.

3.2 de Broglie Matter Waves
In 1924, Louis de Broglie hypothesized that if light waves exhibit particle properties, material particles (like electrons) must possess wave characteristics.
The de Broglie wavelength formula:
lambda = h / p = h / (m * v)
where p is relativistic momentum.
Confirmed experimentally by Davisson and Germer (1927) through electron diffraction in a nickel crystal lattice.

3.3 Heisenberg's Uncertainty Principle
Werner Heisenberg formulated the fundamental quantum limit that the position (x) and momentum (p) of a particle cannot be measured simultaneously with arbitrary precision:
Delta_x * Delta_p >= hbar / 2
where hbar = h / (2 * pi).
Similarly for energy and time:
Delta_E * Delta_t >= hbar / 2.
This is not an instrumental limitation, but an intrinsic wave property of matter.

3.4 Wavefunction & The Schrödinger Equation
The quantum state of a particle is represented by complex wave function Psi(x, t).
Max Born interpreted |Psi(x, t)|^2 as the probability density of finding the particle at coordinate x at time t.
Time-dependent Schrödinger Equation:
i * hbar * dPsi/dt = H_hat * Psi
where H_hat is the Hamiltonian operator representing total energy (Kinetic + Potential).`,
  },
];

export const INITIAL_FEATURED_MINDMAP: MindMapData = {
  id: 'map-os-virtual-memory',
  title: 'Virtual Memory & Demand Paging',
  chapter: 'Chapter 9: Operating Systems',
  subject: 'Computer Science & Engineering',
  overview: 'A foundational operating system mechanism enabling execution of processes that are not completely in physical memory, utilizing demand paging, page tables, TLB caching, and replacement algorithms.',
  keyTakeaways: [
    'Virtual memory decouples user logical memory from physical RAM.',
    'TLB cache hit ratio is the dominant factor determining Effective Access Time (EAT).',
    'Page faults require OS kernel intervention and disk I/O to swap in missing pages.',
    'LRU and Clock algorithms minimize page faults and avoid Belady\'s Anomaly.',
    'Thrashing occurs when memory allocation falls below the process working set size.',
  ],
  detailLevel: 'detailed',
  sourcePagesCount: 4,
  generatedAt: new Date().toISOString(),
  nodes: [
    {
      id: 'root',
      parentId: null,
      title: 'Virtual Memory & Paging',
      summary: 'Memory virtualization technique separating logical memory from physical RAM.',
      details: 'Allows programs larger than physical memory to execute while maximizing multiprogramming degree and memory protection.',
      type: 'core',
      sourcePage: 'Page 1',
      tags: ['OS', 'Memory', 'Kernel'],
    },
    {
      id: 'n-paging',
      parentId: 'root',
      title: 'Demand Paging Architecture',
      summary: 'Pages are loaded into physical frames strictly upon access demand.',
      details: 'Logical address is divided into page number (p) and offset (d). Address translation uses the Page Table.',
      type: 'concept',
      sourcePage: 'Page 1',
      tags: ['Address Translation', 'Frames'],
    },
    {
      id: 'n-pagetable',
      parentId: 'n-paging',
      title: 'Page Table Structure',
      summary: 'Data structure holding frame mappings and protection bits.',
      details: 'Contains Valid/Invalid bit, dirty/modify bit, and read/write protection flags. Multi-level and inverted page tables scale for 64-bit systems.',
      type: 'subtopic',
      sourcePage: 'Page 1',
    },
    {
      id: 'n-tlb',
      parentId: 'root',
      title: 'TLB Hardware Acceleration',
      summary: 'High-speed associative hardware cache for rapid translation.',
      details: 'Avoids two-step memory lookups by caching recently resolved page-to-frame translations directly on CPU MMU.',
      type: 'concept',
      sourcePage: 'Page 2',
      tags: ['Hardware', 'Cache'],
    },
    {
      id: 'n-eat-formula',
      parentId: 'n-tlb',
      title: 'Effective Access Time (EAT)',
      summary: 'Mathematical formula for average memory latency considering TLB hit ratio.',
      details: 'Weighted sum of TLB hits (single lookup) and misses (requires traversing page table in main memory).',
      type: 'formula',
      formula: 'EAT = \\alpha(t_{TLB} + t_{mem}) + (1-\\alpha)(t_{TLB} + 2t_{mem})',
      sourcePage: 'Page 2',
    },
    {
      id: 'n-pagefault',
      parentId: 'root',
      title: 'Page Fault Sequence',
      summary: 'Hardware trap triggering kernel intervention when referenced page is absent from RAM.',
      details: 'Involves saving registers, checking PCB validity, finding free frame, scheduling disk read, updating page table, and restarting instruction.',
      type: 'concept',
      sourcePage: 'Page 2',
      tags: ['Trap', 'Disk I/O'],
    },
    {
      id: 'n-pf-steps',
      parentId: 'n-pagefault',
      title: 'Fault Handling Steps',
      summary: '6-step protocol executing within the operating system kernel.',
      details: '1. Trap to OS -> 2. Verify legality -> 3. Locate free frame -> 4. Read page from disk -> 5. Reset page table -> 6. Restart instruction.',
      type: 'subtopic',
      sourcePage: 'Page 2',
    },
    {
      id: 'n-replacement',
      parentId: 'root',
      title: 'Page Replacement Algorithms',
      summary: 'Strategies for selecting victim frames when memory is full.',
      details: 'Balancing algorithmic overhead, hardware support, and minimization of page fault frequency.',
      type: 'concept',
      sourcePage: 'Page 3',
      tags: ['Algorithms', 'Optimization'],
    },
    {
      id: 'n-lru',
      parentId: 'n-replacement',
      title: 'Least Recently Used (LRU)',
      summary: 'Replaces frame that was not referenced for longest past duration.',
      details: 'Approximates the optimal offline algorithm. Immune to Belady anomaly. Requires timestamp counters or reference stacks.',
      type: 'subtopic',
      sourcePage: 'Page 3',
    },
    {
      id: 'n-clock',
      parentId: 'n-replacement',
      title: 'Clock / Second-Chance',
      summary: 'Circular buffer heuristic utilizing a hardware reference bit.',
      details: 'If reference bit is 1, clears bit to 0 and advances clock hand. If 0, selects page as victim.',
      type: 'subtopic',
      sourcePage: 'Page 3',
    },
    {
      id: 'n-belady',
      parentId: 'n-replacement',
      title: "Belady's Anomaly (FIFO)",
      summary: 'Counter-intuitive phenomenon where increasing physical frames increases page faults.',
      details: 'Demonstrates why FIFO is unsuitable for high-performance operating systems compared to stack algorithms like LRU.',
      type: 'takeaway',
      sourcePage: 'Page 3',
    },
    {
      id: 'n-thrashing',
      parentId: 'root',
      title: 'Thrashing & Working Set',
      summary: 'Catastrophic state where system spends more time swapping than executing.',
      details: 'Occurs when sum of processes working sets exceeds available physical memory frames.',
      type: 'concept',
      sourcePage: 'Page 4',
      tags: ['Performance', 'Locality'],
    },
    {
      id: 'n-workingset',
      parentId: 'n-thrashing',
      title: 'Working-Set Principle',
      summary: 'Locality-of-reference model capturing pages used in last Delta references.',
      details: 'OS monitors working set sizes and dynamically suspends lower priority processes when memory demand exceeds physical limits.',
      type: 'subtopic',
      sourcePage: 'Page 4',
    },
  ],
  edges: [
    { id: 'e-1', source: 'root', target: 'n-paging', label: 'implements' },
    { id: 'e-2', source: 'n-paging', target: 'n-pagetable', label: 'indexed by' },
    { id: 'e-3', source: 'root', target: 'n-tlb', label: 'accelerated by' },
    { id: 'e-4', source: 'n-tlb', target: 'n-eat-formula', label: 'governed by' },
    { id: 'e-5', source: 'root', target: 'n-pagefault', label: 'handled via' },
    { id: 'e-6', source: 'n-pagefault', target: 'n-pf-steps', label: 'protocol' },
    { id: 'e-7', source: 'root', target: 'n-replacement', label: 'managed with' },
    { id: 'e-8', source: 'n-replacement', target: 'n-lru', label: 'strategy' },
    { id: 'e-9', source: 'n-replacement', target: 'n-clock', label: 'heuristic' },
    { id: 'e-10', source: 'n-replacement', target: 'n-belady', label: 'risk in FIFO' },
    { id: 'e-11', source: 'root', target: 'n-thrashing', label: 'prevents' },
    { id: 'e-12', source: 'n-thrashing', target: 'n-workingset', label: 'regulated by' },
  ],
  definitions: [
    {
      term: 'Demand Paging',
      definition: 'A memory management scheme where pages of a process are loaded into physical memory only when an instruction attempts to access them.',
      sourcePage: 'Page 1',
      importance: 'high',
    },
    {
      term: 'Translation Lookaside Buffer (TLB)',
      definition: 'A small, fast associative hardware cache on the CPU that stores recent virtual-to-physical address translations.',
      sourcePage: 'Page 2',
      importance: 'high',
    },
    {
      term: 'Page Fault',
      definition: 'An interrupt/trap generated by the MMU hardware when a program attempts to access a page marked invalid in the page table.',
      sourcePage: 'Page 2',
      importance: 'high',
    },
    {
      term: "Belady's Anomaly",
      definition: 'The counterintuitive phenomenon observed in FIFO page replacement where increasing the number of allocated physical frames increases the total number of page faults.',
      sourcePage: 'Page 3',
      importance: 'medium',
    },
    {
      term: 'Thrashing',
      definition: 'A severe degradation in system performance occurring when the operating system spends more CPU time paging in and out than executing application instructions.',
      sourcePage: 'Page 4',
      importance: 'high',
    },
  ],
  formulas: [
    {
      name: 'Effective Access Time (EAT) for Paging',
      formula: 'EAT = \\alpha(t_{TLB} + t_{mem}) + (1 - \\alpha)(t_{TLB} + 2t_{mem})',
      variables: [
        { symbol: '\\alpha', explanation: 'TLB Hit Ratio (fraction between 0.0 and 1.0)' },
        { symbol: 't_{TLB}', explanation: 'TLB hardware lookup time (typically 1-2 ns)' },
        { symbol: 't_{mem}', explanation: 'Main memory access latency (typically 50-100 ns)' },
      ],
      sourcePage: 'Page 2',
      notes: 'Crucial for calculating memory latency overhead with translation caching.',
    },
  ],
  flashcards: [
    {
      id: 'fc-1',
      question: 'What is the primary difference between a logical page and a physical frame?',
      answer: 'A page is a fixed-size block in logical/virtual memory space, whereas a frame is an identical-size physical slot in RAM.',
      hint: 'Think software/programmer view vs hardware silicon view.',
      category: 'Architecture',
    },
    {
      id: 'fc-2',
      question: 'Why does a standard page table lookup require TWO memory accesses without a TLB?',
      answer: 'First access retrieves the frame mapping from the page table located in RAM; second access retrieves the actual data byte from the calculated physical frame.',
      hint: 'The page table itself resides in main memory.',
      category: 'Performance',
    },
    {
      id: 'fc-3',
      question: 'Which page replacement algorithm is vulnerable to Belady\'s Anomaly?',
      answer: 'FIFO (First-In, First-Out). Stack-based algorithms like LRU and OPT are immune.',
      hint: 'First-in, first-out queue structure.',
      category: 'Algorithms',
    },
    {
      id: 'fc-4',
      question: 'How does the Clock (Second-Chance) replacement algorithm use the reference bit?',
      answer: 'When inspected, if the reference bit is 1, the algorithm resets it to 0 and gives it a second chance. If it is 0, the page is selected as the victim.',
      hint: 'Circular buffer with a clock hand.',
      category: 'Algorithms',
    },
    {
      id: 'fc-5',
      question: 'What triggers thrashing in a multiprogrammed operating system?',
      answer: 'When the total sum of working set sizes across all active processes exceeds the available physical memory frames, forcing continuous disk swapping.',
      hint: 'Lack of frames relative to active locality.',
      category: 'System Performance',
    },
  ],
  quiz: [
    {
      id: 'q-1',
      type: 'mcq',
      question: 'Given a TLB hit ratio of 90%, TLB access time of 10ns, and main memory access time of 100ns, what is the Effective Access Time (EAT)?',
      options: ['120 ns', '110 ns', '129 ns', '100 ns'],
      correctAnswer: '120 ns',
      explanation: 'EAT = 0.90*(10 + 100) + 0.10*(10 + 200) = 0.90*(110) + 0.10*(210) = 99 + 21 = 120 ns.',
      sourcePage: 'Page 2',
    },
    {
      id: 'q-2',
      type: 'true_false',
      question: 'The Least Recently Used (LRU) algorithm suffers from Belady\'s Anomaly when memory frames are expanded.',
      correctAnswer: 'False',
      explanation: 'LRU belongs to the class of stack algorithms for which the set of pages in memory for n frames is always a subset of the pages for n+1 frames, completely preventing Belady\'s Anomaly.',
      sourcePage: 'Page 3',
    },
    {
      id: 'q-3',
      type: 'fill_blank',
      question: 'The high-speed associative hardware cache inside the CPU used for mapping page numbers to frame numbers is called the _______.',
      correctAnswer: 'TLB',
      explanation: 'TLB stands for Translation Lookaside Buffer, which provides single-cycle or sub-nanosecond lookups for page addresses.',
      sourcePage: 'Page 2',
    },
    {
      id: 'q-4',
      type: 'mcq',
      question: 'What bit in the Page Table indicates whether the referenced page is currently loaded in RAM?',
      options: ['Valid / Invalid bit', 'Dirty / Modify bit', 'Reference bit', 'Execute bit'],
      correctAnswer: 'Valid / Invalid bit',
      explanation: 'A bit setting of "valid" indicates the page is resident in memory. If "invalid", accessing it triggers a page fault trap.',
      sourcePage: 'Page 1',
    },
    {
      id: 'q-5',
      type: 'mcq',
      question: 'What is the primary indicator that an operating system has entered thrashing?',
      options: ['CPU utilization drops drastically while disk paging queue spikes', 'CPU utilization reaches 100% processing user loops', 'Network throughput drops to zero', 'Page table size exceeds RAM capacity'],
      correctAnswer: 'CPU utilization drops drastically while disk paging queue spikes',
      explanation: 'During thrashing, processes are blocked waiting for disk I/O to swap pages, leaving CPU idle or waiting.',
      sourcePage: 'Page 4',
    },
  ],
};
