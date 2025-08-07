#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { z } from 'zod';

// Types for Salesforce authentication and responses
interface SalesforceAuth {
  access_token: string;
  instance_url: string;
  token_type: string;
}

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanItem[];
}

interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string }>;
    url: {
      raw: string;
      host: string[];
      path: string[];
    };
    body?: {
      mode: string;
      raw?: string;
    };
  };
  response?: any[];
}

class PostmanSalesforceMCP {
  private server: Server;
  private salesforceAuth: SalesforceAuth | null = null;
  private postmanApiKey: string | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'postman-salesforce-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'authenticate_salesforce',
          description: 'Authenticate with Salesforce using OAuth2',
          inputSchema: {
            type: 'object',
            properties: {
              client_id: {
                type: 'string',
                description: 'Salesforce connected app client ID',
              },
              client_secret: {
                type: 'string',
                description: 'Salesforce connected app client secret',
              },
              username: {
                type: 'string',
                description: 'Salesforce username',
              },
              password: {
                type: 'string',
                description: 'Salesforce password + security token',
              },
              login_url: {
                type: 'string',
                description: 'Salesforce login URL (default: https://login.salesforce.com)',
                default: 'https://login.salesforce.com',
              },
            },
            required: ['client_id', 'client_secret', 'username', 'password'],
          },
        },
        {
          name: 'set_postman_api_key',
          description: 'Set Postman API key for collection management',
          inputSchema: {
            type: 'object',
            properties: {
              api_key: {
                type: 'string',
                description: 'Postman API key',
              },
            },
            required: ['api_key'],
          },
        },
        {
          name: 'get_postman_collection',
          description: 'Retrieve a Postman collection by ID',
          inputSchema: {
            type: 'object',
            properties: {
              collection_id: {
                type: 'string',
                description: 'Postman collection ID',
              },
            },
            required: ['collection_id'],
          },
        },
        {
          name: 'execute_postman_request',
          description: 'Execute a request from a Postman collection',
          inputSchema: {
            type: 'object',
            properties: {
              collection_id: {
                type: 'string',
                description: 'Postman collection ID',
              },
              request_name: {
                type: 'string',
                description: 'Name of the request to execute',
              },
              variables: {
                type: 'object',
                description: 'Variables to substitute in the request',
                additionalProperties: { type: 'string' },
              },
            },
            required: ['collection_id', 'request_name'],
          },
        },
        {
          name: 'salesforce_query',
          description: 'Execute a SOQL query against Salesforce',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'SOQL query string',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'salesforce_create_record',
          description: 'Create a record in Salesforce',
          inputSchema: {
            type: 'object',
            properties: {
              sobject: {
                type: 'string',
                description: 'Salesforce object type (e.g., Account, Contact)',
              },
              data: {
                type: 'object',
                description: 'Record data',
                additionalProperties: true,
              },
            },
            required: ['sobject', 'data'],
          },
        },
        {
          name: 'salesforce_update_record',
          description: 'Update a record in Salesforce',
          inputSchema: {
            type: 'object',
            properties: {
              sobject: {
                type: 'string',
                description: 'Salesforce object type',
              },
              id: {
                type: 'string',
                description: 'Record ID',
              },
              data: {
                type: 'object',
                description: 'Updated record data',
                additionalProperties: true,
              },
            },
            required: ['sobject', 'id', 'data'],
          },
        },
        {
          name: 'salesforce_delete_record',
          description: 'Delete a record in Salesforce',
          inputSchema: {
            type: 'object',
            properties: {
              sobject: {
                type: 'string',
                description: 'Salesforce object type',
              },
              id: {
                type: 'string',
                description: 'Record ID',
              },
            },
            required: ['sobject', 'id'],
          },
        },
        {
          name: 'describe_salesforce_object',
          description: 'Get metadata for a Salesforce object',
          inputSchema: {
            type: 'object',
            properties: {
              sobject: {
                type: 'string',
                description: 'Salesforce object type',
              },
            },
            required: ['sobject'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'authenticate_salesforce':
          return this.authenticateSalesforce(request.params.arguments);

        case 'set_postman_api_key':
          return this.setPostmanApiKey(request.params.arguments);

        case 'get_postman_collection':
          return this.getPostmanCollection(request.params.arguments);

        case 'execute_postman_request':
          return this.executePostmanRequest(request.params.arguments);

        case 'salesforce_query':
          return this.salesforceQuery(request.params.arguments);

        case 'salesforce_create_record':
          return this.salesforceCreateRecord(request.params.arguments);

        case 'salesforce_update_record':
          return this.salesforceUpdateRecord(request.params.arguments);

        case 'salesforce_delete_record':
          return this.salesforceDeleteRecord(request.params.arguments);

        case 'describe_salesforce_object':
          return this.describeSalesforceObject(request.params.arguments);

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private async authenticateSalesforce(args: any) {
    const { client_id, client_secret, username, password, login_url = 'https://login.salesforce.com' } = args;

    try {
      const response = await axios.post(
        `${login_url}/services/oauth2/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id,
          client_secret,
          username,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.salesforceAuth = response.data;
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Successfully authenticated with Salesforce',
              instance_url: this.salesforceAuth!.instance_url,
            }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Salesforce authentication failed: ${error.response?.data?.error_description || error.message}`
      );
    }
  }

  private async setPostmanApiKey(args: any) {
    const { api_key } = args;
    this.postmanApiKey = api_key;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Postman API key set successfully',
          }, null, 2),
        },
      ],
    };
  }

  private async getPostmanCollection(args: any) {
    if (!this.postmanApiKey) {
      throw new McpError(ErrorCode.InvalidRequest, 'Postman API key not set');
    }

    const { collection_id } = args;

    try {
      const response = await axios.get(
        `https://api.getpostman.com/collections/${collection_id}`,
        {
          headers: {
            'X-API-Key': this.postmanApiKey,
          },
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to fetch Postman collection: ${error.response?.data?.message || error.message}`
      );
    }
  }

  private async executePostmanRequest(args: any) {
    if (!this.postmanApiKey) {
      throw new McpError(ErrorCode.InvalidRequest, 'Postman API key not set');
    }

    if (!this.salesforceAuth) {
      throw new McpError(ErrorCode.InvalidRequest, 'Salesforce authentication required');
    }

    const { collection_id, request_name, variables = {} } = args;

    try {
      // Get the collection
      const collectionResponse = await axios.get(
        `https://api.getpostman.com/collections/${collection_id}`,
        {
          headers: {
            'X-API-Key': this.postmanApiKey,
          },
        }
      );

      const collection: PostmanCollection = collectionResponse.data.collection;
      
      // Find the request by name
      const request = this.findRequestByName(collection.item, request_name);
      if (!request) {
        throw new McpError(ErrorCode.InvalidRequest, `Request "${request_name}" not found in collection`);
      }

      // Substitute variables
      let url = request.request.url.raw;
      let body = request.request.body?.raw || '';

      // Replace Salesforce instance URL
      url = url.replace('{{instance_url}}', this.salesforceAuth.instance_url);
      
      // Replace other variables
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        url = url.replace(regex, value as string);
        body = body.replace(regex, value as string);
      });

      // Prepare headers
      const headers: Record<string, string> = {};
      request.request.header.forEach(header => {
        let value = header.value;
        if (header.key === 'Authorization' && value.includes('{{access_token}}')) {
          value = value.replace('{{access_token}}', this.salesforceAuth!.access_token);
        }
        headers[header.key] = value;
      });

      // Execute the request
      const config: any = {
        method: request.request.method.toLowerCase(),
        url,
        headers,
      };

      if (body && ['post', 'put', 'patch'].includes(config.method)) {
        config.data = body;
      }

      const response = await axios(config);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              data: response.data,
            }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to execute Postman request: ${error.response?.data?.message || error.message}`
      );
    }
  }

  private findRequestByName(items: PostmanItem[], name: string): PostmanItem | null {
    for (const item of items) {
      if (item.name === name) {
        return item;
      }
      // Handle nested items (folders)
      if ('item' in item) {
        const found = this.findRequestByName((item as any).item, name);
        if (found) return found;
      }
    }
    return null;
  }

  private async salesforceQuery(args: any) {
    if (!this.salesforceAuth) {
      throw new McpError(ErrorCode.InvalidRequest, 'Salesforce authentication required');
    }

    const { query } = args;

    try {
      const response = await axios.get(
        `${this.salesforceAuth.instance_url}/services/data/v59.0/query`,
        {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${this.salesforceAuth.access_token}`,
          },
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Salesforce query failed: ${error.response?.data?.[0]?.message || error.message}`
      );
    }
  }

  private async salesforceCreateRecord(args: any) {
    if (!this.salesforceAuth) {
      throw new McpError(ErrorCode.InvalidRequest, 'Salesforce authentication required');
    }

    const { sobject, data } = args;

    try {
      const response = await axios.post(
        `${this.salesforceAuth.instance_url}/services/data/v59.0/sobjects/${sobject}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.salesforceAuth.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create Salesforce record: ${error.response?.data?.[0]?.message || error.message}`
      );
    }
  }

  private async salesforceUpdateRecord(args: any) {
    if (!this.salesforceAuth) {
      throw new McpError(ErrorCode.InvalidRequest, 'Salesforce authentication required');
    }

    const { sobject, id, data } = args;

    try {
      const response = await axios.patch(
        `${this.salesforceAuth.instance_url}/services/data/v59.0/sobjects/${sobject}/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.salesforceAuth.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Record updated successfully',
              id: id,
            }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update Salesforce record: ${error.response?.data?.[0]?.message || error.message}`
      );
    }
  }

  private async salesforceDeleteRecord(args: any) {
    if (!this.salesforceAuth) {
      throw new McpError(ErrorCode.InvalidRequest, 'Salesforce authentication required');
    }

    const { sobject, id } = args;

    try {
      await axios.delete(
        `${this.salesforceAuth.instance_url}/services/data/v59.0/sobjects/${sobject}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${this.salesforceAuth.access_token}`,
          },
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Record deleted successfully',
              id: id,
            }, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete Salesforce record: ${error.response?.data?.[0]?.message || error.message}`
      );
    }
  }

  private async describeSalesforceObject(args: any) {
    if (!this.salesforceAuth) {
      throw new McpError(ErrorCode.InvalidRequest, 'Salesforce authentication required');
    }

    const { sobject } = args;

    try {
      const response = await axios.get(
        `${this.salesforceAuth.instance_url}/services/data/v59.0/sobjects/${sobject}/describe`,
        {
          headers: {
            Authorization: `Bearer ${this.salesforceAuth.access_token}`,
          },
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to describe Salesforce object: ${error.response?.data?.[0]?.message || error.message}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Postman Salesforce MCP server running on stdio');
  }
}

const server = new PostmanSalesforceMCP();
server.run().catch(console.error);