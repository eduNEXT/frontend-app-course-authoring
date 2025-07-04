import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const getApiBaseUrl = () => getConfig().STUDIO_BASE_URL;

export const getEntityLinksByDownstreamContextUrl = () => `${getApiBaseUrl()}/api/contentstore/v2/downstreams/`;
export const getContainerEntityLinksByDownstreamContextUrl = () => `${getApiBaseUrl()}/api/contentstore/v2/downstream-containers/`;

export const getEntityLinksSummaryByDownstreamContextUrl = (downstreamContextKey: string) => `${getApiBaseUrl()}/api/contentstore/v2/downstreams/${downstreamContextKey}/summary`;

export interface PaginatedData<T> {
  next: string | null;
  previous: string | null;
  nextPageNum: number | null;
  previousPageNum: number | null;
  count: number;
  numPages: number;
  currentPage: number;
  results: T,
}

export interface BasePublishableEntityLink {
  id: number;
  upstreamContextKey: string;
  upstreamContextTitle: string;
  upstreamVersion: number;
  downstreamUsageKey: string;
  downstreamContextKey: string;
  versionSynced: number;
  versionDeclined: number | null;
  created: string;
  updated: string;
  readyToSync: boolean;
}

export interface PublishableEntityLink extends BasePublishableEntityLink {
  upstreamUsageKey: string;
}

export interface ContainerPublishableEntityLink extends BasePublishableEntityLink {
  upstreamContainerKey: string;
}

export interface PublishableEntityLinkSummary {
  upstreamContextKey: string;
  upstreamContextTitle: string;
  readyToSyncCount: number;
  totalCount: number;
  lastPublishedAt: string;
}

export const getEntityLinks = async (
  downstreamContextKey?: string,
  readyToSync?: boolean,
  upstreamUsageKey?: string,
): Promise<PublishableEntityLink[]> => {
  const { data } = await getAuthenticatedHttpClient()
    .get(getEntityLinksByDownstreamContextUrl(), {
      params: {
        course_id: downstreamContextKey,
        ready_to_sync: readyToSync,
        upstream_usage_key: upstreamUsageKey,
        no_page: true,
      },
    });
  return camelCaseObject(data);
};

export const getContainerEntityLinks = async (
  downstreamContextKey?: string,
  readyToSync?: boolean,
  upstreamContainerKey?: string,
): Promise<ContainerPublishableEntityLink[]> => {
  const { data } = await getAuthenticatedHttpClient()
    .get(getContainerEntityLinksByDownstreamContextUrl(), {
      params: {
        course_id: downstreamContextKey,
        ready_to_sync: readyToSync,
        upstream_container_key: upstreamContainerKey,
        no_page: true,
      },
    });
  return camelCaseObject(data);
};

export const getEntityLinksSummaryByDownstreamContext = async (
  downstreamContextKey: string,
): Promise<PublishableEntityLinkSummary[]> => {
  const { data } = await getAuthenticatedHttpClient()
    .get(getEntityLinksSummaryByDownstreamContextUrl(downstreamContextKey));
  return camelCaseObject(data);
};
