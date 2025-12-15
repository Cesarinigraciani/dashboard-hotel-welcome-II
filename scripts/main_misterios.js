document.addEventListener('DOMContentLoaded', function () {
  // 🔙 Botones volver
  document.querySelectorAll('#btn-volver-fisica, #btn-volver-logica').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.getElementById('dashboard-fisica').style.display = 'none';
      document.getElementById('dashboard-logica').style.display = 'none';
      document.getElementById('inicio-dashboard').style.display = 'block';
      ocultarMenuInforme();
    });
  });

  // 🔘 Activar vistas
  var btnFisica = document.getElementById('btn-fisica');
  var btnLogica = document.getElementById('btn-logica');

  if (btnFisica) {
    btnFisica.addEventListener('click', function () {
      document.getElementById('inicio-dashboard').style.display = 'none';
      document.getElementById('dashboard-fisica').style.display = 'block';
      document.getElementById('dashboard-logica').style.display = 'none';
      ocultarMenuInforme();
    });
  }

  if (btnLogica) {
    btnLogica.addEventListener('click', function () {
      document.getElementById('inicio-dashboard').style.display = 'none';
      document.getElementById('dashboard-logica').style.display = 'block';
      document.getElementById('dashboard-fisica').style.display = 'none';
      ocultarMenuInforme();
    });
  }

  // 📄 Botón Crear informe
  var btnInforme = document.getElementById('btn-informe');
  var menuInforme = document.getElementById('menu-informe');
  if (btnInforme && menuInforme) {
    btnInforme.addEventListener('click', function () {
      var visible = menuInforme.style.display === 'block';
      menuInforme.style.display = visible ? 'none' : 'block';
    });
  }

  // 📄 Generar PDF
  var btnGenerar = document.getElementById('btn-generar-pdf');
  if (btnGenerar) {
    btnGenerar.addEventListener('click', function () {
      var seleccionados = Array.from(document.querySelectorAll('#menu-informe input[type="checkbox"]:checked'))
        .map(function (cb) { return cb.value; });

      if (seleccionados.length === 0) {
        alert('Seleccione al menos un informe');
        return;
      }

      // Compatibilidad con jsPDF UMD (CDN) y global
      var ns = window.jspdf;
      var JsPDFClass = ns && ns.jsPDF ? ns.jsPDF : window.jsPDF;
      if (!JsPDFClass) {
        alert('jsPDF no está cargado. Incluye el script antes de main-v2.js.');
        return;
      }
      var doc = new JsPDFClass();
      var y = 20;
      seleccionados.forEach(function (tipo) {
        doc.text('Informe: ' + tipo, 20, y);
        y += 10;
      });
      doc.save('informe-seleccionado.pdf');
      document.querySelectorAll('#menu-informe input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
      ocultarMenuInforme();
      mostrarCampoCorreo();
    });
  }

  // 📄 Utilidades
  function ocultarMenuInforme() {
    var menu = document.getElementById('menu-informe');
    if (menu) menu.style.display = 'none';
  }

  function mostrarCampoCorreo() {
    var envio = document.getElementById('envio-informe');
    if (!envio) {
      envio = document.createElement('div');
      envio.id = 'envio-informe';
      envio.innerHTML =
        '<label>Escriba el correo para enviar informe:</label>' +
        '<input type="email" id="correo-destino" placeholder="ejemplo@dominio.com">' +
        '<button id="btn-enviar">Enviar</button>';
      document.body.appendChild(envio);
    }
    envio.style.display = 'block';
  }
}); // cierre correcto

// ✅ Detectar si la app ya está instalada
if (window.matchMedia("(display-mode: standalone)").matches) {
  const installBtn = document.getElementById("btn-instalar");
  if (installBtn) {
    installBtn.innerHTML = "✅ Ya instalada";
    installBtn.disabled = true;
    installBtn.style.backgroundColor = "#4CAF50";
    installBtn.style.cursor = "default";
    installBtn.classList.add("instalada");
  }
}

// ✅ Instalación PWA
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.getElementById("btn-instalar");
  if (installBtn) {
    installBtn.style.display = "inline-block";

    installBtn.addEventListener("click", () => {
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
      });
    });
  }
});

// ✅ Endpoints Misterios
const urlResumen = "https://script.google.com/macros/s/AKfycbyJovic2_XrRXPFrW5I9lsmJKfxQUAybwN0EIjUELw5zetoJ_HpqEjMHfYP7xNb4k9r/exec";
const urlLogico  = "https://script.google.com/macros/s/AKfycbyJovic2_XrRXPFrW5I9lsmJKfxQUAybwN0EIjUELw5zetoJ_HpqEjMHfYP7xNb4k9r/exec";

// ✅ Normalizador global
const normalizar = str =>
  String(str || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// ✅ Generar tarjetas físicas
function generarTarjetasPorPlanta() {
  const tipos = [
    "ZOCALOS", "MDA1Y", "KAMAY", "KIT-PMR", "FUENTE AUXILIAR", "DETECTORES",
    "PUKAY", "SIRAY+BSCL", "MSTAY 8", "MSTAY 2", "MDA2 YLT", "CENTRAL COFEM",
    "BATERIAS", "EXTINTORES", "SOPORTES"
  ];

  const plantas = ["SOTANO 1", "SOTANO 2", "BAJA", "PRIMERA", "SEGUNDA"];
  const contenedor = document.getElementById("contenedor-tarjetas");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  plantas.forEach(planta => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-planta";
    tarjeta.setAttribute("data-planta", normalizar(planta));

    const titulo = document.createElement("h4");
    titulo.textContent = `Planta ${planta}`;
    tarjeta.appendChild(titulo);

    const grupo = document.createElement("div");
    grupo.className = "grupo-tipos";

    const resumenFiltrado = window._resumen.filter(r =>
      normalizar(r.planta) === normalizar(planta) &&
      Number(r.total) > 0
    );

    tipos.forEach(tipo => {
      const existe = resumenFiltrado.some(r =>
        normalizar(r.tipo) === normalizar(tipo)
      );
      if (!existe) return;

      const barra = document.createElement("div");
      barra.className = "barra-resumen";
      barra.setAttribute("data-tipo", normalizar(tipo));
      barra.setAttribute("data-planta", normalizar(planta));
      barra.innerHTML = `
        <label>${tipo}</label>
        <progress></progress>
        <span class="porcentaje">0%</span>
      `;
      grupo.appendChild(barra);
    });

    tarjeta.appendChild(grupo);
    contenedor.appendChild(tarjeta);
  });
}

// ✅ Pintar barras físicas
function pintarBarrasResumen() {
  const tarjetas = document.querySelectorAll(".barra-resumen");
  if (!tarjetas.length) return;

  tarjetas.forEach(b => {
    const tipoHTML = normalizar(b.dataset.tipo);
    const plantaHTML = normalizar(b.dataset.planta);

    const barra = b.querySelector("progress");
    const texto = b.querySelector(".porcentaje");
    if (!barra || !texto) return;

    const fila = window._resumen.find(r =>
      normalizar(r.tipo) === tipoHTML &&
      normalizar(r.planta) === plantaHTML
    );

    if (!fila || isNaN(Number(fila.total)) || Number(fila.total) === 0) {
      texto.textContent = "No aplica";
      texto.classList.add("no-aplica");
      barra.style.display = "none";
      return;
    }

    const total = Number(fila.total);
    const instalados = Number(fila.instalados || 0);
    const porcentaje = Math.round((instalados / total) * 100);

    barra.style.display = "inline-block";
    barra.max = total;
    barra.value = instalados;
    texto.textContent = `${porcentaje}%`;
    texto.classList.remove("no-aplica");

    barra.classList.remove("barra-verde", "barra-azul", "barra-gris");

    if (instalados === 0) barra.classList.add("barra-gris");
    else if (instalados < total) barra.classList.add("barra-azul");
    else barra.classList.add("barra-verde");
  });
}

// ✅ Avance por planta
function pintarAvancePorPlanta() {
  const plantas = ["SOTANO 1","SOTANO 2","BAJA","PRIMERA","SEGUNDA"];

  plantas.forEach(planta => {
    const tarjeta = document.querySelector(`.tarjeta-planta[data-planta="${normalizar(planta)}"]`);
    if (!tarjeta) return;

    const filas = window._resumen.filter(r =>
      normalizar(r.planta) === normalizar(planta) &&
      Number(r.total) > 0
    );

    const total = filas.reduce((a, r) => a + Number(r.total), 0);
    const instalados = filas.reduce((a, r) => a + Number(r.instalados), 0);
    const porcentaje = total > 0 ? Math.round((instalados / total) * 100) : 0;

    let indicador = tarjeta.querySelector(".indicador-planta");
    if (!indicador) {
      indicador = document.createElement("div");
      indicador.className = "indicador-planta";
      tarjeta.insertBefore(indicador, tarjeta.firstChild);
    }

    indicador.textContent = `Avance planta: ${porcentaje}%`;

    tarjeta.style.borderLeft =
      porcentaje === 100 ? "6px solid green" :
      porcentaje >= 50 ? "6px solid orange" :
      "6px solid red";
  });
}

// ✅ Cálculo físico global
function calcularAvanceFisicoGlobal() {
  const valores = (window._promedios || [])
    .map(p => Number(p.promedio))
    .filter(v => !isNaN(v));

  const promedio = valores.length
    ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
    : 0;

  const el = document.getElementById("avance-fisico-global");
  if (el) el.textContent = `${promedio}%`;

  const ld = document.getElementById("loading-fisico");
  if (ld) ld.style.display = "none";

  return promedio;
}

// ✅ Cálculo lógico global
function calcularAvanceLogicoGlobal() {
  const valores = (window._avanceLogico || [])
    .map(p => Number(p.promedio))
    .filter(v => !isNaN(v));

  const promedio = valores.length
    ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
    : 0;

  const el = document.getElementById("avance-logico-global");
  if (el) el.textContent = `${promedio}%`;

  const ld = document.getElementById("loading-logico");
  if (ld) ld.style.display = "none";

  return promedio;
}

// ✅ Avance global
function mostrarAvanceGlobal() {
  const fisico = calcularAvanceFisicoGlobal();
  const logico = calcularAvanceLogicoGlobal();
  const global = Math.round((fisico + logico) / 2);

  const el = document.getElementById("avance-global-valor");
  const simbolo = document.getElementById("simbolo-global");

  if (el) el.textContent = `${global}%`;

  let color = "#e74c3c";
  let texto = "🔴 Menor al 50%";

  if (global === 100) {
    color = "#2ecc71";
    texto = "🟢 100% completado";
  } else if (global >= 50) {
    color = "#f39c12";
    texto = "🟠 Avance medio (50–99%)";
  } else if (global === 0) {
    color = "#40E0D0";
    texto = "🔷 No aplica";
  }

  if (simbolo) {
    simbolo.textContent = texto;
    simbolo.style.color = color;
  }

  const ld = document.getElementById("loading-global");
  if (ld) ld.style.display = "none";
}

// ✅ Cargar datos físicos
fetch(urlResumen)
  .then(res => res.json())
  .then(data => {
    window._equipos = data.equipos || [];
    window._resumen = data.resumen || [];
    window._promedios = data.promedios || [];

    generarTarjetasPorPlanta();
    pintarBarrasResumen();
    pintarAvancePorPlanta();
    mostrarAvanceGlobal();
  });

// ✅ Cargar datos lógicos
fetch(urlLogico)
  .then(res => res.json())
  .then(data => {
    window._avanceLogico = data.avanceLogico || [];

    const cont = document.getElementById("avance-logico");
    if (cont) cont.innerHTML = "";

    window._avanceLogico.forEach(planta => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-planta";

      const indicador = document.createElement("div");
      indicador.className = "indicador-planta";
      indicador.textContent = `Avance lógico: ${planta.promedio}%`;
      tarjeta.appendChild(indicador);

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

        const texto = document.createElement("span");
        texto.className = "porcentaje";

        const num = Number(valor);
        const txt = String(valor).trim().toLowerCase();

        if (txt === "n/a" || txt === "no aplica" || isNaN(num)) {
          texto.textContent = "No aplica";
          barra.style.display = "none";
        } else {
          barra.value = num;
          texto.textContent = `${num}%`;

          barra.classList.remove("barra-verde", "barra-naranja", "barra-roja", "barra-gris");

          if (num === 100) barra.classList.add("barra-verde");
          else if (num >= 50) barra.classList.add("barra-naranja");
          else if (num > 0) barra.classList.add("barra-roja");
          else barra.classList.add("barra-gris");
        }

        grupo.appendChild(etiqueta);
        grupo.appendChild(barra);
        grupo.appendChild(texto);
        tarjeta.appendChild(grupo);
      });

      if (planta.promedio === 100) tarjeta.style.borderLeft = "6px solid #2ecc71";
      else if (planta.promedio >= 50) tarjeta.style.borderLeft = "6px solid #ff9800";
      else tarjeta.style.borderLeft = "6px solid #f44336";

      cont.appendChild(tarjeta);
    });

    mostrarAvanceGlobal();
  });
