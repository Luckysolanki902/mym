import User from '../models/User';

/**
 * Helper to get email from MID
 * @param {string} mid 
 * @returns {Promise<string|null>}
 */
export async function getEmailFromMid(mid) {
  try {
    const user = await User.findOne({ mid }).select('email');
    return user ? user.email : null;
  } catch (error) {
    console.error('Error fetching email from MID:', error);
    return null;
  }
}
