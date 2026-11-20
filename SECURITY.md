# Security Policy

## Supported versions

House Radar is pre-1.0. Only the `main` branch is supported; fixes land there.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Anything else | No |

## Reporting a vulnerability

Please do not open a public issue for security problems. Use GitHub private vulnerability reporting:

1. Go to the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Fill in the form.

Include, when possible:

- A description of the issue and its impact.
- The affected component, file or commit.
- Steps to reproduce, or a proof of concept.
- Any suggested fix or mitigation.

Do not include real credentials or personal data.

## What to expect

This is a personal project maintained by one person, so these are goals, not guarantees:

- Acknowledgement within about a week.
- An assessment and a plan, or a request for more detail, as soon as reasonably possible.
- Credit in the fix, if you want it.

Please allow time to fix the issue before disclosing it publicly.

## Scope

- Staging is private: it is reachable only through a Tailscale network and has no public ports.
- There is no production deployment yet.
- The documentation portal is static content.
- In scope: the code in this repository, its CI workflows and its dependencies.
