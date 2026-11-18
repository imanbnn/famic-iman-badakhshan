import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";

const root = new URL("../", import.meta.url);
const source = new URL("src/", root);
const read = (url) => readFile(url, "utf8");
const moduleUrl = (code) => "data:text/javascript;base64," + Buffer.from(code).toString("base64");

async function javascriptModules(directory) {
  const modules = new Map();
  for (const path of (await readdir(directory, { recursive: true })).sort()) {
    if (!path.endsWith(".js")) continue;
    const name = path.replaceAll("\\", "/");
    modules.set("#" + name.slice(0, -".js".length), await read(new URL(name, directory)));
  }
  return modules;
}

// Module workers do not inherit the document's import map.
function workerModule(id, modules) {
  const code = modules
    .get(id)
    .replace(
      /\bfrom\s+"(#[\w/-]+)"/g,
      (_, dependency) => "from " + JSON.stringify(workerModule(dependency, modules))
    );
  return moduleUrl(code);
}

async function scripts() {
  const modules = await javascriptModules(source);
  const imports = {};
  for (const [id, code] of modules) {
    imports[id] = id === "#audio/music-worker" ? workerModule(id, modules) : moduleUrl(code);
  }
  return (
    '<script type="importmap">\n' +
    JSON.stringify({ imports }, null, 2) +
    '\n</script>\n<script type="module">import "#app/main";</script>'
  );
}

async function stylesheet() {
  const manifest = new URL("styles/game.css", source);
  const imports = [...(await read(manifest)).matchAll(/@import "([^"]+)";/g)];
  const files = await Promise.all(imports.map(([, path]) => read(new URL(path, manifest))));
  return (
    '<link rel="stylesheet" href="data:text/css;base64,' + Buffer.from(files.join("\n")).toString("base64") + '">'
  );
}

async function page() {
  const template = await read(new URL("index.html", source));
  const placeholders = [...template.matchAll(/<!-- view: ([\w/-]+) -->/g)];
  const sections = new Map(
    await Promise.all(
      placeholders.map(async ([placeholder, name]) => {
        const html = await read(new URL("views/" + name + ".html", source));
        return [placeholder, html.trim().replace(/\n[ \t]*/g, " ")];
      })
    )
  );
  const [css, js] = await Promise.all([stylesheet(), scripts()]);
  sections.set("<!-- styles -->", css);
  sections.set("<!-- game -->", js);
  return template.replace(/<!-- (?:view: [\w/-]+|styles|game) -->/g, (placeholder) => sections.get(placeholder));
}

const output = new URL("dist/", root);
await mkdir(output, { recursive: true });
await writeFile(new URL("index.html", output), await page());
