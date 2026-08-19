import { Role } from '../generated/prisma/enums';

export default {
  administration: {
    CreateStaff: Role.Admin,
    ReadAllStaff: Role.Admin,
    UpdateStaff: Role.Admin,
    DeleteStaff: Role.Admin,
    Approval: Role.Admin,
    ReadPendingVendors: Role.Admin,
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
};
