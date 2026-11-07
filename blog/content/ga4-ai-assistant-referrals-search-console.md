If a report says “AI traffic is growing”, my first question is: which kind of AI traffic? Visits from an assistant, appearances in Google's AI-powered search features and ordinary organic-search sessions describe different things. Mixing them creates an attractive graph but an unreliable marketing decision.

My starting point is to separate **visits**, **search visibility** and **meaningful outcomes**. Google Analytics 4 can describe sessions arriving from recognised assistant referrals. Google Search Console can show visibility in Google's generative search features. Neither system, on its own, proves that an AI-generated answer persuaded someone to become an enquiry.

## The short answer: use two reporting lenses

Use GA4's **Session default channel group** to examine sessions classified as AI Assistant, then use Search Console's **Generative AI performance reports** to examine appearances of your pages within Google's AI experiences. Record their source, date range and measurement unit separately. Do not add a count of impressions to a count of sessions.

Google's [default channel group documentation](https://support.google.com/analytics/answer/9756891) explicitly distinguishes AI Assistant referrals from Organic Search. Google AI Overviews and AI Mode belong in Organic Search in that channel definition, not the AI Assistant bucket. This is the crucial distinction to explain before presenting an “AI channel” result.

## Why an assistant visit is not an AI Overview impression

An assistant may link to a page and a visitor may follow it. The resulting visit can be classified by Analytics using available traffic-source information. That tells us about recorded arrival, subject to referral information, tagging, consent and measurement coverage.

Google Search works differently. A page might appear in an AI Overview or AI Mode response without anybody clicking through. A different page might gain an organic-search visit from a search experience containing an AI feature. The session's Organic Search label does not, by itself, isolate those visitors.

On 3 June 2026, Google [introduced dedicated generative AI performance reporting](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) in Search Console. Google's announcement says the reports cover impressions, pages, countries, devices and dates, and notes that the rollout reached websites worldwide by 31 August 2026. These visibility dimensions are valuable, but an impression is not a visit or a verified enquiry.

## Build the report around four clearly labelled questions

I would put four questions at the top of a measurement brief, then assign each to the system that can answer it.

- **Where did visitors arrive from?** Inspect GA4 sessions using the session-scoped channel group, then review the underlying source and medium where available.
- **Which pages appeared in Google's generative features?** Use Search Console's dedicated generative AI report, with the relevant Search or Discover view.
- **What did visitors actually do?** Examine appropriately defined GA4 events and page engagement, not an unexplained total labelled conversions.
- **Did anyone complete the intended outcome?** Reconcile confirmed enquiries, bookings or other outcomes with their own reliable records, where available and permitted.

The fourth question matters most commercially. My [GA4 key-event audit](/blog/ga4-key-events-enquiry-measurement-audit/) distinguishes a page view, a contact click and a confirmed enquiry. An event marked as important does not automatically establish that an enquiry happened.

## Choose the right channel-group scope

GA4 offers first-user, session and event-scoped channel dimensions. Google's [channel-group definitions](https://support.google.com/analytics/answer/9756891) explain that they answer different questions and may use different attribution logic.

If the question is “How many sessions arrived through recognised assistants?”, choose the session-scoped dimension. If the question concerns how credit for a selected key event is distributed, review the event-scoped attribution model instead. Keep the denominator and attribution settings visible in exported reports.

This extends my [marketing attribution definitions guide](/blog/marketing-attribution-measurement-definitions/): before comparing channels, agree on the event, reporting grain, time zone and what is actually being credited. A session acquisition table and an event-attribution table are not interchangeable.

## Compare periods without making a false trend

Record the reporting property's time zone and the exact start and end dates. Compare the same metrics at the same scope over equal-length periods. For example, a complete Monday-to-Sunday window should be compared with another complete Monday-to-Sunday window if that is how stakeholders review performance.

Do not call a partial month a 28-day trend. Do not compare Search Console impressions with GA4 sessions as though they were competing traffic totals. Search visibility and onsite activity also have different reporting delays; the latest complete day in one system may not be ready in the other.

For a simple weekly dashboard, I would keep two separate panels: assistant-attributed sessions in GA4, and generative-feature impressions in Search Console. Under each, show its source, window, scope, limitations and any genuinely comparable previous period.

## A fictional example that avoids invented case-study results

Imagine a publisher sees ten visits attributed to assistants and one hundred impressions in a generative-search report. Those numbers are **illustrative**, not observations from a real account. They should remain two rows, not be added to claim “110 AI interactions”.

The publisher can ask which pages attract visits, which pages appear in generative features and whether those pages answer a clear reader question. It cannot conclude that a particular AI system delivered a lead, or that one hundred people visited, just because the impression count appears in a dashboard.

For content quality, my [answer-first writing guide](/blog/answer-first-marketing-article-writing/) offers a complementary editorial test: answer a useful question, show evidence and make the next step clear. The [Google Search generative AI optimisation guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) also emphasises valuable content and established SEO foundations rather than guaranteed AI placement.

## A repeatable weekly audit

Before circulating an AI-discovery chart, I would ask whether each item can pass these checks.

- The GA4 property and Search Console property both belong to the site being reviewed.
- Each row states whether it counts sessions, events, clicks or impressions.
- AI Assistant and Organic Search remain distinct acquisition classifications.
- The Search Console panel identifies Search versus Discover and the relevant date range.
- Any outcome labelled “enquiry” has evidence of completion rather than intent alone.
- Missing or delayed data is shown as unavailable, never silently treated as zero.

This is a reporting quality test, not a prescription to collect more personal data. If measurement coverage is limited by consent or browser settings, say so rather than estimating the missing users.

## Frequently asked questions

### Does AI Assistant in GA4 include Google AI Overviews?

No. Google's documented default channel definition excludes AI Overviews and AI Mode from AI Assistant and includes them in Organic Search. Check the dimension and the underlying sources rather than treating every search session as an assistant referral.

### Can I calculate AI-search conversions from Search Console impressions?

Not directly. Impressions record visibility, not completed actions. Analyse relevant onsite events separately, and use independently confirmed outcomes when a business decision requires proof of an enquiry or sale.

### Should I combine GA4 and Search Console in one dashboard?

Yes, for context, but keep their panels, dates, units and attribution limitations separate. A shared dashboard can help readers understand the journey without suggesting that unlike measurements are additive.

## The decision I would make

Measure **assistant referrals as sessions**, **Google generative-search appearances as visibility** and **business outcomes as independently defined actions**. If one part cannot be verified, leave that part open rather than filling the gap with an impressive-sounding estimate. That is more useful for marketing decisions, and more credible for anyone assessing an AEO or GEO claim.
