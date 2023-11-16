import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { convertObjectToSnakeCase } from '../../utils';

export const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;
let getCreateOrRerunCourseUrlFormat;

try {
  getCreateOrRerunCourseUrlFormat = new URL('course/', getApiBaseUrl()).href;
} catch (error) {
  // If constructing URL fails, use template string as a fallback
  getCreateOrRerunCourseUrlFormat = `${getApiBaseUrl()}course/`;
}

export const getCreateOrRerunCourseUrl = getCreateOrRerunCourseUrlFormat;
export const getCourseRerunUrl = (courseId) => new URL(`/api/contentstore/v1/course_rerun/${courseId}`, getApiBaseUrl()).href;
export const getOrganizationsUrl = new URL('organizations', getApiBaseUrl()).href;

/**
 * Get's organizations data.
 * @returns {Promise<Object>}
 */
export async function getOrganizations() {
  const { data } = await getAuthenticatedHttpClient().get(
    getOrganizationsUrl,
  );
  return camelCaseObject(data);
}

/**
 * Get's course rerun data.
 * @returns {Promise<Object>}
 */
export async function getCourseRerun(courseId) {
  const { data } = await getAuthenticatedHttpClient().get(
    getCourseRerunUrl(courseId),
  );
  return camelCaseObject(data);
}

/**
 * Create or rerun course with data.
 * @param {object} data
 * @returns {Promise<Object>}
 */
export async function createOrRerunCourse(courseData) {
  const { data } = await getAuthenticatedHttpClient().post(
    getCreateOrRerunCourseUrl,
    convertObjectToSnakeCase(courseData, true),
  );
  return camelCaseObject(data);
}
