export default {
 staff: {
  create: ["admin"],
  readAll: ["admin"],
  update: ["admin"],
  delete: ["admin"]
 },
 vendor: {
  readAll: ["admin"],
  update: ["admin"]
 },
 product: {
  create: ["vendor"],
  update: ["admin", "vendor"],
  delete: ["admin", "vendor"]
 },
};
