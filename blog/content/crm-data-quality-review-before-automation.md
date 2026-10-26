CRM data quality starts with a practical question: can the information in this record support the next marketing or sales decision? A useful review checks identity, completeness, consistency, freshness and ownership before records enter an automated journey. Start with a defined audience and a small set of decision-critical fields, then record exceptions and their causes.

My public role history includes HubSpot CRM, lead enrichment and marketing automation at OKI Europe. That is the professional context for this guide. The review below is a proposed method, rather than a report of a particular employer database, cleanup project or commercial result.

## Start with the decision the data must support

A database can look tidy while still being unsuitable for its intended use. An email address may be formatted correctly but belong to someone whose organisation, role or preferences have changed. A country field may be populated yet use a different definition from the campaign’s territory rule.

Write down the next action first: selecting an audience, assigning an enquiry, reporting a campaign or deciding who needs follow-up. Then define the information necessary for that action. This keeps the review focused on usefulness rather than collecting fields simply because the CRM can store them.

For context on that broader journey, read my [HubSpot marketing automation lessons](/blog/hubspot-marketing-automation-lessons-oki/). Here, the narrower question is whether the underlying records are dependable enough to support it.

## Define a manageable review scope

Choose a clearly described group, such as contacts from one acquisition source during a named period. Include the review date and selection rule. A sample can expose problems worth investigating, but it should not be presented as a measurement of the entire database unless the sampling method supports that conclusion.

Create a short review sheet with the record identifier, observed issue, evidence, decision, responsible person and review date. Keep source values alongside proposed corrections. A tidy replacement without an explanation can make later troubleshooting harder than the original inconsistency.

## Check identity before filling gaps

Ask whether each record represents the person or organisation you think it does. Similar names are a reason to investigate, not sufficient grounds to combine records. Check identifiers, relevant associations and the available history before deciding whether two entries describe the same entity.

[HubSpot’s deduplication documentation](https://knowledge.hubspot.com/records/deduplication-of-records) explains how email addresses, company domains and record identifiers can support matching. Review the relevant creation or import route rather than assuming every route behaves identically. Preserve identifiers when preparing updates so existing records can be distinguished from new ones.

Where a merge is appropriate, review which values and relationships will remain. [HubSpot’s duplicate-management guidance](https://knowledge.hubspot.com/records/manage-duplicate-records) states that merged records cannot be reverted. Treat that as a separate, authorised decision; spotting a possible duplicate does not itself justify merging it.

## Separate missing, inconsistent and outdated values

Completeness asks whether the required information is present. Consistency asks whether values follow agreed meanings and formats. Freshness asks whether the information remains suitable for the decision today. These are different checks and need different remedies.

For example, a blank territory needs investigation, two competing territory labels need a definition, and a territory recorded before an organisational change needs verification. Filling every blank with a default might improve a completion percentage while making audience selection less reliable.

Document the meaning of important fields. Specify whether country refers to the contact, company headquarters or delivery location. Keep an explicit unknown value distinct from an inferred answer. When enrichment supplies information, record its source and review date instead of presenting an assumption as a confirmed fact.

## Review ownership and automation eligibility

A complete record may still have no clear next action. Check whether responsibility is assigned, whether the relevant team can act, and whether the status reflects the latest interaction. Record an operational exception separately from a judgement about the person’s interest.

Review communication preferences and suppression rules separately from data completeness. A populated email field does not establish that a contact should receive every communication. Define eligibility for the particular journey and test how exclusions behave before including the intended audience.

A separate [HubSpot workflow eligibility guide](/blog/hubspot-workflow-eligibility-suppression-rules/) shows how those record checks become explicit entry rules, exclusions and re-enrolment decisions.

This supports the distinction in my [B2B lead-quality framework](/blog/b2b-lead-quality-cost-per-lead/): usable contact details, audience fit and progression are related signals, but they describe different things. A cleanup should not silently change the qualification definition used in reporting.

## Prevent the same issue at its source

Once a pattern appears, trace how the affected value entered the CRM. Review the form, import mapping, integration or manual process involved. Correcting individual records helps today; improving the entry rule can reduce repeated investigation.

[HubSpot’s property-validation guidance](https://knowledge.hubspot.com/properties/set-validation-rules-for-properties) describes checks for supported field types and important exceptions. It notes that existing values are not retrospectively reformatted and that some entry routes do not enforce the rules. Test the actual route you use, including automation, rather than assuming a property setting covers every source.

Introduce changes carefully. Keep a small approved test group, check downstream segments and workflows, and document the result before applying a wider update. A more restrictive format is useful only if it still represents the information the team genuinely needs.

## Measure the review without inventing a business outcome

Use explicit denominators. Completeness can be reported as records with the agreed required fields divided by records reviewed. Keep the field list and review scope attached to that measure. Changing the requirements between reviews makes a percentage difficult to interpret.

Track confirmed issues, unresolved exceptions and recurring entry routes separately. Compare equivalent groups and time periods. A lower issue count after a smaller import does not necessarily mean the process improved, and cleaner data alone does not prove increased revenue or campaign effectiveness.

Consider a fictional example: a contact has two different territory labels and no assigned owner. The useful output is an agreed territory definition, an evidence-based correction and a named next action. The lesson is the decision trail, rather than a fabricated uplift attached to the cleanup.

## Questions to settle before the next review

### Which fields should a marketing team check first?

Start with the identifiers and fields that determine the next action. Usually that means the relevant contact route, audience criteria, ownership, status and communication eligibility. The appropriate list depends on the journey; avoid treating every available property as mandatory.

### How often should CRM data quality be reviewed?

Set the frequency around how quickly the information changes and the consequence of an error. Review a new import or integration before relying on it. Give recurring checks a named owner and revisit the schedule when sources or processes change.

Explore the [marketing automation collection](/blog/topics/marketing-automation/) for related guidance, or [get in touch](/#contact) to discuss how I approach connected marketing operations.


Once records are ready for reporting, use clear [marketing attribution definitions](/blog/marketing-attribution-measurement-definitions/) to distinguish the measured action, counting basis and reporting scope.
