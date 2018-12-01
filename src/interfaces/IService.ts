import { ServiceHandlerFunction } from 'interfaces/ServiceHandlerFunction';

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'ALL';

/**
 * Query string mapping, key is the query string property,
 * value is the path to which to map it.
 * @type QueryMapping
 */
export interface QueryMapping {
    [s: string]: string;
}

/**
 * Url mapping, key is the url string property,
 * value is the path to which to map it.
 * @type QueryMapping
 */
export interface UrlMapping {
    [s: string]: string;
}

export interface IService {
    /**
     * RPC service name corresponds with the name of the method in the proto
     */
    grpcMethod: string;
    /**
     * REST method under which the service is available.
     * @default GET
     * @property method {HttpMethod}
     */
    method: HttpMethod;
    /**
     * REST endpoint on which the service will be exposed
     * @property url {string}
     */
    url: string;
    /**
     * Flag to disable checking of authorization header for an token
     */
    unauthenticated?: boolean;
    /**
     *  Maps query string parameters to request object
     *  @property queryMapping {QueryMapping}
     */
    queryMapping?: QueryMapping;
    /**
     * Maps url parameters to the reuest object
     */
    urlMapping?: UrlMapping;
    /**
     * Handles the actual request
     */
    handler: ServiceHandlerFunction;
}