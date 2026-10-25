# Daily personal blogging workflow

**Times:** Europe/London, every calendar day. Daily questions at **18:00**; approved post publication starts at **20:00**.

## 18:00 interview
Ask the author 10 thoughtful, open-ended questions relevant to the actual day: interactions, observations, difficult conversations, feelings, lessons, uncertainty, and one of their recurring interests (dignity and equality, freedom of expression, human rights, religious harmony, marginalised communities, education and critical thinking, immigration, or responsible technology). Rotate the questions; do not manufacture anecdotes, infer sensitive personal information or pretend a conversation happened. Ask which details are private or should be anonymised.

When the author replies, draft a first-person personal essay of up to 2,500 words, faithful to their answers, clearly distinguishing first-hand observation, opinion and independently verified fact. Ask the author to explicitly approve the draft before publication. Do not treat silence, a partial response or a reply to questions as publication approval.

## 20:00 publisher
1. Resolve today's London date and find the actual answers and explicit approval from the 18:00 interview. If either is unavailable, **do not publish**. Tell the author what's needed.
2. Review private details about third parties, alleged misconduct, personal identifiers, attribution, factual assertions, external sources and the author's instructions. Strip identifying details where required and ask for consent for direct quotations.
3. Read latest `blog/posts.json`, `blog/content` and existing articles from GitHub to avoid repetition, confirm there is no personal post for today's London date, and identify useful internal links. Prepare links on existing relevant pages.
4. Prepare `blog/content/<slug>.md` and matching JSON metadata. For personal posts set `category` to `Personal perspectives`, `categoryUrl` to `/blog/topics/personal-perspectives/`, `entryDate` to `YYYY-MM-DD`, `answerCount` to `10`, `approvedForPublication` and `privacyChecked` to `true`, `approvedAt` to the actual approval timestamp, `publishedAt` and `modifiedAt` to the intended local publication timestamp. Include SEO title/description, deck, keywords, context and verified sources as needed. Use `heroPrefix: personal-YYYY-MM-DD`, `heroWidth: 1600`, `heroHeight: 900`, helpful `heroAlt` and `heroCaption`. The build automatically creates distinct original typographic WebP/JPG media if no approved image set exists.
5. Commit approved source and relevant linking changes to the GitHub repository. The GitHub Actions `Build and publish blog` workflow renders the pages, optimises media, checks site integrity, and commits the generated files to `main`. Wait for the workflow to pass and verify live URL, image, RSS and sitemap. Do not report success from a source commit alone.
6. On any missing answers, approval, privacy concern, duplicate, validation failure or deployment issue, **hold publication** and inform the author clearly. Never auto-generate experience or override publication approval.

**One-off approved essay exception:** When the author explicitly approves a complete standalone essay outside the daily interview, it may be published without inventing ten same-day answers. Such a post must set `editorialBasis` to `standalone-approved`, `standaloneApproved` to `true`, `answerCount` to `0`, and retain the same required `approvedAt`, `approvedForPublication`, `privacyChecked`, `entryDate` and local-date uniqueness safeguards. State in `context` that the piece is a standalone reflection rather than a report of that day's events. This exception does not override the scheduled daily interview rules. Multiple personal essays may share a local date only when each is a distinct standalone essay separately approved by the author; the article must use a unique `heroPrefix` such as `personal-YYYY-MM-DD-<slug-short>` to avoid cover-art collisions. The regular daily interview remains limited to one diary entry.

Unpublished answers and drafts remain private; do not create a public GitHub issue or commit raw interview answers. Use the same title/date only once; never silently overwrite another article. The editorial questions can be revised as the author's interests evolve.

## Sample metadata contract

```json
{
  "slug": "personal-reflection-example-2026-10-24",
  "title": "A personal reflection",
  "seoTitle": "A personal reflection | Faraz Ansari",
  "description": "An approved reflection based on real experiences and conversations.",
  "deck": "A short introduction to the essay.",
  "publishedAt": "2026-10-24T20:00:00+01:00",
  "modifiedAt": "2026-10-24T20:00:00+01:00",
  "approvedAt": "2026-10-24T19:30:00+01:00",
  "entryDate": "2026-10-24",
  "answerCount": 10,
  "approvedForPublication": true,
  "privacyChecked": true,
  "category": "Personal perspectives",
  "categoryUrl": "/blog/topics/personal-perspectives/",
  "keywords": ["personal essays", "reflections"],
  "heroPrefix": "personal-2026-10-24",
  "heroWidth": 1600,
  "heroHeight": 900,
  "heroAlt": "Original typographic editorial cover for a personal essay",
  "heroCaption": "A moment worth reflecting on.",
  "context": "First-person reflection based on the author's answers; all views are personal.",
  "sources": []
}
```

The example is documentation only and **must not be published**.
