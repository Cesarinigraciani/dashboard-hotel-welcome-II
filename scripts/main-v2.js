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

// ✅ Instalación de la PWA
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.getElementById("btn-instalar");
  if (installBtn) {
    installBtn.style.display = "inline-block";

    installBtn.addEventListener("click", () => {
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then(choice => {
        if (choice.outcome === "accepted") {
          console.log("✅ Dashboard Aguero-PCI instalado");
          installBtn.innerHTML = "✅ Ya instalada";
          installBtn.disabled = true;
          installBtn.style.backgroundColor = "#4CAF50";
          installBtn.style.cursor = "default";
        }
        deferredPrompt = null;
      });
    });
  }
});

// ✅ Ocultar el botón si la app se instala desde otro método
window.addEventListener("appinstalled", () => {
  const installBtn = document.getElementById("btn-instalar");
  if (installBtn) {
    installBtn.innerHTML = "✅ Ya instalada";
    installBtn.disabled = true;
    installBtn.style.backgroundColor = "#4CAF50";
    installBtn.style.cursor = "default";
  }
  console.log("✅ Dashboard Aguero-PCI ya estaba instalado");
});


// 🔗 Endpoints
const urlResumen = "https://script.google.com/macros/s/AKfycbwfgMEz_12nEmQoTvrM43p7rEjGuMT1ZCKBVwZ9aBROWpelSoItPKhyF7NGhICnlwGm/exec";
const urlLogico = "https://script.google.com/macros/s/AKfycbwfgMEz_12nEmQoTvrM43p7rEjGuMT1ZCKBVwZ9aBROWpelSoItPKhyF7NGhICnlwGm/exec";

// 🔧 Normalizar texto
const normalizar = (str) =>
  String(str || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .replace(/\s+/g, "")
    .trim();

// ✅ Cálculo físico global
function calcularAvanceFisicoGlobal() {
  const resumen = window._resumen || [];

  // Filtramos solo plantas con equipos válidos y porcentajes numéricos
  const porcentajesValidos = resumen
    .filter(r => Number(r.total) > 0 && !isNaN(Number(r.porcentaje)))
    .map(r => Number(r.porcentaje));

  // Calculamos el promedio
  let promedio = 0;
  if (porcentajesValidos.length > 0) {
    const suma = porcentajesValidos.reduce((a, b) => a + b, 0);
    promedio = Math.round(suma / porcentajesValidos.length);
  }

  // Pintamos en el dashboard
  const el = document.getElementById("avance-fisico-global");
  if (el) el.textContent = `${promedio}%`;

  const ld = document.getElementById("loading-fisico");
  if (ld) ld.style.display = "none";

  // Devolvemos el valor para el cálculo global
  return promedio;
}

/// ✅ Cálculo lógico global
function calcularAvanceLogicoGlobal(avanceLogico = window._avanceLogico || []) {
  // Validamos que sea un array y que tenga objetos con promedio numérico
  const porcentajesValidos = Array.isArray(avanceLogico)
    ? avanceLogico
        .map(p => Number(p.promedio))
        .filter(v => !isNaN(v) && v >= 0)
    : [];

  let promedio = 0;
  if (porcentajesValidos.length > 0) {
    const suma = porcentajesValidos.reduce((a, b) => a + b, 0);
    promedio = Math.round(suma / porcentajesValidos.length);
  }

  // Pintamos en el DOM
  const el = document.getElementById("avance-logico-global");
  if (el) el.textContent = `${promedio}%`;
  const ld = document.getElementById("loading-logico");
  if (ld) ld.style.display = "none";
  return promedio;
}

function mostrarAvanceGlobal() {
  const promedioFisico = calcularAvanceFisicoGlobal();
  const promedioLogico = calcularAvanceLogicoGlobal();
  const promedioGlobal = Math.round((Number(promedioFisico) + Number(promedioLogico)) / 2);

  const valorGlobal = document.getElementById("avance-global-valor");
  const simboloGlobal = document.getElementById("simbolo-global");

  let color = "#e74c3c";
  let simbolo = "🔴 Menor al 50%";

  if (promedioGlobal === 0) {
    color = "#40E0D0";
    simbolo = "🔷 No aplica (sin equipos en esta planta)";
  } else if (promedioGlobal === 100) {
    color = "#2ecc71";
    simbolo = "🟢 100% completado";
  } else if (promedioGlobal >= 50) {
    color = "#f39c12";
    simbolo = "🟠 Avance medio (50–99%)";
  }

  if (valorGlobal) {
    valorGlobal.textContent = `${promedioGlobal}%`;
    valorGlobal.style.color = color;
  }

  if (simboloGlobal) {
    simboloGlobal.textContent = simbolo;
    simboloGlobal.style.color = color;
  }

  const lg = document.getElementById("loading-global");
  if (lg) lg.style.display = "none";
}


// 🔥 Barras resumen (por tipo y planta en tarjetas existentes)
function pintarBarrasResumen() {
  const tarjetas = document.querySelectorAll(".barra-resumen");
  if (!tarjetas || tarjetas.length === 0) return;
  tarjetas.forEach(b => {
    const tipoHTML = normalizar(b.dataset?.tipo);
    const plantaHTML = normalizar(b.dataset?.planta);
    console.log(`🧩 Pintando tarjeta: tipo=${tipoHTML}, planta=${plantaHTML}`);
    const barra = b.querySelector("progress");
    const texto = b.querySelector(".porcentaje");
    if (!barra || !texto) return;
    const filaResumen = Array.isArray(window._resumen)
      ? window._resumen.find(r =>
          normalizar(r.tipo) === tipoHTML &&
          normalizar(r.planta) === plantaHTML
        )
      : null;
    console.log("✅ Coincidencia encontrada:", filaResumen);
    console.log("🧩 Debug TOTAL:", filaResumen ? filaResumen.total : "sin filaResumen");

    // 🔒 Si no hay datos, mostrar "No aplica" sin barra
    if (!filaResumen) {
      texto.textContent = "No aplica";
      texto.classList.add("no-aplica");
      barra.style.display = "none";
      return;
    }

    // ✅ Si el equipo no existe en esta planta (columna B = 0)
if (Number(filaResumen.total) === 0) {
  texto.textContent = "";
  texto.classList.remove("no-aplica");
  barra.style.display = "inline-block";
  barra.max = 100;
  barra.value = 100;
  // Limpieza de clases
  barra.classList.remove("completado", "gris", "barra-verde", "barra-naranja", "barra-roja");
  barra.classList.add("barra-turquesa"); // ✅ clase reforzada
  filaResumen.excluirDeMedia = true;
  return;
}

    // ✅ Si el equipo existe pero no instalado
    if (filaResumen.total > 0 && filaResumen.instalados === 0) {
      texto.textContent = "0%";
      texto.classList.remove("no-aplica");
      barra.style.display = "inline-block";
      barra.max = 100;
      barra.value = 0;
      barra.classList.remove("completado");
      barra.style.backgroundColor = "#d3d3d3"; // gris
      return;
    }

    // ✅ Caso normal: porcentaje válido
    const porcentajeNum = Number(filaResumen.porcentaje);
    const porcentaje = Math.max(0, Math.min(100, porcentajeNum));
    barra.style.display = "inline-block";
    barra.max = 100;
    barra.value = porcentaje;
    barra.classList.toggle("completado", porcentaje === 100);
    barra.style.backgroundColor =
      porcentaje === 0 ? "#d3d3d3" :
      porcentaje === 100 ? "#008000" :
      "#1e90ff";
    texto.textContent = `${porcentaje}%`;
    texto.classList.remove("no-aplica");
  });
}
// 🧹 Eliminar tarjetas duplicadas por planta
function limpiarTarjetasDuplicadas() {
  const contenedor = document.getElementById("contenedor-tarjetas");
  if (!contenedor) return;

  const plantas = ["SOTANO","BAJA","PRIMERA","SEGUNDA","TERCERA","CUARTA A","CUARTA B","CUBIERTA"];
  plantas.forEach(planta => {
    const tarjetas = contenedor.querySelectorAll(`.tarjeta-planta[data-planta="${planta}"]`);
    if (tarjetas.length > 1) {
      // ✅ Mantener solo la última (más reciente)
      for (let i = 0; i < tarjetas.length - 1; i++) {
        tarjetas[i].remove();
      }
    }
  });
}
// 🧱 Avance por planta (solo tarjetas físicas)
function pintarAvancePorPlanta() {
  const plantasFijas = ["SOTANO","BAJA","PRIMERA","SEGUNDA","TERCERA","CUARTA A","CUARTA B","CUBIERTA"];
  const contenedorTarjetas = document.getElementById("contenedor-tarjetas");
  if (!contenedorTarjetas) return;
  plantasFijas.forEach(planta => {
    const plantaNorm = normalizar(planta);

    // ✅ Aquí va la línea que preguntas
    const tarjeta = document.querySelector(`#contenedor-tarjetas .tarjeta-planta[data-planta="${planta}"]`);
    if (!tarjeta) return;
  const filas = (window._resumen || []).filter(r => {
  const txt = String(r.porcentaje || "").trim().toLowerCase();
  return normalizar(r.planta) === plantaNorm &&
         txt !== "n/a" && txt !== "no aplica" &&
         Number(r.total) > 0 &&
         Number(r.instalados) <= Number(r.total) &&
         !(Number(r.total) === 1 && Number(r.instalados) === 0); // ← turquesa
});
     const sumaInstalados = filas.reduce((acc, r) => acc + Number(r.instalados || 0), 0);
    const sumaTotal      = filas.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const promedio = sumaTotal > 0
      ? Math.round((sumaInstalados / sumaTotal) * 100)
      : 0;
    let indicador = tarjeta.querySelector(".indicador-planta");
    if (!indicador) {
      indicador = document.createElement("div");
      indicador.className = "indicador-planta";
      tarjeta.insertBefore(indicador, tarjeta.firstChild);
    }
    indicador.textContent = `Avance planta: ${promedio}%`;
    const color = promedio === 100 ? "green" : promedio >= 50 ? "orange" : "red";
    tarjeta.style.borderLeft = `6px solid ${color}`;
  });
}

// 📥 Cargar datos físicos
fetch(urlResumen)
  .then(res => res.json())
  .then(data => {
    // Validamos que existan las claves
    const equipos = data.equipos || [];
    const resumen = data.resumen || [];
    const promedios = data.promedios || [];

    // Asignamos a window
    window._equipos = equipos;
    window._resumen = resumen;
   window._avanceLogico = data.promedios || data.avanceLogico || [];


    // Logs de validación
    console.log("Equipos cargados:", window._equipos);
    console.log("Resumen completo:", window._resumen);
    console.log("Promedios (avance lógico):", window._avanceLogico);

    // Calculamos y pintamos globales
    const fisico = calcularAvanceFisicoGlobal();   // → 68
    const logico = calcularAvanceLogicoGlobal();   // → 57
    mostrarAvanceGlobal();                         // → 63

    // ✅ Limpieza de duplicados antes de pintar
    limpiarTarjetasDuplicadas();
    // UI dependiente de datos
    pintarBarrasResumen();
    pintarAvancePorPlanta();
    calcularAvanceFisicoGlobal(); // ✅ usa window._resumen internamente

    // Parte física (barras por fase)
    document.querySelectorAll(".fase").forEach(fase => {
      const tipo = normalizar(fase.dataset.tipo);
      const planta = normalizar(fase.dataset.planta);
      const barra = fase.querySelector("progress");
      const texto = fase.querySelector(".porcentaje");

      // Forzar 100% para LAZO
      if (tipo === "LAZO") {
        if (barra) {
          barra.max = 6;
          barra.value = 6;
          barra.classList.add("completado");
          barra.style.display = "inline-block";
        }
        if (texto) {
          texto.textContent = "100%";
          texto.classList.remove("no-aplica");
        }
        return;
      }

      // Buscar fila en resumen
      const filaResumen = window._resumen.find(r =>
        normalizar(r.tipo) === tipo &&
        normalizar(r.planta) === planta
      );

      // Si no hay fila resumen, intentar calcular por equipos
      if (!filaResumen) {
        const filtrados = window._equipos.filter(e =>
          normalizar(e.points_type) === tipo &&
          normalizar(e.planta) === planta
        );
        const instalados = filtrados.filter(e =>
          ["INSTALADO", "VERIFICADO", "PROBADO"].includes(normalizar(e.comment))
        );
        const total = filtrados.length;
        const hechos = instalados.length;
        if (total === 0) {
          if (texto) {
            texto.textContent = "No aplica";
            texto.classList.add("no-aplica");
          }
          if (barra) {
            barra.style.display = "none";
            barra.classList.remove("completado", "barra-verde", "barra-naranja", "barra-roja", "barra-gris");
          }
          return;
        }
        const porcentaje = Math.round((hechos / total) * 100);
        if (barra) {
          barra.max = total;
          barra.value = hechos;
          barra.style.display = "inline-block";
          barra.classList.toggle("completado", porcentaje === 100);
        }
        if (texto) {
          texto.textContent = `${porcentaje}%`;
          texto.classList.remove("no-aplica");
        }
        return;
      }

      // Sí hay fila resumen: tratar No aplica y pintar normal
      const porcentajeTxt = String(filaResumen.porcentaje || "").trim().toLowerCase();
      const esNoAplica = porcentajeTxt === "n/a" || porcentajeTxt === "no aplica" || Number(filaResumen.total) === 0;
      if (esNoAplica) {
        if (texto) {
          texto.textContent = "No aplica";
          texto.classList.add("no-aplica");
        }
        if (barra) {
          barra.value = 0;
          barra.style.display = "none";
          barra.classList.remove("completado", "barra-verde", "barra-naranja", "barra-roja", "barra-gris");
        }
        return;
      }
      const total = Number(filaResumen.total || 0);
      const porcentaje = Number(filaResumen.porcentaje || 0);
      const hechos = Math.round((porcentaje / 100) * total);
      if (barra) {
        barra.max = total;
        barra.value = hechos;
        barra.style.display = "inline-block";
        barra.classList.remove("completado", "barra-verde", "barra-naranja", "barra-roja", "barra-gris");
        if (porcentaje === 100) barra.classList.add("completado", "barra-verde");
        else if (porcentaje >= 50) barra.classList.add("barra-naranja");
        else barra.classList.add("barra-roja");
      }
      if (texto) {
        texto.textContent = `${porcentaje}%`;
        texto.classList.remove("no-aplica");
      }
    });

    // ✅ Mostrar global después de cargar físico
    mostrarAvanceGlobal();
  })
  .catch(err => {
    console.error("❌ Error al cargar datos físicos:", err);
  });


// 📥 Cargar avance lógico por planta
fetch(urlLogico)
  .then(res => res.json())
  .then(data => {
    window._avanceLogico = data.avanceLogico || [];
    const avanceLogico = window._avanceLogico;
    const seccionLogica = document.getElementById("avance-logico");
    if (seccionLogica) seccionLogica.innerHTML = "";

    // Calcular global lógico
    calcularAvanceLogicoGlobal(avanceLogico);

    // Pintar tarjetas de avance lógico
    avanceLogico.forEach(planta => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-planta";
      tarjeta.setAttribute("data-planta", planta.planta);

      // ✅ Indicador de avance lógico por planta (encabezado)
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

        const valorTxt = String(valor || "").trim().toLowerCase();
        const valorNumerico = Number(valor);

        const texto = document.createElement("span");
        texto.className = "porcentaje";

        if (valorTxt === "n/a" || valorTxt === "no aplica" || Number.isNaN(valorNumerico)) {
          texto.textContent = "No aplica";
          barra.style.display = "none";
        } else {
          barra.value = valorNumerico;
          texto.textContent = `${valorNumerico}%`;

          // ✅ Colores corregidos para barras lógicas
          if (valorNumerico === 100) {
            barra.classList.add("barra-verde");
          } else if (valorNumerico >= 50) {
            barra.classList.add("barra-naranja");
          } else if (valorNumerico > 0) {
            barra.classList.add("barra-roja");
          } else {
            barra.classList.add("barra-gris");
          }
        }

        grupo.appendChild(etiqueta);
        grupo.appendChild(barra);
        grupo.appendChild(texto);
        tarjeta.appendChild(grupo);
      });

      // ✅ Borde lateral según avance lógico global
      if (planta.promedio === 100) {
        tarjeta.style.borderLeft = "6px solid #2ecc71"; // verde
      } else if (planta.promedio >= 50) {
        tarjeta.style.borderLeft = "6px solid #ff9800"; // naranja
      } else {
        tarjeta.style.borderLeft = "6px solid #f44336"; // rojo
      }

      if (seccionLogica) seccionLogica.appendChild(tarjeta);
    });

    // ✅ Pintar avance lógico por planta con cálculo real
    pintarAvanceLogicoPorPlanta();

    // ✅ Mostrar global después de cargar lógico
    mostrarAvanceGlobal();
  })
  .catch(err => {
    console.error("❌ Error al cargar avance lógico por planta:", err);
  });














