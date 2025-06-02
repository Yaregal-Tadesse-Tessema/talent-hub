/* eslint-disable prettier/prettier */
import { CollectionQuery, FilterOperator, Order, Where } from './query';

// Function to encode a CollectionQuery object to a custom URL query string
export function encodeCollectionQuery(query: CollectionQuery): string {
  const queryParams: string[] = [];

  if (query.select && query.select.length > 0) {
    queryParams.push(`s=${query.select.join(',')}`);
  }

  if (query.where && query.where.length > 0) {
    queryParams.push(`w=${encodeWhere(query.where)}`);
  }

  if (query.take !== undefined) {
    queryParams.push(`t=${query.take}`);
  }

  if (query.skip !== undefined) {
    queryParams.push(`sk=${query.skip}`);
  }

  if (query.orderBy && query.orderBy.length > 0) {
    queryParams.push(`o=${encodeOrderBy(query.orderBy)}`);
  }

  if (query.includes && query.includes.length) {
    queryParams.push(`i=${query.includes.join(',')}`);
  }

  if (query.groupBy && query.groupBy.length) {
    queryParams.push(`g=${query.groupBy.join(',')}`);
  }

  if (query.having && query.having.length) {
    queryParams.push(`h=${encodeWhere(query.having)}`);
  }

  if (query.count) {
    queryParams.push(`c=true`);
  }

  return queryParams.join('&');
}

// Function to decode a custom URL query string into a CollectionQuery object
export function decodeCollectionQuery(queryString: string): CollectionQuery {
  if (!queryString || queryString == '' || queryString == '') {
    return new CollectionQuery();
  }
  const query: CollectionQuery = new CollectionQuery();
  const queryParams = new URLSearchParams(queryString.replace(/\+/g, '%2B'));

  if (queryParams.has('s') && queryParams.get('s')) {
    query.select = queryParams.get('s')!.split(',');
  }

  if (queryParams.has('w') && queryParams.get('w')) {
    query.where = decodeWhere(queryParams.get('w')!);
  }

  if (queryParams.has('t')) {
    query.take = parseInt(queryParams.get('t')!, 10);
  }

  if (queryParams.has('sk') && queryParams.get('sk')) {
    query.skip = parseInt(queryParams.get('sk')!, 10);
  }

  if (queryParams.has('o') && queryParams.get('o')) {
    query.orderBy = decodeOrderBy(queryParams.get('o')!);
  }

  if (queryParams.has('i') && queryParams.get('i')) {
    query.includes = queryParams.get('i')!.split(',');
  }

  if (queryParams.has('g') && queryParams.get('g')) {
    query.groupBy = queryParams.get('g')!.split(',');
  }

  if (queryParams.has('h') && queryParams.get('h')) {
    query.having = decodeWhere(queryParams.get('h')!);
  }

  if (queryParams.has('c') && queryParams.get('c')) {
    query.count = queryParams.get('c') === 'true';
  }

  return query;
}

// Helper function to encode a Where array to a compact string
function encodeWhere(where: Where[][]): string {
  return where.map(encodeWhereGroup).join('|');
}

// Helper function to decode a compact string to a Where array
function decodeWhere(encoded: string): Where[][] {
  const where = encoded.split('|').map(decodeWhereGroup);
  return where;
}

// Helper function to encode a Where group to a compact string
function encodeWhereGroup(group: Where[]): string {
  return group.map(encodeWhereItem).join(',');
}

// Helper function to decode a compact string to a Where group
function decodeWhereGroup(encoded: string): Where[] {
  return encoded.split(',').map(decodeWhereItem);
}

// Helper function to encode a Where item to a compact string
function encodeWhereItem(item: Where): string {
  return `${item.column}:${item.operator}:${item.value}`;
}

// Helper function to decode a compact string to a Where item
function decodeWhereItem(encoded: string): Where {
  const parts = encoded.split(':');
  const joinedString = parts.slice(2, 6).join(':');
  return {
    column: parts[0],
    operator: parts[1] as FilterOperator,
    value: joinedString,
  };
}

// Helper function to encode an Order array to a compact string
function encodeOrderBy(orderBy: Order[]): string {
  return orderBy.map(encodeOrderItem).join(',');
}

// Helper function to decode a compact string to an Order array
function decodeOrderBy(encoded: string): Order[] {
  return encoded.split(',').map(decodeOrderItem);
}

// Helper function to encode an Order item to a compact string
function encodeOrderItem(item: Order): string {
  return `${item.column}:${item.direction || 'asc'}`;
}

// Helper function to decode a compact string to an Order item
function decodeOrderItem(encoded: string): Order {
  const parts = encoded.split(':');
  return {
    column: parts[0],
    direction: parts[1] as 'ASC' | 'DESC',
  };
}
