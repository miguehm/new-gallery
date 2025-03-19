import PhotoSwipeLightbox from "photoswipe/lightbox";
// import "photoswipe/style.css";
import "photoswipe/dist/photoswipe.css";

export function initPhotoSwipe() {
  const lightbox = new PhotoSwipeLightbox({
    gallery: ".pswp-gallery",
    children: "a",
    pswpModule: () => import("photoswipe"),
    // Añadir opciones para mejorar el comportamiento de gestos y zoom
    wheelToZoom: true, // Permite usar la rueda del mouse para hacer zoom
    pinchToClose: true, // Permite pellizcar para cerrar
    maxZoomLevel: 4, // Nivel máximo de zoom (ajustable según necesidades)
    padding: { top: 20, bottom: 20, left: 20, right: 20 }, // Padding para evitar que las imágenes toquen los bordes
    imageClickAction: "zoom-or-close", // Hacer clic para zoom o cerrar
    tapAction: "zoom-or-close", // Tap para zoom o cerrar
    doubleTapAction: "zoom", // Doble tap para zoom
    secondaryZoomLevel: 2, // Nivel de zoom al hacer doble clic
    preloaderDelay: 0, // Sin retraso al precargar
    allowPanToNext: true, // Permitir deslizar a la siguiente imagen si no hay más zoom
  });

  // Añadir soporte para orientación de imagen (vertical/horizontal)
  lightbox.on("contentLoad", (e) => {
    const { content, isLazy } = e;

    if (content.type === "image") {
      // Pre-cargar la imagen para determinar sus dimensiones reales
      const img = new Image();

      img.onload = function () {
        // Obtener las dimensiones reales de la imagen
        const realWidth = this.width;
        const realHeight = this.height;

        // Actualizar los atributos con las dimensiones reales
        content.element.dataset.pswpWidth = realWidth;
        content.element.dataset.pswpHeight = realHeight;

        // Forzar a PhotoSwipe a actualizar el tamaño
        if (lightbox.pswp && lightbox.pswp.currSlide === content) {
          lightbox.pswp.updateSize(true);
        }
      };

      img.src = content.data.src;
    }
  });

  // Eventos para personalizar el comportamiento
  lightbox.on("uiRegister", function () {
    lightbox.pswp.ui.registerElement({
      name: "custom-caption",
      order: 9,
      isButton: false,
      appendTo: "root",
      html: "",
      onInit: (el) => {
        lightbox.pswp.on("change", () => {
          const currSlideElement = lightbox.pswp.currSlide.data.element;
          let captionHTML = "";
          if (currSlideElement) {
            const img = currSlideElement.querySelector("img");
            const alt = img ? img.alt : "";
            captionHTML = alt
              ? `<div class="pswp__caption__center">${alt}</div>`
              : "";
          }
          el.innerHTML = `<div class="pswp__caption">${captionHTML}</div>`;
        });
      },
    });
  });

  lightbox.init();
  return lightbox;
}
