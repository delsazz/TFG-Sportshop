export const DEFAULT_SITE_CONFIG = {
    logoHeaderUrl: '/img/campusfp.png',
    logoFooterUrl: '/img/campusfp.png',
    logoLoginUrl: '/img/campusfp.png',
    logoHomeUrl: '/img/campusfp.png',
    logoAdminUrl: '/img/campusfp.png',
    bizumTelefono: '+34 600 000 000',
    bizumBancoUrl: 'https://www.bizum.es/bancos-bizum/',
    transferenciaTitular: 'Campus FP Uniformes',
    transferenciaIban: 'ES00 0000 0000 0000 0000 0000',
    transferenciaConcepto: 'Pedido {pedidoId} - Campus FP Uniformes',
    transferenciaNotas: 'Envia el justificante desde la pantalla de confirmacion del pedido.',
    tarjetaHabilitada: false,
    bizumHabilitado: true,
    transferenciaHabilitada: true,
    mostradorHabilitado: true,
};
export function resolveLogoUrl(value, fallback = '/img/campusfp.png') {
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
