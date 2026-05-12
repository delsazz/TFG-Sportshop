import { getToken, getAuthEmail } from '../lib/almacenamiento_autenticacion';
import { DEFAULT_SITE_CONFIG } from '../lib/configuracion_sitio';
function buildHeaders() {
    const token = getToken();
    const userEmail = getAuthEmail();
    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userEmail ? { 'X-User-Email': userEmail } : {}),
    };
}
async function parseResponse(response) {
    if (response.ok) {
        return response.json();
    }
    const message = await response.text();
    throw new Error(message || 'No se pudo guardar la configuracion');
}
export async function updateSiteConfiguration(payload) {
    const formData = new FormData();
    formData.append('config', new Blob([
        JSON.stringify({
            bizumTelefono: payload.bizumTelefono,
            bizumBancoUrl: payload.bizumBancoUrl,
            transferenciaTitular: payload.transferenciaTitular,
            transferenciaIban: payload.transferenciaIban,
            transferenciaConcepto: payload.transferenciaConcepto,
            transferenciaNotas: payload.transferenciaNotas,
            tarjetaHabilitada: payload.tarjetaHabilitada,
            bizumHabilitado: payload.bizumHabilitado,
            transferenciaHabilitada: payload.transferenciaHabilitada,
            mostradorHabilitado: payload.mostradorHabilitado,
        }),
    ], { type: 'application/json' }));
    if (payload.logoHeaderFile)
        formData.append('logoHeader', payload.logoHeaderFile);
    if (payload.logoFooterFile)
        formData.append('logoFooter', payload.logoFooterFile);
    if (payload.logoLoginFile)
        formData.append('logoLogin', payload.logoLoginFile);
    if (payload.logoHomeFile)
        formData.append('logoHome', payload.logoHomeFile);
    if (payload.logoAdminFile)
        formData.append('logoAdmin', payload.logoAdminFile);
    const response = await fetch('/api/configuracion/admin', {
        method: 'PUT',
        headers: buildHeaders(),
        body: formData,
    });
    return {
        ...DEFAULT_SITE_CONFIG,
        ...(await parseResponse(response)),
    };
}

