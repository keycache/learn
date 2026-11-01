export function SkipToContentLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.tabIndex = -1;
      mainContent.focus();
      mainContent.addEventListener('blur', () => {
        mainContent.tabIndex = -1;
      });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 dark:focus:bg-blue-500 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Skip to main content
    </a>
  );
}
