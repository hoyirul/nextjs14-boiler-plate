/* 
  Author  : Mochammad Hairullah
  Path    : /app/lib/pagination.ts
*/

export function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}