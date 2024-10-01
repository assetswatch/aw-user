import Cookies from "js-cookie";
import { checkEmptyVal } from "./common";

/**
 * Sets a cookie with a specified name, value, and options.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 * @param {object} [options] - Additional options (e.g., expires, path).
 */
export const setCookie = (name, value, options = {}) => {
  Cookies.set(name, value, { ...options });
};

/**
 * Gets the value of a specified cookie.
 * @param {string} name - The name of the cookie.
 * @returns {string | undefined} - The value of the cookie, or undefined if not found.
 */
export const getCookie = (name) => {
  const coo = Cookies.get(name);
  return checkEmptyVal(coo) ? coo : JSON.parse(Cookies.get(name));
};

/**
 * Removes a cookie by name.
 * @param {string} name - The name of the cookie.
 * @param {object} [options] - Additional options (e.g., path).
 */
export const removeCookie = (name, options = {}) => {
  Cookies.remove(name, { ...options });
};
