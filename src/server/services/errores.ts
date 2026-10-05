/**
 * Errores de dominio tipados. Las rutas HTTP los traducen a códigos de estado
 * sin depender del texto del mensaje.
 */
export class ErrorDominio extends Error {
  constructor(
    mensaje: string,
    public readonly status: 400 | 403 | 404 | 409 | 422
  ) {
    super(mensaje);
    this.name = new.target.name;
  }
}

export class RecursoNoEncontradoError extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje, 404);
  }
}

export class PermisoDenegadoError extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje, 403);
  }
}

export class TransicionInvalidaError extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje, 409);
  }
}

export class ReglaNegocioError extends ErrorDominio {
  constructor(mensaje: string) {
    super(mensaje, 422);
  }
}
