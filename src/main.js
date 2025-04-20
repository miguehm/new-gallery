// Variable global para almacenar la estructura de contenido
let contentStructure = null;
let activeMenu = null;
let activeButton = null;
let lightbox = null;

// Importar la función de inicialización de PhotoSwipe
import { initPhotoSwipe } from "./photoswipe";
// import "photoswipe/style.css";

// Función para cargar la estructura de contenido
async function loadContentStructure() {
  try {
    const response = await fetch("./content-structure.json");
    if (!response.ok) {
      throw new Error("No se pudo cargar la estructura de contenido");
    }
    contentStructure = await response.json();
    generateMenus();

    // Inicializar con imágenes aleatorias
    homeImages();
  } catch (error) {
    console.error("Error al cargar la estructura de contenido:", error);
  }
}

// Función para generar los menús basados en la estructura
function generateMenus() {
  const menuContainer = document.querySelector(".mt-6"); // Contenedor del menú

  // Limpiar menús existentes
  menuContainer.innerHTML = "";

  // Para cada categoría principal
  Object.keys(contentStructure).forEach((category) => {
    if (category === "random") {
      return; // En un forEach, 'return' funciona como 'continue' en un bucle normal
    }
    // Convertir la categoría a un ID seguro para HTML
    const categoryId = category.toLowerCase().replace(/\s+/g, "-");

    // Crear el botón principal de categoría
    const categoryButton = document.createElement("button");
    categoryButton.className =
      "block w-full py-2 text-left text-lg font-semibold text-gray-400 hover:text-white underline decoration-2 decoration-gray-400 underline-offset-4";
    categoryButton.textContent = capitalizeAllLetters(category);
    categoryButton.onclick = function () {
      toggleMenu(`${categoryId}-menu`, this);
    };

    // Crear el contenedor del menú desplegable
    const menuContent = document.createElement("div");
    menuContent.id = `${categoryId}-menu`;
    menuContent.className = "menu-content ml-4";

    // Para cada subcategoría
    Object.keys(contentStructure[category]).forEach((subcategory) => {
      // Convertir la subcategoría a un ID seguro para HTML
      const subcategoryId = `${categoryId}-${subcategory.toLowerCase().replace(/\s+/g, "-")}`;

      // Crear botón de subcategoría
      const subcategoryButton = document.createElement("button");
      subcategoryButton.className =
        "block py-1 text-gray-400 hover:text-white hover:underline";
      subcategoryButton.textContent = capitalizeFirstLetter(subcategory);
      subcategoryButton.onclick = function () {
        changeGallery(category, subcategory);
      };

      menuContent.appendChild(subcategoryButton);
    });

    // Añadir todo al contenedor
    menuContainer.appendChild(categoryButton);
    menuContainer.appendChild(menuContent);
  });
}

// Función para capitalizar la primera letra
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalizeAllLetters(string) {
  return string.toUpperCase();
}

// Función para cambiar dinámicamente la galería con animación
function changeGallery(category, subcategory) {
  const gallery = document.getElementById("gallery");

  // Destruir la instancia anterior de PhotoSwipe si existe
  if (lightbox) {
    lightbox.destroy();
    lightbox = null;
  }

  // Remover clase activa de todos los botones
  document.querySelectorAll(".menu-content button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Agregar clase activa al botón clickeado
  const clickedButton = window.event.target;
  clickedButton.classList.add("active");

  // Aplicar animación de salida
  gallery.classList.add("fade-out");

  setTimeout(() => {
    gallery.innerHTML = "";
    gallery.className =
      "pswp-gallery grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";

    // Obtener las imágenes para esta categoría/subcategoría
    const images = contentStructure[category][subcategory];
    console.log(contentStructure);
    // const basePath = `/content/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}/`;

    // Crear elementos para cada imagen
    images.forEach((image, index) => {
      const imgContainer = document.createElement("figure");
      imgContainer.className = "";

      const imgLink = document.createElement("a");
      // imgLink.href = basePath + image;
      imgLink.href = image;
      imgLink.className = "pswp-item";

      // No definir dimensiones fijas para permitir que PhotoSwipe detecte las reales
      // Se maneja ahora con el evento contentLoad en photoswipe.js

      const img = document.createElement("img");
      // img.src = basePath + image;
      img.src = image;
      img.className = "w-full rounded-xl shadow";
      img.alt = `${subcategory} - Imagen ${index + 1}`;

      // Pre-carga la imagen para obtener sus dimensiones reales
      const tempImg = new Image();
      tempImg.onload = function () {
        // Una vez cargada, establecer las dimensiones reales
        imgLink.dataset.pswpWidth = tempImg.naturalWidth;
        imgLink.dataset.pswpHeight = tempImg.naturalHeight;
      };
      // tempImg.src = basePath + image;
      tempImg.src = image;

      imgLink.appendChild(img);
      imgContainer.appendChild(imgLink);
      // Añadir cada imagen a la galería
      gallery.appendChild(imgContainer);
      // Ajuste de filas para efecto mosaico (CSS Grid Masonry), con manejo de cache
      const setRowSpan = () => {
        const galleryStyle = getComputedStyle(gallery);
        const rowHeight = parseFloat(galleryStyle.getPropertyValue('grid-auto-rows'));
        const rowGap = parseFloat(galleryStyle.getPropertyValue('row-gap'));
        const totalHeight = img.offsetHeight;
        const rowSpan = Math.ceil((totalHeight + rowGap) / (rowHeight + rowGap));
        imgContainer.style.gridRowEnd = `span ${rowSpan}`;
      };
      img.addEventListener('load', setRowSpan);
      if (img.complete) setRowSpan();
    });

    gallery.classList.remove("fade-out");
    void gallery.offsetWidth; // Forzar reflow
    gallery.classList.add("fade-in");

    // Inicializar PhotoSwipe después de cargar las imágenes
    lightbox = initPhotoSwipe();
    // Segunda pasada de cálculo para asegurar espacios uniformes
    setTimeout(() => recalcAll(gallery), 100);
  }, 200);
}

// Función para mostrar imágenes aleatorias en la página principal
function homeImages() {
  // Verificar si contentStructure está cargado
  if (!contentStructure || !contentStructure["random"]) {
    // Si la estructura no está cargada todavía, programar para ejecutar después
    setTimeout(homeImages, 100);
    return;
  }

  const gallery = document.getElementById("gallery");

  // Destruir la instancia anterior de PhotoSwipe si existe
  if (lightbox) {
    lightbox.destroy();
    lightbox = null;
  }

  // Aplicar animación de salida si ya hay contenido
  if (gallery.children.length > 0) {
    gallery.classList.add("fade-out");

    setTimeout(() => {
      populateHomeGallery(gallery);
    }, 200);
  } else {
    // Si no hay contenido previo, poblar directamente
    populateHomeGallery(gallery);
  }
}

// Función auxiliar para poblar la galería con imágenes aleatorias
// Función auxiliar para poblar la galería con imágenes aleatorias
function populateHomeGallery(gallery) {
  // Limpiar la galería
  gallery.innerHTML = "";
  gallery.className =
    "pswp-gallery grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";

  // Obtener las imágenes aleatorias
  const randomImages = contentStructure["random"];

  // Crear elementos para cada imagen
  randomImages.forEach((imagePath, index) => {
    const imgContainer = document.createElement("figure");
    imgContainer.className = "";

    const imgLink = document.createElement("a");
    imgLink.href = imagePath;
    imgLink.className = "pswp-item";

    // No especificar dimensiones fijas inicialmente

    const img = document.createElement("img");
    img.src = imagePath; // Las rutas ya vienen completas
    img.className = "w-full rounded-xl shadow";
    img.alt = `Imagen destacada ${index + 1}`;

    // Pre-carga la imagen para obtener sus dimensiones reales
    const tempImg = new Image();
    tempImg.onload = function () {
      // Una vez cargada, establecer las dimensiones reales
      imgLink.dataset.pswpWidth = tempImg.naturalWidth;
      imgLink.dataset.pswpHeight = tempImg.naturalHeight;
    };
    tempImg.src = imagePath;

    imgLink.appendChild(img);
    imgContainer.appendChild(imgLink);
    // Añadir cada imagen a la galería
    gallery.appendChild(imgContainer);
    // Ajuste de filas para efecto mosaico (CSS Grid Masonry), con manejo de cache
    const setRowSpanHome = () => {
      const galleryStyle = getComputedStyle(gallery);
      const rowHeight = parseFloat(galleryStyle.getPropertyValue('grid-auto-rows'));
      const rowGap = parseFloat(galleryStyle.getPropertyValue('row-gap'));
      const totalHeight = img.offsetHeight;
      const rowSpan = Math.ceil((totalHeight + rowGap) / (rowHeight + rowGap));
      imgContainer.style.gridRowEnd = `span ${rowSpan}`;
    };
    img.addEventListener('load', setRowSpanHome);
    if (img.complete) setRowSpanHome();
  });

  // Aplicar animación de entrada
  gallery.classList.remove("fade-out");
  void gallery.offsetWidth; // Forzar reflow
  gallery.classList.add("fade-in");

  // Inicializar PhotoSwipe después de cargar las imágenes
  lightbox = initPhotoSwipe();
  // Segunda pasada de cálculo para asegurar espacios uniformes
  setTimeout(() => recalcAll(gallery), 100);
}

// Función para alternar el menú con animación mejorada (mantener igual)
function toggleMenu(id, button) {
  const menu = document.getElementById(id);
  console.log(id);

  // Si el menú ya está abierto, lo cerramos
  if (menu === activeMenu) {
    menu.style.maxHeight = "0px";
    button.classList.remove("active");
    setTimeout(() => menu.classList.remove("menu-open"), 200);
    activeMenu = null;
    activeButton = null;
    return;
  }

  // Cerrar el menú anterior si hay uno abierto
  if (activeMenu) {
    activeMenu.style.maxHeight = "0px";
    activeButton.classList.remove("active");
    setTimeout(() => activeMenu.classList.remove("menu-open"), 200);
  }

  // Abrir el nuevo menú y marcar el botón, ajustando dinámicamente a su contenido
  menu.classList.add("menu-open");
  // Expandir al alto completo del contenido para mostrar todos los items
  const fullHeight = menu.scrollHeight;
  menu.style.maxHeight = `${fullHeight}px`;
  button.classList.add("active");

  activeMenu = menu;
  activeButton = button;
}

// Cargar la estructura de contenido cuando se carga la página
document.addEventListener("DOMContentLoaded", loadContentStructure);
// Recalcula los spans de todas las figuras (para espacios uniformes)
function recalcAll(gallery) {
  const style = getComputedStyle(gallery);
  const rowHeight = parseFloat(style.getPropertyValue('grid-auto-rows'));
  const rowGap = parseFloat(style.getPropertyValue('row-gap'));
  gallery.querySelectorAll('figure').forEach(container => {
    const img = container.querySelector('img');
    if (!img) return;
    const totalHeight = img.offsetHeight;
    const span = Math.ceil((totalHeight + rowGap) / (rowHeight + rowGap));
    container.style.gridRowEnd = `span ${span}`;
  });
}

const nameTitle = document.getElementById("name-title");
nameTitle.onclick = homeImages;
