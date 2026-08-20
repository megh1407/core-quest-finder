# Campus Quest

TECHFEST — Virtual AR/VR Treasure Hunt

Build the frontend foundation and interactive prototype for a browser-based 3D single-player virtual treasure hunt called TECHFEST — The Lost AR-VR Core.

The complete product specification is provided in the attached project specification. Treat that specification as the source of truth for the product requirements, terminology, game flow, and scope.

1. Product Vision

Create a lightweight, polished, browser-based 3D virtual college campus where players explore buildings and rooms, investigate objects, discover hidden clues, solve technical challenges, collect items, unlock areas, and ultimately recover the lost AR/VR prototype CORE-X.

The experience should feel like:

Explore → Investigate → Discover → Solve → Unlock → Compete → Recover the Treasure

This is NOT a huge open-world game and NOT a combat game.

Keep the world compact, performant, believable, futuristic, and suitable for normal modern laptops.

2. Technology Direction

Use:

React

TypeScript

Vite

Tailwind CSS

Three.js

React Three Fiber

Drei

Zustand

React Router where appropriate

Recharts where analytics are needed

The future backend architecture must remain compatible with:

Node.js

Express

TypeScript

MongoDB

Mongoose

Socket.IO

Do not replace MongoDB/Mongoose with another database technology.

Do not create a fake architecture that would make later integration with the real backend difficult.

3. Important Development Rule

DO NOT attempt to build the entire final application in one step.

First build a clean, working frontend prototype and architecture that can later be connected to the real backend.

The recommended first playable slice is:

Main Gate → Library → Library Room → 5–8 interactive objects → decoy interactions → hidden clue → one challenge → next clue

Also create a basic admin dashboard prototype showing the player's live state.

Once this slice works correctly, the architecture should be reusable for the remaining nine levels.

4. Player Experience

Create a player-facing application with these major screens/states:

Landing page

Player registration

Guidelines

Game start screen

3D campus/game screen

Challenge modal

Inventory

Hint interface

AR Scanner interface

Pause screen

Level completion

Final treasure/mission completion

Final score

Leaderboard

The game timer must start ONLY after the player presses START GAME.

For the initial prototype, use local/mock state where backend functionality is not yet available, but structure the code so real API/WebSocket integration can replace the mock layer later.

5. Visual Design

Use a futuristic AR/VR-inspired college technology aesthetic.

Visual direction:

Dark modern interface

Subtle holographic panels

Digital objective indicators

AR scan lines

Futuristic loading screens

Restrained glow

College/technology/mystery atmosphere

Clean typography

Strong hierarchy

Minimal visual clutter

Do NOT make everything neon.

The 3D environment must remain the main visual focus.

The UI should feel like a professional TECHFEST event product rather than a generic gaming website.

6. Player HUD

Create a minimal HUD containing:

TECHFEST title

Timer

Current penalty

Level X/10

Current clue/objective

AR Scanner button

Inventory button

Hint button

Pause button

The HUD should not cover too much of the 3D environment.

7. 3D Campus Prototype

Create a compact stylized low-poly campus prototype.

Include at minimum:

Main Gate

Main Road

Garden

Library

Computer Lab

Robotics Lab

Electronics Lab

Auditorium

Cafeteria

Main Academic Building

Server Room

Final Secret Room

For this first prototype, the Library is the fully playable location.

Other locations can initially be represented as simplified buildings/placeholders.

The player should be able to see buildings from outside but should NOT see their interior contents from outside.

Entering a building should transition/load the appropriate interior scene.

Use lightweight geometry and avoid unnecessary rendering.

8. Player Controls

Implement:

W / Arrow Up = forward

S / Arrow Down = backward

A / Arrow Left = left

D / Arrow Right = right

E = interact

Mouse = camera control

ESC = pause

Default camera:

Third-person

Also implement a camera toggle for:

Eye/First-person view

First-person view should be particularly useful inside rooms when searching objects.

9. Library Prototype

Make the Library the first complete playable environment.

The room should contain believable lightweight objects such as:

Bookshelves

Books

Computer

Tables

Chairs

Cabinet

Locker

Box

Painting

Notice board

The player must NOT immediately know which object contains the clue.

Most objects must be decoys.

Example decoy responses:

"Just a chair."

"The computer is switched off."

"Only old documents."

One object should contain the hidden clue.

Do NOT permanently highlight the correct object.

10. Interaction System

Objects should only become interactable when the player is close enough.

Show a subtle:

[E] Investigate

prompt.

When the player presses E:

Detect the nearby interactable object

Show an interaction result

If decoy → display a short decoy message

If correct → reveal the clue

Record the interaction in game state

Create this as a reusable interaction system so it can later work for every building and room.

11. Hidden Clue

For the first prototype, hide one clue inside a Library object.

The clue should indirectly identify the next destination.

Example style:

"Where machines learn to move."

This should point the player toward the Robotics Lab.

Do not make clues overly obvious.

The clue system must later support:

clue text

destination

building

room

object ID

required item

next level

Keep these as data/configuration rather than hardcoding game logic wherever possible.

12. Challenge System

After discovering the clue, open a challenge interface.

Support short-answer challenge types such as:

Single word

Number

Code output

Multiple choice

Binary

Hexadecimal

Logic

Mathematics

Cybersecurity

For the prototype, implement at least one simple challenge.

Wrong answer:

Add a configurable penalty

Allow retry

Correct answer:

Complete the level

Move toward the next clue/objective

Important:

The architecture must assume that final answer validation will eventually happen server-side.

Do not design the frontend around trusting the client for authoritative scoring.

13. Timer and Scoring

Use:

Final Time = Actual Game Time + Total Penalty

Penalties should support:

Wrong answer

Hint usage

Scanner usage

Other future configurable actions

Example:

Wrong answer = +30 seconds

Hints can later support:

Hint 1 = +15 seconds

Hint 2 = +30 seconds

Hint 3 = +45 seconds

Do not permanently hardcode these values throughout the UI. Centralize configuration.

14. Inventory

Create a reusable inventory system.

Possible items:

Blue Key

USB Drive

Access Card

Circuit Piece

Secret Note

Items can eventually unlock:

Doors

Lockers

Computers

Secret rooms

Final areas

For the first prototype, display the inventory UI and implement basic item collection/state.

15. Progressive Hint System

Create a Hint UI.

Support:

Hint 1 → correct room

Hint 2 → object category

Hint 3 → specific search area

Show the associated penalty before/after using the hint.

The system should be configurable rather than hardcoded.

16. AR Scanner

Add an optional AR Scanner button.

When activated:

Show a subtle scanning overlay

Add scan-line animation

Show a short result

Possible results:

"Unusual signal detected nearby."

"Possible hidden object within 5 meters."

"Electronic activity detected."

"Nothing unusual detected."

The scanner MUST NOT directly reveal the correct object.

Create the UI and state system now, while keeping the detection logic modular for later backend/game-engine integration.

17. Final Treasure Flow

Support the eventual 10-level flow:

Library → Old Book → Logic

Computer Lab → Computer → Coding

Robotics Lab → Toolbox/Robot → Binary

Auditorium → Seat/Control Panel → Pattern

Cafeteria → Hidden Note → Riddle

Main Building → Locker → Encryption

Electronics Lab → Circuit Board → Electronics

Garden → Hidden Marker → Mathematics

Server Room → Terminal → Coding/Cyber

Secret Room → Treasure → Master Puzzle

For the current prototype, only implement Level 1 fully.

Structure the data so Levels 2–10 can be added without rewriting the game engine.

18. Story

Use the initial storyline:

THE LOST AR-VR CORE

A mysterious AR/VR prototype called CORE-X has disappeared.

Ten encrypted traces are hidden throughout the virtual campus.

Players must:

Explore → Investigate → Solve → Unlock → Recover CORE-X.

Make the storyline editable later through the admin system.

19. Admin Dashboard

Create a separate admin/control-room interface.

It should visually feel like a futuristic event operations dashboard.

Include:

Overview

Total Players

Active

Searching

Solving

Completed

Not Started

Average Time

Average Penalty

Live Leaderboard

Columns:

Rank

Player/Team

Level

Time

Penalty

Final Time

Location

Status

Player Details

Clicking a player should show:

Current level

Building

Room

Progress

Attempts

Penalties

Inventory

Current state

Last action

Activity Feed

Show events such as:

Player started

Room entered

Object investigated

Clue found

Challenge opened

Wrong answer

Penalty added

Hint used

Item collected

Door unlocked

Level completed

Player completed

For now, use mock/local data, but create clean service interfaces so Socket.IO can later replace the mock event source.

20. Live Campus Map

Create an admin live-map panel.

Use a simplified top-down version of the campus master map.

Show:

Buildings

Roads

Rooms/areas where relevant

Player locations

Player status

The player map should NOT reveal answers or hidden object locations.

The admin map can provide operational information.

21. Analytics

Prepare the admin dashboard architecture for:

Average completion time

Average penalty

Average attempts

Completion rate

Question success/failure

Average time per level

Hint usage

Scanner usage

Most visited locations

Question difficulty

Correct/wrong percentages

Use Recharts where appropriate.

For now, mock data is acceptable.

22. Database-Compatible Data Model

The frontend architecture must be compatible with these future MongoDB/Mongoose entities:

Player

Event

Level

Challenge

Object

Attempt

Penalty

InventoryItem

PlayerInventory

PlayerProgress

GameSession

ActivityLog

Important player fields include:

enrollment number

team

player name

event

status

current level

current building

current room

start time

end time

game time

penalty

final time

inventory

Important challenge fields include:

level

clue

destination

building

room

object ID

type

question

answer

penalty

hints

active state

Do NOT create an unrelated database structure.

23. Backend Integration Boundary

Create clear service/API boundaries for future backend integration.

The frontend should eventually communicate with:

REST API for normal CRUD/game operations

Socket.IO for real-time events

Do not put server-authoritative game logic inside React components.

The backend will eventually be responsible for validating:

Current level

Player progression

Interaction permissions

Location

Object interaction

Answer

Timer

Penalty

Inventory

Unlock state

24. Security Expectations

Design with these rules in mind:

Never expose future answers unnecessarily

Never expose future clue mappings unnecessarily

Do not trust client-side scoring

Do not trust client-side progression

Keep admin functionality separate

Prepare for authenticated admin routes

Prepare for rate limiting

Prepare for input validation

Use environment variables for secrets

This prototype can use mock authentication, but the architecture must allow secure real authentication later.

25. Multiplayer/Real-Time Preparation

Although the player experience is single-player, multiple students may play simultaneously.

The architecture must support many independent player sessions.

Different players must be able to receive different randomized questions/challenges from a larger question pool in the eventual backend.

Do NOT implement shared global player state.

Each player's:

level

clue

challenge

timer

penalty

inventory

location

progression

must be independently tracked.

26. Performance

Optimize for normal modern laptops.

Use:

Low-poly assets

GLTF/GLB where appropriate

Compressed assets

Lazy loading

Indoor scene loading

Frustum culling

Limited dynamic lighting

Optimized shadows

Avoid rendering unnecessary objects outside the current area

Do not create an unnecessarily heavy 3D environment.

27. Scope Restrictions

DO NOT build:

Huge open world

Combat

Vehicles

NPC AI

Voice chat

Multiplayer character interaction

Full realistic graphics

Complex physics

Full VR headset support in version 1

The target is a polished browser-based AR/VR-inspired treasure hunt.

28. Code Quality

Use:

TypeScript types

Reusable components

Reusable game systems

Clear folder structure

Separation of UI, game logic, state, and services

Centralized configuration

Meaningful naming

No unnecessary duplication

No giant monolithic components

Do not hardcode the entire game into one React component.

29. First Deliverable

For THIS iteration, prioritize:

Professional landing page

Registration screen

Guidelines screen

Start Game flow

Basic 3D campus

Main Gate

Library exterior

Library interior

Third-person movement

First-person camera toggle

5–8 Library objects

Interaction system

Decoy interactions

One hidden clue

One challenge

Timer

Penalty system

Inventory UI

Hint UI

AR Scanner UI

Basic level progression

Basic admin dashboard

Mock live player state

Responsive UI

Clean reusable architecture

DO NOT implement all ten levels yet.

30. Acceptance Criteria

The first prototype should allow a user to:

Register

Read guidelines

Start the game

See the timer begin

Spawn at the Main Gate

Move around the campus

Enter the Library

Enter the Library room

Approach objects

See [E] Investigate

Investigate decoy objects

Discover one correct hidden clue

Read the clue

Open the challenge

Submit an answer

Receive a penalty for an incorrect answer

Retry

Complete the challenge

Progress to the next objective

View inventory

Use the hint interface

Open the AR scanner

Pause/resume

See basic progress in the admin dashboard

The application must be runnable and visually polished.

Before finishing, verify that the application builds successfully and that there are no obvious TypeScript/runtime errors.

When making architectural decisions, prioritize maintainability and future integration with the Node.js + Express + MongoDB/Mongoose + Socket.IO backend described above.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://core-quest-finder.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7dbdc095-fd7d-4f4d-a15e-30b97e80377c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
