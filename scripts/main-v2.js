document.addEventListener("DOMContentLoaded", () => {
  // 🔙 Botón volver
  document.querySelectorAll("#btn-volver-fisica, #btn-volver-logica").forEach(btn => {
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

  // 🔗 Endpoints
  const urlResumen = "https://script.google.com/macros/s/AKfycby03FtUdUoGVw7r9CdZD0Za6lKwczve2CcuGaGmzSpwjzLKfJWxHlf3KQEsajwcJ5jT/exec";
  const urlLogico = "https://script.google.com/macros/s/AKfycby03FtUdUoGVw7r9CdZD0Za6lKwczve2CcuGaGmzSpwjzLKfJWxHlf3KQEsajwcJ5jT/exec";

  // 🔧 Normalizar texto
  const normalizar = str =>
    String(str || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, "")
      .replace(/\s+/g, "")
      .trim();

  // ✅ Funciones para calcular avances globales
  function calcularAvanceFisicoGlobal(resumen) {
    const porcentajes = resumen.map(r => Number(r.porcentaje || 0));
    const promedio = porcentajes.length > 0
      ? Math.round(porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length)
      : 0;
    document.getElementById("avance-fisico-global").textContent = `${promedio}%`;
    document.getElementById("loading-fisico").style.display = "none"; // 👈 Añade esta línea
    return promedio;
      
  }


  function calcularAvanceLogicoGlobal(avanceLogico) {
  const porcentajes = avanceLogico.map(p => Number(p.promedio || 0));
  const promedio = porcentajes.length > 0
    ? Math.round(porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length)
    : 0;

  document.getElementById("avance-logico-global").textContent = `${promedio}%`;
  document.getElementById("loading-logico").style.display = "none";
  return promedio;
}
      
  //  Avance global visual (físico + lógico)
  function mostrarAvanceGlobal() {
    const promedioFisico = calcularAvanceFisicoGlobal(window._resumen || []);
    const promedioLogico = calcularAvanceLogicoGlobal(window._avanceLogico || []);
    const promedioGlobal = Math.round((promedioFisico + promedioLogico) / 2);

    const avanceGlobal = document.getElementById("avance-global");
    avanceGlobal.innerHTML = `
      <strong>Avance global: ${promedioGlobal}%</strong><br>
      <span style="color:#e74c3c">🔴 Menor al 50%</span> 
      <span style="color:#f39c12">🟠 Entre 50% y 99%</span> 
      <span style="color:#2ecc71">🟢 100% completado</span>
    `;
  }
// ✅ Ocultar mensaje de carga
  document.getElementById("loading-global").style.display = "none";

  //  Cargar datos físicos
  fetch(urlResumen)
    .then(res => res.json())
    .then(data => {
      const { equipos, resumen } = data;
      window._resumen = resumen;
      calcularAvanceFisicoGlobal(resumen);
      mostrarAvanceGlobal();

      //  Parte física
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

      //  Parte lógica (barras predefinidas)
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

      //  Parte resumen por tipo y planta
      document.querySelectorAll(".barra-resumen").forEach(b => {
        const tipoHTML = normalizar(b.dataset.tipo);
        const plantaHTML = normalizar(b.dataset.planta);
        const barra = b.querySelector("progress");
        const texto = b.querySelector(".porcentaje");

        const fila = resumen.find(r =>
          normalizar(r.tipo) === tipoHTML && normalizar(r.planta) === plantaHTML
        );

        if (!fila) {
          texto.textContent = "Sin datos";
          barra.value = 0;
          barra.style.backgroundColor = "#cccccc";
          return;
        }

        const porcentaje = Number(fila.porcentaje || 0);
        barra.max = 100;
        barra.value = porcentaje;
        texto.textContent = `${porcentaje}%`;
        barra.classList.toggle("completado", porcentaje === 100);

        if (porcentaje === 0) barra.style.backgroundColor = "#ff0000";
        else if (porcentaje <= 25) barra.style.backgroundColor = "#ff8c00";
        else if (porcentaje <= 50) barra.style.backgroundColor = "#ffd700";
        else if (porcentaje <= 75) barra.style.backgroundColor = "#90ee90";
        else barra.style.backgroundColor = "#008000";
      });

      //  Avance por planta
      const plantasFijas = ["SOTANO", "BAJA", "PRIMERA", "SEGUNDA", "TERCERA", "CUARTA A", "CUARTA B", "CUBIERTA"];
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

          let color = promedio === 100 ? "green" : promedio >= 50 ? "orange" : "red";
          tarjeta.style.borderLeft = `6px solid ${color}`;
        }
      });
    })
    .catch(err => {


     // Avance global visual (físico + lógico)
function mostrarAvanceGlobal() {
  const promedioFisico = calcularAvanceFisicoGlobal(window._resumen || []);
  const promedioLogico = calcularAvanceLogicoGlobal(window._avanceLogico || []);
  const promedioGlobal = Math.round((promedioFisico + promedioLogico) / 2);

  const avanceGlobal = document.getElementById("avance-global");
  avanceGlobal.innerHTML = `
    <strong>Avance global: ${promedioGlobal}%</strong><br>
    <span style="color:#e74c3c">🔴 Menor al 50%</span> 
    <span style="color:#f39c12">🟠 Entre 50% y 99%</span> 
    <span style="color:#2ecc71">🟢 100% completado</span>
  `;
} // ✅ cierre correcto de la función


    })
    .catch(err => {
      console.error("❌ Error al cargar datos físicos:", err);
    });

  // 📥 Cargar avance lógico por planta
fetch(urlLogico)
  .then(res => res.json())
  .then(data => {
    window._avanceLogico = data.avanceLogico;
    const avanceLogico = window._avanceLogico;

    mostrarAvanceGlobal();

    const contenedorLogico = document.getElementById("dashboard-logica");
    const seccionLogica = document.getElementById("avance-logico");
    seccionLogica.innerHTML = "";

    calcularAvanceLogicoGlobal(avanceLogico);

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
        etiqueta.textContent = fase;

        const barra = document.createElement("progress");
        barra.max = 100;
        const valorNumerico = Number(valor);
        barra.value = valorNumerico;

        const texto = document.createElement("span");
        texto.className = "porcentaje";
        texto.textContent = `${valorNumerico}%`;

        if (valorNumerico === 100) {
          barra.classList.add("barra-verde");
        } else if (valorNumerico >= 50) {
          barra.classList.add("barra-naranja");
        } else if (valorNumerico > 0) {
          barra.classList.add("barra-roja");
        } else {
          barra.classList.add("barra-gris");
        }

        grupo.appendChild(etiqueta);
        grupo.appendChild(barra);
        grupo.appendChild(texto);
        tarjeta.appendChild(grupo);
      });

      const resumen = document.createElement("p");
      resumen.className = "resumen-promedio";
      resumen.textContent = `Avance lógico global: ${planta.promedio}%`;

      if (planta.promedio === 100) {
        tarjeta.style.borderLeft = "6px solid #2ecc71";
      } else if (planta.promedio >= 50) {
        tarjeta.style.borderLeft = "6px solid #ff9800";
      } else {
        tarjeta.style.borderLeft = "6px solid #f44336";
      }

      tarjeta.appendChild(resumen);
      seccionLogica.appendChild(tarjeta);
    });
  })
  .catch(err => {
    console.error("❌ Error al cargar avance lógico por planta:", err);
  });

// ✅ Cierre final del bloque principal
});
// ✅ Instalación de la PWA desde el botón del icono
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.getElementById('btn-instalar');
  if (installBtn) {
    installBtn.style.display = 'inline-block';

    installBtn.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') {
          console.log('✅ Dashboard Vallecas instalado');
        }
        deferredPrompt = null;
      });
    });
  }
});










