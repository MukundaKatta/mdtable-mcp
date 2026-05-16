# mdtable-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/mdtable-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/mdtable-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)

MCP server: render JSON arrays of objects as GitHub-flavored Markdown
tables. Escapes pipes, supports column ordering, and per-column alignment.

## Tool

### `render`

```json
{
  "rows": [
    { "name": "Mukunda", "age": 30 },
    { "name": "Alex", "age": 25 }
  ],
  "align": { "age": "right" }
}
```

→

```
| name | age |
| --- | ---: |
| Mukunda | 30 |
| Alex | 25 |
```

## Configure

```json
{ "mcpServers": { "mdtable": { "command": "npx", "args": ["-y", "@mukundakatta/mdtable-mcp"] } } }
```

## License

MIT.
