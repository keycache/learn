import { describe, it, expect, beforeEach } from 'vitest'
import { parseLessonResponse } from '@/services/llm/utils/responseParser'

/**
 * Integration test for parsing real LLM response
 * Tests that the actual OpenRouter API response is correctly parsed and un-escaped
 */
describe('LLM Response Parser - Real Response Integration Test', () => {
  // This is the ACTUAL raw JSON response from OpenRouter API
  // The content field has escaped newlines (\n) that need to become real newlines
  const realOpenRouterResponse = JSON.stringify({
    id: 'gen-1793654579-3dWkkghQxYTWDtQlLF2c',
    object: 'chat.completion',
    created: 1793654579,
    model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    provider: 'Nvidia',
    system_fingerprint: null,
    service_tier: null,
    choices: [
      {
        index: 0,
        logprobs: null,
        finish_reason: 'stop',
        native_finish_reason: 'stop',
        message: {
          role: 'assistant',
          content: JSON.stringify({
            title: 'Spanish Numbers: From 1 to 1,000,000 - Patterns & Memory Tricks',
            summary:
              'Learn Spanish numbers 1-1,000,000 with easy patterns, pronunciation tips, and memory tricks perfect for beginners',
            duration: '45-60 minutes',
            active: true,
            difficulty: 'beginner',
            learningObjectives: [
              'Count confidently from 1 to 10 in Spanish with correct pronunciation',
              'Master the pattern for numbers 11-19 and identify the exceptions',
              'Build numbers 20-99 using the tens + units formula',
              'Construct hundreds (100-900) and thousands (1,000-9,000) using simple patterns',
              'Say numbers up to one million (1,000,000) by combining learned patterns',
              'Recognize and remember key exceptions like 100 (cien vs ciento) and 500 (quinientos)',
            ],
            tags: [
              'spanish',
              'numbers',
              'counting',
              'beginner',
              'pronunciation',
              'patterns',
              'memory-tricks',
            ],
            content: `# 🎯 Spanish Numbers: From 1 to 1,000,000

> **¡Hola!** Ready to count like a Spanish pro? By the end of this lesson, you'll be able to say **any number up to one million** using simple patterns and memory tricks. Let's go! 🚀

---

## 📋 Learning Objectives

- ✅ Count 1-10 with perfect pronunciation
- ✅ Spot the pattern in 11-19 (and the sneaky exceptions!)
- ✅ Build 20-99 like LEGO bricks: *tens + y + units*
- ✅ Master hundreds and thousands with one simple rule
- ✅ Say **1,000,000** without breaking a sweat

---

## 🔢 Part 1: The Foundation — Numbers 1-10

These are your **building blocks**. Memorize them well — everything else builds on these!

| Number | Spanish | Pronunciation Guide | Memory Trick 🧠 |
|--------|---------|---------------------|-----------------| 
| 1 | **uno** | *OO-noh* | Sounds like "you know" → **Uno** = You know **one** |
| 2 | **dos** | *dohss* | Rhymes with "dose" → **Dos** = **Two** doses |
| 3 | **tres** | *trehss* | Sounds like "trace" → **Tres** leaves a **trace** (3 lines) |
| 4 | **cuatro** | *KWAH-troh* | **Qua** sounds like "quad" (4) → **Cuatro** = **Quad**ro |
| 5 | **cinco** | *SEEN-koh* | Think **sink** + **oh** → **Cinco** fingers in the **sink-OH** |
| 6 | **seis** | *seh-eess* | Sounds like "says" → **Seis** **says** "I'm 6!" |
| 7 | **siete** | *SYEH-teh* | **Sie** sounds like "see" → **Siete** = **See** **7** stars ✨ |
| 8 | **ocho** | *OH-choh* | **O** looks like **8** → **Ocho** starts with **O**! |
| 9 | **nueve** | *NWEH-beh* | **Nue** sounds like "new" → **Nueve** = **New** **9** |
| 10 | **diez** | *DYEHSS* | Sounds like "dies" → **Diez** = **Ten** **dies** (rhyme!) |

> **🗣️ Practice Tip:** Say each number **out loud 3 times** while holding up that many fingers. Muscle memory + voice = sticky brain! 🧠💪

\`\`\`
🎵 RHYME TIME: "Uno, dos, tres, cuatro,
Cinco, seis, siete, ocho,
Nueve, diez — that's the flow!"
\`\`\`

---

## 🔟 Part 2: The "Teens" — Numbers 11-19

Here's where it gets interesting. **11-15 are unique words**, but **16-19 follow a pattern!**

### 🎲 The Exceptions (Memorize These!)

| Number | Spanish | Pronunciation | Memory Trick |
|--------|---------|---------------|--------------| 
| 11 | **once** | *OHN-seh* | **Once** upon a time → **11** |
| 12 | **doce** | *DOH-seh* | **Doce** = **Do** + **ce** → **2** syllables = **12** |
| 13 | **trece** | *TREH-seh* | **Tres** (3) + **ce** → **Trece** = **13** |
| 14 | **catorce** | *kah-TOHR-seh* | **Cuatro** (4) + **ce** → **Catorce** = **14** |
| 15 | **quince** | *KEEN-seh* | **Quin** sounds like "queen" → **Quince** = **Queen** **15** 👑 |

### ✨ The Magic Pattern: 16-19

> **Formula:** \`diez\` + \`y\` + \`unit\` → **but written as ONE word!**

| Number | Formula | Spanish | Pronunciation | Breakdown |
|--------|---------|---------|---------------|-----------| 
| 16 | 10 + 6 | **dieciséis** | *dyeh-see-SEHSS* | diez + y + seis → **dieciséis** (accent on **séis**!) |
| 17 | 10 + 7 | **diecisiete** | *dyeh-see-SYEH-teh* | diez + y + siete → **diecisiete** |
| 18 | 10 + 8 | **dieciocho** | *dyeh-see-OH-choh* | diez + y + ocho → **dieciocho** |
| 19 | 10 + 9 | **diecinueve** | *dyeh-see-NWEH-beh* | diez + y + nueve → **diecinueve** |

> **⚠️ KEY CHANGES to notice:**
> - \`diez\` → **deci-** (loses the \`z\`, gains \`ci\`)
> - \`y\` → **ci** (built into the spelling!)
> - **Accent mark** on **dieciséis** (only one in 16-19!)

\`\`\`
🧠 MEMORY HACK: "De-ci" sounds like "DC" (Washington DC) →
Think: "DC has 16-19 year olds!"
\`\`\`

---

## 🔟 Part 3: The Tens — 20, 30, 40... 90

These are **super regular** — almost all end in **-enta**!

| Number | Spanish | Pronunciation | Pattern Spotter 🔍 |
|--------|---------|---------------|---------------------| 
| 20 | **veinte** | *BEHN-teh* | **V** shape = 2 points → **Veinte** = **20** |
| 30 | **treinta** | *TREHN-tah* | **Tres** (3) + **inta** → **Treinta** = **30** |
| 40 | **cuarenta** | *kwah-REHN-tah* | **Cuatro** (4) + **enta** → **Cuarenta** = **40** |
| 50 | **cincuenta** | *seen-KWEHN-tah* | **Cinco** (5) + **enta** → **Cincuenta** = **50** |
| 60 | **sesenta** | *seh-SEHN-tah* | **Seis** (6) + **enta** → **Sesenta** = **60** |
| 70 | **setenta** | *seh-TEHN-tah* | **Siete** (7) + **nta** → **Setenta** = **70** |
| 80 | **ochenta** | *oh-CHEHN-tah* | **Ocho** (8) + **enta** → **Ochenta** = **80** |
| 90 | **noventa** | *noh-BEHN-tah* | **Nueve** (9) + **nta** → **Noventa** = **90** |

> **🎯 PATTERN ALERT:** Every ten from 30-90 = **root number + -enta/-inta**
> - 30: tres → tre**inta**
> - 40: cuatro → cu**arenta** (note: ua → a)
> - 50: cinco → cin**cuenta**
> - 60: seis → se**senta**
> - 70: siete → se**tenta** (note: te → ta)
> - 80: ocho → o**chenta**
> - 90: nueve → no**venta** (note: ve → ve)

---

## ➕ Part 4: Building 21-99 — The "Y" Formula

> **Golden Rule:** \`TEN\` + **y** + \`UNIT\` = **any number 21-99**

### Examples:

| Number | Build It! | Spanish | Pronunciation |
|--------|-----------|---------|---------------| 
| 21 | veinte + y + uno | **veintiuno** | *behn-tee-OO-noh* |
| 22 | veinte + y + dos | **veintidós** | *behn-tee-DOHSS* (accent!) |
| 23 | veinte + y + tres | **veintitrés** | *behn-tee-TREHSS* (accent!) |
| 24 | veinte + y + cuatro | **veinticuatro** | *behn-tee-KWAH-troh* |
| 31 | treinta + y + uno | **treinta y uno** | *trehn-tah ee OO-noh* |
| 45 | cuarenta + y + cinco | **cuarenta y cinco** | *kwah-rehn-tah ee SEEN-koh* |
| 58 | cincuenta + y + ocho | **cincuenta y ocho** | *seen-kwen-tah ee OH-choh* |
| 73 | setenta + y + tres | **setenta y tres** | *seh-tehn-tah ee trehss* |
| 86 | ochenta + y + seis | **ochenta y seis** | *oh-chehn-tah ee seh-eess* |
| 99 | noventa + y + nueve | **noventa y nueve** | *noh-behn-tah ee NWEH-beh* |

> **⚡ SPECIAL RULE for 21-29:** They fuse into **ONE WORD**!
> - \`veinte\` + \`y\` + \`uno\` → **veintiuno** (not *veinte y uno*)
> - \`veinte\` + \`y\` + \`dos\` → **veintidós** (accent on ó!)
> - \`veinte\` + \`y\` + \`tres\` → **veintitrés** (accent on é!)
> - \`veinte\` + \`y\` + \`seis\` → **veintiséis** (accent on é!)

> **📝 From 31 onward:** Write as **THREE words** → *treinta y uno*, *cuarenta y cinco*

\`\`\`
🎵 CHANT IT: "Veinte y uno, veinte y dos,
Veinte y tres, veinte y cuatro...
Treinta y uno, cuarenta y dos,
Counting in Spanish is easy for you!"
\`\`\`

---

## 💯 Part 5: Hundreds — 100 to 900

### The Big Exception: 100

| Number | Spanish | When to Use |
|--------|---------|-------------| 
| 100 | **cien** | **Exactly 100** — *"Tengo cien dólares"* (I have 100 dollars) |
| 101+ | **ciento** | **101-199** — *"Ciento uno"* (101), *"Ciento veintitrés"* (123) |

> **🧠 MEMORY TRICK:** **Cien** = **C**lean **100** (short, exact)
> **Ciento** = **C**ount **on** adding more (longer, continues)

### 200-900: The Pattern

> **Formula:** \`unit\` + \`cientos\` (mostly!)

| Number | Spanish | Pronunciation | Pattern Note |
|--------|---------|---------------|--------------| 
| 200 | **doscientos** | *dohs-SYEHN-tohs* | dos + cientos |
| 300 | **trescientos** | *trehs-SYEHN-tohs* | tres + cientos |
| 400 | **cuatrocientos** | *kwah-troh-SYEHN-tohs* | cuatro + cientos |
| 500 | **quinientos** | *kee-NYEHN-tohs* | ⚠️ **EXCEPTION!** Not *cincocientos* |
| 600 | **seiscientos** | *seh-eess-SYEHN-tohs* | seis + cientos |
| 700 | **setecientos** | *seh-teh-SYEHN-tohs* | ⚠️ **EXCEPTION!** Not *sietecientos* |
| 800 | **ochocientos** | *oh-choh-SYEHN-tohs* | ocho + cientos |
| 900 | **novecientos** | *noh-beh-SYEHN-tohs* | ⚠️ **EXCEPTION!** Not *nuevecientos* |

> **🎯 THREE EXCEPTIONS to memorize:**
> - 500 → **quinientos** (think **quin** = 5 in Latin)
> - 700 → **setecientos** (shortened from *siete*)
> - 900 → **novecientos** (shortened from *nueve*)

### Building 101-999

> **Formula:** \`hundreds\` + \`tens-y-units\`

\`\`\`
101  → ciento uno
115  → ciento quince
123  → ciento veintitrés
256  → doscientos cincuenta y seis
399  → trescientos noventa y nueve
742  → setecientos cuarenta y dos
999  → novecientos noventa y nueve
\`\`\`

> **🚫 NO "y" between hundreds and tens!**
> ❌ *ciento **y** uno* → ✅ **ciento uno**

---

## 🔥 Part 6: Thousands — 1,000 to 9,000

### The Magic Word: **MIL**

| Number | Spanish | Pronunciation | Key Rule |
|--------|---------|---------------|----------| 
| 1,000 | **mil** | *meel* | **Never "un mil"** — just **mil**! |
| 2,000 | **dos mil** | *dohs meel* | Number + **mil** (space, not fused) |
| 3,000 | **tres mil** | *trehs meel* | |
| 9,000 | **nueve mil** | *NWEH-beh meel* | |

> **🧠 MEMORY TRICK:** **Mil** sounds like "meal" → **One meal** = **1,000** calories? 🍔

### Building Big Numbers: The Layer Cake Method 🎂

> **Read left to right, layer by layer:**
> \`THOUSANDS\` + \`HUNDREDS\` + \`TENS-Y-UNITS\`

\`\`\`
1,234  → mil doscientos treinta y cuatro
2,015  → dos mil quince
5,678  → cinco mil seiscientos setenta y ocho
9,999  → nueve mil novecientos noventa y nueve
\`\`\`

> **⚠️ NO "y" between thousands and hundreds!**
> ✅ *dos mil quinientos* (2,500)
> ❌ *dos mil **y** quinientos*

---

## 🌟 Part 7: Up to ONE MILLION!

### The Next Big Word: **MILLÓN**

| Number | Spanish | Pronunciation | Grammar Note |
|--------|---------|---------------|--------------| 
| 1,000,000 | **un millón** | *oon mee-YOHN* | **Must say "un"** — unlike *mil*! |
| 2,000,000 | **dos millones** | *dohs mee-YOH-nehss* | **Millones** (plural!) |
| 5,000,000 | **cinco millones** | *SEEN-koh mee-YOH-nehss* | |

> **🎯 CRITICAL DIFFERENCE:**
> - **Mil** → NEVER "un mil" → just **mil**
> - **Millón** → ALWAYS "un millón" → **un millón**

### Million + Thousands + Hundreds

\`\`\`
1,000,001  → un millón uno
2,345,678  → dos millones trescientos cuarenta y cinco mil seiscientos setenta y ocho

Breakdown:
  dos millones          → 2,000,000
  trescientos cuarenta y cinco mil  → 345,000
  seiscientos setenta y ocho       → 678
\`\`\`

> **📌 PLURAL RULE:** 1 million = **millón** | 2+ million = **millones**

---

## 📚 Part 8: Quick Reference Cheat Sheet

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    SPANISH NUMBER BLUEPRINT                   │
├─────────────────────────────────────────────────────────────┤
│  1-10       → MEMORIZE (building blocks)                     │
│  11-15      → MEMORIZE (exceptions: once, doce, trece,       │
│               catorce, quince)                               │
│  16-19      → dieci + unit (dieciséis, diecisiete...)        │
│  20-90      → root + -enta/-inta (veinte, treinta, cuarenta) │
│  21-29      → FUSED: veinti + unit (veintiuno, veintidós...) │
│  31-99      → THREE words: treinta y uno, cuarenta y cinco   │
│  100        → cien (exact) / ciento (101+)                   │
│  200-900    → unit + cientos (EXCEPTIONS: 500, 700, 900)    │
│  1,000      → mil (NEVER "un mil")                           │
│  1,000,000  → un millón (MUST say "un") / millones (plural) │
│                                                                 │
│  🚫 NO "y" between: hundreds-tens, thousands-hundreds       │
│  ✅ YES "y" between: tens-units (31-99)                      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 🎮 Part 9: Practice Challenges

### Challenge 1: Say These Out Loud
\`\`\`
1.  37  → _________________________
2.  82  → _________________________
3.  105 → _________________________
4.  216 → _________________________
5.  500 → _________________________ (watch out!)
6.  743 → _________________________
7.  1,000 → _________________________
8.  2,024 → _________________________
9.  10,000 → _________________________ (diez mil)
10. 1,000,000 → _________________________
\`\`\`

### Challenge 2: Write in Spanish
\`\`\`
1.  48  → _________________________
2.  63  → _________________________
3.  119 → _________________________
4.  305 → _________________________
5.  700 → _________________________ (exception!)
6.  4,500 → _________________________
7.  99,999 → _________________________
8.  500,000 → _________________________ (quinientos mil)
9.  3,000,000 → _________________________
10. 1,234,567 → _________________________
\`\`\`

> **💡 Answers at the bottom — no peeking until you try!**

---

## ✅ Part 10: Summary — Your Number Superpowers

| You Can Now... | How? |
|----------------|------| 
| 🎯 Count 1-10 | Memorized with memory tricks |
| 🎯 Handle 11-19 | Know 5 exceptions + 4-pattern rule |
| 🎯 Build 20-99 | Tens + **y** + units (fused for 20s!) |
| 🎯 Master 100-999 | **Cien/Ciento** + hundreds pattern (3 exceptions) |
| 🎯 Say thousands | **Mil** (no "un") + number + **mil** |
| 🎯 Reach 1,000,000 | **Un millón** (with "un") + **millones** (plural) |

### 🏆 The ONLY Exceptions to Remember:

1. **11-15:** once, doce, trece, catorce, quince
2. **16-19:** dieciséis (accent!), diecisiete, dieciocho, diecinueve
3. **21-29:** fused words + accents on 22, 23, 26
4. **100:** cien vs ciento
5. **500:** quinientos (not cincocientos)
6. **700:** setecientos (not sietecientos)
7. **900:** novecientos (not nuevecientos)
8. **1,000:** mil (never "un mil")
9. **1,000,000:** un millón (must say "un"), plural = millones

---

## 🗝️ Challenge Answers

**Challenge 1:**
1. treinta y siete  |  2. ochenta y dos  |  3. ciento cinco
4. doscientos dieciséis  |  5. quinientos  |  6. setecientos cuarenta y tres
7. mil  |  8. dos mil veinticuatro  |  9. diez mil  |  10. un millón

**Challenge 2:**
1. cuarenta y ocho  |  2. sesenta y tres  |  3. ciento diecinueve
4. trescientos cinco  |  5. setecientos  |  6. cuatro mil quinientos
7. noventa y nueve mil novecientos noventa y nueve
8. quinientos mil  |  9. tres millones  |  10. un millón doscientos treinta y cuatro mil quinientos sesenta y siete

---

> **🌟 ¡FELICIDADES!** You now have the tools to say **ANY number up to a million** in Spanish! Practice a little each day — count your steps, count money, count sheep in Spanish — and it'll become automatic. **¡Buena suerte!** 🍀

---

*Lesson created for ages 9-12 | Beginner Spanish | Estimated time: 45-60 minutes*`,
          }),
        },
      },
    ],
  })

  it('should parse real OpenRouter response and preserve markdown tables with proper newlines', () => {
    // Extract the lesson JSON from the message content (as the LLMService would do)
    const outerJson = JSON.parse(realOpenRouterResponse)
    const lessonJsonStr = outerJson.choices[0].message.content

    // Parse the lesson
    const result = parseLessonResponse(lessonJsonStr)

    // Should succeed
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()

    const content = result.data?.content

    // Check that content exists
    expect(content).toBeDefined()
    expect(content!.length).toBeGreaterThan(1000)

    // Verify NO escaped newlines (they should be real newlines)
    const hasEscapedNewlines = content!.includes('\\n')
    expect(hasEscapedNewlines).toBe(false)

    // Verify real newlines exist
    const hasRealNewlines = content!.includes('\n')
    expect(hasRealNewlines).toBe(true)

    // Verify table structure is preserved
    expect(content!).toContain('| Number | Spanish |')
    expect(content!).toContain('|--------|')

    // Most importantly: verify table rows are on SEPARATE LINES
    const tableStart = content!.indexOf('| Number | Spanish |')
    const tableSectionLength = 500
    const tableSection = content!.substring(tableStart, tableStart + tableSectionLength)

    // Check that header, separator, and data row are NOT on same line
    const lines = tableSection.split('\n')
    expect(lines.length).toBeGreaterThan(3)

    // First line should be header
    expect(lines[0]).toContain('| Number |')
    // Second line should be separator
    expect(lines[1]).toContain('|--------|')
    // Third line should be data row with "1"
    expect(lines[2]).toContain('| 1 |')

    console.log('✅ Table rendering test passed!')
    console.log(`   - Content length: ${content!.length}`)
    console.log(`   - Has real newlines: ${hasRealNewlines}`)
    console.log(`   - Has escaped newlines: ${hasEscapedNewlines}`)
    console.log(`   - Table rows on separate lines: ✓`)
  })

  it('should preserve all markdown elements (headings, bold, italic, blockquotes, code blocks)', () => {
    const outerJson = JSON.parse(realOpenRouterResponse)
    const lessonJsonStr = outerJson.choices[0].message.content
    const result = parseLessonResponse(lessonJsonStr)

    expect(result.success).toBe(true)
    const content = result.data?.content!

    // Check headings
    expect(content).toContain('# 🎯 Spanish Numbers')
    expect(content).toContain('## 📋 Learning Objectives')
    expect(content).toContain('## 🔢 Part 1:')

    // Check bold - verify the actual content
    expect(content).toContain('**uno**')
    expect(content).toContain('**building blocks**')
    expect(content).toContain('**1,000,000**')

    // Check italic
    expect(content).toContain('*OO-noh*')
    expect(content).toContain('*tens + y + units*')

    // Check blockquotes
    expect(content).toContain('> **¡Hola!**')
    expect(content).toContain('> **🗣️ Practice Tip:**')

    // Check code blocks
    expect(content).toContain('```')
    expect(content).toContain('RHYME TIME:')
    expect(content).toContain('🎵')

    // Check list items
    expect(content).toContain('- ✅ Count 1-10')
    expect(content).toContain('- ✅ Spot the pattern')

    console.log('✅ All markdown elements preserved!')
  })

  it('should include raw response in result for debugging', () => {
    const outerJson = JSON.parse(realOpenRouterResponse)
    const lessonJsonStr = outerJson.choices[0].message.content
    const result = parseLessonResponse(lessonJsonStr)

    expect(result.success).toBe(true)
    expect(result.rawResponse).toBeDefined()
    expect(result.rawResponse!.length).toBeGreaterThan(0)
    expect(result.rawResponse).toEqual(lessonJsonStr)

    console.log('✅ Raw response preserved for debugging!')
  })

  it('should handle the complete lesson structure with all required fields', () => {
    const outerJson = JSON.parse(realOpenRouterResponse)
    const lessonJsonStr = outerJson.choices[0].message.content
    const result = parseLessonResponse(lessonJsonStr)

    expect(result.success).toBe(true)
    const lesson = result.data!

    // Verify all required fields
    expect(lesson.title).toEqual('Spanish Numbers: From 1 to 1,000,000 - Patterns & Memory Tricks')
    expect(lesson.summary).toBeDefined()
    expect(lesson.duration).toEqual('45-60 minutes')
    expect(lesson.active).toBe(true)
    expect(lesson.difficulty).toEqual('beginner')
    expect(lesson.learningObjectives).toHaveLength(6)
    expect(lesson.tags).toHaveLength(7)
    expect(lesson.content).toBeDefined()

    console.log('✅ Complete lesson structure validated!')
  })
})
