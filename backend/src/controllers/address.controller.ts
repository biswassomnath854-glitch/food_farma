import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Address } from '../models';
import { sendSuccess, sendError } from '../utils/response';

export const getUserAddresses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const addresses = await Address.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });

    return sendSuccess(res, 'Addresses retrieved successfully', addresses);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch addresses', 500);
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }

    const existingAddresses = await Address.count({ where: { userId: req.user.id } });
    const shouldBeDefault = isDefault || existingAddresses === 0;

    const address = await Address.create({
      userId: req.user.id,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault: shouldBeDefault,
    });

    return sendSuccess(res, 'Address created successfully', address, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create address', 500);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const address = await Address.findOne({ where: { id, userId: req.user.id } });

    if (!address) {
      return sendError(res, 'Address not found', 404);
    }

    const { fullName, phone, addressLine, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
      address.isDefault = true;
    }

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine) address.addressLine = addressLine;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;

    await address.save();

    return sendSuccess(res, 'Address updated successfully', address);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update address', 500);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { id } = req.params;
    const address = await Address.findOne({ where: { id, userId: req.user.id } });

    if (!address) {
      return sendError(res, 'Address not found', 404);
    }

    const wasDefault = address.isDefault;
    await address.destroy();

    if (wasDefault) {
      const remainingAddress = await Address.findOne({ where: { userId: req.user.id } });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    return sendSuccess(res, 'Address deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete address', 500);
  }
};
