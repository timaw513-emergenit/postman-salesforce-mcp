#!/bin/bash

# Postman Salesforce MCP Server Setup Script

set -e

echo "🚀 Setting up Postman Salesforce MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Create project structure
echo "📁 Creating project structure..."
mkdir -p src
mkdir -p dist
mkdir -p docs

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Make the binary executable
chmod +x dist/index.js

echo "✅ Build completed successfully!"

# Get the full path to the built server
SERVER_PATH=$(pwd)/dist/index.js

echo ""
echo "🎉 Setup complete! Your MCP server is ready."
echo ""
echo "📍 Server location: $SERVER_PATH"
echo ""
echo "📝 Next steps:"
echo "1. Add the following to your Claude Desktop configuration:"
echo ""
echo "   {"
echo "     \"mcpServers\": {"
echo "       \"postman-salesforce\": {"
echo "         \"command\": \"node\","
echo "         \"args\": [\"$SERVER_PATH\"]"
echo "       }"
echo "     }"
echo "   }"
echo ""
echo "2. Restart Claude Desktop"
echo "3. In Claude, authenticate with Salesforce using:"
echo "   - Your Salesforce connected app credentials"
echo "   - Your Postman API key"
echo ""
echo "4. Test the connection with your collection ID: a5a93a26-cfe9-4509-bef7-537e162497c4"
echo ""

# Check if Claude Desktop config exists and offer to help
CLAUDE_CONFIG_PATH=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    CLAUDE_CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    CLAUDE_CONFIG_PATH="$APPDATA/Claude/claude_desktop_config.json"
else
    CLAUDE_CONFIG_PATH="$HOME/.config/claude/claude_desktop_config.json"
fi

if [ -f "$CLAUDE_CONFIG_PATH" ]; then
    echo "📋 Claude Desktop config found at: $CLAUDE_CONFIG_PATH"
    echo ""
    read -p "Would you like to automatically add this server to your Claude config? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Create a backup
        cp "$CLAUDE_CONFIG_PATH" "$CLAUDE_CONFIG_PATH.backup"
        
        # Check if the config is empty or doesn't have mcpServers
        if [ ! -s "$CLAUDE_CONFIG_PATH" ] || ! grep -q "mcpServers" "$CLAUDE_CONFIG_PATH"; then
            # Create or update the config
            cat > "$CLAUDE_CONFIG_PATH" << EOF
{
  "mcpServers": {
    "postman-salesforce": {
      "command": "node",
      "args": ["$SERVER_PATH"]
    }
  }
}
EOF
            echo "✅ Configuration added to Claude Desktop!"
        else
            echo "⚠️  Existing configuration detected. Please manually add the server configuration."
        fi
        echo "🔄 Please restart Claude Desktop to load the new server."
    fi
else
    echo "📝 Claude Desktop config not found. Please create it manually at:"
    echo "   $CLAUDE_CONFIG_PATH"
fi

echo ""
echo "🔗 For help and examples, see the README.md and docs/example-usage.md files"
echo "💡 Test your setup by asking Claude to authenticate with Salesforce!"
echo ""