import {buildQueryString} from 'aurelia-path';
import {HttpClient} from 'aurelia-fetch-client';
import extend from 'extend';

/**
 * Rest class. A simple rest client to fetch resources
 */
export class Rest {

  /**
   * The defaults to apply to anc request
   *
   * @param {{}} defaults The fetch client options
   */
  defaults: {} = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  /**
   * Inject the httpClient to use for requests.
   *
   * @param {HttpClient} httpClient The httpClient to use
   * @param {string}     [endpoint] The endpoint name
   */
  constructor(httpClient: HttpClient, endpoint: string) {
    this.client   = httpClient;
    this.endpoint = endpoint;
  }

  /**
   * Make a request to the server.
   *
   * @param {string} method     The fetch method
   * @param {string} path       Path to the resource
   * @param {{}}     [body]     The body to send if applicable
   * @param {{}}     [options]  Fetch options overwrites
   *
   * @return {Promise<any>|Promise<Error>} Server response as Object
   */
  request(method: string, path: string, body?: {}, options?: {}): Promise<any|Error> {
    let requestOptions = extend(true, {headers: {}}, this.defaults, options || {}, {method, body});

    let contentType = requestOptions.headers['Content-Type'] || requestOptions.headers['content-type'];

    if (typeof body === 'object' && contentType) {
      requestOptions.body = contentType.toLowerCase() === 'application/json'
                          ? JSON.stringify(body)
                          : buildQueryString(body);
    }

    return this.client.fetch(path, requestOptions).then(response => {
      if (response.status >= 200 && response.status < 400) {
        return response.json().catch(error => null);
      }

      throw response;
    });
  }

  /**
   * Find a resource.
   *
   * @param {string}           resource  Resource to find in
   * @param {{}|string|Number} criteria  Object for where clause, string / number for id.
   * @param {{}}               [options] Extra fetch options.
   *
   * @return {Promise<any>|Promise<Error>} Server response as Object
   */
  find(resource: string, criteria?: {}, options?: {}): Promise<any|Error> {
    return this.request('GET', getRequestPath(resource, criteria), undefined, options);
  }

  /**
   * Create a new instance for resource.
   *
   * @param {string} resource  Resource to create
   * @param {{}}     body      The data to post (as Object)
   * @param {{}}     [options] Extra fetch options.
   *
   * @return {Promise<any>|Promise<Error>} Server response as Object
   */
  post(resource: string, body?: {}, options?: {}): Promise<any|Error> {
    return this.request('POST', resource, body, options);
  }

  /**
   * Update a resource.
   *
   * @param {string}           resource  Resource to update
   * @param {{}|string|Number} criteria  Object for where clause, string / number for id.
   * @param {object}           body      New data for provided criteria.
   * @param {{}}               [options] Extra fetch options.
   *
   * @return {Promise<any>|Promise<Error>} Server response as Object
   */
  update(resource: string, criteria?: {}|string|Number, body?: {}, options?: {}): Promise<any|Error> {
    return this.request('PUT', getRequestPath(resource, criteria), body, options);
  }

  /**
   * Patch a resource.
   *
   * @param {string}           resource  Resource to patch
   * @param {{}|string|Number} criteria  Object for where clause, string / number for id.
   * @param {object}           body      Data to patch for provided criteria.
   * @param {{}}               [options] Extra fetch options.
   *
   * @return {Promise<any>|Promise<Error>} Server response as Object
   */
  patch(resource: string, criteria?: {}|string|Number, body?: {}, options?: {}): Promise<any|Error> {
    return this.request('PATCH', getRequestPath(resource, criteria), body, options);
  }

  /**
   * Delete a resource.
   *
   * @param {string}           resource  The resource to delete
   * @param {{}|string|Number} criteria  Object for where clause, string / number for id.
   * @param {{}}               [options] Extra fetch options.
   *
   * @return {Promise<any>|Promise<Error>} Server response as Object
   */
  destroy(resource: string, criteria?: {}|string|Number, options?: {}): Promise<any|Error> {
    return this.request('DELETE', getRequestPath(resource, criteria), undefined, options);
  }

  /**
   * Create a new instance for resource.
   *
   * @param {string} resource  The resource to create
   * @param {{}}     body      The data to post (as Object)
   * @param {{}}     [options] Extra fetch options.
   *
   * @return {Promise<any>|Promise<Error>} Server response as Object
   */
  create(resource: string, body?: {}, options?: {}): Promise<any|Error> {
    return this.post(...arguments);
  }
}

function getRequestPath(resource, criteria) {
  if (typeof criteria === 'object' && criteria !== null) {
    resource += `?${buildQueryString(criteria)}`;
  } else if (criteria) {
    let hasSlash = resource.slice(-1) === '/';
    resource += `${hasSlash ? '' : '/'}${criteria}${hasSlash ? '/' : ''}`;
  }

  return resource;
}
