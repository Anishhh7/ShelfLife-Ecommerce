export default {
  staff: {
    create: ['admin'],
    readAll: ['admin'],
    update: ['admin'],
    delete: ['admin'],
  },
  vendor: {
    readAll: ['admin'],
    update: ['admin'],
  },
  product: {
    create: ['vendor'],
    update: ['admin', 'vendor'],
    delete: ['admin', 'vendor'],
  },
  order: {
    myOrders: ['customer'],
    vendorOrder: ['vendor'],
    updateVendorStatus: ['vendor'],
    updateAdminStatus: ['admin'],
    readAll: ['admin'],
    cancel:['customer']
  },
  dashboard: {
    vendorStats: ['vendor'],
    adminStats: ['admin'],
    customerStats:['customer']
  },
  review: {
    adminReadAll: ['admin'],
    vendorReadAll: ['vendor'],
    userReadAll: ['user'],
    create:['user'],
    delete: ['admin'],

  },
};
