/**
 * Pipeline de compresión de imágenes en el cliente (Browser HTML5 Canvas API).
 * Reduce la imagen a máximo 1200px (ancho o alto), calidad 80% WebP o JPEG, garantizando < 250 KB.
 */
export interface OpcionesCompresion {
  maxDimension?: number;
  calidad?: number;
  formato?: 'image/webp' | 'image/jpeg';
}

export async function comprimirImagenEnCliente(
  archivo: File | Blob,
  opciones: OpcionesCompresion = {}
): Promise<{ blob: Blob; url: string; tamanoBytes: number }> {
  const maxDimension = opciones.maxDimension || 1200;
  const calidad = opciones.calidad || 0.8;
  const formato = opciones.formato || 'image/webp';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al decodificar la imagen en el navegador.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            width = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo obtener el contexto 2D del Canvas.'));
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Fallo al exportar el Blob comprimido desde Canvas.'));
            }
            const url = URL.createObjectURL(blob);
            resolve({
              blob,
              url,
              tamanoBytes: blob.size,
            });
          },
          formato,
          calidad
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(archivo);
  });
}

/**
 * Libera la URL de objeto del navegador para evitar fugas de memoria (Memory Leaks)
 * en dispositivos móviles de campo de recursos limitados.
 */
export function liberarUrlImagen(url: string): void {
  if (url && typeof window !== 'undefined' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
