# Minecraft 50-Bot Survival Squad

A role-based Mineflayer bot swarm for a private/test Minecraft server.

## What is included

- 50 configurable bots
- Commander chat commands
- Automatic reconnect
- Role assignment
- Follow-owner squad
- Resource gathering
- Basic food gathering
- Exploration
- Basic combat against nearby hostile mobs
- Shared task state
- Progression-oriented task queue
- Graceful shutdown

The code is intentionally modular: the 50 bots are instances of the same worker class rather than 50 duplicated scripts.

## Requirements

Node.js 18+ and a Minecraft server compatible with Mineflayer.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MC_HOST`, `MC_PORT`, `MC_AUTH`, and `MC_OWNER`.
3. Install dependencies:

```bash
npm install
```

4. Start:

```bash
npm start
```

For an offline-mode/private server, use:

```env
MC_AUTH=offline
```

For Microsoft-authenticated accounts, each account needs its own legitimate authentication setup. Do not put passwords in this project.

## Commands

Run these in Minecraft chat as the configured owner:

- `!status`
- `!follow`
- `!stop`
- `!gather wood`
- `!gather stone`
- `!gather coal`
- `!gather iron`
- `!gather food`
- `!explore`
- `!guard`
- `!auto`
- `!task <role> <task>`

Examples:

`!gather iron`

`!task miner gather:diamond_ore`

`!follow`

`!auto`

## Important

This is a survival automation framework, not a guaranteed one-click Minecraft speedrunner. Nether/End progression, inventories, structures and combat are deliberately separated into modules so they can be improved without rewriting all 50 bots.
