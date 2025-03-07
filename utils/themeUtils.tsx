// utils/themeUtils.ts
export const getThemeFromCookie = (req: any): string => {
    const cookie = req.headers.cookie;
    if (!cookie) return 'light'; // Default to light theme
    const match = cookie.match(/(^| )theme=([^;]+)/);
    return match ? match[2] : 'light';
  };
  
  export const setThemeInCookie = (theme: string): void => {
    document.cookie = `theme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year expiration
  };
  