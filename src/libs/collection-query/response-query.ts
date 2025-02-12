/* eslint-disable prettier/prettier */
import { SelectQueryBuilder } from 'typeorm';
import { CollectionQuery } from './query';
import { DataResponseFormat } from '../response-format/data-response-format';

export async function responseQuery<T>(
  query: CollectionQuery,
  dataQuery: SelectQueryBuilder<T>,
): Promise<DataResponseFormat<any>> {
  const response = new DataResponseFormat<any>();

  if (query.count) {
    response.total = await dataQuery.getCount();
  } else {
    const [result, total] = await dataQuery.getManyAndCount();
    response.total = total;
    response.items = result;
  }
  return response;
}
