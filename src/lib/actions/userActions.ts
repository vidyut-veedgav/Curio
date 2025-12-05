'use server'

import { prisma } from '@/lib/prisma/db';

export interface UpdateUserDataInput {
  name?: string;
  bio?: string;
}

/**
 * Retrieves user data by user ID
 */
export async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Updates user profile information
 *
 * Business Logic:
 * - Email cannot be changed through this function (handled by auth layer)
 * - Only provided fields are updated
 */
export async function setUserData(userId: string, data: UpdateUserDataInput) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.bio !== undefined && { bio: data.bio }),
    },
  });
}

/**
 * Creates a new user
 * Note: Typically called by auth layer during signup
 */
export async function createUser(data: {
  email: string;
  name?: string;
  bio?: string;
}) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  return prisma.user.create({
    data,
  });
}
