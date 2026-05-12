export const getPedidosAlumno = async () => {
    const token = sessionStorage.getItem("token");
    const res = await fetch("http://localhost:3000/api/pedidos", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.json();
};
