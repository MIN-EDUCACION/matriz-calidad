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
    const asesores = asesoresPorProceso[procesoSelect.value] || [];
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
    consecutivoSpan.textContent = nuevo;
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

    // ✅ Enviar a Google Sheets
    fetch("https://script.google.com/macros/s/AKfycbyZOA79SxXMH-bn3bCLG0O0ndMXJrJEMA4cOeJZwJwgR02TRErbedNitSnGIANJirEe/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Consecutivo: data.Consecutivo,
        Fecha_Auditoria: data["Fecha Auditoría"],
        Fecha_Gestion: data["Fecha Gestión"],
        Proceso: data.Proceso,
        Asesor: data.Asesor,
        Evaluador: data.Evaluador,
        Radicado: data.Radicado,
        Nota: data.Nota,
        Semaforo: data["Semáforo"],
        Observaciones: data.Observaciones,
        Retroalimentacion: data["Retroalimentación"]
      })
    })
    .then(res => res.text())
    .then(msg => console.log("✅ Enviado a Google Sheets:", msg))
    .catch(err => console.error("❌ Error al enviar a Sheets:", err));

    alert(`Auditoría guardada exitosamente.\nConsecutivo: ${consecutivo}\nNota: ${nota}%\n${semaforo}`);
    this.reset();
    notaSpan.textContent = '100%';
    document.getElementById('fecha-auditoria').valueAsDate = new Date();
    actualizarConsecutivoEnVista();
  });
});
