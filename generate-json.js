const fs = require("fs");
const path = require("path");
// Variable para controlar el número de fotos por carpeta
const PHOTOS_PER_FOLDER = 2;

function scanDirectory(dir, basePath) {
  const result = {};
  fs.readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .forEach((dirent) => {
      const subdirPath = path.join(dir, dirent.name);
      const relativePath = path.join(basePath, dirent.name);

      // Obtenemos la categoría principal de la ruta
      const category = basePath;
      // Obtenemos la subcategoría (nombre de la carpeta actual)
      const subcategory = dirent.name;

      const images = fs
        .readdirSync(subdirPath)
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        // Cambio aquí: Construimos la ruta completa para cada imagen
        .map((file) => `content/${category}/${subcategory}/${file}`);

      result[dirent.name] = images;
    });
  return result;
}

function getRandomPhotos(structure) {
  // Array para almacenar las fotos seleccionadas
  const randomPhotos = [];
  // Recorrer todas las categorías y subcategorías
  Object.keys(structure).forEach((category) => {
    Object.keys(structure[category]).forEach((subcategory) => {
      // Obtener todas las fotos de esta carpeta
      const folderPhotos = structure[category][subcategory];
      // Si la carpeta tiene fotos, seleccionar algunas al azar
      if (folderPhotos.length > 0) {
        // Ya no necesitamos construir las rutas aquí ya que vienen completas
        const photosWithPaths = folderPhotos;

        // Mezclar las fotos
        const shuffledPhotos = [...photosWithPaths].sort(
          () => Math.random() - 0.5,
        );
        // Seleccionar hasta PHOTOS_PER_FOLDER fotos (o menos si la carpeta no tiene suficientes)
        const selectedCount = Math.min(
          PHOTOS_PER_FOLDER,
          shuffledPhotos.length,
        );
        const selectedPhotos = shuffledPhotos.slice(0, selectedCount);
        // Agregar las fotos seleccionadas al resultado
        randomPhotos.push(...selectedPhotos);
      }
    });
  });
  // Mezclar el resultado final para tener un orden aleatorio
  return randomPhotos.sort(() => Math.random() - 0.5);
}

const contentDir = path.join(__dirname, "./src/public/content/");
const structure = {};

fs.readdirSync(contentDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .forEach((dirent) => {
    const categoryPath = path.join(contentDir, dirent.name);
    structure[dirent.name] = scanDirectory(categoryPath, dirent.name);
  });

// Agregar la entrada "random" con fotos aleatorias limitadas por carpeta
structure["random"] = getRandomPhotos(structure);

fs.writeFileSync(
  path.join(__dirname, "./src/content-structure.json"),
  JSON.stringify(structure, null, 2),
);
fs.writeFileSync(
  path.join(__dirname, "./dist/content-structure.json"),
  JSON.stringify(structure, null, 2),
);

console.log("Structure JSON generated successfully!");
