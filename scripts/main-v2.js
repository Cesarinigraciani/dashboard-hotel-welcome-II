document.addEventListener("DOMContentLoaded", () => {
  // 🔙 Botón volver
  document.querySelectorAll("#btn-volver").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("dashboard-fisica").style.display = "none";
      document.getElementById("dashboard-logica").style.display = "none";
      document.getElementById("inicio-dashboard").style.display = "block";
    });
  });

  // 🔘 Activar vistas
  document.getElementById("btn-fisica").addEventListener("click", () => {
    document.getElementById("inicio-dashboard").style.display = "none";
    document.getElementById("dashboard-fisica").style.display = "block";
    document.getElementById("dashboard-logica").style.display = "none";
  });

  document.getElementById("btn-logica").addEventListener("click", () => {
    document.getElementById("inicio-dashboard").style.display = "none";
    document.getElementById("dashboard-logica").style.display = "block";
    document.getElementById("dashboard-fisica").style.display = "none";
  });

  // 🔗 URL de tu hoja de datos
  const urlDatos = "https://script.google.com/macros/s/AKfycby3SIcs2eiWzyDX-SSs42fdZJMhyCq13U0TRXjB1qF9wa2BUtJgrJrDCS3boGhot0nb/exec";

  // 🔧 Función segura para normalizar texto
  const normalizar = str =>
  String(str || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // quita tildes
    .replace(/[^A-Z0-9]/g, "")       // reemplaza guiones, signos, etc. por espacio
    .replace(/\s+/g, "")             // normaliza espacios múltiples
    .trim();

console.log("🔍 Comparando:", normalizar("CUARTA B"), normalizar("cuarta   b"));


  // 📦 Cargar datos y procesar
  fetch(urlDatos)
    .then(res => res.json())
    .then(data => {
      console.log("✅ Datos recibidos:", data);
      const { equipos, resumen } = data;
       window._resumen = resumen;

      console.log("📊 RESUMEN recibido:", resumen);
     console.log("📄 Copia del resumen:", JSON.stringify(resumen, null, 2));
window._resumen = resumen;

// 🧪 Validación de plantas únicas
const plantasUnicas = [...new Set(resumen.map(r => r.planta))];
console.log("🧪 Plantas únicas en resumen:", plantasUnicas);

      console.log("📄 Copia del resumen:", JSON.stringify(resumen, null, 2));

      // 🔧 Parte física
      document.querySelectorAll(".fase").forEach(fase => {
        const tipo = normalizar(fase.dataset.tipo);
        const barra = fase.querySelector("progress");
        const texto = fase.querySelector(".porcentaje");

        if (tipo === "LAZO") {
          barra.max = 6;
          barra.value = 6;
          texto.textContent = "100%";
          barra.classList.add("completado");
          return;
        }

        const filtrados = equipos.filter(e => normalizar(e.points_type) === tipo);
        const instalados = filtrados.filter(e =>
          ["INSTALADO", "VERIFICADO", "PROBADO"].includes(normalizar(e.comment))
        );

        const hechos = instalados.length;
        const total = filtrados.length;
        const porcentaje = total > 0 ? Math.round((hechos / total) * 100) : 0;

        barra.max = total;
        barra.value = hechos;
        texto.textContent = `${porcentaje}%`;
        barra.classList.toggle("completado", porcentaje === 100);
      });

      // 🔧 Parte lógica
      document.querySelectorAll(".fase-logica").forEach(fase => {
        const estado = normalizar(fase.dataset.estado);
        const barra = fase.querySelector("progress");
        const texto = fase.querySelector(".porcentaje");

        const filtrados = equipos.filter(e => normalizar(e.comment) === estado);
        const total = filtrados.length;
        const porcentaje = total > 0 ? 100 : 0;

        barra.max = total;
        barra.value = total;
        texto.textContent = `${porcentaje}%`;
        barra.classList.toggle("completado", porcentaje === 100);
      });

     // 📊 Parte resumen por tipo y planta
document.querySelectorAll(".barra-resumen").forEach(b => {
  const tipoHTML = normalizar(b.dataset.tipo);
  const plantaHTML = normalizar(b.dataset.planta);
  const barra = b.querySelector("progress");
  const texto = b.querySelector(".porcentaje");

  console.log(`🔍 Buscando tipo=${tipoHTML}, planta=${plantaHTML}`);

  const fila = resumen.find(r => {
    const tipoJSON = normalizar(r.tipo);
    const plantaJSON = normalizar(r.planta);
    return tipoJSON === tipoHTML && plantaJSON === plantaHTML;
  });

  if (!fila) {
    console.warn(`❌ No se encontró fila para tipo=${tipoHTML}, planta=${plantaHTML}`);
    texto.textContent = "Sin datos";
    barra.value = 0;
    barra.style.backgroundColor = "#cccccc";
    return; // ⛔ Evita seguir ejecutando si no hay datos
  }

  const porcentaje = Number(fila.porcentaje || 0);
  barra.max = 100;
  barra.value = porcentaje;
  texto.textContent = `${porcentaje}%`;

  barra.classList.toggle("completado", porcentaje === 100);

  // 🎨 Colores motivadores
  if (porcentaje === 0) barra.style.backgroundColor = "#ff0000";
  else if (porcentaje <= 25) barra.style.backgroundColor = "#ff8c00";
  else if (porcentaje <= 50) barra.style.backgroundColor = "#ffd700";
  else if (porcentaje <= 75) barra.style.backgroundColor = "#90ee90";
  else barra.style.backgroundColor = "#008000";

  console.log(`🎯 Coincidencia: ${tipoHTML} – ${plantaHTML} → ${porcentaje}%`);
});



      // 🧮 Avance por planta
      const plantasFijas = ["SOTANO", "BAJA","PRIMERA", "SEGUNDA", "TERCERA", "CUARTA A", "CUARTA B", "CUBIERTA"];
      const contenedorTarjetas = document.getElementById("contenedor-tarjetas");

      plantasFijas.forEach(planta => {
        const datosPlanta = resumen.filter(r => normalizar(r.planta) === normalizar(planta));
        const porcentajes = datosPlanta.map(r => Number(r.porcentaje || 0));
        const promedio = porcentajes.length > 0 ? Math.round(porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length) : 0;

        const tarjeta = [...contenedorTarjetas.querySelectorAll(".tarjeta-planta")]
  .find(t => normalizar(t.getAttribute("data-planta")) === normalizar(planta));

        if (tarjeta) {
          let indicador = tarjeta.querySelector(".indicador-planta");
          if (!indicador) {
            indicador = document.createElement("div");
            indicador.className = "indicador-planta";
            indicador.style.marginBottom = "8px";
            indicador.style.fontWeight = "bold";
            tarjeta.insertBefore(indicador, tarjeta.firstChild.nextSibling);
          }
          indicador.textContent = `Avance planta: ${promedio}%`;

          // 🎨 Color motivador
          const completadas = datosPlanta.filter(t => t.porcentaje === 100).length;
const enProgreso = datosPlanta.filter(t => t.porcentaje > 0 && t.porcentaje < 100).length;
const sinIniciar = datosPlanta.filter(t => t.porcentaje === 0).length;

let color = "";
if (promedio === 100) {
  color = "green";
} else if (promedio >= 50) {
  color = "orange";
} else {
  color = "red";
}


if (color) {
  tarjeta.style.borderLeft = `6px solid ${color}`;
}

        }
      });

      // 🧮 Avance global
      const totalGlobal = resumen.reduce((sum, r) => sum + Number(r.porcentaje || 0), 0);
      const promedioGlobal = resumen.length > 0 ? Math.round(totalGlobal / resumen.length) : 0;
      const avanceGlobal = document.getElementById("avance-global");
avanceGlobal.innerHTML = `
  <strong>Avance global: ${promedioGlobal}%</strong><br>
  <span style="color:#e74c3c">🔴 Menor al 50%</span> 
  <span style="color:#f39c12">🟠 Entre 50% y 99%</span> 
  <span style="color:#2ecc71">🟢 100% completado</span>
`;

    })
    .catch(err => {
      console.error("❌ Error al cargar datos:", err);
    });
});

// 📥 Cargar avance lógico PCI desde Apps Script
fetch("https://script.google.com/macros/s/1xBiUr1c9NSU1WpOch-Om0odpQz29K-_8Y6jGzxpqX_Y/exec")
  .then(res => res.json())
  .then(data => {
    const avanceLogico = data.avanceLogico; // ← extraemos la propiedad correcta

    const contenedorLogico = document.getElementById("dashboard-logica");
    const seccionLogica = document.createElement("div");
    seccionLogica.id = "avance-logico";
    contenedorLogico.appendChild(seccionLogica);

    avanceLogico.forEach(planta => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-planta";
      tarjeta.setAttribute("data-planta", planta.planta);

      const titulo = document.createElement("h3");
      titulo.textContent = `Planta: ${planta.planta}`;
      tarjeta.appendChild(titulo);

      Object.entries(planta.fases).forEach(([fase, valor]) => {
        const grupo = document.createElement("div");
        grupo.className = "grupo-fase";

        const etiqueta = document.createElement("span");
        etiqueta.textContent = fase.replace(/_/g, " ").toUpperCase();

        const barra = document.createElement("progress");
        barra.max = 100;
        barra.className = "barra-logica";

        // 🌀 Animación progresiva
        let progreso = 0;
        const intervalo = setInterval(() => {
          if (progreso >= valor) {
            clearInterval(intervalo);
          } else {
            progreso++;
            barra.value = progreso;
          }
        }, 10);

        const texto = document.createElement("span");
        texto.className = "porcentaje";
        texto.textContent = `${valor}%`;

        // 🎨 Color motivador
        if (valor === 0) barra.style.backgroundColor = "#ff0000";
        else if (valor < 50) barra.style.backgroundColor = "#ff8c00";
        else if (valor < 100) barra.style.backgroundColor = "#ffd700";
        else barra.style.backgroundColor = "#2ecc71";

        grupo.appendChild(etiqueta);
        grupo.appendChild(barra);
        grupo.appendChild(texto);
        tarjeta.appendChild(grupo);
      });

      const resumen = document.createElement("p");
      resumen.className = "resumen-promedio";
      resumen.textContent = `Avance lógico global: ${planta.promedio}%`;

      if (planta.promedio === 100) tarjeta.style.borderLeft = "6px solid #2ecc71";
      else if (planta.promedio >= 50) tarjeta.style.borderLeft = "6px solid #ff9800";
      else tarjeta.style.borderLeft = "6px solid #f44336";

      tarjeta.appendChild(resumen);
      seccionLogica.appendChild(tarjeta);
    });
  })
  .catch(err => {
    console.error("❌ Error al cargar avance lógico por planta:", err);
  });


