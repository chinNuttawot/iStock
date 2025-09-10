export const filenameFromUri = (uri: string, fallback = ""): string => {
    if (!uri) return fallback;
    const clean = uri.split(/[?#]/)[0];                 // ตัด ?query และ #hash
    const last = clean.substring(clean.lastIndexOf("/") + 1);
    try {
        return decodeURIComponent(last) || fallback;      // เผื่อมี %20 ฯลฯ
    } catch {
        return last || fallback;
    }
};