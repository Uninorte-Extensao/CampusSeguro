export function sanitizeFullName(value: string): string {
  return value
    .replace(/[^A-Za-zÀ-ÿ\s'-]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s/, "")
    .slice(0, 80);
}

export function sanitizeEmail(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase().slice(0, 50);
}

export function formatDateBR(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 8);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 4) {
    return numbers.replace(/(\d{2})(\d+)/, "$1/$2");
  }

  return numbers.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
}

/**
 * Converte uma data "DD/MM/AAAA" para o formato ISO "AAAA-MM-DD"
 * esperado pelo backend (pydantic `date`). Retorna null se incompleta.
 */
export function dataBRParaISO(value: string): string | null {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length !== 8) return null;

  const dia = numbers.slice(0, 2);
  const mes = numbers.slice(2, 4);
  const ano = numbers.slice(4, 8);

  return `${ano}-${mes}-${dia}`;
}

export function formatCpf(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return numbers.replace(/(\d{3})(\d+)/, "$1.$2");
  }

  if (numbers.length <= 9) {
    return numbers.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  }

  return numbers.replace(
    /(\d{3})(\d{3})(\d{3})(\d{1,2})/,
    "$1.$2.$3-$4"
  );
}

export function isCpfLike(value: string): boolean {
  const trimmed = value.trim();

  return !trimmed.includes("@") && /^[\d.\-]+$/.test(trimmed);
}

export function formatEmailOrCpf(value: string): string {
  const trimmed = value.trim();

  if (isCpfLike(trimmed)) {
    return formatCpf(trimmed);
  }

  return sanitizeEmail(trimmed);
}