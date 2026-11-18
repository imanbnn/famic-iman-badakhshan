import { INK, MINT, ORANGE, PAPER, box, oval, path } from "#render/canvas";
import { brass, steel, rubber, glass, copper, contour, line, lens, wheel } from "#render/robots/parts";

function cabestan(c) {
  box(c, -15, 12, 9, 6, 2, rubber, INK);
  box(c, 6, 12, 9, 6, 2, rubber, INK);
  contour(c, "M-18 14 L-14 6 L14 6 L18 14 Q13 18 0 17 Q-12 18 -18 14Z", "#528786");
  box(c, -8, 10, 16, 5, 2, INK);
  box(c, -5, 11, 3, 2, 1, MINT);
  box(c, 2, 11, 3, 2, 1, MINT);
  contour(c, "M-13 -12 Q0 -16 13 -12 Q8 -3 13 4 Q0 10 -13 4 Q-8 -3 -13 -12Z", brass);
  line(c, "M-9 -8 Q0 -5 9 -8 M-9 -3 Q0 0 10 -3 M-10 2 Q0 5 10 2", "#94623e", 1.7);
  oval(c, 0, 6, 16, 4, copper, INK);
  oval(c, 0, -12, 15, 4.5, "#e88e62", INK);
  box(c, -3, -18, 6, 6, 1.4, steel, INK, 1.5);
  line(c, "M-11 -16 L10 -19", INK, 3);
  oval(c, -11, -16, 2.3, 2.1, brass, INK, 1.2);
}

function etau(c) {
  box(c, -13, 12, 8, 6, 2, rubber, INK);
  box(c, 5, 12, 8, 6, 2, rubber, INK);
  contour(c, "M-14 4 L-19 -7 L-17 -16 L-7 -18 L-6 -11 L-12 -9 L-8 -2Z", "#abc8bf");
  contour(c, "M14 4 L19 -7 L17 -16 L7 -18 L6 -11 L12 -9 L8 -2Z", "#abc8bf");
  line(c, "M-14 -14 L-8 -15 M14 -14 L8 -15", PAPER, 1.8);
  box(c, -17, -1, 34, 5, 2.5, "#789397", INK, 1.6);
  line(c, "M-6 -1 L-8 3 M0 -1 L-2 3 M6 -1 L4 3", INK, 1);
  contour(c, "M-12 4 L-7 1 L7 1 L13 5 L12 13 L7 16 L-8 16 L-13 11Z", "#e69c53");
  oval(c, -11, 5, 2.5, 2.5, brass, INK, 1.3);
  oval(c, 11, 5, 2.5, 2.5, brass, INK, 1.3);
  box(c, -7, 6, 14, 5.5, 1.8, INK);
  line(c, "M-4 8 L-1 9 M2 9 L5 8", PAPER, 1.5);
}

function orque(c) {
  contour(c, "M-11 -3 Q-11 -10 -8 -18 Q-1 -16 2 -7 L3 -1Z", "#45798a");
  contour(c, "M-11 3 Q-15 1 -21 -4 Q-21 2 -17 6 Q-21 7 -21 12 Q-15 12 -10 7Z", "#6ba8aa");
  contour(c, "M-14 4 Q-11 -6 -1 -8 Q12 -12 18 -4 Q23 2 17 7 Q10 12 0 12 Q-8 12 -14 7Z", "#31546a");
  contour(c, "M-10 7 Q-1 10 4 4 Q8 1 13 2 Q17 3 20 0 Q20 6 14 9 Q3 15 -8 10Z", "#e5e8cf", null);
  contour(c, "M-4 7 Q-1 7 4 9 Q4 15 -2 17 Q-6 18 -5 13Z", steel, INK, 1.7);
  contour(c, "M2 -5 Q4 -9 12 -6 Q9 -3 4 -2Z", PAPER, null);
  lens(c, 10, -1, 3.2);
  line(c, "M-10 -2 Q-8 1 -5 1 M15 5 L17 4", "#9bc2c1", 1.1);
}

function rivet(c) {
  box(c, -12, 12, 7, 7, 2, rubber, INK);
  box(c, 4, 12, 7, 7, 2, rubber, INK);
  box(c, -9, -19, 6, 8, 1, copper, INK, 1.5);
  box(c, -11, -20, 10, 4, 1.5, brass, INK, 1.5);
  contour(c, "M-13 -6 Q-13 -14 0 -15 Q13 -14 13 -5 L14 10 Q14 16 0 17 Q-14 16 -14 10Z", "#bb6e56");
  box(c, -15, -1, 30, 5, 2, brass, INK, 1.4);
  box(c, -9, 5, 18, 7, 2, INK);
  box(c, -6, 7, 3, 3, 1, ORANGE);
  box(c, 3, 7, 3, 3, 1, ORANGE);
  for (const x of [-11, 11]) oval(c, x, 1.5, 1.2, 1.2, INK);
  oval(c, 7, -12, 6, 6, PAPER, INK, 1.8);
  line(c, "M7 -12 L10 -15", "#b65b43", 1.8);
  line(c, "M-11 -6 Q-8 -10 -5 -10", "#f6b58a", 1.5);
}

function etrille(c) {
  const legs = "M-9 5 L-16 7 L-19 13 M-7 9 L-11 13 L-11 17 M9 5 L16 7 L19 13 M7 9 L11 13 L11 17";
  line(c, legs, INK, 4.8);
  line(c, legs, "#e9a468", 2.2);
  contour(c, "M-9 3 L-16 1 Q-21 -3 -20 -10 L-16 -16 L-16 -8 L-12 -7 L-11 -12 Q-6 -10 -7 -6 L-11 -3Z", "#e87f58");
  contour(c, "M9 3 L16 1 Q21 -3 20 -10 L16 -16 L16 -8 L12 -7 L11 -12 Q6 -10 7 -6 L11 -3Z", "#e87f58");
  contour(c, "M-13 3 Q-11 -4 0 -5 Q11 -4 13 3 L10 9 L4 12 L-4 12 L-10 9Z", ORANGE);
  oval(c, -4.5, -4.5, 2.8, 3.1, PAPER, INK, 1.5);
  oval(c, 4.5, -4.5, 2.8, 3.1, PAPER, INK, 1.5);
  oval(c, -4, -4.5, 1.1, 1.4, INK);
  oval(c, 4, -4.5, 1.1, 1.4, INK);
  line(c, "M-5 5 L0 7 L5 5", INK, 1.8);
}

function bison(c) {
  contour(c, "M-17 6 L-13 -1 L2 -1 L8 3 L10 10 L6 13 L-16 13Z", "#d09b48");
  contour(c, "M-13 0 L-10 -12 L-6 -15 L3 -13 L6 -1Z", brass);
  contour(c, "M-9 -2 L-7 -10 L-1 -11 L2 -3Z", "#30717a", INK, 1.4);
  line(c, "M-7 -8 L-4 -9", "#d6ead6", 1.5);
  contour(c, "M-11 -8 Q-18 -9 -18 -16 Q-14 -12 -9 -13Z", PAPER, INK, 1.5);
  contour(c, "M1 -11 Q8 -11 9 -17 Q10 -11 7 -7 L3 -6Z", PAPER, INK, 1.5);
  wheel(c, -11, 12, 6);
  wheel(c, 3, 12, 4.7);
  contour(c, "M9 -6 L12 -7 L14 7 L20 6 L20 9 L11 12Z", steel, INK, 1.6);
  contour(c, "M6 -1 L9 -2 L10 12 L17 12 L17 15 L7 16Z", "#93b1ac", INK, 1.6);
  oval(c, -13, 4, 2, 2, PAPER, INK, 1);
}

function ponton(c) {
  box(c, -16, 7, 32, 10, 5, rubber, INK, 2);
  for (const x of [-10, 0, 10]) oval(c, x, 12, 2.4, 2.4, "#7ea2a0", INK, 1.1);
  contour(c, "M-21 0 L18 -1 Q21 -1 19 3 L15 9 L-15 9 L-20 5Z", "#619299");
  line(c, "M-16 5 L15 5", "#f2a17a", 2.3);
  contour(c, "M-10 0 L-8 -10 L2 -12 L9 -8 L11 -1Z", "#d4cba1");
  box(c, -6, -8, 6, 5, 1, INK);
  box(c, 2, -8, 4, 5, 1, INK);
  line(c, "M-4 -6 L-2 -6", glass, 1.3);
  box(c, -8, -13, 16, 2.8, 1.3, copper, INK, 1.3);
  line(c, "M-2 -13 L-2 -18", INK, 1.7);
  path(
    c,
    [
      [-2, -18],
      [5, -17],
      [-2, -15]
    ],
    ORANGE,
    INK,
    1
  );
  for (const x of [-16, 16]) box(c, x - 1.5, -4, 3, 5, 1, brass, INK, 1);
}

function enclume(c) {
  contour(
    c,
    "M-18 -9 L-10 -14 L12 -14 L12 -11 L20 -11 L18 -5 L10 -2 Q5 1 6 7 L13 11 L15 16 L-13 16 L-11 11 L-5 7 L-6 3 Q-7 -1 -12 -3Z",
    "#6d91a0"
  );
  contour(c, "M-20 -10 L-11 -15 L11 -15 L16 -12 L10 -9 L-12 -7Z", "#c2d9d1", INK, 1.8);
  contour(c, "M-10 -5 L8 -7 L13 -7 L8 -3 L-7 0Z", INK, null);
  line(c, "M-6 -4 L4 -5", "#ffcf76", 2);
  path(
    c,
    [
      [-2, 4],
      [3, 3],
      [3, 7],
      [-2, 8]
    ],
    "#b3c6b6"
  );
  box(c, -15, 13, 31, 5, 1.4, steel, INK, 1.8);
  for (const x of [-10, 11]) oval(c, x, 15.5, 1, 1, brass);
}

function scaphandre(c) {
  box(c, -11, 11, 8, 8, 2, rubber, INK);
  box(c, 4, 11, 8, 8, 2, rubber, INK);
  contour(c, "M-16 7 Q-19 -4 -12 -12 Q-7 -18 1 -17 Q12 -17 16 -7 Q18 0 15 7 L8 12 L-8 12Z", "#d3a061");
  for (const x of [-16, 16]) box(c, x - 3, -4, 6, 9, 2, copper, INK, 1.7);
  box(c, -15, 9, 30, 5.5, 2.5, brass, INK, 1.8);
  oval(c, 0, -2, 11.5, 10.6, "#f1cd86", INK, 1.8);
  oval(c, 0, -2, 8.7, 7.8, "#285864", INK, 1.4);
  line(c, "M-5 -2 L-3 -2 M3 -2 L5 -2", "#c1f3d7", 2.3);
  line(c, "M0 -8.5 L0 5 M-7 2 Q0 4 7 2", "#bb965f", 1);
  for (const x of [-10, 10]) oval(c, x, 11.7, 1, 1, INK);
  line(c, "M-10 -11 Q-8 -14 -4 -14", PAPER, 1.3);
}

function belier(c) {
  box(c, -13, 8, 25, 10, 4, rubber, INK);
  contour(c, "M-13 -3 L-8 -12 L2 -14 L12 -9 L15 1 L9 10 L-8 11 L-14 4Z", "#c1634b");
  contour(c, "M-6 -8 Q-15 -17 -19 -9 Q-23 0 -14 3 Q-8 3 -9 -3 Q-12 -6 -14 -3 Q-15 -9 -10 -7Z", brass, INK, 1.9);
  contour(c, "M6 -10 Q14 -17 18 -10 Q22 -3 16 0 Q11 1 11 -4 Q14 -6 15 -4 Q16 -10 10 -8Z", brass, INK, 1.8);
  contour(c, "M-6 -4 L9 -6 L6 0 L-3 2Z", INK, null);
  line(c, "M-3 -2 L5 -3", "#fada90", 1.7);
  contour(c, "M-17 8 L10 4 L19 8 L17 14 L-13 18 L-19 14Z", "#e4875d", INK, 2);
  line(c, "M-17 13 L16 9", PAPER, 1.6);
  for (const x of [-10, 9]) oval(c, x, x < 0 ? 11 : 7.5, 1.15, 1.15, INK);
}

function morse(c) {
  contour(c, "M-12 5 Q-21 7 -20 13 L-9 15 L-5 10 M11 6 Q21 6 20 13 L11 15 L6 10Z", steel);
  contour(c, "M-14 0 Q-14 -14 -3 -16 Q8 -18 14 -8 Q17 1 13 10 L7 14 L-6 14 L-13 10Z", "#77969d");
  contour(c, "M-12 -7 Q-5 -13 13 -9 L14 -5 Q-1 -9 -12 -3Z", "#c37d59", INK, 1.2);
  lens(c, -6, -4, 3.1);
  lens(c, 6, -4, 3.1);
  contour(c, "M-11 5 L-6 5 Q-4 12 -8 19 Q-9 14 -11 11Z M6 6 L11 4 Q13 13 7 18 Q9 12 6 6Z", PAPER, INK, 1.7);
  oval(c, -4, 4, 6.8, 4.5, "#c4bfa6", INK, 1.4);
  oval(c, 4, 4, 6.8, 4.5, "#c4bfa6", INK, 1.4);
  oval(c, 0, 1, 3, 2, INK);
  line(c, "M-5 4 L-14 3 M5 4 L14 3", INK, 1);
}

export const haulers = {
  cabestan,
  etau,
  orque,
  rivet,
  etrille,
  bison,
  ponton,
  enclume,
  scaphandre,
  belier,
  morse
};
