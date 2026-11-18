A search impression is not a website visit, and a website visit is not a qualified enquiry. This distinction has become especially important for marketing intelligence in 2026, now that Google Search Console provides a dedicated view of appearances in generative AI features. My starting point is simple: measure what each system actually observes, then explain what it cannot prove.

Google's [Generative AI performance report](https://support.google.com/webmasters/answer/16984139?hl=en) covers visibility in AI Overviews and AI Mode. Its rollout reached websites worldwide by 31 August 2026. That gives marketers a practical starting point for AI-search reporting, but not a shortcut to calculating revenue from AI answers.

## What does the new report measure?

The dedicated Search Console report records impressions when links to a site's pages appear in supported generative AI features on Google Search. It offers breakdowns by page, country, date and device, and allows a choice between text-based and multimodal Web searches. Google provides a separate report for generative AI features in Discover.

Impressions describe exposure, not clicks. A person may see a link without visiting it. The [Google launch announcement](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) also explains that these impressions already form part of overall Search performance reporting. Do not add the dedicated total to the general total as though it came from another independent source.

## Begin with a decision, not a dashboard

Before looking at the chart, ask what decision the report is intended to support. Are you choosing which article to improve, reviewing search visibility by market, or assessing whether visitors complete a meaningful action? Those questions require different evidence.

I would separate reporting into visibility, visits, intent and confirmed outcomes. Search Console helps with the first, while analytics can describe observed sessions and interactions. Completed enquiries, accepted opportunities or sales need an appropriately verified downstream record. My [GA4 key-event audit](/blog/ga4-key-events-enquiry-measurement-audit/) explains why clicking a contact link is not the same as submitting a confirmed enquiry.

This is a proposed measurement framework, not a claim about any particular campaign or company. It keeps useful distinctions visible rather than squeezing unrelated measures into one impressive-looking conversion rate.

## Understand how impressions are counted

The report's chart generally aggregates at property level. If two links from the same site appear in one generative result, they can count as one property impression. Page-grouped rows use page-level aggregation instead, so their sum may not match the chart total. Google documents that difference in its [report guidance](https://support.google.com/webmasters/answer/16984139?hl=en).

Most page data is attributed to canonical URLs rather than duplicate addresses. Country refers to where a search originated, not necessarily where a business sells. Search Console dates use Pacific Time, even if the marketing team works in London. Preserve those details when combining exports.

Search Labs experiments are excluded. The latest points can be preliminary and change after collection completes. If the report is absent, Google says insufficient eligible impressions may be one explanation; a missing report is not proof that the site was never cited.

## Keep AI visibility separate from site traffic

An AI Overview impression does not tell you whether somebody clicked, returned through another search, or remembered a brand later. Site analytics may describe incoming sessions and source or medium, but a Google organic session does not automatically identify the precise search experience that preceded it.

Google's [Analytics traffic-source guidance](https://support.google.com/analytics/answer/15612152?hl=en) distinguishes acquisition dimensions; those labels should not be silently treated as a complete record of generative AI exposure. Consent choices, identity limits and attribution settings can also affect what analytics observes.

It is still helpful to place relevant measures beside one another, provided they remain clearly labelled. For example, examine an article's visibility trend, its landing-page sessions, consent-eligible contact actions and confirmed submissions in separate columns. That provides context without alleging a causal relationship the systems cannot establish.

## Build a five-stage measurement review

I would structure a repeatable review around five separate evidence levels:

- **Visibility:** generative AI impressions, including property, dates, search type and filters.
- **Discovery:** organic clicks and relevant Search Console landing pages, without double-counting the visibility subset.
- **Visit:** GA4 sessions and acquisition information, with consent and identity caveats.
- **Intent:** contact, booking or document actions that indicate interest but not necessarily a completed request.
- **Outcome:** verified enquiries or downstream business milestones, each with a documented counting rule.

Not every stage will have accessible data. Mark missing measurements as unavailable rather than zero. Record where each figure originated, when it was exported and whether a definition changed. The same discipline underpins my [marketing attribution definitions guide](/blog/marketing-attribution-measurement-definitions/).

## Compare complete periods consistently

Choose comparable periods, for example two complete 28-day windows, and keep property, geography, device, search type and reporting scope consistent. Flag incomplete days, recent processing and exceptional publication changes. Avoid claiming an improvement from a handful of impressions without considering the baseline.

The first 28 days of a new publishing programme may not offer meaningful before-and-after evidence. A limited baseline is still useful if presented honestly: it can show which pages have measurable exposure and what needs tracking next. Never invent an earlier period to make a trend chart look complete.

## Turn page findings into useful editorial work

When a page receives AI-search impressions, inspect its actual answer. Does it satisfy the likely reader question? Are claims sourced, the title descriptive and the next step relevant? Are canonical URLs and internal links correct? These are ordinary editorial and technical questions, not mysterious generative AI hacks.

My [answer-first writing guide](/blog/answer-first-marketing-article-writing/) explains how to answer a question, support it with evidence and offer a helpful next decision. Google's [generative AI optimisation guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) likewise emphasises original, useful content and established SEO practices rather than special formatting tricks.

A page might serve a research need without producing an immediate lead. A fair review accounts for the page's purpose rather than judging every educational article by the same last-click conversion target.

## What about opting out of generative AI features?

Google also provides a [Search generative AI control](https://support.google.com/webmasters/answer/16908024?hl=en) in Search Console settings, with a global rollout completed in August 2026. Site owners can manage eligibility to appear in specified generative AI Search and Discover features.

Changing that setting affects participation in the covered features; Google says it is not a ranking or inclusion signal for other parts of Search. It should be an informed ownership decision, not a knee-jerk optimisation response to a quiet reporting week.

## Questions to take into the next review

**Can I calculate an AI-search conversion rate from this report?** Not from impressions alone. The report does not provide a verified chain from each exposure to an enquiry. Define the compatible numerator, denominator and attribution rules before publishing a rate.

**Does inclusion guarantee traffic?** No. An impression is not a click, and eligibility is not a ranking guarantee.

**What should I do first?** Save a dated visibility baseline, identify a small set of relevant pages, verify their answers and review complete reporting periods. Marketing intelligence becomes useful when its limitations are as clear as its charts.
