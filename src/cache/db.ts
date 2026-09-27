/** TypeScript fallback — Metro picks `.native` / `.web` at runtime. */
export {
  cacheEmpresas,
  cacheVendasDia,
  readCachedEmpresas,
  readCachedVendasDia,
} from './db.web';
