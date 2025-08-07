# Quick Reference Guide

## Essential Commands

### Setup and Installation
```bash
# Clone and setup
git clone https://github.com/timaw513-emergenit/postman-salesforce-mcp.git
cd postman-salesforce-mcp
chmod +x setup.sh
./setup.sh

# Manual setup
npm install
npm run build

# Development mode
npm run dev
```

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "postman-salesforce": {
      "command": "node",
      "args": ["/absolute/path/to/postman-salesforce-mcp/dist/index.js"]
    }
  }
}
```

## Tool Reference

### 🔐 Authentication
```javascript
// Authenticate with Salesforce
{
  "client_id": "your_connected_app_client_id",
  "client_secret": "your_connected_app_client_secret",
  "username": "your_username@company.com",
  "password": "your_password_with_security_token"
}

// Set Postman API Key
{
  "api_key": "PMAK-your-api-key"
}
```

### 📋 Postman Operations
```javascript
// Get Collection
{
  "collection_id": "a5a93a26-cfe9-4509-bef7-537e162497c4"
}

// Execute Request
{
  "collection_id": "a5a93a26-cfe9-4509-bef7-537e162497c4",
  "request_name": "Get All Accounts",
  "variables": {
    "limit": "10",
    "fields": "Id,Name,Industry"
  }
}
```

### 💾 Salesforce CRUD Operations
```javascript
// Query
{
  "query": "SELECT Id, Name FROM Account LIMIT 10"
}

// Create
{
  "sobject": "Account",
  "data": {
    "Name": "Test Account",
    "Industry": "Technology"
  }
}

// Update
{
  "sobject": "Account",
  "id": "001XXXXXXXXX",
  "data": {
    "Phone": "555-123-4567"
  }
}

// Delete
{
  "sobject": "Account",
  "id": "001XXXXXXXXX"
}

// Describe Object
{
  "sobject": "Account"
}
```

## Common Workflows

### 1. Initial Setup Flow
1. `authenticate_salesforce` → Get Salesforce access
2. `set_postman_api_key` → Enable Postman integration
3. `get_postman_collection` → Inspect your collection
4. `salesforce_query` → Test connection with simple query

### 2. Testing Flow
1. `execute_postman_request` → Run "Get All Accounts"
2. `salesforce_create_record` → Create test account
3. `execute_postman_request` → Run "Update Account" 
4. `salesforce_delete_record` → Cleanup test data

### 3. Data Migration Flow
1. `salesforce_query` → Export existing data
2. `execute_postman_request` → Use collection for bulk operations
3. `salesforce_create_record` → Create new records
4. `describe_salesforce_object` → Verify field mappings

## Troubleshooting Quick Fixes

### Authentication Issues
```bash
# Check credentials
# Verify connected app settings
# Ensure security token is appended to password
# Try sandbox URL: https://test.salesforce.com
```

### Collection Issues  
```bash
# Verify collection ID is correct
# Check API key permissions
# Ensure collection is accessible
# Try fetching collection first
```

### Variable Issues
```bash
# Variable names are case-sensitive
# Check {{variable_name}} format
# Verify variables exist in collection
# Test with simple variables first
```

### Common Error Codes
- **401**: Check authentication credentials
- **403**: Verify API permissions  
- **404**: Check resource IDs/names
- **500**: Server error - check logs

## File Locations

### Key Files
- **Main Server**: `src/index.ts`
- **Build Output**: `dist/index.js`
- **Configuration**: `package.json`, `tsconfig.json`
- **Documentation**: `README.md`, `docs/`

### Configuration Paths
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

## Your Collection Specifics

**Collection ID**: `a5a93a26-cfe9-4509-bef7-537e162497c4`

### Automatic Variable Substitution
- `{{instance_url}}` → Your Salesforce instance URL
- `{{access_token}}` → OAuth access token
- `{{api_version}}` → API version (v59.0)

### Custom Variables (examples)
- `{{account_id}}` → Specific Account ID
- `{{limit}}` → Query result limit
- `{{fields}}` → Field selection lists

## Links

- **Repository**: https://github.com/timaw513-emergenit/postman-salesforce-mcp
- **Issues**: https://github.com/timaw513-emergenit/postman-salesforce-mcp/issues
- **Documentation**: [README.md](../README.md)
- **Examples**: [example-usage.md](example-usage.md)
- **Testing**: [testing-plan.md](testing-plan.md)