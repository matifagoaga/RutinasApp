const MAX_GIF_BYTES = 3 * 1024 * 1024; // 3MB
const MAX_SOURCE_BYTES = 15 * 1024 * 1024; // 15MB tope antes de procesar
const MAX_DIMENSION = 900;
const JPEG_QUALITY = 0.82;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = src;
  });
}

async function compressImage(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

/** Convierte un archivo de imagen/GIF elegido por el usuario en un data URL
 * listo para guardar. Los GIF se conservan tal cual (para no perder la
 * animación); el resto se comprime/redimensiona vía canvas. */
export async function processImageFile(file: File): Promise<string> {
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("La imagen es muy pesada (máx 15MB).");
  }
  if (file.type === "image/gif") {
    if (file.size > MAX_GIF_BYTES) {
      throw new Error("El GIF es muy pesado (máx 3MB). Probá con uno más corto o liviano.");
    }
    return readFileAsDataUrl(file);
  }
  const dataUrl = await readFileAsDataUrl(file);
  try {
    return await compressImage(dataUrl);
  } catch {
    return dataUrl;
  }
}
