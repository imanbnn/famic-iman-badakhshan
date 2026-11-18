import { emptyTrack, scoreBar, BAR_COUNT, harbourReflection } from "#audio/score";

globalThis.onmessage = () => {
  const track = emptyTrack();
  for (let bar = 0; bar < BAR_COUNT; bar++) scoreBar(track, bar);
  harbourReflection(track);
  globalThis.postMessage(track, [track.left.buffer, track.right.buffer]);
};
