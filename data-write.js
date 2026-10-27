/* Speakwell — confused words, writing guides, templates */
window.SW = window.SW || {};

/* [wordA, meaningA, exampleA, wordB, meaningB, exampleB] */
SW.confused = [
  ["affect", "verb: to influence", "The delay will affect sales.", "effect", "noun: a result", "The effect was huge."],
  ["accept", "to receive or agree", "I accept the offer.", "except", "excluding", "Everyone except Ravi came."],
  ["adapt", "to adjust", "We adapted to remote work.", "adopt", "to take on as your own", "We adopted a new tool."],
  ["advice", "noun: a suggestion", "Thanks for the advice.", "advise", "verb: to suggest", "I advise you to wait."],
  ["above", "higher than (no contact)", "The clock is above the door.", "over", "covering / more than / across", "Over 100 people came."],
  ["accident", "unplanned event with harm", "a car accident", "incident", "any event, often reported", "a security incident"],
  ["addition", "adding something", "a new addition to the team", "edition", "a version of a publication", "the 2026 edition"],
  ["afterward", "later", "We talked afterward.", "afterword", "closing section of a book", "Read the afterword."],
  ["aisle", "a passage between seats", "an aisle seat", "isle", "a small island", "the Isle of Man"],
  ["all", "the whole amount", "All staff must attend.", "every", "each one, singular noun", "Every employee must attend."],
  ["allowed", "permitted", "Phones are not allowed.", "aloud", "out loud", "Read it aloud."],
  ["assure", "to promise a person", "I assure you it's fine.", "ensure", "to make certain", "Ensure the data is backed up."],
  ["insure", "to buy insurance", "Insure the shipment.", "ensure", "to make certain", "Ensure it arrives."],
  ["borrow", "take temporarily", "Can I borrow your pen?", "lend", "give temporarily", "Can you lend me your pen?"],
  ["complement", "completes or goes well with", "The colours complement each other.", "compliment", "praise", "Thanks for the compliment."],
  ["council", "a group of people", "the city council", "counsel", "advice / a lawyer", "legal counsel"],
  ["discreet", "careful, private", "Please be discreet.", "discrete", "separate, distinct", "three discrete steps"],
  ["elicit", "to draw out", "Elicit feedback from users.", "illicit", "illegal", "illicit trade"],
  ["farther", "physical distance", "The office is farther away.", "further", "more, additional", "Let's discuss further."],
  ["fewer", "countable things", "fewer meetings", "less", "uncountable amounts", "less time"],
  ["i.e.", "that is", "the boss, i.e. Meera", "e.g.", "for example", "fruit, e.g. apples"],
  ["its", "belonging to it", "The team met its goal.", "it's", "it is / it has", "It's ready."],
  ["lay", "to put something down (needs an object)", "Lay the file on the desk.", "lie", "to recline (no object)", "I need to lie down."],
  ["lose", "to fail to keep", "Don't lose the client.", "loose", "not tight", "a loose screw"],
  ["principal", "main / head of a school", "the principal reason", "principle", "a rule or belief", "a matter of principle"],
  ["stationary", "not moving", "a stationary car", "stationery", "paper, pens", "Order more stationery."],
  ["than", "comparison", "faster than before", "then", "time / next", "Finish, then send it."],
  ["their", "belonging to them", "their office", "there", "a place / there is", "Put it there."],
  ["they're", "they are", "They're late.", "there", "a place", "over there"],
  ["to", "direction / infinitive", "go to work", "too", "also / excessively", "too expensive"],
  ["weather", "climate conditions", "The weather is great.", "whether", "if", "Tell me whether you'll come."],
  ["who's", "who is", "Who's presenting?", "whose", "belonging to whom", "Whose laptop is this?"],
  ["your", "belonging to you", "your report", "you're", "you are", "You're right."],
  ["breath", "noun", "Take a deep breath.", "breathe", "verb", "Breathe slowly."],
  ["cite", "to quote a source", "Cite the study.", "site", "a place / website", "the project site"],
  ["desert", "dry land / to abandon", "Don't desert the team.", "dessert", "sweet course", "Ice cream for dessert."],
  ["emigrate", "to leave a country", "They emigrated from India.", "immigrate", "to come into a country", "They immigrated to Canada."],
  ["everyday", "adjective: ordinary", "everyday tasks", "every day", "each day", "I work out every day."],
  ["anyway", "regardless", "Anyway, let's begin.", "any way", "any method", "Is there any way to help?"],
  ["personal", "private", "a personal matter", "personnel", "staff", "personnel department"],
  ["precede", "to come before", "A brief intro preceded the talk.", "proceed", "to continue", "Let's proceed."],
  ["quiet", "not loud", "a quiet room", "quite", "fairly / completely", "quite good"],
  ["night", "the dark hours", "late at night", "knight", "an armoured warrior", "a knight in armour"]
];

SW.wordFamilies = {
  homophones: "Words that sound alike but differ in meaning and spelling: night / knight, their / there / they're.",
  homographs: "Words spelt the same but with different pronunciations and meanings: lead (to guide) / lead (a metal).",
  homonyms: "Words that sound and are spelt alike but mean different things: bat (an animal) / bat (sports equipment)."
};

/* Writing guides drawn from the topics you collected */
SW.guides = [
  { id: "intro", title: "Writing an introduction", kind: "Essay & report",
    steps: ["Hook: a question, fact, or short scene.", "Context: what the reader needs to know.", "Thesis: your main point in one sentence.", "Roadmap (for longer pieces): what's coming."],
    tip: "Write the introduction last, once you know what you actually said." },
  { id: "body", title: "Writing a body paragraph", kind: "Essay & report",
    steps: ["Topic sentence: the paragraph's single idea.", "Evidence: data, example, quote.", "Explanation: why the evidence supports the point.", "Link: connect to the next paragraph."],
    tip: "One idea per paragraph. If you need 'also' twice, split it." },
  { id: "conclusion", title: "Writing a conclusion", kind: "Essay & report",
    steps: ["Restate the main point in new words.", "Summarise key evidence briefly.", "Answer 'so what?' — why it matters.", "End with a call to action or forward look."],
    tip: "No new arguments in the conclusion." },
  { id: "audience", title: "Know your audience", kind: "Any writing",
    steps: ["Who reads this? What do they already know?", "What do they need to do after reading?", "What tone fits: formal, friendly, urgent?", "Cut anything they don't need."],
    tip: "Write for one specific person, even if many will read it." },
  { id: "formal-informal", title: "Formal vs informal writing", kind: "Tone",
    steps: ["Formal: no contractions, no slang, full sentences, third person often.", "Informal: contractions, first person, shorter sentences.", "Swap: 'get' → 'obtain/receive', 'ask for' → 'request', 'help' → 'assist' only when it adds formality.", "Business email sits in the middle: polite, plain, friendly."],
    tip: "Plain English is not informal. 'We'll send it Friday' is fine for most work email." },
  { id: "formal-letter", title: "Formal letter", kind: "Letters",
    steps: ["Your address and date (top right or top left).", "Recipient's name, title, address.", "Salutation: Dear Mr/Ms Surname, (or Dear Hiring Manager,)", "Opening: why you're writing.", "Body: details, one point per paragraph.", "Closing: what you want next.", "Sign-off: Yours sincerely (name known) / Yours faithfully (UK, name unknown) / Sincerely (US)."],
    tip: "Keep it to one page." },
  { id: "thank-you", title: "Saying thank you over email", kind: "Email",
    steps: ["Be specific: what exactly they did.", "Say the impact it had.", "Keep it short.", "Avoid the mistakes: generic thanks, over-long thanks, thanking in advance for things they haven't agreed to."],
    tip: "Alternatives: 'I really appreciate your help with...', 'Thanks so much for...', 'I'm grateful for...', 'You made a real difference by...'." },
  { id: "congrats", title: "Congratulatory message", kind: "Messages",
    steps: ["Name the achievement.", "Say something personal about effort or quality.", "Wish them well for what's next."],
    tip: "'Congratulations on your promotion! Your work on the Q3 launch made it obvious. Well deserved.'" },
  { id: "speech", title: "Writing an impactful speech", kind: "Speaking",
    steps: ["One core message in one sentence.", "Know the audience and time limit (about 130 words per minute).", "Open with a hook.", "Three main points with stories or examples.", "Write for the ear: short sentences, repetition, signposts.", "Close with a memorable line and call to action.", "Rehearse aloud at least three times."],
    tip: "If it's hard to say, it's hard to hear. Read every line aloud while writing." },
  { id: "obituary", title: "Writing an obituary or tribute", kind: "Personal",
    steps: ["Full name, age, place, date of passing.", "Life story: birth, family, education, work.", "What made them special: values, passions, a short story.", "Surviving family.", "Service details or where to send condolences."],
    tip: "Use warm, simple language. Specific memories mean more than adjectives." },
  { id: "captions", title: "Social media captions", kind: "Social",
    steps: ["Front-load: the first line must earn the tap.", "Write like you talk.", "One clear call to action.", "Use a few relevant hashtags at the end."],
    tip: "Read it aloud. If you wouldn't say it, rewrite it." },
  { id: "titles", title: "Crafting titles", kind: "Any writing",
    steps: ["Promise a clear benefit or answer.", "Use numbers or 'how to' when they fit.", "Keep under 60 characters.", "Choose title case or sentence case and stay consistent."],
    tip: "Write five titles and pick the best one." },
  { id: "non-sequitur", title: "Avoiding non sequiturs", kind: "Logic",
    steps: ["A non sequitur is a conclusion that doesn't follow from what came before.", "Example: 'She's a great designer, so she'll be a great manager.'", "Fix: show the missing link, or drop the claim.", "In speech, use 'because' and 'so' only where the logic really connects."],
    tip: "After each 'so', ask: does this actually follow?" },
  { id: "ai-prompts", title: "Using AI to help you write", kind: "Tools",
    steps: ["Give context: who, what, audience, tone, length.", "Paste your own draft first and ask for improvements, not a fresh piece.", "Ask for 3 versions, then choose and edit.", "Always check facts, names and numbers.", "Keep your own voice: change words that you'd never say."],
    tip: "Good prompt: 'Rewrite this email to my manager to be more concise and confident, under 120 words, keep my main points.'" }
];

/* Templates for the writing studio */
SW.templates = [
  { id: "email-request", name: "Request email", text: "Subject: Request for [what] by [date]\n\nHi [Name],\n\nI hope you're well. I'm working on [project] and need [specific thing] by [date] so that [reason].\n\nCould you [action]? If that timeline is difficult, let me know and we can find another option.\n\nThanks very much,\n[Your name]" },
  { id: "email-update", name: "Project update", text: "Subject: [Project] update – [date]\n\nHi team,\n\nQuick update on [project]:\n\nDone: [what's finished]\nNext: [what's coming]\nRisks: [any blockers]\n\nI need [decision/help] from [person] by [date].\n\nThanks,\n[Your name]" },
  { id: "thanks", name: "Thank-you note", text: "Hi [Name],\n\nThank you so much for [specific help]. It made a real difference: [impact].\n\nI really appreciate it.\n\nBest,\n[Your name]" },
  { id: "meeting-notes", name: "Meeting summary", text: "Subject: Summary – [meeting] [date]\n\nHi all,\n\nThanks for joining. Here's what we agreed:\n\nDecisions\n- [decision 1]\n\nActions\n- [Owner]: [task] by [date]\n\nNext meeting: [date/time]\n\nBest,\n[Your name]" },
  { id: "apology", name: "Apology email", text: "Hi [Name],\n\nI'm sorry about [mistake]. That was my error.\n\nI've [fix] and attached the corrected [item]. To prevent this, I'll [prevention step].\n\nThanks for your patience.\n\nBest regards,\n[Your name]" },
  { id: "letter", name: "Formal letter", text: "[Your address]\n[Date]\n\n[Recipient name]\n[Title]\n[Address]\n\nDear [Mr/Ms Surname],\n\nI am writing to [purpose].\n\n[Details paragraph]\n\nI would be grateful if you could [request]. Please contact me at [phone/email].\n\nYours sincerely,\n\n[Your name]" },
  { id: "speech", name: "Short speech", text: "Hook: [question / fact / story]\n\nWhy it matters: [to this audience]\n\nPoint 1: [idea] – Example: [story/number]\nPoint 2: [idea] – Example:\nPoint 3: [idea] – Example:\n\nClose: [memorable line]. [Call to action]." },
  { id: "congrats", name: "Congratulations", text: "Congratulations on [achievement], [Name]! [Personal line about their effort]. Wishing you every success with [what's next]." }
];

/* Words people overuse, for the writing checker */
SW.wordUpgrades = {
  "very good": "excellent", "very bad": "poor", "very big": "large / significant", "very small": "tiny / minor", "very important": "critical / essential",
  "very fast": "rapid", "very tired": "exhausted", "very happy": "delighted", "a lot of": "many / much", "get": "receive / obtain (formal)", "in order to": "to",
  "due to the fact that": "because", "at this point in time": "now", "kindly revert": "please reply", "revert back": "reply", "do the needful": "please take care of this",
  "prepone": "bring forward", "please find attached": "I've attached", "discuss about": "discuss", "return back": "return", "cope up": "cope", "same to same": "identical"
};
