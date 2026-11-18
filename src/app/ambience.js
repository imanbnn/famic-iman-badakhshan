import { Sound } from "#audio/playback";
import { Tide } from "#render/harbour/water";
import { byId } from "#ui/dom";
import { showSettings } from "#ui/setup/control-labels";
import { savePreferences } from "#app/preferences";

export function wireAmbience(prefs, current) {
  const sound = new Sound();
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function syncMusic() {
    const { stage } = current();
    const audible =
      prefs.sound &&
      prefs.music &&
      document.body.dataset.pilot === "playing" &&
      !document.hidden &&
      !document.querySelector("dialog[open]");
    sound.music(Boolean(audible), stage);
  }

  const harbourWater = new Tide(byId("departure-water"));
  harbourWater.fitPoster();
  function updateWater() {
    const { chart, session } = current();
    const moving = !motion.matches && !document.hidden && !document.querySelector("dialog[open]");
    harbourWater.run(moving && !byId("launch").hidden);
    chart?.tide.run(moving && !session.state.won);
  }

  byId("sound").onclick = () => {
    prefs.sound = !prefs.sound;
    savePreferences(prefs);
    showSettings(prefs);
    if (prefs.sound) sound.play("swap", true, current().session?.state.active);
    else sound.mute();
    syncMusic();
  };
  for (const toggle of document.querySelectorAll("[data-music]"))
    toggle.onclick = () => {
      prefs.music = !prefs.music;
      if (prefs.music) prefs.sound = true;
      savePreferences(prefs);
      showSettings(prefs);
      syncMusic();
    };
  document.addEventListener("visibilitychange", refresh);
  motion.addEventListener("change", () => {
    updateWater();
    const { chart, session } = current();
    if (motion.matches && chart) chart.highlight(session.state, chart.highlights);
  });
  const dialogState = new MutationObserver(refresh);
  for (const dialog of document.querySelectorAll("dialog"))
    dialogState.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  function refresh() {
    updateWater();
    syncMusic();
  }
  function playEffect(event, hero, moves) {
    sound.play(event, prefs.sound, hero, moves);
  }
  return { motion, updateWater, syncMusic, playEffect };
}
