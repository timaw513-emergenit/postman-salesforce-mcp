# Example Usage for Your Salesforce Collection

Based on your collection ID `a5a93a26-cfe9-4509-bef7-537e162497c4`, here are specific examples for using the MCP server with your Salesforce Postman collection.

## Setup Sequence

1. **First, authenticate with Salesforce:**
```
Use tool: authenticate_salesforce
Parameters:
{
  "client_id": "your_salesforce_connected_app_client_id",
  "client_secret": "your_salesforce_connected_app_client_secret",
  "username": "your_salesforce_username@company.com",
  "password": "your_password_with_security_token",
  "login_url": "https://login.salesforce.com"
}
```

2. **Set your Postman API key:**
```
Use tool: set_postman_api_key
Parameters:
{
  "api_key": "PMAK-your-postman-api-key-here"
}
```

3. **Retrieve your Salesforce collection:**
```
Use tool: get_postman_collection
Parameters:
{
  "collection_id": "a5a93a26-cfe9-4509-bef7-537e162497c4"
}
```

## Common Salesforce Operations

### Execute Collection Requests

Once you have your collection, you can execute specific requests. Here are examples for common Salesforce operations:

#### Get All Accounts
```
Use tool: execute_postman_request
Parameters:
{
  "collection_id": "a5a93a26-cfe9-4509-bef7-537e162497c4",
  "request_name": "Get All Accounts",
  "variables": {
    "limit": "50"
  }
}
```

#### Get Account by ID
```
Use tool: execute_postman_request
Parameters:
{
  "collection_id": "a5a93a26-cfe9-4509-bef7-537e162497c4",
  "request_name": "Get Account by ID",
  "variables": {
    "account_id": "0011234567890123"
  }
}
```

#### Create New Account
```
Use tool: execute_postman_request
Parameters:
{
  "collection_id": "a5a93a26-cfe9-4509-bef7-537e162497c4",
  "request_name": "Create Account",
  "variables": {
    "account_name": "Test Company Inc",
    "industry": "Technology"
  }
}
```

#### Update Account
```
Use tool: execute_postman_request
Parameters:
{
  "collection_id": "a5a93a26-cfe9-4509-bef7-537e162497c4",
  "request_name": "Update Account",
  "variables": {
    "account_id": "0011234567890123",
    "phone": "555-123-4567",
    "website": "https://testcompany.com"
  }
}
```

## Direct Salesforce API Operations

You can also use the direct Salesforce tools for operations not covered in your Postman collection:

### Query Data
```
Use tool: salesforce_query
Parameters:
{
  "query": "SELECT Id, Name, Industry, CreatedDate FROM Account WHERE Industry = 'Technology' ORDER BY CreatedDate DESC LIMIT 10"
}
```

### Create Records Directly
```
Use tool: salesforce_create_record
Parameters:
{
  "sobject": "Contact",
  "data": {
    "FirstName": "John",
    "LastName": "Doe",
    "Email": "john.doe@testcompany.com",
    "AccountId": "0011234567890123"
  }
}
```

### Update Records Directly
```
Use tool: salesforce_update_record
Parameters:
{
  "sobject": "Account",
  "id": "0011234567890123",
  "data": {
    "Phone": "555-987-6543",
    "BillingCity": "San Francisco",
    "BillingState": "CA"
  }
}
```

### Get Object Metadata
```
Use tool: describe_salesforce_object
Parameters:
{
  "sobject": "Account"
}
```

## Testing Workflows

### Complete Account Management Flow
1. **Query existing accounts:**
```
Use tool: salesforce_query
Parameters:
{
  "query": "SELECT Id, Name, Industry FROM Account WHERE Name LIKE '%Test%'"
}
```

2. **Create a new test account:**
```
Use tool: execute_postman_request
Parameters:
{
  "collection_id": "a5a93a26-cfe9-4509-bef7-537e162497c4",
  "request_name": "Create Account",
  "variables": {
    "account_name": "Automated Test Account",
    "industry": "Software"
  }
}
```

3. **Verify the creation:**
```
Use tool: salesforce_query
Parameters:
{
  "query": "SELECT Id, Name, Industry, CreatedDate FROM Account WHERE Name = 'Automated Test Account'"
}
```

4. **Update the account:**
```
Use tool: execute_postman_request
Parameters:
{
  "collection_id": "a5a93a26-cfe9-4509-bef7-537e162497c4",
  "request_name": "Update Account",
  "variables": {
    "account_id": "retrieved_id_from_step_3",
    "phone": "555-TEST-123",
    "website": "https://automated-test.com"
  }
}
```

5. **Clean up (optional):**
```
Use tool: salesforce_delete_record
Parameters:
{
  "sobject": "Account",
  "id": "retrieved_id_from_step_3"
}
```

## Variable Mapping

Your Postman collection likely uses these common variables that the MCP server will automatically handle:

- `{{instance_url}}` → Your Salesforce instance URL (e.g., `https://your-org.my.salesforce.com`)
- `{{access_token}}` → Your OAuth access token
- `{{api_version}}` → Salesforce API version (typically `v59.0`)

Additional variables you might need to provide:
- `{{account_id}}` → Specific Account ID for operations
- `{{contact_id}}` → Specific Contact ID for operations
- `{{limit}}` → Query result limits
- `{{fields}}` → Field lists for queries

## Error Handling Examples

If you encounter errors, here's how to troubleshoot:

### Authentication Issues
```
Error: "Salesforce authentication required"
Solution: Run authenticate_salesforce tool first
```

### Collection Access Issues
```
Error: "Failed to fetch Postman collection"
Solution: Verify your API key and collection ID
```

### Request Not Found
```
Error: "Request 'xyz' not found in collection"
Solution: Check the exact request name in your collection
```

### Variable Substitution Issues
```
Error: Variables not being replaced
Solution: Ensure variable names match exactly (case-sensitive)
```

## Tips for Your Specific Collection

1. **Inspect your collection first** using `get_postman_collection` to see all available requests
2. **Note the exact request names** - they must match exactly (case-sensitive)
3. **Check variable names** in your collection to ensure proper substitution
4. **Test authentication** before running other operations
5. **Use direct Salesforce tools** for operations not in your collection

This MCP server gives you the flexibility to use both your existing Postman collection and direct Salesforce API operations through a unified interface.