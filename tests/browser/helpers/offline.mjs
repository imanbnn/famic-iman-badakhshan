export async function offlineContext(browser, options) {
  // WebKit's offline emulation also rejects file: navigations. Deny network
  // protocols explicitly so it can still read the local game from disk.
  const context = await browser.newContext({
    ...options,
    offline: browser.browserType().name() !== "webkit"
  });
  await context.route(/^https?:\/\//, (route) => route.abort("internetdisconnected"));
  return context;
}
