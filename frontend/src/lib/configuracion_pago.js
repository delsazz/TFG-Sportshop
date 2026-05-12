import { DEFAULT_SITE_CONFIG, getSiteConfig } from './configuracion_sitio';
export const DEFAULT_PAYMENT_CONFIG = {
    bizumTelefono: DEFAULT_SITE_CONFIG.bizumTelefono,
    bizumBancoUrl: DEFAULT_SITE_CONFIG.bizumBancoUrl,
    transferenciaTitular: DEFAULT_SITE_CONFIG.transferenciaTitular,
    transferenciaIban: DEFAULT_SITE_CONFIG.transferenciaIban,
    transferenciaConcepto: DEFAULT_SITE_CONFIG.transferenciaConcepto,
    transferenciaNotas: DEFAULT_SITE_CONFIG.transferenciaNotas,
    tarjetaHabilitada: DEFAULT_SITE_CONFIG.tarjetaHabilitada,
    bizumHabilitado: DEFAULT_SITE_CONFIG.bizumHabilitado,
    transferenciaHabilitada: DEFAULT_SITE_CONFIG.transferenciaHabilitada,
    mostradorHabilitado: DEFAULT_SITE_CONFIG.mostradorHabilitado,
};
export function formatPaymentConcept(template, pedidoId) {
    return template.replace('{pedidoId}', pedidoId || 'pendiente');
}
export async function getPaymentConfig() {
    try {
        const config = await getSiteConfig();
        return {
            bizumTelefono: config.bizumTelefono,
            bizumBancoUrl: config.bizumBancoUrl,
            transferenciaTitular: config.transferenciaTitular,
            transferenciaIban: config.transferenciaIban,
            transferenciaConcepto: config.transferenciaConcepto,
            transferenciaNotas: config.transferenciaNotas,
            tarjetaHabilitada: config.tarjetaHabilitada,
            bizumHabilitado: config.bizumHabilitado,
            transferenciaHabilitada: config.transferenciaHabilitada,
            mostradorHabilitado: config.mostradorHabilitado,
        };
    }
    catch {
        return DEFAULT_PAYMENT_CONFIG;
    }
}

