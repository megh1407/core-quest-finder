import type { Level } from "../types";
import { GAME_CONFIG } from "../config";

const { penalties } = GAME_CONFIG;

function scaffold(
  id: number,
  name: string,
  building: Level["building"],
  room: string,
  destination: string,
  type: Level["challenge"]["type"],
): Level {
  return {
    id,
    name,
    building,
    room,
    objective: `Locate the encrypted trace in the ${destination}.`,
    playable: false,
    clue: {
      id: `clue-${id}`,
      levelId: id,
      text: "This trace is still encrypted.",
      destination,
      building,
      room,
      objectId: `${building}_target`,
      requiredItem: null,
      nextLevel: id < 10 ? id + 1 : null,
    },
    challenge: {
      id: `ch-${id}`,
      levelId: id,
      type,
      question: "Locked until this level is deployed.",
      answer: "",
      penaltySeconds: penalties.wrongAnswer,
      hints: [],
      active: false,
    },
    objects: [],
  };
}

/**
 * Level definitions are pure data. Levels 2-10 are scaffolded so the engine,
 * HUD and admin views already know the full mission chain; only level 1 is
 * playable in this prototype.
 */
export const LEVELS: Level[] = [
  {
    id: 1,
    name: "The Silent Archive",
    building: "library",
    room: "reading_hall",
    objective: "Search the Library for the first encrypted trace.",
    playable: true,
    rewardItem: "usb_drive",
    clue: {
      id: "clue-1",
      levelId: 1,
      text: "Where machines learn to move, the second trace waits beneath the tools.",
      destination: "Robotics Lab",
      building: "robotics_lab",
      room: "assembly_bay",
      objectId: "lib_old_book",
      requiredItem: null,
      nextLevel: 2,
    },
    challenge: {
      id: "ch-1",
      levelId: 1,
      type: "logic",
      question:
        "The archive terminal prints a sequence and asks for the next value: 2, 3, 5, 9, 17, 33, ?",
      answer: "65",
      penaltySeconds: penalties.wrongAnswer,
      hints: [
        {
          order: 1,
          text: "The trace is inside the Library reading hall - not the corridor.",
          penaltySeconds: penalties.hint[0],
        },
        {
          order: 2,
          text: "Look for something that can be opened and read, not sat on.",
          penaltySeconds: penalties.hint[1],
        },
        {
          order: 3,
          text: "Each value doubles and loses one. Check the worn book on the reading table.",
          penaltySeconds: penalties.hint[2],
        },
      ],
      active: true,
    },
    objects: [
      {
        id: "lib_shelf_a",
        levelId: 1,
        building: "library",
        room: "reading_hall",
        kind: "bookshelf",
        label: "Tall Bookshelf",
        position: [-6.5, 0, -4],
        radius: 2.8,
        message: "Rows of reference volumes. Dust, and nothing else.",
      },
      {
        id: "lib_shelf_b",
        levelId: 1,
        building: "library",
        room: "reading_hall",
        kind: "bookshelf",
        label: "Archive Shelf",
        position: [-6.5, 0, 1.5],
        radius: 2.8,
        message: "Journals from 2011. Only old documents.",
      },
      {
        id: "lib_computer",
        levelId: 1,
        building: "library",
        room: "reading_hall",
        kind: "computer",
        label: "Catalogue Terminal",
        position: [5.6, 0, -4.4],
        radius: 2.4,
        message: "The computer is switched off.",
      },
      {
        id: "lib_chair",
        levelId: 1,
        building: "library",
        room: "reading_hall",
        kind: "chair",
        label: "Reading Chair",
        position: [1.4, 0, 2.6],
        radius: 2,
        message: "Just a chair.",
      },
      {
        id: "lib_cabinet",
        levelId: 1,
        building: "library",
        room: "reading_hall",
        kind: "cabinet",
        label: "Filing Cabinet",
        position: [6.2, 0, 2.8],
        radius: 2.4,
        message: "Locked drawers, and the label reads: EMPTY - 2019.",
      },
      {
        id: "lib_painting",
        levelId: 1,
        building: "library",
        room: "reading_hall",
        kind: "painting",
        label: "Founder's Portrait",
        position: [0, 0, -7.2],
        radius: 2.4,
        message: "A portrait of the founder. The wall behind it is solid.",
      },
      {
        id: "lib_noticeboard",
        levelId: 1,
        building: "library",
        room: "reading_hall",
        kind: "noticeboard",
        label: "Notice Board",
        position: [-7.4, 0, 5.5],
        rotationY: Math.PI / 2,
        radius: 2.4,
        message: "TECHFEST schedule, a lost-ID notice, and a torn poster.",
      },
      {
        id: "lib_box",
        levelId: 1,
        building: "library",
        room: "reading_hall",
        kind: "box",
        label: "Storage Box",
        position: [4.2, 0, 6.2],
        radius: 2.2,
        message: "Packing material and a broken projector lamp.",
      },
      {
        id: "lib_old_book",
        levelId: 1,
        building: "library",
        room: "reading_hall",
        kind: "book",
        label: "Worn Book",
        position: [-1.6, 0, -1.4],
        radius: 2.1,
        message:
          "A hollowed-out volume. Inside: a folded strip of paper with an encrypted trace.",
        holdsClue: true,
        grantsItem: "usb_drive",
      },
    ],
  },
  scaffold(2, "Cold Boot", "computer_lab", "lab_a", "Computer Lab", "code_output"),
  scaffold(3, "Servo Silence", "robotics_lab", "assembly_bay", "Robotics Lab", "binary"),
  scaffold(4, "Row Seven", "auditorium", "stage_hall", "Auditorium", "logic"),
  scaffold(5, "Table Talk", "cafeteria", "dining", "Cafeteria", "single_word"),
  scaffold(6, "Locker 404", "main_building", "corridor", "Main Building", "cybersecurity"),
  scaffold(7, "Broken Trace", "electronics_lab", "bench_row", "Electronics Lab", "hexadecimal"),
  scaffold(8, "Buried Marker", "garden", "east_lawn", "Garden", "mathematics"),
  scaffold(9, "Root Access", "server_room", "rack_hall", "Server Room", "cybersecurity"),
  scaffold(10, "CORE-X", "secret_room", "vault", "Secret Room", "logic"),
];

export function getLevel(id: number): Level {
  const found = LEVELS.find((l) => l.id === id);
  if (found) return found;
  const first = LEVELS[0];
  if (!first) throw new Error("No levels configured");
  return first;
}