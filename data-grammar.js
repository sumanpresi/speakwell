/* Speakwell — grammar, syntax, mechanics and punctuation lessons (works fully offline) */
window.SW = window.SW || {};

SW.lessonGroups = [
  { id: "basics", name: "Grammar basics", blurb: "The eight parts of speech and the mistakes people make most." },
  { id: "syntax", name: "Syntax rules", blurb: "How words combine into clear, correct sentences." },
  { id: "structure", name: "Sentence structure", blurb: "S + V + O, sentence types, and building your own." },
  { id: "mechanics", name: "Mechanics", blurb: "Spelling, capitals, numbers, plurals and contractions." },
  { id: "punctuation", name: "Punctuation", blurb: "Every mark, what it does, and when to skip it." }
];

SW.lessons = [
  /* ---------- GRAMMAR BASICS ---------- */
  { id: "parts-of-speech", group: "basics", title: "Parts of speech",
    summary: "Every English word plays one of eight roles. Knowing the role tells you where the word can go.",
    points: [
      "Noun: person, place, thing or idea. <em>Sven</em> owns an expensive <em>house</em>.",
      "Verb: an action or a state. They <em>play</em> golf on Sundays.",
      "Adjective: describes a noun or pronoun. That was a <em>loud</em> sound system.",
      "Adverb: modifies a verb, adjective or another adverb. The food arrived <em>fast</em>.",
      "Pronoun: replaces a noun. <em>She</em> is very punctual.",
      "Preposition: links a noun to other words. The shoes are <em>beside</em> the door.",
      "Conjunction: joins words, phrases or clauses. He asked for leave <em>but</em> was refused.",
      "Interjection: shows strong feeling. <em>Wow!</em> That's a surprise gift."
    ],
    examples: [["", "The new manager quickly presented her plan, and wow, everyone agreed."]],
    quiz: [
      { q: "In 'She spoke confidently', what is 'confidently'?", o: ["Adjective", "Adverb", "Verb", "Noun"], a: 1, why: "It tells us how she spoke, so it modifies a verb." },
      { q: "In 'The file is under the folder', what is 'under'?", o: ["Conjunction", "Adverb", "Preposition", "Pronoun"], a: 2, why: "It links 'folder' to the rest of the sentence and shows position." }
    ] },
  { id: "verbs", group: "basics", title: "Verbs",
    summary: "The verb is the engine of the sentence. No verb, no sentence.",
    points: [
      "Action verbs show what someone does: <em>write, present, call</em>.",
      "Linking verbs connect the subject to a description: <em>is, seems, becomes, feels</em>.",
      "Helping (auxiliary) verbs sit before the main verb: <em>have</em> finished, <em>will</em> join, <em>are</em> waiting.",
      "Transitive verbs need an object (<em>send</em> the report). Intransitive verbs don't (the team <em>arrived</em>).",
      "Prefer strong, specific verbs in speech: 'we <em>cut</em> costs' beats 'we made a reduction in costs'."
    ],
    examples: [["We had a discussion about the budget.", "We discussed the budget."], ["She is the one who does the leading of the team.", "She leads the team."]],
    quiz: [
      { q: "Which sentence uses a linking verb?", o: ["She closed the deal.", "The plan seems risky.", "They ran the numbers.", "He sent the deck."], a: 1, why: "'Seems' connects 'plan' to the description 'risky'." },
      { q: "Pick the stronger version.", o: ["We made a decision to hire.", "We decided to hire."], a: 1, why: "A direct verb is shorter and clearer than a verb + noun phrase." }
    ] },
  { id: "nouns", group: "basics", title: "Nouns",
    summary: "Names for people, places, things and ideas.",
    points: [
      "Common nouns are general (<em>city, manager</em>); proper nouns are specific and capitalised (<em>Mumbai, Priya</em>).",
      "Countable nouns take a/an and plurals (<em>a meeting, two meetings</em>).",
      "Uncountable nouns have no plural: <em>advice, information, equipment, feedback, furniture, news</em>.",
      "Say 'a piece of advice', 'some feedback', 'an item of news' — not 'advices' or 'feedbacks'.",
      "Collective nouns (<em>team, staff, committee</em>) usually take a singular verb in American English."
    ],
    examples: [["Can you give me some advices?", "Can you give me some advice?"], ["I have many informations.", "I have a lot of information."]],
    quiz: [
      { q: "Which is correct?", o: ["Thanks for the feedbacks.", "Thanks for the feedback.", "Thanks for a feedback."], a: 1, why: "'Feedback' is uncountable." }
    ] },
  { id: "pronouns", group: "basics", title: "Pronouns",
    summary: "Words that stand in for nouns so you don't repeat yourself.",
    points: [
      "Subject pronouns do the action: <em>I, you, he, she, it, we, they</em>.",
      "Object pronouns receive it: <em>me, you, him, her, it, us, them</em>.",
      "Test with the other person removed: 'Ravi and I went' (I went). 'Send it to Ravi and me' (send it to me).",
      "Possessives have no apostrophe: <em>its, yours, theirs, whose</em>.",
      "Reflexive pronouns (<em>myself</em>) are only for when the subject acts on itself. Don't say 'Contact myself'."
    ],
    examples: [["Please reply to John or myself.", "Please reply to John or me."], ["Me and Anita will present.", "Anita and I will present."]],
    quiz: [
      { q: "Choose the correct one.", o: ["Between you and I, the deal is done.", "Between you and me, the deal is done."], a: 1, why: "After a preposition ('between') you need the object pronoun 'me'." },
      { q: "Choose the correct one.", o: ["The company changed it's logo.", "The company changed its logo."], a: 1, why: "'It's' means 'it is'. The possessive is 'its'." }
    ] },
  { id: "adjectives", group: "basics", title: "Adjectives",
    summary: "Words that describe nouns.",
    points: [
      "Usual order: opinion, size, age, shape, colour, origin, material, purpose. 'A <em>lovely small old round blue Italian glass</em> vase.'",
      "Comparatives: short words add -er (<em>faster</em>); longer words use more (<em>more efficient</em>).",
      "Never double them: 'more better' is wrong.",
      "In professional speech, replace vague adjectives (<em>good, nice, big</em>) with measurable ones (<em>on time, 12% cheaper</em>)."
    ],
    examples: [["This option is more cheaper.", "This option is cheaper."], ["It was a nice quarter.", "It was a record quarter: revenue rose 18%."]],
    quiz: [
      { q: "Pick the natural order.", o: ["a black big leather bag", "a big black leather bag", "a leather big black bag"], a: 1, why: "Size comes before colour, and colour before material." }
    ] },
  { id: "adverbs", group: "basics", title: "Adverbs",
    summary: "Words that tell how, when, where, why or how much.",
    points: [
      "Many end in -ly (<em>clearly, briefly</em>), but not all (<em>fast, well, soon, often</em>).",
      "'Good' is an adjective; 'well' is the adverb. 'She presented <em>well</em>.'",
      "Frequency adverbs go before the main verb but after 'be': 'I <em>usually</em> join late.' 'She is <em>always</em> early.'",
      "Cut empty intensifiers in speech: <em>very, really, basically, literally, actually</em>."
    ],
    examples: [["He did good in the interview.", "He did well in the interview."], ["I go always to the gym.", "I always go to the gym."]],
    quiz: [
      { q: "Which is correct?", o: ["The meeting went good.", "The meeting went well."], a: 1, why: "'Went' is a verb, so it needs the adverb 'well'." }
    ] },
  { id: "articles", group: "basics", title: "Articles (a, an, the)",
    summary: "Small words that cause big mistakes, especially for speakers of languages without them.",
    points: [
      "<em>A/an</em> = one of many, first mention. <em>The</em> = a specific one both people know.",
      "Use <em>an</em> before a vowel <strong>sound</strong>: an hour, an MBA, a university, a one-day event.",
      "No article with general plurals and uncountables: '<em>Meetings</em> waste time.' '<em>Coffee</em> helps.'",
      "Use <em>the</em> with unique things and superlatives: the CEO, the best option, the internet.",
      "No article before most names of people, cities, companies and meals: 'I had lunch with Meera at Infosys.'"
    ],
    examples: [["She is engineer.", "She is an engineer."], ["The life is short.", "Life is short."], ["I have a MBA.", "I have an MBA."]],
    quiz: [
      { q: "Choose the correct article: '___ honest answer'", o: ["a", "an", "the", "no article"], a: 1, why: "'Honest' starts with a vowel sound ('on-est')." },
      { q: "'I sent you ___ report yesterday. Did you read ___ report?'", o: ["a / the", "the / a", "a / a", "the / the"], a: 0, why: "First mention uses 'a'; once it is known, use 'the'." }
    ] },
  { id: "prepositions", group: "basics", title: "Prepositions",
    summary: "Words that show time, place and relationship.",
    points: [
      "Time: <em>at</em> 5 pm, <em>on</em> Monday / 3 March, <em>in</em> October / 2026 / the morning.",
      "Place: <em>at</em> the office (a point), <em>in</em> the room (inside), <em>on</em> the screen / the call.",
      "Common office pairs: <em>responsible for, interested in, good at, depend on, agree with (a person), agree to (a plan), discuss (no preposition)</em>.",
      "'Discuss about' and 'return back' are common errors. Just say 'discuss the issue', 'return'."
    ],
    examples: [["Let's discuss about the timeline.", "Let's discuss the timeline."], ["I'll see you in Monday.", "I'll see you on Monday."], ["He is on the meeting.", "He is in the meeting / on the call."]],
    quiz: [
      { q: "'The launch is ___ 15 November.'", o: ["in", "on", "at"], a: 1, why: "Use 'on' for dates and days." },
      { q: "Which is correct?", o: ["We need to discuss about pricing.", "We need to discuss pricing."], a: 1, why: "'Discuss' takes a direct object." }
    ] },
  { id: "conjunctions", group: "basics", title: "Conjunctions",
    summary: "Joining words that link ideas, and the backbone of connected speech.",
    points: [
      "Coordinating (FANBOYS): <em>for, and, nor, but, or, yet, so</em>. Join equal ideas.",
      "Subordinating: <em>because, although, if, when, while, unless, since</em>. Join a dependent idea to a main one.",
      "Linking adverbs between sentences: <em>however, therefore, as a result, meanwhile</em>. They need a semicolon or full stop before them.",
      "In speech, conjunctions signal logic. 'Sales rose, <em>but</em> margins fell, <em>so</em> we need to review pricing.'"
    ],
    examples: [["Although it rained, but we went.", "Although it rained, we went."], ["We were late, however we finished.", "We were late; however, we finished."]],
    quiz: [
      { q: "Which is correct?", o: ["Although he tried, but he failed.", "Although he tried, he failed."], a: 1, why: "Use one conjunction, not 'although ... but'." }
    ] },
  { id: "interjections", group: "basics", title: "Interjections",
    summary: "Short bursts of feeling: Wow! Oops! Well...",
    points: [
      "Common ones: <em>wow, oh, oops, ouch, hey, well, hmm, ah, yay, phew</em>.",
      "Followed by an exclamation mark (strong) or a comma (mild): 'Well, let's see.'",
      "Great for friendly chat; use sparingly in formal writing.",
      "In speech, 'Oh, nice!' or 'Ah, I see' are natural listening signals that show you're engaged."
    ],
    examples: [["", "Oops, I sent the wrong file. Here's the right one."]],
    quiz: [
      { q: "Which is most suitable for a formal report?", o: ["Wow, sales doubled!", "Sales doubled."], a: 1, why: "Formal writing lets the fact carry the emotion." }
    ] },
  { id: "common-mistakes", group: "basics", title: "Common grammar mistakes",
    summary: "The errors that most often reveal non-native or careless English.",
    points: [
      "Present perfect vs past: 'I <em>have seen</em> it' (no time given) vs 'I <em>saw</em> it yesterday'.",
      "Missing -s in third person: 'She <em>works</em>', 'It <em>doesn't</em>'.",
      "'Since' + start point, 'for' + duration: since 2020, for six years.",
      "Questions in speech: 'Can you tell me where <em>the office is</em>?' not 'where is the office?'",
      "'Do the needful', 'revert back', 'prepone', 'out of station' are regional. Global alternatives: 'please take care of it', 'reply', 'bring forward', 'out of town'."
    ],
    examples: [["I am working here since 2019.", "I have been working here since 2019."], ["Kindly revert back.", "Please reply."], ["He don't agree.", "He doesn't agree."]],
    quiz: [
      { q: "Which is correct?", o: ["I am here since Monday.", "I have been here since Monday."], a: 1, why: "An ongoing state that started in the past uses the present perfect." },
      { q: "Most global way to say 'Please revert'?", o: ["Please revert back.", "Please reply.", "Please do the needful."], a: 1, why: "'Reply' is understood everywhere." }
    ] },
  { id: "key-concepts", group: "basics", title: "Key grammar concepts",
    summary: "Five ideas that unlock most of English grammar.",
    points: [
      "Every complete sentence needs a subject and a finite verb.",
      "Word order is mostly fixed: Subject, Verb, Object, then Manner, Place, Time. 'I met him calmly at the office yesterday.'",
      "Agreement: the verb matches its subject; pronouns match the noun they replace.",
      "Tense shows time; aspect (simple, continuous, perfect) shows how the action unfolds.",
      "Voice: active (the team fixed it) is clearer than passive (it was fixed) unless the doer doesn't matter."
    ],
    examples: [["Yesterday at office I met him.", "I met him at the office yesterday."]],
    quiz: [
      { q: "Best word order?", o: ["I every day check email at 9.", "I check email at 9 every day.", "Every day email I check at 9."], a: 1, why: "Subject, verb, object, then place/time." }
    ] },

  /* ---------- SYNTAX ---------- */
  { id: "verb-tenses", group: "syntax", title: "Verb tenses",
    summary: "Twelve tenses, but four do most of the work in daily speech.",
    points: [
      "Present simple: habits and facts. 'I <em>lead</em> the sales team.'",
      "Present continuous: now, or temporary. 'I'm <em>working</em> on the proposal.'",
      "Past simple: finished, with a time. 'We <em>launched</em> in May.'",
      "Present perfect: past with present relevance, no exact time. 'We'<em>ve launched</em> three products.'",
      "Future: <em>will</em> (decisions now, promises), <em>going to</em> (plans), present continuous (arrangements: 'I'm meeting her at 3')."
    ],
    examples: [["I am knowing the answer.", "I know the answer."], ["I have finished it yesterday.", "I finished it yesterday."]],
    quiz: [
      { q: "'We ___ the contract last week.'", o: ["have signed", "signed", "sign"], a: 1, why: "A finished time ('last week') needs the past simple." },
      { q: "'Don't worry, I ___ send it now.'", o: ["will", "am going to", "send"], a: 0, why: "A decision made at the moment of speaking uses 'will'." }
    ] },
  { id: "modals", group: "syntax", title: "Modal verbs",
    summary: "Can, could, may, might, must, should, would, will, shall. They set your tone.",
    points: [
      "Polite requests: <em>Could you</em> ... ? <em>Would you mind</em> ...ing?",
      "Suggestions: We <em>could</em> ... / Maybe we <em>should</em> ... / <em>Shall</em> we ...?",
      "Possibility: it <em>might</em> / <em>may</em> / <em>could</em> slip to Friday.",
      "Obligation: <em>must</em> (strong, rules), <em>have to</em> (external), <em>should</em> (advice).",
      "Modals take the base verb with no 'to' and no -s: 'She can <em>speak</em>', not 'she can speaks'."
    ],
    examples: [["Send me the file.", "Could you send me the file when you get a chance?"], ["You must to sign here.", "You must sign here."]],
    quiz: [
      { q: "Most polite request?", o: ["Give me the numbers.", "I want the numbers.", "Could you share the numbers by Friday?"], a: 2, why: "'Could you' plus a clear deadline is polite and specific." }
    ] },
  { id: "sva", group: "syntax", title: "Subject-verb agreement",
    summary: "Singular subjects take singular verbs; plural take plural.",
    points: [
      "Find the real subject: 'The list of items <em>is</em> on the desk' (the list is).",
      "'Each', 'every', 'everyone', 'nobody' are singular: 'Everyone <em>has</em> a laptop.'",
      "With 'either/or' and 'neither/nor', match the nearer subject.",
      "'The number of' is singular; 'a number of' is plural.",
      "'There is' + singular, 'there are' + plural. In speech people say 'there's two'; avoid it in formal settings."
    ],
    examples: [["The data from all regions are ready.", "The data from all regions is ready. (common in business use)"], ["Each of the managers have a team.", "Each of the managers has a team."]],
    quiz: [
      { q: "'A number of employees ___ working remotely.'", o: ["is", "are"], a: 1, why: "'A number of' means 'many', so it's plural." },
      { q: "'Neither the manager nor the interns ___ available.'", o: ["is", "are"], a: 1, why: "The verb matches the nearer subject: 'interns'." }
    ] },
  { id: "direct-objects", group: "syntax", title: "Direct objects",
    summary: "The person or thing that receives the action.",
    points: [
      "Ask 'what?' or 'whom?' after the verb: She wrote <em>the report</em>.",
      "Only transitive verbs take direct objects.",
      "The object usually comes straight after the verb. Don't separate them: 'I like <em>very much</em> coffee' is wrong.",
      "Pronoun objects use object form: 'Call <em>him</em>'."
    ],
    examples: [["I like very much this idea.", "I like this idea very much."]],
    quiz: [
      { q: "Direct object in 'The client approved the budget yesterday'?", o: ["The client", "approved", "the budget", "yesterday"], a: 2, why: "Approved what? The budget." }
    ] },
  { id: "indirect-objects", group: "syntax", title: "Indirect objects",
    summary: "The person who receives the direct object.",
    points: [
      "Pattern: verb + indirect + direct. 'I sent <em>her</em> the file.'",
      "Or: verb + direct + to/for + person. 'I sent the file <em>to her</em>.'",
      "'Explain', 'describe', 'suggest' never take the first pattern: 'Explain <em>it to me</em>', not 'explain me it'."
    ],
    examples: [["Can you explain me the process?", "Can you explain the process to me?"], ["She suggested me a book.", "She suggested a book to me."]],
    quiz: [
      { q: "Which is correct?", o: ["Please explain me the plan.", "Please explain the plan to me."], a: 1, why: "'Explain' needs 'to' before the person." }
    ] },
  { id: "syntax", group: "syntax", title: "Syntax",
    summary: "The arrangement of words. Change the order, change the meaning or the emphasis.",
    points: [
      "Default: Subject, Verb, Object, Manner, Place, Time.",
      "Put the most important information at the end of the sentence, where listeners remember it.",
      "Keep modifiers next to what they modify: 'I <em>only</em> need two slides' vs 'I need <em>only</em> two slides'.",
      "Front an idea for emphasis: 'What we need now is focus.'"
    ],
    examples: [["Walking into the office, the lights were off.", "Walking into the office, I saw the lights were off."]],
    quiz: [
      { q: "Which has a dangling modifier?", o: ["After reviewing the data, we changed the plan.", "After reviewing the data, the plan changed."], a: 1, why: "The plan didn't review the data. 'We' did." }
    ] },
  { id: "clauses", group: "syntax", title: "Clauses",
    summary: "A clause has a subject and a verb. Some can stand alone; some can't.",
    points: [
      "Independent clause: a complete thought. 'The meeting ended.'",
      "Dependent clause: needs a main clause. 'Because the client left early...'",
      "Relative clauses add detail: 'The manager <em>who hired me</em> left.' Use <em>who</em> for people, <em>which/that</em> for things.",
      "Commas around a relative clause mean it's extra; no commas mean it's essential."
    ],
    examples: [["The person which called you.", "The person who called you."]],
    quiz: [
      { q: "Which is a dependent clause?", o: ["We shipped on time.", "When the server crashed", "She smiled."], a: 1, why: "It starts with 'when' and doesn't complete a thought." }
    ] },
  { id: "fragments", group: "syntax", title: "Sentence fragments",
    summary: "Pieces dressed up as sentences.",
    points: [
      "A fragment is missing a subject, a verb, or a complete thought.",
      "Common in writing: 'Because the budget was cut.' Fix: join it to a main clause.",
      "Fragments are fine in casual chat and on slides ('Revenue up 12%'), but not in formal emails."
    ],
    examples: [["We delayed the launch. Because testing failed.", "We delayed the launch because testing failed."]],
    quiz: [
      { q: "Which is a fragment?", o: ["Although the plan was approved.", "The plan was approved."], a: 0, why: "'Although...' needs a main clause." }
    ] },
  { id: "run-ons", group: "syntax", title: "Run-on sentences",
    summary: "Two sentences jammed together without the right joint.",
    points: [
      "Comma splice: 'The demo went well, the client signed.' (wrong)",
      "Fix with a full stop, a semicolon, or a conjunction: 'The demo went well, <em>so</em> the client signed.'",
      "In speech, run-ons show up as endless 'and... and... and'. Pause and start a new sentence."
    ],
    examples: [["I called him he didn't answer.", "I called him, but he didn't answer."]],
    quiz: [
      { q: "Which is correct?", o: ["It's late, let's stop.", "It's late; let's stop."], a: 1, why: "Two independent clauses need a semicolon, full stop or conjunction." }
    ] },
  { id: "diagramming", group: "syntax", title: "Sentence diagramming",
    summary: "Drawing a sentence to see its skeleton.",
    points: [
      "Main line: subject | verb | object.",
      "Modifiers hang below the word they describe.",
      "Try it mentally: 'The new intern quickly finished the long report.' Skeleton: intern | finished | report.",
      "If you can find the skeleton, you can find agreement errors and dangling modifiers."
    ],
    examples: [["", "Skeleton of 'Our small team in Pune shipped two major features last month': team | shipped | features"]],
    quiz: [
      { q: "Skeleton of 'The tired engineers finally fixed the old server'?", o: ["engineers | fixed | server", "tired | finally | old", "engineers | finally | old"], a: 0, why: "Subject, verb, object; the rest are modifiers." }
    ] },
  { id: "subjects", group: "syntax", title: "Subjects",
    summary: "Who or what the sentence is about.",
    points: [
      "Ask 'who or what does the action?'",
      "The subject can be a noun, pronoun, -ing phrase ('<em>Presenting</em> scares me') or clause ('<em>What you said</em> helped').",
      "Use 'it' or 'there' as a dummy subject: '<em>It</em> is raining', '<em>There</em> are three issues'. English never drops the subject: 'Is raining' is wrong."
    ],
    examples: [["Is important to arrive early.", "It is important to arrive early."]],
    quiz: [
      { q: "Subject of 'Working from home saves time'?", o: ["home", "Working from home", "time"], a: 1, why: "The whole -ing phrase is the subject." }
    ] },
  { id: "conditionals", group: "syntax", title: "Conditionals",
    summary: "If-sentences for facts, plans, dreams and regrets.",
    points: [
      "Zero (facts): If you heat ice, it melts.",
      "First (real future): If we <em>finish</em> early, we<em>'ll</em> leave.",
      "Second (unreal now): If I <em>were</em> you, I<em>'d</em> ask for a raise.",
      "Third (unreal past): If we <em>had tested</em> it, we <em>would have found</em> the bug.",
      "Never put 'will' in the if-clause: 'If it <em>rains</em>', not 'if it will rain'."
    ],
    examples: [["If I will get time, I will call.", "If I get time, I'll call."], ["If I was you...", "If I were you..."]],
    quiz: [
      { q: "'If we ___ earlier, we would have caught the train.'", o: ["left", "had left", "would leave"], a: 1, why: "Third conditional: if + past perfect, would have + past participle." }
    ] },

  /* ---------- STRUCTURE ---------- */
  { id: "sentence-structure", group: "structure", title: "Sentence structure (S + V + O)",
    summary: "Most English sentences follow Subject – Verb – Object.",
    points: [
      "Subject: who or what does the action. <em>The cat</em>.",
      "Verb: what happens. <em>chased</em>.",
      "Object: who or what receives it. <em>the mouse</em>.",
      "Complement: adds information about the subject. She is <em>happy</em>.",
      "Adverbial: when, where, how, why. She works <em>quickly</em>, <em>at home</em>."
    ],
    examples: [["", "The cat (S) chased (V) the mouse (O)."]],
    builder: true,
    quiz: [
      { q: "In 'My friend wrote the song', the object is:", o: ["My friend", "wrote", "the song"], a: 2, why: "It receives the action." }
    ] },
  { id: "sentence-patterns", group: "structure", title: "Sentence patterns",
    summary: "Five core patterns cover almost everything.",
    points: [
      "S + V: The team <em>arrived</em>.",
      "S + V + O: She <em>sent</em> the email.",
      "S + V + C: The plan <em>is</em> ready.",
      "S + V + IO + DO: He <em>gave</em> me feedback.",
      "S + V + O + C: They <em>made</em> her team lead."
    ],
    examples: [["", "Simple: I presented. Compound: I presented, and they listened. Complex: When I presented, they listened."]],
    quiz: [
      { q: "Pattern of 'They elected him captain'?", o: ["S+V+O", "S+V+O+C", "S+V+C"], a: 1, why: "'Captain' completes the object 'him'." }
    ] },
  { id: "sentence-types", group: "structure", title: "Types of sentences",
    summary: "Declarative, interrogative, imperative, exclamatory.",
    points: [
      "Declarative states a fact: 'We live in India.' Ends with a full stop.",
      "Interrogative asks: 'Do you like coffee?' Ends with a question mark.",
      "Imperative commands or requests: 'Please open the door.' Usually a full stop.",
      "Exclamatory shows emotion: 'What a beautiful day!'",
      "Good speakers mix all four. A question wakes an audience; an imperative gives a clear next step."
    ],
    examples: [["", "Ever missed a deadline? (interrogative) Here's why it happens. (declarative) Try this tomorrow. (imperative)"]],
    quiz: [
      { q: "'Please send the slides by noon.' is:", o: ["Declarative", "Interrogative", "Imperative", "Exclamatory"], a: 2, why: "It's a request." }
    ] },
  { id: "simple-compound-complex", group: "structure", title: "Simple, compound, complex",
    summary: "Vary length and shape to keep listeners and readers with you.",
    points: [
      "Simple: one independent clause. 'Sales grew.'",
      "Compound: two independent clauses + FANBOYS. 'Sales grew, but costs rose.'",
      "Complex: independent + dependent. 'Although sales grew, profit fell.'",
      "Compound-complex: both. 'Although sales grew, costs rose, so profit fell.'",
      "Speaking rule: keep most spoken sentences under 20 words."
    ],
    examples: [["", "Short. Then a longer sentence that explains why it matters. Then short again."]],
    quiz: [
      { q: "'When the call ended, I wrote notes.' is:", o: ["Simple", "Compound", "Complex"], a: 2, why: "A dependent 'when' clause + a main clause." }
    ] },

  /* ---------- MECHANICS ---------- */
  { id: "spell-check", group: "mechanics", title: "Spelling",
    summary: "Patterns that catch most spelling errors.",
    points: [
      "'I before e except after c' works for <em>receive, ceiling</em>; exceptions: <em>weird, seize, their</em>.",
      "Double the final consonant for short stressed words: <em>stop → stopped, begin → beginning</em>.",
      "Commonly misspelt: <em>accommodate, definitely, separate, occurred, necessary, receive, recommend, privilege, embarrass, calendar</em>.",
      "Pick US or UK spelling and stay consistent: <em>organize/organise, color/colour, program/programme</em>."
    ],
    examples: [["I will definately recieve it.", "I will definitely receive it."]],
    quiz: [
      { q: "Which is spelt correctly?", o: ["seperate", "separate", "seperete"], a: 1, why: "There's 'a rat' in sep-a-rate." },
      { q: "Which is spelt correctly?", o: ["accomodate", "acommodate", "accommodate"], a: 2, why: "Two c's and two m's." }
    ] },
  { id: "contractions", group: "mechanics", title: "Contractions",
    summary: "I'm, don't, we'll — natural in speech, careful in formal writing.",
    points: [
      "The apostrophe replaces missing letters: do not → <em>don't</em>, it is → <em>it's</em>.",
      "Use them freely when speaking; it sounds more natural and fluent.",
      "Limit them in contracts, reports and formal letters.",
      "Avoid 'should of'. It's 'should've' = should have."
    ],
    examples: [["I should of called.", "I should've called."], ["Do not worry, we will handle it.", "Don't worry, we'll handle it. (spoken)"]],
    quiz: [
      { q: "Correct contraction of 'they are'?", o: ["their", "there", "they're"], a: 2, why: "They're = they are." }
    ] },
  { id: "title-case", group: "mechanics", title: "Title case vs sentence case",
    summary: "Two ways to capitalise headings.",
    points: [
      "Title case capitalises major words: 'How to Write a Formal Letter'.",
      "Sentence case capitalises only the first word and names: 'How to write a formal letter'.",
      "Sentence case reads friendlier and is now common on slides and apps.",
      "Pick one style per document and stick to it."
    ],
    examples: [["Quarterly results AND Next steps", "Quarterly results and next steps"]],
    quiz: [
      { q: "Which is title case?", o: ["The art of small talk", "The Art of Small Talk"], a: 1, why: "Major words are capitalised." }
    ] },
  { id: "capitalization", group: "mechanics", title: "Capitalisation rules",
    summary: "When to use a capital letter.",
    points: [
      "First word of a sentence, the pronoun <em>I</em>, names of people, places, companies, days, months, languages.",
      "Job titles only before a name: '<em>Director</em> Rao', but 'Ms Rao is the director'.",
      "Seasons are lowercase: spring, winter.",
      "Don't capitalise words for emphasis in emails. It reads as shouting."
    ],
    examples: [["i will join on monday.", "I will join on Monday."], ["Please send the Report ASAP.", "Please send the report as soon as you can."]],
    quiz: [
      { q: "Which is correct?", o: ["We meet every Summer in July.", "We meet every summer in July."], a: 1, why: "Seasons are not capitalised; months are." }
    ] },
  { id: "abbreviations", group: "mechanics", title: "Abbreviations",
    summary: "Shortened words, acronyms and initialisms.",
    points: [
      "Acronyms are read as words (<em>NASA, PIN</em>); initialisms are read letter by letter (<em>FBI, CEO</em>).",
      "Spell out on first use: 'key performance indicators (KPIs)'.",
      "<em>e.g.</em> = for example; <em>i.e.</em> = that is. Don't mix them up.",
      "Avoid text-speak in work emails: 'pls', 'thx', 'u'."
    ],
    examples: [["Pls share the doc asap thx", "Please share the document today. Thanks."]],
    quiz: [
      { q: "'We need a lead, ___ someone who owns it.' Which fits?", o: ["e.g.", "i.e."], a: 1, why: "You're restating, not giving an example." }
    ] },
  { id: "numbers", group: "mechanics", title: "Numbers",
    summary: "When to write numbers as words or digits.",
    points: [
      "Spell out one to nine; use digits for 10 and above (common style).",
      "Never start a sentence with digits: 'Twenty people came', not '20 people came'.",
      "Indian system vs international: 1,00,000 (one lakh) = 100,000 (one hundred thousand). For global audiences, say 'one hundred thousand' or '0.1 million'.",
      "One crore = 10 million. Convert before presenting to international teams."
    ],
    examples: [["Revenue was 5 crore.", "Revenue was ₹50 million (₹5 crore)."]],
    quiz: [
      { q: "10 lakh in international terms is:", o: ["100,000", "1 million", "10 million"], a: 1, why: "1 lakh = 100,000, so 10 lakh = 1,000,000." }
    ] },
  { id: "plurals", group: "mechanics", title: "Plurals",
    summary: "Regular, irregular and tricky plurals.",
    points: [
      "Most add -s; words ending in s, x, z, ch, sh add -es: <em>boxes, matches</em>.",
      "Consonant + y → -ies: <em>company → companies</em>. Vowel + y keeps it: <em>days</em>.",
      "Irregular: <em>person → people, child → children, criterion → criteria, analysis → analyses</em>.",
      "No apostrophe for plurals: 'two laptops', not 'two laptop's'."
    ],
    examples: [["We have three criterias.", "We have three criteria."], ["The CEO's met today.", "The CEOs met today."]],
    quiz: [
      { q: "Plural of 'analysis'?", o: ["analysises", "analyses", "analysis'"], a: 1, why: "Greek -is becomes -es." }
    ] },

  /* ---------- PUNCTUATION ---------- */
  { id: "comma", group: "punctuation", title: "Comma",
    summary: "The most used and misused mark.",
    points: [
      "After an introductory phrase: 'After the meeting, we left.'",
      "Before FANBOYS joining two full sentences: 'I called, but she was out.'",
      "Around extra information: 'Ravi, our designer, built it.'",
      "In lists: 'slides, notes, and data' (the last comma is optional; be consistent).",
      "Never a comma between subject and verb: 'The team that won the award, is here' is wrong."
    ],
    examples: [["Let's eat grandma.", "Let's eat, grandma."]],
    quiz: [
      { q: "Which is correct?", o: ["Hi Priya I hope you are well.", "Hi Priya, I hope you are well."], a: 1, why: "A comma after the greeting separates it." }
    ] },
  { id: "period", group: "punctuation", title: "Full stop (period)",
    summary: "Ends a statement. Short sentences are your friend.",
    points: [
      "Ends declarative and most imperative sentences.",
      "One space after it, not two.",
      "In US English, it goes inside closing quotation marks.",
      "If a sentence ends with an abbreviation like 'etc.', don't add a second full stop."
    ],
    examples: [["We need pens, paper, etc..", "We need pens, paper, etc."]],
    quiz: [
      { q: "How many spaces after a full stop?", o: ["One", "Two"], a: 0, why: "Modern style uses one space." }
    ] },
  { id: "colon", group: "punctuation", title: "Colon",
    summary: "Introduces what follows: a list, an explanation or a quote.",
    points: [
      "Use after a complete sentence: 'We need three things: time, money and focus.'",
      "Don't use after a verb or preposition: 'We need: time' is wrong.",
      "Also for times (9:30), ratios (3:1) and formal greetings in US letters ('Dear Sir:')."
    ],
    examples: [["The agenda includes: budget, hiring.", "The agenda includes budget and hiring. / Agenda: budget, hiring."]],
    quiz: [
      { q: "Which is correct?", o: ["Bring: a pen and ID.", "Bring two things: a pen and ID."], a: 1, why: "The colon follows a complete clause." }
    ] },
  { id: "semicolon", group: "punctuation", title: "Semicolon",
    summary: "Joins two closely related complete sentences.",
    points: [
      "'The demo crashed; we restarted it.'",
      "Before linking adverbs: '...; however, ...'",
      "In complex lists that already contain commas: 'Pune, India; Austin, USA; and Leeds, UK.'"
    ],
    examples: [["I'm tired, however I'll finish.", "I'm tired; however, I'll finish."]],
    quiz: [
      { q: "Best punctuation: 'The data is clean ___ we can start.'", o: [",", ";", ":"], a: 1, why: "Two full related sentences, no conjunction." }
    ] },
  { id: "apostrophe", group: "punctuation", title: "Apostrophe",
    summary: "Possession and contraction. Never plurals.",
    points: [
      "Singular possession: the client<em>'s</em> office.",
      "Plural possession: the clients<em>'</em> offices; irregular: the children<em>'s</em> books.",
      "<em>It's</em> = it is. <em>Its</em> = belonging to it.",
      "Decades: the 1990s (no apostrophe)."
    ],
    examples: [["The team lost it's way.", "The team lost its way."], ["Employee's must sign in.", "Employees must sign in."]],
    quiz: [
      { q: "'The ___ cafeteria' (belongs to many employees)", o: ["employee's", "employees'", "employees"], a: 1, why: "Plural noun ending in s: apostrophe after the s." }
    ] },
  { id: "quotation-marks", group: "punctuation", title: "Quotation marks",
    summary: "For exact words, titles of short works, and special terms.",
    points: [
      "Direct speech: She said, \"We're on track.\"",
      "Don't use them for emphasis. 'We sell \"fresh\" fish' suggests it isn't fresh.",
      "US: double quotes, punctuation inside. UK: often single quotes, punctuation by sense."
    ],
    examples: [["Our \"best\" offer ends today.", "Our best offer ends today."]],
    quiz: [
      { q: "Quotation marks for emphasis are:", o: ["Recommended", "Best avoided"], a: 1, why: "They read as sarcasm or doubt." }
    ] },
  { id: "dash-hyphen", group: "punctuation", title: "Hyphen and dash",
    summary: "Three lines of different length with different jobs.",
    points: [
      "Hyphen (-) joins words: <em>well-known speaker, follow-up meeting</em>. But 'follow up with her' (verb) has no hyphen.",
      "En dash (–) for ranges: 9–5, pages 10–20.",
      "Em dash (—) for a strong break. Use sparingly; commas or a full stop are often cleaner."
    ],
    examples: [["A two hour long meeting.", "A two-hour meeting."]],
    quiz: [
      { q: "Which is correct?", o: ["Let's schedule a follow up.", "Let's schedule a follow-up."], a: 1, why: "As a noun it is hyphenated." }
    ] },
  { id: "ellipsis", group: "punctuation", title: "Ellipsis (...)",
    summary: "Three dots for omission or a trailing thought.",
    points: [
      "Shows words left out of a quote.",
      "Shows hesitation in dialogue: 'I was going to... never mind.'",
      "In work messages it can read as passive-aggressive: 'Ok...' Use a full stop instead."
    ],
    examples: [["Sure...", "Sure, I'll do it by 5."]],
    quiz: [
      { q: "In a work chat, 'Fine...' usually sounds:", o: ["Enthusiastic", "Annoyed or unsure"], a: 1, why: "The trailing dots suggest hesitation." }
    ] },
  { id: "question-exclamation", group: "punctuation", title: "Question and exclamation marks",
    summary: "End marks with attitude.",
    points: [
      "Direct questions take '?'. Indirect questions don't: 'She asked when we'd start.'",
      "One exclamation mark at most, and rarely in formal writing.",
      "Never '?!' or '!!!' in work email."
    ],
    examples: [["Can you send it today!!", "Can you send it today?"]],
    quiz: [
      { q: "Which is correct?", o: ["He asked if we were ready?", "He asked if we were ready."], a: 1, why: "It's an indirect question." }
    ] }
];
