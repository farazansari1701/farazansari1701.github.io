A website can record an event correctly and still answer the wrong marketing question. A page view shows that a page was displayed; a contact-button click suggests interest; a confirmed enquiry requires evidence that somebody actually submitted a request. I would not place all three under one unexplained conversion total.

My practical approach is to give each action a precise name, test how it is collected and agree which actions deserve attention in a performance review. This is an educational measurement framework, using fictional examples rather than any employer's confidential analytics. It develops the outcome definitions in my [marketing attribution guide](/blog/marketing-attribution-measurement-definitions/).

## The quick answer: a key event is a chosen event

In Google Analytics 4, a key event is an event identified as important to an organisation. It is not a certificate that a sale, lead or conversation happened. Google's [key-event overview](https://support.google.com/analytics/answer/9267568?hl=en) explains that the designation supports analysis of significant actions across channels.

For an informational website, page views, article engagement and outbound clicks can be useful observations. But I would reserve an enquiry outcome for something closer to a completed contact request. The event label must reflect what the collection mechanism can prove.

Google also distinguishes [Analytics key events from Google Ads conversions](https://support.google.com/analytics/answer/13965727). Reporting scope and advertising attribution can therefore differ. Before using a total in a presentation, check which metric the interface or export actually returns.

## Build an evidence ladder for the journey

I would separate a fictional professional website's interactions into four levels, rather than count every visible action as a lead.

- Exposure: a page view establishes a recorded visit to a page, not a business outcome.
- Engagement: a meaningful scroll or article interaction suggests attention, with limits.
- Intent: clicking a contact link, opening a CV or starting a form describes an attempted next step.
- Confirmation: a successful form response or validated request provides stronger evidence that an enquiry occurred.

These levels are not universally ranked by commercial value. A recruitment portfolio and an online shop have different objectives. Their shared requirement is that a metric's name should not claim more certainty than the event records.

A prominent button might generate many clicks while failing to create any completed requests. That could be a journey problem, a measurement problem or simply a mismatch between the button's purpose and the report's label. My [landing-page review](/blog/landing-page-promise-next-action/) explores the experience between promise and action.

## Review the event marked as important

The first configuration check is surprisingly simple: which event names are marked as key events? I would inspect the list, the dates of any changes and the meaning of each event. Then I would compare key-event counts with the underlying event table by name.

Google specifically warns against marking the generic page_view event as a key event when the real objective is a confirmation-page visit. Doing so treats ordinary page views as important outcomes. Its [event-creation guidance](https://support.google.com/analytics/answer/12844695?hl=en) recommends creating a more specific event from relevant conditions instead.

If a report suddenly shows an unusually high total, investigate the configuration before celebrating growth. Ask whether the counted event genuinely represents a finished action, whether its meaning changed and whether duplicate triggers are possible. A large count is a reason to inspect the definition, not evidence of business success.

## Name an enquiry only when it is confirmed

Suppose a fictional portfolio offers a contact form, a mail link and a meeting-booking button. I would give each its own event name and outcome definition.

A mail link click cannot prove that an email was sent. Opening a meeting service cannot prove a booking was made. A form can fail validation after somebody presses Submit. Without receipt or a confirmation step, those interactions should remain labelled as intent.

When a form submission is genuinely successful, Google's [key-event tutorial](https://support.google.com/analytics/answer/12966437?hl=en-GB) explains how a specific event, such as generate_lead, may represent a confirmation-page milestone. For other systems, choose a reliable success signal from the actual form or server response rather than assuming a button click is enough.

This distinction matters when comparing a platform response with downstream qualification. In my [B2B lead-quality framework](/blog/b2b-lead-quality-cost-per-lead/), acquisition, contactability and sales acceptance remain separate stages of the same journey.

## Test consent and collection together

Event quality also depends on whether the collection respects people's preferences. Google's [consent-mode implementation guide](https://developers.google.com/tag-platform/security/guides/consent) describes setting a default consent state and updating it when somebody makes a choice. The exact collection behaviour depends on the implementation and the applicable policy.

I would test a visitor who declines analytics, one who accepts and one who changes their preference later. Check that the site remains usable without optional analytics and that event collection matches the stated consent behaviour. Do not treat missing events from non-consenting visitors as proof that visitors did nothing.

For a small site, a concise record of tag purpose, event name, consent dependency and intended reporting use can make future reviews much safer.

## Use controlled tests before relying on a dashboard

The most useful quality check is an observed sequence with a known expected result. Start with a clean test session, document the action and compare it with the event stream.

Google's [event documentation](https://support.google.com/analytics/answer/9322688?hl=en) describes Realtime and DebugView as tools for verifying collection. Their displays serve different purposes from a processed historical report, and test events may not appear in every reporting interface immediately.

For a fictional contact journey, I would deliberately visit a page, open the contact section, click the contact control and complete a valid test form where one exists. Record which events appear at each step. Repeat with an invalid form and ensure a failed submission is not described as a lead.

Check for repeat firing when navigating backwards, refreshing a confirmation page or clicking twice. If an outcome relies on CRM acceptance, separately verify that the record exists and meets the agreed definition. A tag cannot certify an external business process it does not observe.

## Keep the reporting boundaries visible

A useful report identifies its property, reporting timezone, complete date range, event name, counting unit and collection limitations. A last-seven-days comparison should not quietly include today when one source has not finished processing it.

Sessions, users, events, confirmed forms and accepted leads each have different counting rules. They are not interchangeable denominators. Nor should a reported key event automatically become a sales-qualified lead in a CRM.

I would pair a GA4 observation with the next verifiable stage, then document the gap between them. My [workflow eligibility checklist](/blog/hubspot-workflow-eligibility-suppression-rules/) offers a complementary way to decide when an action should enter an automated follow-up, rather than simply assuming every event belongs there.

## Questions to ask before sharing results

### Is a contact click a conversion?

It may be a deliberately selected key event, but it remains a contact-intent action unless another system confirms that an enquiry was sent. Use the precise event name and state the distinction.

### Should every page view become a key event?

Not when the intended outcome is a specific enquiry or confirmation. A generic page view counts ordinary browsing. Use a narrowly defined event that corresponds to the intended milestone.

### What is the first useful measurement improvement?

Audit the existing event names and key-event settings before introducing new tracking. Write down what every event proves, run repeatable tests and correct misleading labels. The aim is not to make a dashboard look bigger; it is to make each marketing decision easier to defend.

I approach measurement as a chain of evidence, from recorded behaviour to confirmed outcomes. When the links are explicit, an analyst can spot a broken assumption before it becomes a confident but inaccurate conclusion. [Explore my work](/#projects) or [get in touch](/#contact) to discuss marketing measurement and operations.
