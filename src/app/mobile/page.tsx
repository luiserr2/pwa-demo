import { redirect } from 'next/navigation';

/**
 * /mobile era una copia divergente de /captura (enviaba técnico/radiobase ficticios).
 * Se unifica en /captura preservando los parámetros de la URL.
 */
export default function MobileRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(searchParams)) {
    if (typeof valor === 'string') params.set(clave, valor);
    else if (Array.isArray(valor) && valor[0]) params.set(clave, valor[0]);
  }
  const qs = params.toString();
  redirect(qs ? `/captura?${qs}` : '/campo');
}
