document.addEventListener('DOMContentLoaded', function () {
  const asesoresPorProceso = {
    "PQRSD": ["Avila, Marcela Paola", "Beltran, Nicole Juliana", "Castro, Diana Angelica", "Fuentes, Sandra Milena", "Lopez, Angela Marcela", "Roa, Cindy Paola", "Sanchez, Hellen Viviana", "Nadya Eliscet Bernal Escobar"],
    "NOTIFICACIONES - PQRSD": ["Insuasty, Daniel Ismael"],
    "NOTIFICACIONES": ["Gomez, Natalia", "Gutierrez, Valentina", "Alvarez, Carlos William", "Garavito, Gabriela Alexandra", "Mahecha, Diego Andres", "Peña, Jairo Esteban", "Rincon, Nathaly Dayana", "Sandoval, Diego Mauricio", "Santamaria, Edinson Yesid", "Hernandez, Diego Andres", "John Edwar Olarte"],
    "LEGALIZACIONES": ["Castiblanco, Jonathan Javier", "Saavedra, Jenny Alexandra", "Ojeda, Maria Alejandra", "Rodriguez, Andrés Eduardo", "Ruiz, Daissy Katerine"],
    "ANTENCION PRESENCIAL": ["Alvarez, Katherine"]
  };

  const lideresCalidad = ["Rene Alejandro Mayorga", "Andrea Guzman Botache"];

  const evaluadorSelect = document.getElementById('evaluador');
  lideresCalidad.forEach(nombre => {
    const option = document.createElement('option');
    option.value = nombre;
    option.textContent = nombre;
    evaluadorSelect.appendChild(option);
  });

  const procesoSelect = document.getElementById('proceso');
  const asesorSelect = document.getElementById('asesor');

  procesoSelect.addEventListener('change', () => {
    const proceso = procesoSelect.value;
    const asesores = asesoresPorProceso[proceso] || [];
    asesorSelect.innerHTML = '<option value="">-- Selecciona --</option>';
    asesores.forEach(nombre => {
      const option = document.createElement('option');
      option.value = nombre;
      option.textContent = nombre;
      asesorSelect.appendChild(option);
    });
  });

  document.getElementById('fecha-auditoria').valueAsDate = new Date();

  const cumplimientoSelects = document.querySelectorAll('.cumplimiento');
  const notaSpan = document.getElementById('nota');
  const consecutivoSpan = document.getElementById('consecutivo');
  const pesos = [50, 30, 20];

  const calcularNota = () => {
    let nota = 100;
    for (let i = 0; i < cumplimientoSelects.length; i++) {
      const val = cumplimientoSelects[i].value;
      if (val === 'NO') {
        if (i < 3) nota -= pesos[i];
        else return 0;
      }
    }
    return nota;
  };

  const updateNota = () => {
    const nota = calcularNota();
    notaSpan.textContent = `${nota}%`;
  };

  cumplimientoSelects.forEach(select => {
    select.addEventListener('change', updateNota);
  });

  const generarConsecutivo = () => {
    const registros = JSON.parse(localStorage.getItem("monitoreos")) || [];
    const ultimo = registros.length ? registros[registros.length - 1].Consecutivo : null;
    if (!ultimo) return "MEN-001";
    const numero = parseInt(ultimo.split("-")[1]) + 1;
    return `MEN-${numero.toString().padStart(3, '0')}`;
  };

  const actualizarConsecutivoEnVista = () => {
    const nuevo = generarConsecutivo();
    if (consecutivoSpan) consecutivoSpan.textContent = nuevo;
  };

  actualizarConsecutivoEnVista();

  document.getElementById('formulario').addEventListener('submit', function (e) {
    e.preventDefault();
    const nota = calcularNota();
    const semaforo = nota >= 90 ? '🟢 Excelente' : nota >= 80 ? '🟡 Aceptable' : '🔴 Debe mejorar';
    const consecutivo = generarConsecutivo();

    const data = {
      "Consecutivo": consecutivo,
      "Fecha Auditoría": document.getElementById('fecha-auditoria').value,
      "Fecha Gestión": document.getElementById('fecha-gestion').value,
      "Proceso": document.getElementById('proceso').value,
      "Asesor": document.getElementById('asesor').value,
      "Evaluador": document.getElementById('evaluador').value,
      "Radicado": document.getElementById('radicado').value,
      "Uso de plantillas": document.getElementById('c1').value,
      "Claridad del lenguaje": document.getElementById('c2').value,
      "Redacción – puntuación": document.getElementById('c3').value,
      "Redacción – ortografía": document.getElementById('c4').value,
      "Interpretación de la solicitud": document.getElementById('c5').value,
      "Oportunidad en la respuesta": document.getElementById('c6').value,
      "Pertinencia de la respuesta": document.getElementById('c7').value,
      "Desempeño": document.getElementById('c8').value,
      "Observaciones": document.getElementById('observaciones').value,
      "Retroalimentación": document.getElementById('feedback').value,
      "Nota": `${nota}%`,
      "Semáforo": semaforo
    };

    const registros = JSON.parse(localStorage.getItem("monitoreos")) || [];
    registros.push(data);
    localStorage.setItem("monitoreos", JSON.stringify(registros));

    alert(`Auditoría guardada exitosamente.\nConsecutivo: ${consecutivo}\nNota: ${nota}%\n${semaforo}`);
    this.reset();
    notaSpan.textContent = '100%';
    document.getElementById('fecha-auditoria').valueAsDate = new Date();
    actualizarConsecutivoEnVista();
  });

  document.getElementById('btnExportarExcel').addEventListener('click', function () {
    const registros = JSON.parse(localStorage.getItem("monitoreos")) || [];
    if (!registros.length) return alert("No hay datos.");

    const headers = ["Consecutivo", ...Object.keys(registros[0]).filter(h => h !== "Consecutivo")];
    const filas = registros.map(registro => headers.map(header => registro[header]));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...filas]);
    XLSX.utils.book_append_sheet(wb, ws, "Monitoreos");
    XLSX.writeFile(wb, "monitoreos_calidad.xlsx");
  });

  // Abrir modal
  document.getElementById("abrirModalExportarPdf").addEventListener("click", function () {
    document.getElementById("modalExport").style.display = "flex";
    document.getElementById("inputConsecutivo").value = "";
    document.getElementById("errorMensaje").textContent = "";
  });

  // Cancelar
  document.getElementById("cancelarExportacion").addEventListener("click", function () {
    document.getElementById("modalExport").style.display = "none";
  });

  // Confirmar exportación
  document.getElementById("confirmarExportacion").addEventListener("click", function () {
    const registros = JSON.parse(localStorage.getItem("monitoreos")) || [];
    const opcion = document.querySelector("input[name='exportOption']:checked").value;
    let monitoreo = null;

    if (opcion === "ultimo") {
      monitoreo = registros[registros.length - 1];
    } else {
      const consecutivoIngresado = document.getElementById("inputConsecutivo").value.trim().toUpperCase();
      monitoreo = registros.find(r => r.Consecutivo === consecutivoIngresado);
      if (!monitoreo) {
        document.getElementById("errorMensaje").textContent = "❌ Consecutivo no encontrado.";
        return;
      }
    }

    if (!monitoreo) {
      alert("No hay datos para exportar.");
      return;
    }

    generarPdfDesdeRegistro(monitoreo);
    document.getElementById("modalExport").style.display = "none";
  });

  function generarPdfDesdeRegistro(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 128);
    doc.text('FORMATO DE RETROALIMENTACIÓN', 105, 20, null, null, 'center');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Proceso de Calidad y Mejora Continua`, 105, 27, null, null, 'center');

    let y = 35;
    const addField = (label, value) => {
      doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, 10, y);
      doc.setFont(undefined, 'normal');
      doc.text(value || 'N/A', 60, y);
      y += 7;
    };

    addField('Consecutivo', data["Consecutivo"]);
    addField('Asesor', data["Asesor"]);
    addField('Proceso', data["Proceso"]);
    addField('Fecha de auditoría', data["Fecha Auditoría"]);
    addField('Fecha gestión', data["Fecha Gestión"]);
    addField('Evaluador', data["Evaluador"]);
    addField('Radicado', data["Radicado"]);

    doc.setFont(undefined, 'bold');
    doc.text('Evaluación por dimensiones:', 10, y);
    y += 7;

    ["Uso de plantillas", "Claridad del lenguaje", "Redacción – puntuación", "Redacción – ortografía", "Interpretación de la solicitud", "Oportunidad en la respuesta", "Pertinencia de la respuesta", "Desempeño"].forEach(label => {
      doc.setFont(undefined, 'normal');
      doc.text(`${label}: ${data[label]}`, 15, y);
      y += 6;
    });

    y += 4;
    doc.setFont(undefined, 'bold');
    doc.text('Descripción del error y/o afectación:', 10, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    doc.text(doc.splitTextToSize(data["Observaciones"] || 'N/A', 180), 15, y);
    y += 12;

    doc.setFont(undefined, 'bold');
    doc.text('Retroalimentación:', 10, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    doc.text(doc.splitTextToSize(data["Retroalimentación"] || 'N/A', 180), 15, y);
    y += 12;

    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 100, 0);
    doc.text(`Nota: ${data["Nota"]}`, 10, y);
    doc.setTextColor(255, 0, 0);
    doc.text(`Semáforo: ${data["Semáforo"]}`, 100, y);
    y += 15;

    doc.setTextColor(0);
    doc.text(`Firma Evaluador: ${data["Evaluador"]}`, 10, y);
    y += 8;
    doc.text(`Firma Asesor: ${data["Asesor"]}`, 10, y);

    doc.save(`${data["Consecutivo"]}.pdf`);
  }
});
