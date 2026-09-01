import { Role } from '../generated/prisma/enums';
import prisma from '../lib/prisma';
import { userQuery } from '../query/userQuery';
import AppError from '../utils/AppError';
import { changeCloudinaryImage } from '../utils/uploadToCloudinary';

export const approvedVendors = async (vendorId: number) => {
  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
    },
  });

  if (!vendor) {
    throw new AppError('Invalid vendor id', 404);
  }

  if (vendor.role !== 'Vendor') {
    throw new AppError('User is not a vendor', 400);
  }

  if (vendor.approved === true) {
    throw new AppError('Vendor is already approved', 400);
  }

  return prisma.user.update({
    where: {
      id: vendorId,
      approved: false,
    },
    data: {
      approved: true,
    },
  });
};

export const getAllAdministration = async (query: unknown) => {
  return userQuery.list(query, { role: 'Staff' });
};

export const getAllVendors = async (query: unknown) => {
  return userQuery.list(query, { role: 'Vendor', approved: true });
};
export const getAllPendingVendors = async (query: unknown) => {
  return userQuery.list(query, { role: 'Vendor', approved: false });
};
export const getAllCustomers = async (query: unknown) => {
  return userQuery.list(query, { role: 'Customer' });
};

export const deleteUserByRole = async (role: Role, ids: number[]) => {
  return prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({
      where: { id: { in: ids }, role },
      select: { id: true },
    });

    if (users.length !== ids.length) {
      const found = new Set(users.map((user) => user.id));
      throw (
        new AppError(
          `Some ${role.toLocaleLowerCase}s were not found`,
          404
        ),
        {
          missing: ids.filter((id) => !found.has(id)),
        }
      );
    }

    const validIds = users.map((user) => user.id);
    await tx.user.deleteMany({
      where: { id: { in: validIds }, role },
    });

    return validIds;
  });
};
export const changeProfilePhoto = async (
  staffId: number,
  file: Express.Multer.File
) => {
  if (!file) {
    throw new AppError('Profile photo is required', 400);
  }

  const staff = await prisma.user.findUnique({
    where: {
      id: staffId,
    },
  });

  if (staff?.role !== Role.Staff) {
    throw new AppError('Staff not found', 404);
  }

  const newImage = await changeCloudinaryImage(
    staff.profileImagePublicId,
    file,
    'shelflife/profiles'
  );

  return prisma.user.update({
    where: {
      id: staffId,
    },
    data: {
      profilePhotoUrl: newImage.url,
      profilePhotoPublicId: newImage.publicId,
    },
  });
};
