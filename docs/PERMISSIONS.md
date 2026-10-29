# Permissions

## Permission table

| What a person does | Permission | Dev | BA | QA | PM | TM | Why |
|---|---|---|---|---|---|---|---|
| Read the list of issues, or one issue | any signed-in user |  |  |  |  |  | Judgment: reading needs no role |
| Create an issue | issue:create | ✔ | ✔ | ✔ | ✔ | ✔ | Req 3 (any user); all five roles get it, a user with no role does not |
| Edit an issue's title, description, steps or priority | (ownership rule, see below) |  |  |  |  |  | Note: only the author |
| Classify an issue | issue:classify |  | ✔ |  |  |  | Req 6 |
| Close an issue | issue:close |  | ✔ |  |  |  | Req 10 |
| Move an issue between open and in-progress | (ownership rule, see below) |  |  |  |  |  | Note: assigned person |
| Assign an issue to someone | issue:assign |  | ✔ |  | ✔ | ✔ | Judgment: Req 4 says who can be assigned, not who assigns |
| Add a comment | comment:create | ✔ | ✔ | ✔ | ✔ | ✔ | Req 5 (anyone); all five roles get it |
| Delete your own comment | (ownership rule, see below) |  |  |  |  |  | Judgment: the comment's author |
| Delete someone else's comment | comment:deleteAny |  |  |  |  | ✔ | Judgment: Req 5 never says delete; moderation by the Technical Manager |
| Add a test case | testCase:create |  |  | ✔ |  |  | Req 7 |
| Mark a test case passed or failed | testCase:setResult |  |  | ✔ |  |  | Req 7 |
| Delete an issue | issue:delete |  |  |  |  | ✔ | Judgment: cleanup only; in tension with Req 10 |
| Change someone's role | user:set-role |  |  |  |  | ✔ | Judgment: Req 2 never says who |
| Log hours on an issue | timeLog:create | ✔ |  |  |  |  | Req 8 |

A person who is signed in but has no role yet can read issues and nothing else.

## Ownership rules

| Action | Who, besides the role | Which sentence says so |
|---|---|---|
| Edit an issue's title, description, steps or priority | Only the issue's author | Note |
| Move an issue between open and in-progress | Only the person it is assigned to | Note |
| Add a test case or mark a result | Only on an issue assigned to that Quality Analyst | Note |
| Log hours | Only on an issue assigned to that Developer | Note |
| Delete a comment | The comment's author, or a Technical Manager (comment:deleteAny) | Judgment |

## Gaps and judgment calls

- Product Manager: may create issues, comment and assign issues, because planning work needs assignment; nothing else, since no requirement gives the role anything.
- Technical Manager: may create, assign, delete issues, delete any comment and hand out roles. Only a Technical Manager gives roles so nobody can pick their own, and a Technical Manager cannot change their own role so the last one cannot lock everyone out. The first one is made by hand in the database.
- Delete an issue: only the Technical Manager, for cleanup. Req 10 says issues are retained, so this is the one exception and is open to argument.
- Assign an issue / delete someone else's comment: Business Analyst, Product Manager and Technical Manager may assign, since Req 4 is silent on who; only the Technical Manager may delete another person's comment, because Req 5 says comments cannot be edited and deleting them should be rare.
- Change priority: part of editing an issue, so it belongs to the issue's author. A Business Analyst changing it would be a fair alternative.
- No role: a person who just signed up may read issues and do nothing else until a Technical Manager gives them a role.
- Recording a fix version and date (Req 9): Developers on their assigned issues. There is no permission or route for it yet, so it stays in this file only.
