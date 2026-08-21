// Extrae la URL de la primera imagen markdown (![alt](url)) del contenido de un post.
export function extraerPrimeraImagenMarkdown(contenido) {
  if (!contenido) return null;
  const match = contenido.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match ? match[1] : null;
}

// Imagen a mostrar para un post: la portada explícita si existe, si no la
// primera imagen incrustada en el contenido, si no null (para mostrar placeholder).
export function imagenDePost(post) {
  return post.imagen_portada || extraerPrimeraImagenMarkdown(post.contenido) || null;
}
