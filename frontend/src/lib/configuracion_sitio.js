export const DEFAULT_SITE_CONFIG = {
    logoHeaderUrl: '/img/sportshop.jpg',
    logoFooterUrl: '/img/sportshop.jpg',
    logoLoginUrl: '/img/sportshop.jpg',
    logoHomeUrl: '/img/sportshop.jpg',
    logoAdminUrl: '/img/sportshop.jpg',
    bizumTelefono: '+34 600 000 000',
    bizumBancoUrl: 'https://www.bizum.es/bancos-bizum/',
    transferenciaTitular: 'SportShop',
    transferenciaIban: 'ES00 0000 0000 0000 0000 0000',
    transferenciaConcepto: 'Pedido {pedidoId} - SportShop',
    transferenciaNotas: 'Envia el justificante desde la pantalla de confirmacion del pedido.',
    tarjetaHabilitada: false,
    bizumHabilitado: true,
    transferenciaHabilitada: true,
    mostradorHabilitado: true,
};
export function resolveLogoUrl(value, fallback = '/img/sportshop.jpg') {
    const normalized = value?.trim();
    return normalized ? normalized : fallback;
}
export async function getSiteConfig() {
    const response = await fetch('/api/configuracion');
    if (!response.ok) {
        return DEFAULT_SITE_CONFIG;
    }
    return {
        ...DEFAULT_SITE_CONFIG,
        ...(await response.json()),
    };
}
