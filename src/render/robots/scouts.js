import { INK, MINT, ORANGE, PAPER, box, oval } from "#render/canvas";
import { brass, steel, glass, copper, contour, line, lens } from "#render/robots/parts";

function manta(c) {
  contour(c, "M-2 4 Q1 11 -3 19 Q4 17 5 6Z", "#6799a1", INK, 1.6);
  contour(
    c,
    "M-20 -12 Q-10 -11 -5 -9 L-2 -13 L2 -13 L5 -9 Q12 -7 20 -15 Q20 -3 15 3 L8 2 Q5 10 0 12 Q-5 10 -8 3 L-15 5 Q-19 -3 -20 -12Z",
    "#497989"
  );
  contour(c, "M-18 -9 L-8 -4 L-5 1 L-14 -1Z M18 -11 L8 -4 L6 0 L14 -4Z", "#98cbbd", null);
  contour(c, "M-5 -8 Q0 -12 5 -8 L4 3 L0 8 L-4 3Z", "#88c4bd", INK, 1.4);
  lens(c, 0, -4, 3.7);
  line(c, "M-4 4 L0 8 L4 4", PAPER, 1.2);
}

function vigie(c) {
  contour(c, "M-5 4 L-5 -9 Q-6 -12 -11 -11 L-14 -11 L-14 -18 L-6 -18 Q3 -18 3 -10 L3 4Z", "#80aaa8");
  box(c, -17, -19, 7, 10, 2, brass, INK, 1.6);
  oval(c, -15, -14, 3.4, 4.5, INK);
  oval(c, -15.2, -14.5, 2, 2.8, glass);
  line(c, "M-4 -6 L2 -6 M-4 -3 L2 -3", INK, 1.3);
  contour(c, "M-9 4 L2 1 L11 5 L10 12 L4 16 L-5 16 L-11 10Z", "#5b97a1");
  contour(c, "M-9 8 Q-16 7 -18 12 L-10 14Z M9 7 Q15 5 18 9 L11 13Z", "#d7c28b", INK, 1.7);
  oval(c, 1, 8, 4.5, 3.6, INK);
  line(c, "M-1 8 L3 7", ORANGE, 1.7);
  box(c, -6, 14, 12, 4, 1.6, steel, INK, 1.4);
  line(c, "M9 2 L12 -5", INK, 1.5);
  oval(c, 12, -6, 2.1, 2.1, ORANGE, INK, 1);
}

function nacre(c) {
  contour(
    c,
    "M-5 9 Q-15 6 -18 -4 Q-20 -9 -15 -11 Q-15 -16 -10 -15 Q-7 -20 -3 -17 Q0 -22 4 -17 Q10 -20 12 -14 Q18 -15 17 -9 Q22 -7 18 -2 Q15 5 5 10Z",
    "#ddb5b4"
  );
  line(c, "M-12 -10 L-4 3 M-7 -14 L-2 2 M0 -15 L0 2 M7 -14 L2 2 M13 -9 L4 3", "#976f82", 1.35);
  line(c, "M-13 -8 L-10 -2 M9 -13 L7 -8", PAPER, 1.3);
  contour(c, "M-16 3 Q0 -1 16 3 Q14 11 4 14 L-5 14 Q-13 11 -16 3Z", "#60999c", INK, 2);
  oval(c, 0, 5, 6.5, 5.8, "#f3dfb6", INK, 1.4);
  lens(c, 0.8, 5.1, 3.3, "#cba2da");
  box(c, -6, 12, 12, 4.5, 2, steel, INK, 1.5);
}

function lumen(c) {
  line(c, "M-6 -9 L-6 -14 Q-6 -20 0 -20 Q6 -20 6 -14 L6 -9", INK, 3.5);
  line(c, "M-6 -12 L-6 -15 Q-5 -19 0 -19 Q5 -19 6 -14", brass, 1.4);
  contour(c, "M-10 -8 L10 -8 L13 7 L9 12 L-9 12 L-13 7Z", "#f0bc70");
  contour(c, "M-8 -5 L6 -5 L9 6 L6 9 L-7 9 L-10 5Z", "#ffe7a9", "#a87f49", 1.3);
  oval(c, 0, 2, 4.7, 4.5, "#eca953", INK, 1.3);
  oval(c, 0, 1.5, 2, 2, PAPER);
  line(c, "M-11 -6 L-6 10 M11 -6 L6 10", INK, 2);
  contour(c, "M-13 -9 L-7 -14 L7 -14 L13 -9 L11 -6 L-11 -6Z", "#397378", INK, 1.8);
  box(c, -12, 10, 24, 5, 2.2, "#397378", INK, 1.8);
  contour(c, "M-6 15 L0 19 L6 15Z", copper, INK, 1.3);
}

function nautile(c) {
  const feelers = "M11 4 Q15 -1 19 -2 M12 7 Q18 4 20 6 M11 10 Q16 12 19 10";
  line(c, feelers, INK, 3.8);
  line(c, feelers, brass, 1.6);
  contour(c, "M-14 6 Q-11 0 0 3 Q7 -6 13 -1 Q18 4 14 11 Q10 17 1 16 L-9 14Z", "#6eaaa7");
  contour(c, "M4 9 Q-2 15 -11 12 Q-19 9 -19 0 Q-19 -11 -9 -15 Q1 -19 7 -9 Q13 -1 4 9Z", "#dfa773");
  line(c, "M3 6 Q-7 13 -13 5 Q-18 -3 -10 -9 Q-3 -13 2 -6 Q5 0 0 3 Q-5 5 -7 1 Q-7 -3 -4 -3", "#805448", 2.45);
  line(c, "M-14 -6 Q-10 -13 -5 -13", PAPER, 1.4);
  lens(c, 10, 4, 3.7);
  line(c, "M3 13 L8 12", PAPER, 1.2);
}

function anguille(c) {
  contour(
    c,
    "M-16 10 Q-8 18 0 11 Q5 5 -2 4 Q-13 4 -13 -2 Q-14 -8 -4 -12 L1 -15 L9 -16 L15 -12 L19 -9 L16 -5 L7 -4 L1 -6 Q-3 -8 -5 -4 Q-6 -2 -1 -2 Q12 -1 10 8 Q9 15 2 18 Q-8 22 -16 14 L-20 16 L-18 10 L-18 7Z",
    "#6eb8a5"
  );
  contour(c, "M-3 -12 L-2 -19 L1 -16 L4 -18 L5 -15Z", "#dbad70", INK, 1.2);
  contour(c, "M6 -7 L16 -9 L18 -8 L15 -5 L8 -4Z", "#d7ddb6", null);
  lens(c, 10, -11, 3.1, "#ffe4a1");
  line(c, "M-9 -5 L-6 -2 M3 0 L4 4 M8 5 L4 6 M5 13 L3 10 M-6 18 L-5 15", "#396d72", 1.5);
  line(c, "M-12 16 Q-7 19 -3 17", PAPER, 1.2);
}

function alcyon(c) {
  contour(c, "M-11 -1 L-19 -2 L-16 4 L-20 8 L-11 9 L-7 13 Q1 15 9 7 L12 -1 L8 -8 L-1 -10Z", "#57939b");
  contour(c, "M-5 7 Q3 9 9 0 L9 6 Q4 15 -6 15 L-10 12Z", "#ce865a", INK, 1.3);
  contour(c, "M-15 -9 L-9 -15 L-3 -14 L2 -17 L9 -13 Q13 -10 12 -5 L8 0 L-1 -2 L-8 -6Z", "#79c2bb");
  contour(c, "M10 -9 L21 -7 L20 -6 L10 -3Z", brass, INK, 1.5);
  lens(c, 6, -9, 3.1, PAPER);
  contour(c, "M-2 -4 Q-11 -6 -18 2 L-19 7 L-10 5 L-12 9 Q-3 7 2 0Z", "#44788b", INK, 1.7);
  line(c, "M-14 4 L-6 0", "#a4d9c8", 1.4);
  line(c, "M-2 14 L-3 17 L1 17", INK, 1.8);
}

function luciole(c) {
  line(c, "M-6 -7 Q-12 -14 -17 -13 M-4 -8 Q-7 -16 -10 -17", INK, 1.8);
  oval(c, -17, -13, 1.6, 1.6, brass, INK, 0.9);
  contour(c, "M-1 -1 Q0 -14 11 -18 Q16 -18 14 -12 Q9 -2 3 2Z", "#add9c9", INK, 1.8);
  contour(c, "M0 2 Q-7 13 -16 11 Q-22 8 -15 3 Q-7 0 -1 -1Z", "#bcded3", INK, 1.8);
  line(c, "M3 -2 L11 -13 M-3 4 L-14 8", "#629298", 1.3);
  contour(c, "M1 0 Q9 0 15 8 Q20 16 15 18 Q8 19 1 11 L-2 5Z", "#ffdc82");
  line(c, "M5 3 Q2 7 1 9 M9 6 Q6 10 5 13 M13 10 L9 15", "#a77b4b", 1.6);
  oval(c, -1, 0, 6, 5.7, "#467472", INK, 1.6);
  oval(c, -6.5, -6, 6.1, 5.4, "#4a727b", INK, 1.8);
  lens(c, -8.5, -7, 3, MINT);
  line(c, "M-2 5 L-5 12 L-9 13 M4 9 L2 15 L0 16", INK, 1.4);
}

function compas(c) {
  box(c, -2.5, -20, 5, 8, 1.8, steel, INK, 1.5);
  contour(c, "M-6 -9 L-1 -6 L-11 12 L-15 17 L-14 9Z", brass);
  contour(c, "M3 -10 L7 -8 L14 10 L11 13 L5 5 L0 -4Z", "#78aaa7");
  contour(c, "M-11 10 L-13 16 L-17 19 L-15 12Z M10 10 L15 9 L17 18 L14 17Z", "#cdd8cc", INK, 1.4);
  line(c, "M-10 4 L10 3", INK, 2.1);
  box(c, -2, 0.8, 4.8, 5.5, 1.2, brass, INK, 1.2);
  oval(c, 0, -9, 7.4, 7, "#d9b376", INK, 1.9);
  lens(c, 0, -9, 4.3, "#8be2d0");
}

function meduse(c) {
  const cables =
    "M-12 1 Q-16 8 -13 12 Q-10 15 -14 17 M-5 2 Q-2 6 -6 11 Q-9 15 -6 19 M4 1 Q1 7 6 10 Q11 14 6 18 M11 1 Q15 4 13 8 Q11 12 16 14";
  line(c, cables, INK, 4);
  line(c, cables, "#86b3c2", 1.8);
  contour(
    c,
    "M-17 2 Q-18 -10 -8 -15 Q1 -20 10 -14 Q17 -10 18 1 Q15 6 11 3 Q7 7 3 3 Q-1 7 -6 3 Q-11 7 -13 3 Q-16 5 -17 2Z",
    "#aeaccb"
  );
  contour(c, "M-13 -4 Q-9 -13 -1 -13 Q-6 -9 -7 -4Z", "#d9dcdb", null);
  contour(c, "M-11 -2 Q0 -7 12 -2 L10 1 Q1 -2 -9 1Z", "#46677a", INK, 1.2);
  line(c, "M-6 -1 L-4 -2 M4 -2 L6 -1.4", "#a8f1de", 1.8);
  for (const [x, y] of [
    [-14, 17],
    [-6, 19],
    [6, 18],
    [16, 14]
  ])
    oval(c, x, y, 1.5, 1.5, brass, INK, 0.9);
}

function prisme(c) {
  contour(c, "M-11 1 L-16 -4 L-18 4 L-13 10 L-9 6Z M10 1 L16 -5 L18 3 L13 9 L9 6Z", "#7fb8b6", INK, 1.6);
  contour(c, "M-14 -5 L-6 -15 L5 -18 L13 -7 L11 6 L1 18 L-9 9Z", "#9986b5");
  contour(c, "M-13 -5 L-5 -14 L4 -16 L0 -8Z", "#e1cadf", null);
  contour(c, "M0 -8 L5 -17 L12 -7 L10 5 L4 9Z", "#b5b2d3", null);
  contour(c, "M-12 -4 L-7 9 L1 16 L-2 3Z", "#6c6e9b", null);
  line(c, "M-6 -14 L0 -8 L12 -7 M0 -8 L4 8 L1 16", "#716780", 1.2);
  contour(c, "M-11 -1 L10 -4 L10 0 L-9 4Z", INK, INK, 0.8);
  line(c, "M-6 1 L3 -1", "#b5ffe4", 1.8);
  oval(c, 1, 13, 1.7, 1.7, brass, INK, 1);
}

export const scouts = { manta, vigie, nacre, lumen, nautile, anguille, alcyon, luciole, compas, meduse, prisme };
