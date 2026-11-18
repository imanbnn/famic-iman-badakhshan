import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname } from "node:path";
import test from "node:test";

const root = new URL("../../", import.meta.url);
const folders = ["src", "tests", "tools", "dist", ".github"];
const textFiles = new Set([".js", ".mjs", ".css", ".html", ".md", ".json", ".yml"]);
const MAX_FILE_LINES = 300;

async function filesIn(folder) {
  return (await readdir(new URL(folder + "/", root), { recursive: true }))
    .map((path) => folder + "/" + path.replaceAll("\\", "/"))
    .filter((path) => textFiles.has(extname(path)));
}

test("Les sources, les tests et le fichier livré restent sous la limite de 300 lignes", async () => {
  const paths = (await Promise.all(folders.map(filesIn))).flat();
  paths.push("README.md", "package.json");
  for (const path of paths) {
    const source = await readFile(new URL(path, root), "utf8");
    const count = source.split(/\r?\n/).length - Number(source.endsWith("\n"));
    assert.ok(count <= MAX_FILE_LINES, path + " contient " + count + " lignes");
  }
});

test("Chaque module du jeu est utilisé par le démarrage ou le moteur audio", async () => {
  const paths = (await filesIn("src")).filter((path) => path.endsWith(".js"));
  const modules = new Map(
    await Promise.all(
      paths.map(async (path) => [
        "#" + path.slice("src/".length, -".js".length),
        await readFile(new URL(path, root), "utf8")
      ])
    )
  );
  const reached = new Set();
  function follow(id) {
    if (reached.has(id)) return;
    assert.ok(modules.has(id), "Import inconnu " + id);
    reached.add(id);
    for (const [, dependency] of modules.get(id).matchAll(/(?:from\s+|import\.meta\.resolve\()"([#][\w/-]+)"/g)) {
      follow(dependency);
    }
  }
  follow("#app/main");
  assert.deepEqual(
    [...modules.keys()].filter((id) => !reached.has(id)),
    []
  );
});
