import { Role } from '../generated/prisma/enums';

export default {
  administration: {
    CreateStaff: Role.Admin,
    ReadAllStaff: Role.Admin,
    UpdateStaff: Role.Admin,
    DeleteStaff: Role.Admin,
    DeleteCustomer: Role.Admin,
    DeleteVendor: Role.Admin,
    Approval: Role.Admin,
    ReadPendingVendors: Role.Admin,
    ReadAllCustomers: Role.Admin,
    ReadVendor: Role.Admin,
  },

  address: {
    CreateAddress: Role.Customer,
    UpdateAddress: Role.Customer,
    ReadAllAddress: Role.Customer,
    DeleteAddress: Role.Customer,
    SetdefaultAddress: Role.Customer,
  },
  category: {
    CreateCategory: Role.Admin,
    UpdateCategory: Role.Admin,
    DeleteCategory: Role.Admin,
  },
  product: {
    CreateProduct: Role.Vendor,
    UpdateProduct: Role.Vendor,
    DeleteProduct: Role.Vendor,
    ReadAllProduct: Role.Vendor,
  },
  cart: {
    CreateCart: Role.Customer,
    AddToCart: Role.Customer,
    RemoveFromCart: Role.Customer,
    UpdateCart: Role.Customer,
    RealAll: Role.Customer,
  },

  order: {
    PlaceOrder: Role.Customer,
  }
};
