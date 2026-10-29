# Permissions

A ✔ means the role may do it. Reading issues needs only a signed-in session, so it is not listed.
A new sign-up has no role and no permissions until a Technical Manager gives one.

Roles: Dev = Developer, BA = Business Analyst, QA = Quality Analyst, PM = Product Manager, TM = Technical Manager.

| Permission | Dev | BA | QA | PM | TM | Why |
| --- | :-: | :-: | :-: | :-: | :-: | --- |
| `issue:create` | ✔ | ✔ | ✔ | ✔ | ✔ | Req 3 |
| `issue:classify` |  | ✔ |  |  |  | Req 6 |
| `issue:close` |  | ✔ |  |  |  | Req 10 |
| `issue:assign` |  | ✔ |  | ✔ | ✔ | Judgment (Req 4 is silent on who) |
| `issue:delete` |  |  |  |  | ✔ | Judgment (tension with Req 10) |
| `comment:create` | ✔ | ✔ | ✔ | ✔ | ✔ | Req 5 |
| `comment:deleteAny` |  |  |  |  | ✔ | Judgment (Req 5 never says delete) |
| `testCase:create` |  |  | ✔ |  |  | Req 7 |
| `testCase:setResult` |  |  | ✔ |  |  | Req 7 |
| `timeLog:create` | ✔ |  |  |  |  | Req 8 |
| `user:set-role` |  |  |  |  | ✔ | Judgment (Req 2 never says who) |

## Not a role permission

- Changing an issue's priority is part of editing an issue, which Lab 05-04 gives to the issue's author.
- Moving an issue between open and in-progress is an ownership rule (Lab 05-04).
