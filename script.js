// Almacén de periodos sumados
let periodos = [];

// --- FUNCIONES AUXILIARES ---
function esBisiesto(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function diasEnMes(month, year) {
  return new Date(year, month, 0).getDate();
}

// --- FUNCIÓN PRINCIPAL: AGREGAR ---
function agregarPeriodo() {
  const inputInicio = document.getElementById("fechaInicio").value;
  const inputFin = document.getElementById("fechaFin").value;

  // Validación básica
  if (!inputInicio || !inputFin) {
    return;
  }

  // Crear fechas asegurando formato local
  let fechaInicio = new Date(inputInicio + "T00:00:00");
  let fechaFin = new Date(inputFin + "T00:00:00");

  if (fechaInicio > fechaFin) {
    alert("Error: La fecha de inicio es posterior al egreso.");
    return;
  }

  // --- LÓGICA INCLUSIVA (+1 día) ---
  fechaFin.setDate(fechaFin.getDate() + 1);

  // --- CÁLCULO ---
  let anios = fechaFin.getFullYear() - fechaInicio.getFullYear();
  let meses = fechaFin.getMonth() + 1 - (fechaInicio.getMonth() + 1);
  let dias = fechaFin.getDate() - fechaInicio.getDate();

  // Ajuste de días negativos
  if (dias < 0) {
    meses -= 1;
    let mesAnterior = fechaFin.getMonth() + 1 - 1;
    let anioReferencia = fechaFin.getFullYear();

    if (mesAnterior === 0) {
      mesAnterior = 12;
      anioReferencia -= 1;
    }
    dias += diasEnMes(mesAnterior, anioReferencia);
  }

  // Ajuste de meses negativos
  if (meses < 0) {
    anios -= 1;
    meses += 12;
  }

  // IMPORTANTE: Guardamos también 'rawInicio' y 'rawFin' para poder editar después
  periodos.push({
    rawInicio: inputInicio,
    rawFin: inputFin,
    a: anios,
    m: meses,
    d: dias,
  });

  // Actualizamos toda la vista
  actualizarListaCompleta();

  // Limpiar los campos
  document.getElementById("form-calculadora").reset();
  document.getElementById("fechaInicio").focus();
}

// --- FUNCIONES DE ACCIÓN (EDITAR / ELIMINAR) ---

function eliminarPeriodo(index) {
  // Borra 1 elemento en la posición 'index'
  periodos.splice(index, 1);
  actualizarListaCompleta();
}

function editarPeriodo(index) {
  const p = periodos[index];

  // Volvemos a poner los datos en los inputs
  document.getElementById("fechaInicio").value = p.rawInicio;
  document.getElementById("fechaFin").value = p.rawFin;

  // Eliminamos el periodo de la lista (para que el usuario lo vuelva a agregar corregido)
  eliminarPeriodo(index);

  // Ponemos el foco en el input
  document.getElementById("fechaInicio").focus();
}

// --- RENDERIZADO (DIBUJAR LA LISTA) ---

// --- Reemplaza la función actualizarListaCompleta por esta ---

function actualizarListaCompleta() {
  const lista = document.getElementById("lista-periodos");
  lista.innerHTML = ""; 

  periodos.forEach((p, index) => {
    const item = document.createElement("div");
    item.className = "periodo-item";

    // Formatear fechas
    const f1Arr = p.rawInicio.split("-");
    const f2Arr = p.rawFin.split("-");
    const f1Show = `${f1Arr[2]}/${f1Arr[1]}/${f1Arr[0]}`;
    const f2Show = `${f2Arr[2]}/${f2Arr[1]}/${f2Arr[0]}`;

    item.innerHTML = `
        <div class="periodo-info">
            <div class="grupo-fechas">
                <div class="fila-dato">
                    <span class="label-alta">Alta:</span>
                    <span class="fecha-tag">${f1Show}</span>
                </div>
                <div class="fila-dato">
                    <span class="label-baja">Baja:</span>
                    <span class="fecha-tag">${f2Show}</span>
                </div>
            </div>

            <div class="grupo-resultado">
                <div class="resultado-destacado">
                    ${p.a} años, ${p.m} meses, ${p.d} días
                </div>
            </div>
        </div>

        <div class="periodo-menu">
            <button class="btn-dots" onclick="toggleMenu(event, 'menu-${index}')">&#8942;</button>
            <div id="menu-${index}" class="menu-dropdown">
                <button onclick="editarPeriodo(${index})">✏️ Editar</button>
                <button class="btn-delete-menu" onclick="eliminarPeriodo(${index})">🗑️ Eliminar</button>
            </div>
        </div>
    `;
    lista.appendChild(item);
  });

  calcularTotalComercial();
}

// --- MENÚ DESPLEGABLE ---

function toggleMenu(event, menuId) {
  event.stopPropagation();

  // Cierra otros menús
  const todosLosMenus = document.querySelectorAll(".menu-dropdown");
  todosLosMenus.forEach((menu) => {
    if (menu.id !== menuId) {
      menu.classList.remove("active");
    }
  });

  // Alterna el actual
  const menu = document.getElementById(menuId);
  if (menu) {
    menu.classList.toggle("active");
  }
}

// Cerrar menú al hacer clic fuera
window.onclick = function (event) {
  if (!event.target.matches(".btn-dots")) {
    const dropdowns = document.getElementsByClassName("menu-dropdown");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("active")) {
        openDropdown.classList.remove("active");
      }
    }
  }
};

// --- CÁLCULO TOTAL Y REINICIO ---

function calcularTotalComercial() {
  if (periodos.length === 0) {
    document.getElementById("resultado-total").style.display = "none";
    return;
  }

  let totalA = 0;
  let totalM = 0;
  let totalD = 0;

  periodos.forEach((p) => {
    totalA += p.a;
    totalM += p.m;
    totalD += p.d;
  });

  let mesesExtra = Math.floor(totalD / 30);
  let diasRestantes = totalD % 30;
  totalM += mesesExtra;
  totalD = diasRestantes;

  let aniosExtra = Math.floor(totalM / 12);
  let mesesRestantes = totalM % 12;
  totalA += aniosExtra;
  totalM = mesesRestantes;

  const box = document.getElementById("resultado-total");
  box.style.display = "block";
  box.innerHTML = `ANTIGÜEDAD TOTAL:<br>${totalA} AÑOS, ${totalM} MESES, ${totalD} DÍAS`;
}

function reiniciar() {
  if (confirm("¿Borrar todos los periodos?")) {
    periodos = [];
    actualizarListaCompleta();
    document.getElementById("form-calculadora").reset();
  }
}

// --- LÓGICA DE MODO OSCURO ---

// 1. Al cargar la página, verificamos si había un tema guardado
document.addEventListener('DOMContentLoaded', () => {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
});

// 2. Función para alternar entre claro y oscuro
function cambiarTema() {
    const body = document.body;
    const esOscuro = body.getAttribute('data-theme') === 'dark';
    
    if (esOscuro) {
        body.removeAttribute('data-theme');
        localStorage.setItem('tema', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('tema', 'dark');
    }
}