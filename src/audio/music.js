import { emptyTrack, scoreBar, BAR_COUNT, harbourReflection } from "#audio/score";

async function workerTrack() {
  const worker = new Worker(import.meta.resolve("#audio/music-worker"), {
    type: "module",
    name: "contreflot-musique"
  });
  try {
    return await new Promise((resolve, reject) => {
      worker.onmessage = (event) => resolve(event.data);
      worker.onerror = (event) => {
        event.preventDefault();
        reject(new Error("Musique hors thread indisponible"));
      };
      worker.onmessageerror = reject;
      worker.postMessage("render");
    });
  } finally {
    worker.terminate();
  }
}

export async function composeMusic() {
  if (typeof Worker === "function") {
    try {
      return await workerTrack();
    } catch {
      /* Some offline browsers restrict module workers. */
    }
  }
  const track = emptyTrack();
  for (let bar = 0; bar < BAR_COUNT; bar++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    scoreBar(track, bar);
  }
  harbourReflection(track);
  return track;
}
