import { api } from "../lib/api";

/**
 * Lấy danh sách sản phẩm từ backend.
 * Hỗ trợ filter theo category, search, sort, phân trang.
 */

export async function getProducts({
  page = 1,
  limit = 12,
  category,   // ví dụ "bean", "accessories"
  q,          // text search
  sort,       // "price_asc", "price_desc", "newest", ...
} = {}) {
  const params = { page, limit };
  if (category && category !== "all") params.category = category;
  if (q) params.q = q;
  if (sort) params.sort = sort;

  const { data } = await api.get("/api/products", { params });
  // BE nên trả { items:[], total, page, pages } — nếu khác thì map lại ở đây
  return data;
}

export async function getProduct(id) {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
}
