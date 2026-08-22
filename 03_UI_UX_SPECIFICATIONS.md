# MediKiosk UI/UX Specifications
## Component Design & Interaction Patterns

---

## DESIGN PHILOSOPHY

### Core Principles
1. **Clinical Authenticity** - NOT AI-generated aesthetics
   - Use real hospital color schemes (calming blues, professional grays)
   - Medical sans-serif typography (not trendy, not futuristic)
   - Clinic-like layout with clear information hierarchy

2. **Accessibility First**
   - Large touch targets (min 48px × 48px for buttons)
   - High contrast ratios (WCAG AA minimum)
   - Audio prompts for every screen
   - Works for elderly, low-literacy users

3. **Clarity Over Decoration**
   - No gradients, no animations beyond functional feedback
   - Information organized in clear sections
   - Icons only when necessary (not decorative)

4. **Speed & Responsiveness**
   - Zero perceived lag
   - Instant visual feedback (button press, voice capture)
   - Progress indicators for longer processes

---

## COLOR PALETTE

### Primary Colors
```
Medical Blue:     #1F5A8C (Trust, healthcare standard)
Clinical Gray:    #2C3E50 (Professional, serious)
Success Green:    #27AE60 (Confirm, positive action)
Warning Red:      #E74C3C (Alert, urgent)
Neutral Gray:     #95A5A6 (Secondary text, disabled)
White:            #FFFFFF (Background, cards)
Light Gray:       #ECF0F1 (Subtle backgrounds, borders)
```

### Usage Rules
- Primary CTA buttons: Medical Blue
- Secondary buttons: Light Gray with border
- Error/Alert: Warning Red
- Confirmation: Success Green
- Text on white: Clinical Gray (#2C3E50)
- Text on Medical Blue: White
- Disabled buttons: Neutral Gray

---

## TYPOGRAPHY

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
             sans-serif;
```

### Scale (Mobile-First)
```
H1 (Page Title):      32px / 1.2 line-height / 700 weight
H2 (Section):         24px / 1.3 line-height / 600 weight
H3 (Subsection):      18px / 1.4 line-height / 600 weight
Body (Regular text):  16px / 1.6 line-height / 400 weight
Small (Labels):       14px / 1.5 line-height / 500 weight
Caption (Help):       12px / 1.5 line-height / 400 weight
Button Text:          16px / 1.5 line-height / 600 weight
```

### Spacing System (8px baseline)
```
8px, 12px, 16px, 24px, 32px, 48px, 64px
Use consistently: padding, margins, gaps
```

---

## SCREEN 1: WELCOME & IDENTIFICATION

### Layout
```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │  M E D I K I O S K                  │ │  (Logo area, no gradient)
│ │                                     │ │  (Use text only or simple mark)
│ └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │  Welcome to your health check-in   ││
│  │                                     ││
│  │  We'll capture your medical history││
│  │  in your own words, before your    ││
│  │  doctor's appointment.             ││
│  │                                     ││
│  │  It takes about 5 minutes.          ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  Select your preferred language:       │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   हिंदी      │  │   English    │   │
│  │   (Hindi)    │  │   (English)  │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │                                     ││
│  │   Authenticate with ABHA ID         ││
│  │   (Simulated for Demo)              ││
│  │                                     ││
│  │  ┌───────────────────────────────┐ ││
│  │  │ Enter ABHA ID or Aadhaar      │ ││
│  │  │ (Leave blank to continue)     │ ││
│  │  │                               │ ││
│  │  │ ___________________________   │ ││
│  │  │                               │ ││
│  │  └───────────────────────────────┘ ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  Consent & Privacy                  ││
│  │                                     ││
│  │  ☑ I agree that MediKiosk will:    ││
│  │    • Capture my health history     ││
│  │    • Digitize my medical documents ││
│  │    • Share with my doctor          ││
│  │    • Store securely per DPDP Act   ││
│  │                                     ││
│  │  [🔊 Read Privacy Policy in Hindi]  ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│      [PROCEED TO HISTORY INTAKE]        │
│                                         │
└─────────────────────────────────────────┘
```

### Component Specs
**Header Section:**
- Logo text "MediKiosk" (32px, Medical Blue, no gradient)
- Tagline: "Smart Health History" (16px, Gray)

**Language Selection:**
- Two buttons side-by-side (or stacked on mobile)
- 48px minimum height
- Button borders (not filled) initially
- Active button: filled Medical Blue background

**Input Field:**
- Border: Light Gray (#ECF0F1)
- Focus border: Medical Blue
- Placeholder text: 12px, Neutral Gray
- No visible focus ring (use border change only)

**Consent Checkbox:**
- Large checkbox (24px × 24px minimum)
- Label text clickable (entire area, not just checkbox)
- Link to privacy policy (underlined)
- Audio button: speaker icon, reads policy aloud

**CTA Button:**
- "PROCEED TO HISTORY INTAKE"
- Full width (minus safe margins)
- 56px height (large for kiosk/elderly)
- Medical Blue background
- White text, 16px bold
- No shadow or depth effects
- Hover: darker blue (#1A4A7A)
- Active/Pressed: even darker

### Interaction
1. User selects language → UI switches language immediately
2. User enters/skips ABHA ID
3. User checks consent
4. On click "PROCEED": Validate consent checked
5. If invalid: Show simple error message, allow retry
6. If valid: Transition to Interview Screen (fade, no bounce)

### Accessibility
- ARIA labels on all buttons and inputs
- Tab order: Language → ID field → Consent → CTA
- Screen reader announces "Privacy Policy" as link
- Audio version of consent available

---

## SCREEN 2: INTERVIEW (Voice + Touch)

### Layout (Two-Column on Desktop, Stacked on Mobile)

```
┌──────────────────────────────────────────────┐
│ [Back] Interview                    [3/5]    │
├────────────────────┬─────────────────────────┤
│                    │                         │
│     VOICE INPUT    │   QUICK SYMPTOMS       │
│                    │                         │
│    ┌──────────┐    │  What brings you in?   │
│    │    🎤    │    │                         │
│    │ LISTENING│    │  [Fever] [Cough]      │
│    │(pulsing) │    │  [Headache] [Chest]   │
│    └──────────┘    │  [Body Ache]          │
│                    │                         │
│  Your concern:     │  [More Symptoms ▼]    │
│                    │                         │
│  "I have had a     │  Doctor's Follow-ups:  │
│  severe headache   │  (AI will ask these)   │
│  for 3 days..."    │                         │
│                    │  "When did it start?"  │
│  [STOP]  [CLEAR]   │  [2 days] [3 days]    │
│                    │  [1 week] [Custom]    │
│                    │                         │
│                    │  "What type of pain?" │
│                    │  [Sharp] [Dull]       │
│                    │  [Throbbing] [Other]  │
│                    │                         │
│                    │                         │
│                    │  [← PREVIOUS] [NEXT →]│
│                    │                         │
└────────────────────┴─────────────────────────┘
```

### Component Specs

**Left Column: Voice Input**
- Heading: "Tell us what's wrong" (24px, gray)
- Microphone button:
  - Size: 120px × 120px (large, easy to tap)
  - Animation: Pulsing opacity (pulse every 1s when listening)
  - Color: Medical Blue when active, Light Gray when inactive
  - Icon: Speaker emoji or SVG icon (not fancy, simple and clear)
  - Text below: "LISTENING" or "TAP TO SPEAK"

- Transcription display:
  - Smaller font (14px) in a bordered box
  - Gray background (#ECF0F1)
  - Shows live transcript as user speaks
  - Updates word-by-word (not all at once)

- Control buttons:
  - [STOP] - ends listening
  - [CLEAR] - clears transcript
  - Size: 48px height, side-by-side
  - Gray backgrounds, Medical Blue hover

**Right Column: Touch Interaction**
- Heading: "Or select from common symptoms" (16px, gray)
- Quick buttons:
  - Grid layout (2-3 columns depending on device)
  - Each: 48px height minimum
  - Light Gray background, dark border
  - White background on selection
  - No checkmarks (visual highlight only)
  - Wrap automatically to new rows

- "More Symptoms" dropdown:
  - Shows additional symptom buttons
  - Collapsible (not a modal)
  - Smooth height animation on expand/collapse

- AI Follow-ups Section:
  - Appears after initial input (fade in)
  - Heading: "Tell us more..." (16px, bold)
  - Multiple-choice options:
    - Larger than quick buttons (56px height)
    - One per row
    - Radio-button style (circular indicator)
    - Shows current question number

- Navigation:
  - [← PREVIOUS] [NEXT →] buttons at bottom
  - Disabled (grayed out) if no input yet

### Interaction Flow

**Step 1: User Speaks**
1. User taps microphone button
2. Button changes color to Medical Blue, shows "LISTENING"
3. Browser requests microphone permission (first time only)
4. Animated pulsing wave feedback
5. Real-time transcript appears in box below
6. User finishes speaking, pauses 3 seconds
7. Speech recognition auto-stops
8. Button reverts to "TAP TO SPEAK"

**Step 2: LLM Processes**
1. Transcript sent to Gemini API (silent)
2. "Analyzing..." indicator appears briefly
3. AI generates follow-up questions based on transcript

**Step 3: AI Questions Appear**
1. Fade-in animation: Follow-ups section appears
2. First question displayed with multiple choices
3. User taps one of the options
4. Selection saved, next question appears
5. Continue until all key questions answered

**Step 4: User Proceeds**
1. Click [NEXT →]
2. Validation: Ensure chief complaint captured
3. If invalid: Highlight missing field, show prompt
4. If valid: Fade transition to Document Upload screen

### Accessibility
- Microphone button keyboard-accessible (SPACE to start/stop)
- All touch buttons labeled with ARIA
- Audio announcement of each question
- Captions of audio transcript for deaf users (optional enhancement)
- High contrast: white text on Medical Blue for all labels

---

## SCREEN 3: DOCUMENT UPLOAD (Optional)

### Layout
```
┌─────────────────────────────────────┐
│ [Back] Upload Prior Reports    [4/5]│
├─────────────────────────────────────┤
│                                     │
│  Do you have prior medical reports? │
│                                     │
│  [YES] [NO]                         │
│                                     │
│  If YES:                            │
│  ┌─────────────────────────────────┐│
│  │  ┌───────────┐                  ││
│  │  │    📄     │ Upload Document  ││
│  │  │  Click or │ (Prescription,   ││
│  │  │   drag    │  Lab Report,     ││
│  │  │ document  │  Discharge)      ││
│  │  │           │                  ││
│  │  └───────────┘                  ││
│  │                                 ││
│  │  Scanning... [████████░░ 80%]   ││
│  │                                 ││
│  │  Extracted content:             ││
│  │  • Hypertension (Diagnosis)     ││
│  │  • Amlodipine 5mg (Medicine)    ││
│  │  • BP: 150/90 mmHg (Lab)        ││
│  │                                 ││
│  │  [REMOVE] [UPLOAD ANOTHER]      ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  [SKIP] [NEXT →]                    │
│                                     │
└─────────────────────────────────────┘
```

### Component Specs
- **Upload Zone:** 
  - Dashed border, Light Gray
  - Icon: Document emoji or SVG
  - Hover state: Medical Blue border
  - Drag-and-drop enabled
  - File input hidden (styled as drag zone)

- **Progress Bar:**
  - Thin (6px height)
  - Medical Blue color
  - Linear, no animation (shows actual progress)

- **Extracted Content:**
  - Table-like layout
  - Left column: Icon (📋 diagnosis, 💊 medicine, 🧪 lab)
  - Right column: Text description
  - Simple, no styling

---

## SCREEN 4: HANDOFF CONFIRMATION

### Layout
```
┌─────────────────────────────────────┐
│                                     │
│  ✓ Your health history is ready    │
│                                     │
│  Captured information:              │
│  • Chief Complaint                  │
│  • Medical History                  │
│  • Medications & Allergies          │
│  • Prior Test Results               │
│                                     │
│  This summary will help your doctor │
│  understand your condition better.  │
│                                     │
│  Next Steps:                        │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Proceed to Room #102             ││
│  │                                 ││
│  │ Your Doctor is ready for you.    ││
│  │                                 ││
│  │     [GO TO DOCTOR'S ROOM]        ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Estimated wait: 2 minutes          │
│                                     │
│  [REVIEW SUMMARY] [PRINT FOR ME]    │
│                                     │
└─────────────────────────────────────┘
```

### Component Specs
- Success checkmark (✓) - Medical Green, 48px
- Room number in large text (32px, bold)
- Primary button: [GO TO DOCTOR'S ROOM] (56px height)
- Secondary buttons: Text-only or outlined
- Estimated wait time: 12px, gray text

### Interaction
- On click "GO TO DOCTOR'S ROOM": Transition to Doctor Dashboard
- Optional: Show summary preview in modal
- Optional: Generate PDF for printing

---

## SCREEN 5: DOCTOR DASHBOARD (The "Wow" Moment)

### Layout
```
┌────────────────────────────────────────────────┐
│ Patient Summary | Patient: Raj Kumar            │
│ ABHA ID: [XXXX-XXXX-XXXX] | Time: 2:45 PM     │
├────────────────────────────────────────────────┤
│                                                │
│ ┌──────────────────────────────────────────────┐│
│ │  ⚠️  URGENT: Severe headache with nausea    ││
│ │      → Consider neurology consult            ││
│ └──────────────────────────────────────────────┘│
│                                                │
│ ┌──────────────────────────────────────────────┐│
│ │ CHIEF COMPLAINT                              ││
│ │ Severe headache x 3 days                     ││
│ └──────────────────────────────────────────────┘│
│                                                │
│ ┌──────────────────────────────────────────────┐│
│ │ HISTORY OF PRESENT ILLNESS (SOCRATES)       ││
│ │                                              ││
│ │ Onset:           3 days ago, gradual start   ││
│ │ Character:       Throbbing, bilateral        ││
│ │ Radiation:       Temples to occipital region ││
│ │ Associated:      Nausea, no fever            ││
│ │ Duration:        Constant, no relief        ││
│ │ Severity:        8/10                       ││
│ │ Exacerbating:    Movement, light            ││
│ │ Relieving:       Rest, dark room            ││
│ └──────────────────────────────────────────────┘│
│                                                │
│ ┌──────────────────────────────────────────────┐│
│ │ PAST MEDICAL HISTORY                         ││
│ │                                              ││
│ │ • Hypertension (HTN) - diagnosed 5 yrs ago  ││
│ │ • No surgical history                       ││
│ │ • No family history of migraine             ││
│ └──────────────────────────────────────────────┘│
│                                                │
│ ┌──────────────────────────────────────────────┐│
│ │ MEDICATIONS & ALLERGIES                      ││
│ │                                              ││
│ │ Current Medications:                         ││
│ │  • Amlodipine 5mg daily (BP control)         ││
│ │                                              ││
│ │ Drug Allergies: NKDA (No Known Drug A)      ││
│ └──────────────────────────────────────────────┘│
│                                                │
│ ┌──────────────────────────────────────────────┐│
│ │ PRIOR LAB VALUES                             ││
│ │                                              ││
│ │ Date: 2024-01-15                            ││
│ │ • Hemoglobin: 13.2 g/dL (Normal)            ││
│ │ • TSH: 2.3 mIU/L (Normal)                   ││
│ │ • Blood Pressure: 150/90 (⚠️ Elevated)       ││
│ └──────────────────────────────────────────────┘│
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ [EDIT] [CONFIRM & SAVE] [PRINT SUMMARY]    │ │
│ └────────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### Component Specs

**Header Section:**
- Patient name (24px, bold)
- ABHA ID (14px, gray)
- Timestamp (14px, gray)
- All in single row with separators

**Alert Box (if applicable):**
- Warning Red background (#FADBD8, light red)
- Dark red text (#C0392B)
- Left border accent: 4px Medical Red
- Padding: 16px all sides
- Icon: ⚠️ emoji or SVG warning icon
- Text: Concise clinical reasoning

**Content Cards:**
- Each section in a bordered box
- Border: Light Gray (#ECF0F1)
- Background: White
- Padding: 16px
- Margin: 12px bottom
- Section heading: 14px, bold, gray (slightly darker)

**Text Styling:**
- Labels (e.g., "Onset:"): 14px, bold, #2C3E50
- Values: 14px, regular, #34495E
- Abnormal values: Highlighted in Light Red (#F5D6D3)
- Line height: 1.8 (scannable)

**Lists (Prior Medications, etc.):**
- Bullet points: •
- Indent: 12px
- Spacing: 8px between items
- Icon indicators: 💊 (med), 🧪 (lab), ⚠️ (alert)

**Action Buttons:**
- [EDIT]: Gray background, editable inline fields appear on click
- [CONFIRM & SAVE]: Medical Blue, 56px height
- [PRINT SUMMARY]: Outlined, Medical Blue border
- All buttons: 48px minimum height, full width on mobile

### Interaction

**View:**
1. Screen loads with structured data
2. Fade-in animation (no bounce, professional)
3. All sections immediately visible (no tabs or accordions)
4. Physician can scroll if needed (long histories)

**Edit:**
1. Physician clicks [EDIT]
2. Editable fields light up (Light Blue background)
3. Inline editing (text fields appear)
4. Changes saved to state immediately
5. Click outside or press Enter to finish editing

**Confirm:**
1. Physician reviews and clicks [CONFIRM & SAVE]
2. Modal confirmation: "Save history and link to ABHA?"
3. On confirm: Data saved, brief success message
4. Ready for next patient (or print)

**Print:**
1. Click [PRINT SUMMARY]
2. Browser print dialog
3. Formatted PDF output with header/footer
4. Logo, timestamp, patient ID

### Accessibility
- All section headings have ARIA labels
- Editable fields marked with aria-label "Editable"
- Buttons keyboard accessible (Tab + Enter)
- High contrast text (#2C3E50 on white = 10.5:1 ratio, AAA compliant)

---

## MOBILE RESPONSIVENESS

### Breakpoints
```
Mobile:    < 480px   (single column, stacked)
Tablet:    480-1024px (some 2-column where sensible)
Desktop:   > 1024px   (full 2-column layouts)
```

### Mobile Adjustments
- Screen 2 (Interview): Stacked vertically (voice top, buttons bottom)
- Doctor Dashboard: Single column, cards take full width
- All buttons: Full width (minus 16px padding)
- Font sizes: Slightly increased for readability
- Microphone button: 100px × 100px (still tappable on small screens)

---

## ANIMATION & TRANSITIONS

### Allowed (Functional Only)
- Page transitions: Fade (100ms)
- Button press: Background color shift (50ms)
- Microphone pulsing: Opacity 0.6-1.0 (1s loop, while listening)
- Card load: Subtle slide-up (200ms)
- Alert box: Fade-in (150ms)

### NOT Allowed (Avoid These)
- Bouncy easing (cubic-bezier with bounce)
- Rotating/spinning icons
- Particle effects, confetti
- Gradient animations
- 3D transforms, perspective effects
- Slow transitions (> 300ms perceived lag)

---

## ERROR HANDLING SCREENS (Minimal for MVP)

### Microphone Error
```
┌────────────────────────────────────┐
│                                    │
│  🎤 Microphone Not Available       │
│                                    │
│  Please check:                     │
│  • Microphone is plugged in        │
│  • Browser has permission          │
│  • No other app is using mic       │
│                                    │
│  You can still use touch buttons.  │
│                                    │
│  [TRY AGAIN] [CONTINUE]            │
│                                    │
└────────────────────────────────────┘
```

### API Error (LLM Timeout)
```
┌────────────────────────────────────┐
│                                    │
│  ⚠️ Processing Delay               │
│                                    │
│  Taking longer than expected...    │
│  Please wait or try again.         │
│                                    │
│  [Retry] [Skip & Continue]         │
│                                    │
└────────────────────────────────────┘
```

---

## DESIGN TOKENS (CSS Variables)

### For TailwindCSS Config
```css
:root {
  --color-primary: #1F5A8C;     /* Medical Blue */
  --color-secondary: #2C3E50;   /* Clinical Gray */
  --color-success: #27AE60;     /* Success Green */
  --color-warning: #E74C3C;     /* Warning Red */
  --color-neutral: #95A5A6;     /* Neutral Gray */
  --color-bg-light: #ECF0F1;    /* Light Gray Background */
  
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 2px 4px rgba(0,0,0,0.08);
  --shadow-lg: 0 4px 8px rgba(0,0,0,0.1);
  
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;
  
  --transition-fast: 50ms ease-in-out;
  --transition-base: 150ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

---

## SUMMARY: What Makes This NOT "AI-Generated"

✅ Clinical color scheme (medical blue, not neon)
✅ Professional typography (system fonts, not trendy)
✅ Minimal decoration (clean, not busy)
✅ Real hospital layout patterns (information hierarchy like an actual EMR)
✅ Functional animations only (no playful or decorative movement)
✅ High contrast, accessibility-first (usable by elderly patients)
✅ Responsive and fast (no lag or janky scrolling)
✅ Authentic clinical language (not marketing speak)
✅ No gradients, shadows, or depth tricks (flat, serious design)
✅ Handpicked colors by human preference (not auto-generated palette)

This is "clinical UI design" — professional, purposeful, and patient-focused.
