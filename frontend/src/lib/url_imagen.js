const base = import.meta.env.BASE_URL;
export function resolveImageUrl(path) {
    const img = path?.trim();
    if (!img)
        return '';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:'))
        return img;
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = img.startsWith('/') ? img.substring(1) : img;
    return `${cleanBase}${cleanPath}`;
}
