const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('wanderlove-theme-mode');
    var mode = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

// Rendered inside <head>. Runs synchronously before the page paints so the
// person never sees a flash of the wrong theme on load.
export function ThemeModeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
