import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { SelectQueryBuilder } from 'typeorm';
import { CollectionQuery } from '../collection-query/query';

export async function commonResponse<T>(
  query: CollectionQuery,
  dataQuery: SelectQueryBuilder<T>,
): Promise<DataResponseFormat<T>> {
  const response = new DataResponseFormat<T>();

  if (query.count) {
    response.total = await dataQuery.getCount();
  } else {
    const [result, total] = await dataQuery.getManyAndCount();
    response.total = total;
    response.items = result;
  }
  return response;
}
