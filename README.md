# Postman Salesforce MCP Server

A Model Context Protocol (MCP) server that provides seamless integration between Postman collections and Salesforce APIs. This server allows you to execute Postman requests, manage Salesforce data, and automate testing workflows through MCP-compatible clients.

## Features

### Postman Integration
- **Collection Management**: Retrieve and inspect Postman collections
- **Request Execution**: Execute individual requests from collections with variable substitution
- **Dynamic Variables**: Support for environment and collection variables
- **Authentication**: Automatic Salesforce token injection

### Salesforce Operations
- **Authentication**: OAuth2 password flow authentication
- **SOQL Queries**: Execute SOQL queries against your Salesforce org
- **CRUD Operations**: Create, read, update, and delete Salesforce records
- **Object Metadata**: Describe Salesforce objects and their fields
- **API Integration**: Full REST API support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/timaw513-emergenit/postman-salesforce-mcp.git
cd postman-salesforce-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### Claude Desktop Configuration

Add to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "postman-salesforce": {
      "command": "node",
      "args": ["/path/to/your/postman-salesforce-mcp/dist/index.js"]
    }
  }
}
```

### Environment Setup

Before using the server, you'll need:

1. **Salesforce Connected App**: Create a connected app in Salesforce with API access
2. **Postman API Key**: Generate an API key from your Postman account
3. **Salesforce Credentials**: Username, password, and security token

## Usage Examples

### 1. Authenticate with Salesforce

```javascript
// Use the authenticate_salesforce tool
{
  "client_id": "your_connected_app_client_id",
  "client_secret": "your_connected_app_client_secret", 
  "username": "your_salesforce_username",
  "password": "your_password_plus_security_token",
  "login_url": "https://login.salesforce.com" // or https://test.salesforce.com for sandbox
}
```

### 2. Set Postman API Key

```javascript
// Use the set_postman_api_key tool
{
  "api_key": "your_postman_api_key"
}
```

### 3. Retrieve Postman Collection

```javascript
// Use the get_postman_collection tool
{
  "collection_id": "your_collection_id"
}
```

### 4. Execute Postman Request

```javascript
// Use the execute_postman_request tool
{
  "collection_id": "your_collection_id",
  "request_name": "Get All Accounts",
  "variables": {
    "limit": "10",
    "fields": "Id,Name,Industry"
  }
}
```

### 5. Query Salesforce Data

```javascript
// Use the salesforce_query tool
{
  "query": "SELECT Id, Name, Industry FROM Account LIMIT 10"
}
```

### 6. Create Salesforce Record

```javascript
// Use the salesforce_create_record tool
{
  "sobject": "Account",
  "data": {
    "Name": "Test Account",
    "Industry": "Technology",
    "Website": "https://example.com"
  }
}
```

## Available Tools

### Authentication & Setup
- `authenticate_salesforce`: Authenticate with Salesforce using OAuth2
- `set_postman_api_key`: Set your Postman API key

### Postman Operations  
- `get_postman_collection`: Retrieve a Postman collection by ID
- `execute_postman_request`: Execute a specific request from a collection

### Salesforce Operations
- `salesforce_query`: Execute SOQL queries
- `salesforce_create_record`: Create new records
- `salesforce_update_record`: Update existing records  
- `salesforce_delete_record`: Delete records
- `describe_salesforce_object`: Get object metadata

## Variable Substitution

The server supports automatic variable substitution in Postman requests:

- `{{instance_url}}`: Automatically replaced with your Salesforce instance URL
- `{{access_token}}`: Automatically replaced with your Salesforce access token
- Custom variables: Pass any additional variables through the `variables` parameter

## Error Handling

The server provides comprehensive error handling:

- Authentication errors with clear messages
- Request validation and parameter checking
- Salesforce API error translation
- Postman API error handling

## Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**: 
   - Verify your connected app settings
   - Check username/password/security token
   - Ensure API access is enabled

2. **Collection Not Found**:
   - Verify the collection ID is correct
   - Check your Postman API key permissions
   - Ensure the collection is accessible

3. **Request Execution Failed**:
   - Check variable substitution
   - Verify request structure in Postman
   - Ensure Salesforce authentication is valid

### Debug Mode

Set environment variable for verbose logging:
```bash
export DEBUG=1
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Salesforce API documentation
- Check Postman API documentation
- Open an issue on GitHub