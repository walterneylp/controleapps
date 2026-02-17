export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string
  ) {
    super(message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Nao autenticado") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Sem permissao") {
    super(403, message, "FORBIDDEN");
  }
}
