const pages = Array.from(document.querySelectorAll(".page"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const indicator = document.getElementById("indicator");

let currentPage = 0;

// Crear los puntos del indicador
pages.forEach((_, i) => {
  const dot = document.createElement("div");
  dot.className =
    "h-1.5 w-1.5 rounded-full bg-amber-200 transition-all duration-200";
  if (i === 0) {
    dot.classList.add("bg-amber-500", "w-4");
  }
  indicator.appendChild(dot);
});

const dots = Array.from(indicator.children);

function updateView(direction = 0) {
  pages.forEach((page, index) => {
    // Reset clases base
    page.classList.remove(
      "opacity-100",
      "translate-x-0",
      "scale-100",
      "pointer-events-auto",
      "opacity-0",
      "translate-x-6",
      "-translate-x-6"
    );

    // Todas por defecto ocultas
    page.classList.add("opacity-0", "scale-[0.98]", "pointer-events-none");

    if (index === currentPage) {
      // Página actual visible
      page.classList.remove("opacity-0", "translate-x-6", "-translate-x-6");
      page.classList.add("opacity-100", "translate-x-0", "scale-100", "pointer-events-auto");
    } else if (index < currentPage) {
      // Las de la izquierda salen hacia la izquierda
      page.classList.add("-translate-x-6");
    } else {
      // Las de la derecha salen hacia la derecha
      page.classList.add("translate-x-6");
    }
  });

  // Actualizar puntos
  dots.forEach((dot, index) => {
    dot.classList.remove("bg-amber-500", "w-4");
    dot.classList.add("bg-amber-200", "w-1.5");
    if (index === currentPage) {
      dot.classList.remove("bg-amber-200", "w-1.5");
      dot.classList.add("bg-amber-500", "w-4");
    }
  });

  // Desactivar botones en extremos
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage === pages.length - 1;
}

function goToPage(newIndex) {
  if (newIndex < 0 || newIndex >= pages.length) return;
  const direction = newIndex - currentPage;
  currentPage = newIndex;
  updateView(direction);
}

// Botones
prevBtn.addEventListener("click", () => goToPage(currentPage - 1));
nextBtn.addEventListener("click", () => goToPage(currentPage + 1));

// Swipe táctil (iPhone y demás móviles)
let startX = 0;
let startY = 0;
let tracking = false;

function onTouchStart(e) {
  if (!e.touches || e.touches.length === 0) return;
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
  tracking = true;
}

function onTouchEnd(e) {
  if (!tracking) return;
  tracking = false;

  const t = e.changedTouches[0];
  const diffX = t.clientX - startX;
  const diffY = t.clientY - startY;

  // Gesto más horizontal que vertical
  if (Math.abs(diffX) > 40 && Math.abs(diffY) < 60) {
    if (diffX < 0) {
      goToPage(currentPage + 1); // desliza a la izquierda -> siguiente
    } else {
      goToPage(currentPage - 1); // desliza a la derecha -> atrás
    }
  }
}

// Añadimos eventos al contenedor de páginas
const pagesContainer = document.getElementById("pages");
pagesContainer.addEventListener("touchstart", onTouchStart, { passive: true });
pagesContainer.addEventListener("touchend", onTouchEnd, { passive: true });

// Estado inicial
updateView();
// ==== LÓGICA DE REGALOS QUE GIRAN ====

// Devuelve true si ya se puede abrir regalos del 25
function puedeAbrir25(now = new Date()) {
  const mes = now.getMonth(); // 0 = enero, 11 = diciembre
  const dia = now.getDate();
  const hora = now.getHours();

  // Bloqueado solo si estamos ANTES del 25 de diciembre por la mañana
  if (mes === 11) { // diciembre
    if (dia < 25) return false;
    if (dia === 25 && hora < 9) return false;
  }
  // En cualquier otro mes, lo consideramos ya pasado (enero-noviembre de años siguientes)
  return true;
}

// Devuelve true si ya se puede abrir regalos del 6 de enero
// Devuelve true si ya se puede abrir regalos del 6 de enero
function puedeAbrir6(now = new Date()) {
  const mes = now.getMonth(); // 0 = enero, 11 = diciembre
  const dia = now.getDate();
  const hora = now.getHours();

  // En diciembre: aún no han llegado Reyes -> BLOQUEADO
  if (mes === 11) {
    return false;
  }

  // En enero: solo a partir del 6 por la mañana
  if (mes === 0) {
    if (dia < 6) return false;
    if (dia === 6 && hora < 9) return false;
    return true;
  }

  // En cualquier mes después de enero (febrero–noviembre):
  // ya ha pasado el 6 de enero, así que se consideran desbloqueados
  return true;
}


function puedeAbrirSegunTipo(tipo) {
  const ahora = new Date();
  if (tipo === "25") return puedeAbrir25(ahora);
  if (tipo === "6") return puedeAbrir6(ahora);
  return true;
}

// Seleccionar todas las cartas
const giftCards = document.querySelectorAll(".gift-card");

giftCards.forEach((card) => {
  const tipo = card.dataset.unlock; // "25" o "6"
  const label = card.querySelector(".gift-label");

  // Al cargar, ver si ya están desbloqueadas por fecha
  function actualizarEstado() {
    const unlocked = puedeAbrirSegunTipo(tipo);
    if (unlocked) {
      card.classList.remove("locked");
      if (label) label.classList.remove("hidden");
    } else {
      card.classList.add("locked");
      if (label) label.classList.add("hidden");
    }
  }

  actualizarEstado();

  card.addEventListener("click", () => {
    const locked = card.classList.contains("locked");

    if (locked) {
      // Si está bloqueada, solo tiembla
      card.classList.add("shake");
      setTimeout(() => {
        card.classList.remove("shake");
      }, 400);
      return;
    }

    // Si está desbloqueada, aseguramos que el texto esté visible
    if (label) label.classList.remove("hidden");

    // Girar carta
    card.classList.toggle("flipped");
  });
});
