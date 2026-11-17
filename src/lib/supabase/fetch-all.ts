// Supabase returns at most 1000 rows per request. This keeps asking page by page until every row is loaded,
// so dashboard lists and counts are never cut off at 1000.
type Page<T> = PromiseLike<{ data: T[] | null; error: unknown }>;

export async function fetchAllRows<T>(page: (from: number, to: number) => Page<T>, pageSize = 1000): Promise<{ data: T[]; error: unknown }> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1);
    if (error) return { data: rows, error };
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) return { data: rows, error: null };
  }
}
