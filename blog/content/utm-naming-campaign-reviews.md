UTM naming works best when source identifies the publisher, medium identifies the channel and campaign identifies the shared initiative. Agree the vocabulary before distributing links, record approved values in one register and test the final destination. The aim is a report that colleagues can interpret consistently, rather than a longer tracking URL.

This is a proposed working method, with a fictional campaign example. It is not a description of an OKI implementation or a claim of improved performance. It complements my [marketing attribution guide](/blog/marketing-attribution-measurement-definitions/): naming describes incoming traffic, while attribution concerns how recorded touchpoints receive credit for a defined action.

## Start with the question the report must answer

Before creating links, write the campaign question in plain English. For example: which placements bring relevant visits to a fictional autumn webinar? Decide whether the review needs a channel comparison, a placement comparison or a creative comparison. Each question needs a different level of detail, so avoid adding fields simply because they are available.

I would also define the reporting owner and review date. A naming convention needs someone who resolves exceptions before launch. Otherwise two sensible colleagues may choose different labels for the same activity, leaving a third person to reconcile them later. For each exception, keep the reason visible so the next reviewer can understand the choice without reconstructing the conversation. A short agreement is easier to maintain than a complicated naming system nobody checks.

## Give each parameter one clear job

Google’s [campaign URL documentation](https://support.google.com/analytics/answer/10917952?hl=en) describes the standard parameters and recommends using source, medium and campaign when adding campaign tags. Keep their roles distinct. The following values illustrate a proposed convention, not a universal vocabulary that every organisation must adopt.

- utm_source identifies the publisher or referring source: linkedin.
- utm_medium describes the marketing channel: paid_social.
- utm_campaign names the shared initiative: autumn-webinar-2026.
- utm_content distinguishes a placement or creative: feed-intro-a.

Keep the campaign value stable across related placements. Changing the source or creative should not create a new initiative unless that distinction is deliberate. If a campaign identifier is needed for cost-data matching, document that separately. Avoid squeezing audience, geography, product and every creative attribute into one increasingly unreadable campaign name.

## Choose a small vocabulary and record exceptions

For a proposed register, I would use lowercase values, ordinary hyphens and a short list of approved media. Google documents that parameter values are case sensitive. A consistent convention reduces accidental separation between labels such as linkedin and LinkedIn. The [GOV.UK tagging guidance](https://docs.data-community.publishing.service.gov.uk/processes/utm-usage/) provides a useful public example of an organisation documenting its own rules.

The register should hold the destination, source, medium, campaign, content, owner, approval date and intended placement. Add the final assembled URL and a short explanation for any exception. Keep a retired-values list so an old label is not accidentally reused for a different purpose. These are proposed operational controls; they do not guarantee accurate reporting by themselves.

Decide how much detail is actually useful. A creative identifier should answer a real review question. Avoid creating a unique campaign label for every individual click or recipient. That makes comparisons harder and can turn a campaign register into an unnecessary collection of personal information.

## Build one example before scaling the convention

For the fictional webinar, imagine a paid LinkedIn feed placement leading to a public registration page. The register would contain source linkedin, medium paid_social, campaign autumn-webinar-2026 and content feed-intro-a. A second creative could use feed-intro-b while keeping the other values unchanged. This makes the intended comparison explicit before any results exist.

Build the URL with a trusted URL builder and check the generated query string. Open the exact link that will be distributed, including any shortened or wrapped version. Confirm that it reaches the intended page and preserves the expected parameters. Do not assume that a correctly completed spreadsheet guarantees a correctly configured advertisement or email link.

## Respect auto-tagging and existing integrations

Manual UTMs are only one part of traffic-source collection. Google’s [manual tagging and auto-tagging guidance](https://support.google.com/analytics/answer/11242870?hl=en) explains how supported advertising integrations supply additional dimensions. Before changing paid-media links, establish which integrations and tagging settings already exist. Do not disable a working integration just to make every channel look identical in a register.

For a review, I would record the tagging method alongside the campaign entry and ask the analytics owner which dimensions should be used. A manually supplied label and a linked advertising-platform dimension can serve different purposes. If they disagree, inspect the configuration and report scope before deciding that a channel has performed badly.

## Keep internal navigation and personal data out

Use campaign tags for distributed acquisition links. Keep ordinary links between your own pages free of campaign UTMs. GOV.UK explicitly warns against internal campaign tagging because it interferes with attribution. If you need to understand an internal button, plan an appropriate interaction event rather than making that button look like a new acquisition source.

Never put an email address, telephone number or other identifying personal information into campaign values. Google’s [PII guidance](https://support.google.com/analytics/answer/6366371?hl=en) addresses this directly. Review URL paths as well as query parameters. This is also a useful connection to my [CRM data quality checklist](/blog/crm-data-quality-review-before-automation/): clear definitions and controlled fields matter before information enters another system.

## Test collection before interpreting performance

Separate link testing from analytics verification. The first confirms navigation and parameter preservation; the second checks whether the expected data arrives in the correct property and report. Use your existing consent controls during testing. A visible parameter in the address bar does not prove an analytics event was collected or that a report has finished processing.

When reviewing results, record the period, timezone, dimension scope and exclusions. Keep visits separate from enquiries and accepted leads, as explained in my [B2B lead-quality framework](/blog/b2b-lead-quality-cost-per-lead/). Good naming makes a comparison easier to inspect. It does not prove that a visit became a sale or that a campaign caused an outcome.

## Questions to settle before launch

### Should every link have a different campaign name?

Use one campaign value for the initiative and distinguish meaningful variants with a documented content value. Create another campaign only when the reporting question genuinely requires it.

### What if older links use inconsistent names?

Preserve the original observations. Document a reporting mapping and its effective date rather than pretending historical labels were always consistent. Correct links still under your control after checking their use.

### What should the handover include?

Share the approved register, tested URLs, tagging method and reporting definitions with the next owner. For context on my approach to campaign operations, [explore my portfolio](/#projects) or [get in touch](/#contact).
