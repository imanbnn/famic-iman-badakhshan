import test from "node:test";
import assert from "node:assert/strict";
import { FLEET, FLEET_SIZE, crewName, readCrew } from "#game/crew";
import { haulers } from "#render/robots/haulers";
import { scouts } from "#render/robots/scouts";
import { t, useCrew } from "#i18n/translate";
import { pointAt } from "#game/pointer";
import { Session } from "#game/session";
import { LEVELS } from "#game/levels";

test("Les 24 modèles ont chacun une identité, une illustration et un poste", () => {
  const robots = Object.values(FLEET).flat();
  assert.equal(FLEET_SIZE, 24);
  assert.equal(FLEET.lest.length, 12);
  assert.equal(FLEET.sonde.length, 12);
  assert.equal(new Set(robots.map((robot) => robot.name)).size, FLEET_SIZE);
  assert.deepEqual(
    robots.map((robot) => robot.id).sort(),
    ["lest", "sonde", ...Object.keys({ ...haulers, ...scouts })].sort()
  );
  assert.ok(Object.values({ ...haulers, ...scouts }).every((draw) => typeof draw === "function"));
});

test("Les 144 équipages sont mémorisables et une ancienne sauvegarde garde ses robots par défaut", () => {
  for (const hauler of FLEET.lest) {
    for (const scout of FLEET.sonde) {
      const pair = { lest: hauler.id, sonde: scout.id },
        crew = readCrew(pair);
      assert.deepEqual(crew, pair);
      assert.equal(crewName(crew, "lest"), hauler.name);
      assert.equal(crewName(crew, "sonde"), scout.name);
    }
  }
  assert.deepEqual(readCrew(), { lest: "lest", sonde: "sonde" });
  assert.deepEqual(readCrew({ lest: "manta", sonde: "nacre" }), { lest: "lest", sonde: "nacre" });
  assert.deepEqual(readCrew({ lest: "rivet", sonde: "unknown" }), { lest: "rivet", sonde: "sonde" });
});

test("Les inspections, les indices et les obstacles nomment les robots choisis", () => {
  useCrew({ lest: "etrille", sonde: "manta" });
  try {
    const game = new Session({ map: ["LnSv"], reserve: 1 });
    assert.match(t(pointAt(game.board, game.state, 3).text), /Manta/);
    assert.match(t(game.input("right").message), /Manta/);
    assert.match(t(LEVELS[2].hints.at(-1)[1]), /Étrille/);
  } finally {
    useCrew(readCrew());
  }
});
