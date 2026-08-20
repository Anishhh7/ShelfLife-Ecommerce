import prisma from '../config/prisma';
import AppError from '../utils/AppError';

export const addToCart = async (
  userId: number,
  productId: number,
  quantity: number
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new AppError('User id is not valid', 400);
  }
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError('Product id is not valid', 400);
  }

  let cart = await prisma.cart.findFirst({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        items: {
          create: {
            product: {
              connect: {
                id: productId,
              },
            },
            quantity,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return {
      cart,
      action: 'created' as const,
    };
  }

  const item = await prisma.item.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (item) {
    await prisma.item.update({
      where: {
        id: item.id,
      },
      data: {
        quantity: (item.quantity ?? 0) + quantity,
      },
    });
  } else {
    await prisma.item.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  const updateCart = await prisma.cart.findUnique({
    where: {
      id: cart.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return {
    cart: updateCart,
    action: 'updated' as const,
  };
};

export const updateCartItem = async (
  userId: number,
  quantity: number,
  itemId: number
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new AppError('You are not authorized user', 400);
  }

  const cart = await prisma.cart.findFirst({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  if (cart.userId !== userId) {
    throw new AppError(
      'You are not authorized to access this cart',
      403
    );
  }

  const item = cart.items.find(
    (item) => item.id === itemId
  );

  if (!item) {
    throw new AppError('Product not found', 400);
  }

  if (quantity >= item.product.stock) {
    throw new AppError(
      `Only ${item.product.stock} items are available in stock`,
      400
    );
  }
  await prisma.item.update({
    where: {
      id: item.id,
    },
    data: {
      quantity,
    },
  });

  return await prisma.cart.findUnique({
    where: {
      id: cart.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

export const removeItemsFromCart = async (
  userId: number,
  itemsIds: number[]
) => {
  const user = await prisma.user.findUnique({
    where: {
       id:userId
    },
  });

  if (!user) {
    throw new AppError('You are not authorized user', 400);
  }

  const cart = await prisma.cart.findFirst({
    where: {
       userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  if (cart.userId !== userId) {
    throw new AppError(
      'You are not authorized to access this cart',
      403
    );
  }

  const items = cart.items.filter((item) =>
    itemsIds.includes(item.id)
  );

  if (items.length !== itemsIds.length) {
    throw new AppError(
      'One or more items do not belong to this cart',
      400
    );
  }

  await prisma.item.deleteMany({
    where: {
      id: {
        in: itemsIds,
      },
      cartId: cart.id,
    },
  });

  return await prisma.cart.findUnique({
    where: {
      id: cart.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};
