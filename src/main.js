// Importar Macy.js
import Macy from 'macy';

// Variable global para almacenar la estructura de contenido
let contentStructure = null;
let activeMenu = null;
let activeButton = null;
let lightbox = null;
let macyInstance = null;

// Importar la función de inicialización de PhotoSwipe
import { initPhotoSwipe } from "./photoswipe";
// import "photoswipe/style.css";

// Verificar que Macy.js se importó correctamente
console.log('Macy.js importado:', typeof Macy);

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

// Función para inicializar Macy.js
function initMacy() {
  console.log('Inicializando Macy.js...');
  
  try {
    // Destruir instancia anterior si existe
    if (macyInstance) {
      console.log('Destruyendo instancia anterior de Macy...');
      try {
        if (typeof macyInstance.destroy === 'function') {
          macyInstance.destroy();
          console.log('Macy.js destruido exitosamente');
        } else {
          console.log('No se encontró método de destrucción');
        }
      } catch (error) {
        console.error('Error al destruir Macy.js:', error);
      }
      macyInstance = null;
    }

    const gallery = document.getElementById("gallery");
    if (!gallery) {
      console.error('No se encontró el elemento gallery');
      return;
    }

    if (gallery.children.length === 0) {
      console.log('Galería vacía, no se puede inicializar Macy');
      return;
    }

    console.log('Creando nueva instancia de Macy...');
    // Crear nueva instancia de Macy
    macyInstance = Macy({
      container: '#gallery',
      trueOrder: false,
      waitForImages: false,
      margin: 16,
      columns: 4,
      breakAt: {
        1200: 4,
        940: 3,
        768: 2,
        520: 1
      }
    });

    console.log('Macy.js inicializado correctamente');
    
  } catch (error) {
    console.error('Error al inicializar Macy.js:', error);
  }
}

// Función para esperar a que todas las imágenes se carguen
function waitForImagesToLoad(gallery, callback) {
  const images = gallery.querySelectorAll('img');
  let loadedCount = 0;
  const totalImages = images.length;

  console.log(`Esperando a que se carguen ${totalImages} imágenes...`);

  if (totalImages === 0) {
    console.log('No hay imágenes para cargar');
    callback();
    return;
  }

  const checkAllLoaded = () => {
    loadedCount++;
    console.log(`Imagen ${loadedCount}/${totalImages} cargada`);
    if (loadedCount === totalImages) {
      console.log('Todas las imágenes cargadas');
      callback();
    }
  };

  images.forEach(img => {
    if (img.complete && img.naturalHeight !== 0) {
      checkAllLoaded();
    } else {
      img.addEventListener('load', checkAllLoaded);
      img.addEventListener('error', checkAllLoaded);
    }
  });
}

// Función para cambiar dinámicamente la galería con animación
function changeGallery(category, subcategory) {
  console.log(`Cambiando galería a: ${category} - ${subcategory}`);
  
  const gallery = document.getElementById("gallery");
  console.log('Galería encontrada para cambio:', !!gallery);

  // Remover clase activa de todos los botones
  document.querySelectorAll(".menu-content button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Agregar clase activa al botón clickeado
  const clickedButton = window.event.target;
  clickedButton.classList.add("active");

  // Regresar scroll al inicio de forma instantánea
  window.scrollTo(0, 0);

  // Aplicar animación de salida
  console.log('Aplicando animación de salida...');
  gallery.classList.add("fade-out");

  setTimeout(() => {
    console.log('Iniciando timeout de cambio de galería...');
    
    // Limpiar completamente la galería
    clearGallery();

    // Obtener las imágenes para esta categoría/subcategoría
    const images = contentStructure[category][subcategory];
    console.log(`Preparando ${images.length} imágenes para ${subcategory}`);

    // Preparar galería
    gallery.classList.remove("fade-out");
    gallery.classList.add("fade-in");

    // Crear elementos para todas las imágenes primero
    images.forEach((image, index) => {
      const imgContainer = document.createElement("figure");
      imgContainer.className = "";
      imgContainer.style.opacity = "0"; // Inicialmente oculto
      imgContainer.style.transform = "translateY(30px) scale(0.95)";

      const imgLink = document.createElement("a");
      imgLink.href = image;
      imgLink.className = "pswp-item";

      const img = document.createElement("img");
      img.src = image;
      img.className = "w-full rounded-xl shadow";
      img.alt = `Imagen ${index + 1}`;

      // Pre-carga la imagen para obtener sus dimensiones reales
      const tempImg = new Image();
      tempImg.onload = function () {
        imgLink.dataset.pswpWidth = tempImg.naturalWidth;
        imgLink.dataset.pswpHeight = tempImg.naturalHeight;
      };
      tempImg.src = image;

      imgLink.appendChild(img);
      imgContainer.appendChild(imgLink);
      gallery.appendChild(imgContainer);
    });

    // Agregar overlay de carga después de las imágenes
    const loadingOverlay = document.createElement("div");
    loadingOverlay.className = "loading-overlay";
    loadingOverlay.textContent = "Cargando...";
    gallery.appendChild(loadingOverlay);

    // Mostrar el overlay inmediatamente
    setTimeout(() => {
      loadingOverlay.style.opacity = "1";
    }, 10);

    // Esperar a que todas las imágenes se carguen
    waitForImagesToLoad(gallery, () => {
      console.log('Todas las imágenes cargadas, inicializando Macy.js...');
      
      // Agregar un delay mínimo para que se vea el overlay
      setTimeout(() => {
        // Remover overlay de carga
        if (loadingOverlay && loadingOverlay.parentNode) {
          loadingOverlay.remove();
        }
        
        // Inicializar Macy.js
        initMacy();
        
        // Mostrar las imágenes con animación más rápida después de que Macy esté listo
        setTimeout(() => {
          gallery.classList.add('loaded');
          
          const figures = gallery.querySelectorAll('figure');
          figures.forEach((figure, index) => {
            setTimeout(() => {
              figure.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
              figure.style.opacity = "1";
              figure.style.transform = "translateY(0) scale(1)";
            }, index * 50); // Más rápido: 50ms en lugar de 100ms
          });
          
          // Inicializar PhotoSwipe
          lightbox = initPhotoSwipe();
          console.log('PhotoSwipe inicializado');
        }, 150); // Más rápido: 150ms en lugar de 300ms
      }, 500); // Delay mínimo para mostrar el overlay
    });

  }, 200);
}

// Función para mostrar imágenes aleatorias en la página principal
function homeImages() {
  console.log('Cargando galería de inicio...');
  
  // Verificar si contentStructure está cargado
  if (!contentStructure || !contentStructure["random"]) {
    // Si la estructura no está cargada todavía, programar para ejecutar después
    setTimeout(homeImages, 100);
    return;
  }

  const gallery = document.getElementById("gallery");

  // Regresar scroll al inicio de forma instantánea
  window.scrollTo(0, 0);

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
function populateHomeGallery(gallery) {
  console.log('Poblando galería de inicio...');
  
  // Limpiar completamente la galería
  clearGallery();

  // Obtener las imágenes aleatorias
  const images = contentStructure["random"];
  console.log(`Preparando ${images.length} imágenes aleatorias`);

  // Preparar galería
  gallery.classList.remove("fade-out");
  gallery.classList.add("fade-in");

  // Crear elementos para todas las imágenes primero
  images.forEach((image, index) => {
    const imgContainer = document.createElement("figure");
    imgContainer.className = "";
    imgContainer.style.opacity = "0"; // Inicialmente oculto
    imgContainer.style.transform = "translateY(30px) scale(0.95)";

    const imgLink = document.createElement("a");
    imgLink.href = image;
    imgLink.className = "pswp-item";

    const img = document.createElement("img");
    img.src = image;
    img.className = "w-full rounded-xl shadow";
    img.alt = `Imagen ${index + 1}`;

    // Pre-carga la imagen para obtener sus dimensiones reales
    const tempImg = new Image();
    tempImg.onload = function () {
      imgLink.dataset.pswpWidth = tempImg.naturalWidth;
      imgLink.dataset.pswpHeight = tempImg.naturalHeight;
    };
    tempImg.src = image;

    imgLink.appendChild(img);
    imgContainer.appendChild(imgLink);
    gallery.appendChild(imgContainer);
  });

  // Agregar overlay de carga después de las imágenes
  const loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-overlay";
  loadingOverlay.textContent = "Cargando...";
  gallery.appendChild(loadingOverlay);

  // Mostrar el overlay inmediatamente
  setTimeout(() => {
    loadingOverlay.style.opacity = "1";
  }, 10);

  // Esperar a que todas las imágenes se carguen
  waitForImagesToLoad(gallery, () => {
    console.log('Todas las imágenes cargadas, inicializando Macy.js...');
    
    // Agregar un delay mínimo para que se vea el overlay
    setTimeout(() => {
      // Remover overlay de carga
      if (loadingOverlay && loadingOverlay.parentNode) {
        loadingOverlay.remove();
      }
      
      // Inicializar Macy.js
      initMacy();
      
      // Mostrar las imágenes con animación más rápida después de que Macy esté listo
      setTimeout(() => {
        gallery.classList.add('loaded');
        
        const figures = gallery.querySelectorAll('figure');
        figures.forEach((figure, index) => {
          setTimeout(() => {
            figure.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
            figure.style.opacity = "1";
            figure.style.transform = "translateY(0) scale(1)";
          }, index * 50); // Más rápido: 50ms en lugar de 100ms
        });
        
        // Inicializar PhotoSwipe
        lightbox = initPhotoSwipe();
        console.log('PhotoSwipe inicializado para galería de inicio');
      }, 150); // Más rápido: 150ms en lugar de 300ms
    }, 500); // Delay mínimo para mostrar el overlay
  });
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

// Función para limpiar completamente la galería
function clearGallery() {
  console.log('Iniciando limpieza de galería...');
  
  const gallery = document.getElementById("gallery");
  console.log('Galería encontrada:', !!gallery);
  
  // Destruir Macy.js
  if (macyInstance) {
    console.log('Destruyendo Macy.js...');
    try {
      if (typeof macyInstance.destroy === 'function') {
        macyInstance.destroy();
        console.log('Macy.js destruido exitosamente');
      } else {
        console.log('No se encontró método de destrucción');
      }
    } catch (error) {
      console.error('Error al destruir Macy.js:', error);
    }
    macyInstance = null;
  } else {
    console.log('No hay instancia de Macy.js para destruir');
  }
  
  // Destruir PhotoSwipe
  if (lightbox) {
    console.log('Destruyendo PhotoSwipe...');
    try {
      lightbox.destroy();
      console.log('PhotoSwipe destruido exitosamente');
    } catch (error) {
      console.error('Error al destruir PhotoSwipe:', error);
    }
    lightbox = null;
  } else {
    console.log('No hay instancia de PhotoSwipe para destruir');
  }
  
  // Limpiar galería
  console.log('Limpiando contenido de la galería...');
  gallery.innerHTML = "";
  gallery.className = "pswp-gallery"; // Remover clase 'loaded'
  console.log('Limpieza de galería completada');
}

// Cargar la estructura de contenido cuando se carga la página
document.addEventListener("DOMContentLoaded", loadContentStructure);

const nameTitle = document.getElementById("name-title");
nameTitle.onclick = homeImages;
