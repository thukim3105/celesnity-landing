/**
 * No-flash theme initialiser. Runs before paint and sets the `dark` class on
 * <html> from localStorage, defaulting to dark (the galaxy theme). Kept as a
 * blocking inline script so there is never a flash of the wrong theme.
 *
 * Server component — renders a raw <script> tag, no client JS bundle.
 */
export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark', t? t==='dark' : true);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
