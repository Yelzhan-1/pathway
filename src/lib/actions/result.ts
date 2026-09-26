export type ActionResult<T = null> =
  | { ok: true; error_ru: null; data: T }
  | { ok: false; error_ru: string; data: null };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, error_ru: null, data };
}

export function fail<T = null>(error_ru: string): ActionResult<T> {
  return { ok: false, error_ru, data: null };
}

export function zodErrorRu(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Проверьте введённые данные.";
}
