# Docs

This folder is meant for both people and AI agents, but it is written so an agent can pull the highest-signal context quickly without digging through the whole repo.

## Start Here

- `AI_CONTEXT.md`: the shortest high-signal overview of the project, entry points, and system rules
- `ARCHITECTURE.md`: how the client, server, and authoritative gameplay loop are split
- `PROTOCOL.md`: the Colyseus room schema, message types, and what is authoritative
- `RUNBOOK.md`: how to run, verify, and debug the project

## Why This Folder Exists

The project is no longer just a visual prototype. In `v3` it includes:

- a browser client in `React + React Three Fiber`
- an authoritative multiplayer room in `Colyseus`
- server-side enemy, projectile, and wave logic

That means it is easy to accidentally edit the client as if it were still locally authoritative. These documents are here to prevent that.
