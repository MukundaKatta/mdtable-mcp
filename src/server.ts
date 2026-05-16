#!/usr/bin/env node
/**
 * mdtable MCP server. One tool: `render`.
 *
 * Convert an array of JSON objects into a GitHub-flavored Markdown table.
 * Column order is the union of keys (or explicit `columns`). Cells get
 * pipe-escaped and trimmed. Optional alignment per column.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const VERSION = '0.1.0';

export type Align = 'left' | 'center' | 'right';

export interface RenderOpts {
  rows: Record<string, unknown>[];
  columns?: string[];
  align?: Record<string, Align>;
}

function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function alignBar(a: Align | undefined): string {
  switch (a) {
    case 'center':
      return ':---:';
    case 'right':
      return '---:';
    default:
      return '---';
  }
}

export function renderMarkdownTable(opts: RenderOpts): string {
  const rows = opts.rows;
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const columns = opts.columns ?? Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const align = opts.align ?? {};

  const header = '| ' + columns.map(escapeCell).join(' | ') + ' |';
  const sep = '| ' + columns.map((c) => alignBar(align[c])).join(' | ') + ' |';
  const body = rows.map((r) => '| ' + columns.map((c) => escapeCell(r[c])).join(' | ') + ' |');

  return [header, sep, ...body].join('\n');
}

const server = new Server({ name: 'mdtable', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'render',
    description:
      'Render an array of JSON objects as a GitHub-flavored Markdown table. Pipe-escapes cells.',
    inputSchema: {
      type: 'object',
      properties: {
        rows: { type: 'array', items: { type: 'object' } },
        columns: { type: 'array', items: { type: 'string' }, description: 'Optional column order.' },
        align: { type: 'object', description: 'Map of column name → "left" | "center" | "right".' },
      },
      required: ['rows'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'render') return errorResult('unknown tool: ' + name);
    const a = args as unknown as RenderOpts;
    return textResult(renderMarkdownTable(a));
  } catch (err) {
    return errorResult('mdtable failed: ' + (err as Error).message);
  }
});

function textResult(text: string) {
  return { content: [{ type: 'text', text }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`mdtable MCP server v${VERSION} ready on stdio\n`);
}
