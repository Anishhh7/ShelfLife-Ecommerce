import { Role } from '../generated/prisma/enums';

export default {
  administration: {
    CreateStaff: Role.Admin,
    ReadAllStaff: Role.Admin,
    UpdateStaff: Role.Admin,
    DeleteStaff: Role.Admin,
    Approvval: Role.Admin,
    ReadPendingVendors: Role.Admin,
    ReadVendor: Role.Admin,
  },
};
