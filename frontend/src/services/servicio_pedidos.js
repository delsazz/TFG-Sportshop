export const getPedidosAlumno = async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/pedidos", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.json();
};
