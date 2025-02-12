/* eslint-disable prettier/prettier */
import {
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  TreeRepository,
} from 'typeorm';
import { FilterOperators } from './filter_operators';
import { CollectionQuery, Order, Where } from './query';

const addFilterConditions = (
  op: string,
  value: any,
  queryCondition: string,
  queryParam: string,
) => {
  if (
    op === FilterOperators.Between &&
    Array.isArray(value) &&
    value.length === 2
  ) {
    // Handle "between" operator for the main ${aggregate}
    return `${queryCondition} BETWEEN :${queryParam}_1 AND :${queryParam}_2`;
  } else if (op === FilterOperators.In && Array.isArray(value)) {
    // Handle "in" operator for the main ${aggregate}
    return `${queryCondition} IN (:...${queryParam})`;
  } else if (op === FilterOperators.NotIn && Array.isArray(value)) {
    // Handle "in" operator for the main ${aggregate}
    return `${queryCondition} Not IN (:...${queryParam})`;
  } else if (op === FilterOperators.IsNull) {
    // Handle "isNull" operator for the main ${aggregate}
    return `${queryCondition} IS NULL`;
  } else if (op === FilterOperators.IsNotNull) {
    // Handle "notNull" operator for the main ${aggregate}
    return `${queryCondition} IS NOT NULL`;
  } else if (op === FilterOperators.EqualTo) {
    return `${queryCondition} = :${queryParam}`;
  } else if (op === FilterOperators.GreaterThan) {
    return `${queryCondition} > :${queryParam}`;
  } else if (op === FilterOperators.LessThan) {
    return `${queryCondition} < :${queryParam}`;
  } else if (op === FilterOperators.LessThanOrEqualTo) {
    return `${queryCondition} <= :${queryParam}`;
  } else if (op === FilterOperators.GreaterThanOrEqualTo) {
    return `${queryCondition} >= :${queryParam}`;
  } else if (op === FilterOperators.NotEqualTo) {
    return `${queryCondition} != :${queryParam}`;
  } else if (op === FilterOperators.All) {
    return `${queryCondition} = ALL(:${queryParam})`;
  } else if (op === FilterOperators.Any) {
    return `${queryCondition} = ANY(:${queryParam})`;
  } else if (op === FilterOperators.Like) {
    return `${queryCondition} LIKE(:${queryParam})`;
  } else if (op === FilterOperators.ILike) {
    return `${queryCondition} ILIKE(:${queryParam})`;
  } else if (op === FilterOperators.NotEqual) {
    return `${queryCondition} <> :${queryParam}`;
  } else {
    return `${queryCondition} ${op} :${queryParam}`;
  }
};

const addFilterParams = (op: string, value: any, column: string, acc: any) => {
  if (
    op === FilterOperators.Between &&
    Array.isArray(value) &&
    value.length === 2
  ) {
    // Handle "between" operator for the main ${aggregate}
    acc[`${column}_1`] = value[0];
    acc[`${column}_2`] = value[1];
  } else if (op === FilterOperators.In && Array.isArray(value)) {
    // Handle "in" operator for the main ${aggregate}
    acc[column] = value;
  } else if (op === FilterOperators.Like || op === FilterOperators.ILike) {
    // Handle "in" operator for the main ${aggregate}
    acc[column] = `%${value}%`;
  } else if (op === FilterOperators.All || op === FilterOperators.Any) {
    // Handle "ALL" and "ANY" operators for the main ${aggregate}
    acc[column] = value;
  } else {
    acc[column] = value;
  }
  return acc;
};
const attributeMapper = (
  op: string,
  value: string,
  relation: string,
  field: string,
) => {
  if (field.includes('->>')) {
    const [mainColumn, nestedColumn] = field.split('->>');
    return addFilterConditions(
      op,
      value,
      `"${relation}"."${mainColumn}"->>'${nestedColumn}'`,
      `${mainColumn}_${nestedColumn}`,
    );
  } else {
    return addFilterConditions(
      op,
      value,
      `${relation}.${field}`,
      `${relation}_${field}`,
    );
  }
};
const applyWhereConditions = <T>(
  aggregate: string,
  queryBuilder: SelectQueryBuilder<T>,
  whereConditions: Where[][],
) => {
  let paramCounter = 0; // To ensure unique parameter names

  for (const [index, conditions] of whereConditions.entries()) {
    const operator = index === 0 ? 'where' : 'andWhere';
    let count = 0;

    queryBuilder[operator]((subQuery) => {
      const orConditions = conditions.map(({ column, value, operator: op }) => {
        const paramName = `${column.replace(/\W/g, '_')}_${paramCounter++}`; // Unique parameter name

        if (column.includes('.')) {
          const [relation, field] = column.split('.');
          value = attributeMapper(op, value, relation, field);

          if (field.includes('->>')) {
            const [mainColumn, nestedColumn] = field.split('->>');
            return addFilterConditions(
              op,
              `:${paramName}`,
              `"${relation}"."${mainColumn}"->>'${nestedColumn}'`,
              paramName,
            );
          } else {
            return addFilterConditions(
              op,
              `:${paramName}`,
              `${relation}.${field}`,
              paramName,
            );
          }
        } else {
          const [mainColumn, nestedColumn] = column.split('->>');

          if (nestedColumn) {
            value = attributeMapper(op, value, aggregate, mainColumn);
            return addFilterConditions(
              op,
              `:${paramName}`,
              `${aggregate}."${mainColumn}"->>'${nestedColumn}'`,
              paramName,
            );
          } else {
            attributeMapper(op, value, aggregate, column);
            return addFilterConditions(
              op,
              `:${paramName}`,
              `${aggregate}."${column}"`,
              paramName,
            );
          }
        }
      });

      const queryParams = conditions.reduce(
        (acc, { column, value, operator: op }) => {
          const paramName = `${column.replace(/\W/g, '_')}_${paramCounter - conditions.length + count++}`;
          acc = addFilterParams(op, value, paramName, acc);
          return acc;
        },
        {},
      );

      if (orConditions.length) {
        subQuery.andWhere(`(${orConditions.join(' OR ')})`, queryParams);
      }
    });

    queryBuilder.expressionMap.wheres =
      queryBuilder.expressionMap.wheres.filter((f) => f.condition);
  }
};



const applyOrderBy = <T>(
  aggregate: string,
  queryBuilder: SelectQueryBuilder<T>,
  orderBy: Order[],
) => {
  orderBy.forEach(({ column, direction = 'ASC', nulls }) => {
    if (column.includes('.')) {
      const [relation, field] = column.split('.');
      queryBuilder.addOrderBy(`${relation}.${field}`, direction, nulls);
    } else {
      queryBuilder.addOrderBy(`${aggregate}.${column}`, direction, nulls);
    }
  });
};

const applyIncludes = <T>(
  aggregate: string,
  queryBuilder: SelectQueryBuilder<T>,
  includes: string[],
) => {
  includes.forEach((relatedEntity) => {
    if (relatedEntity.includes('.')) {
      const [parent, child] = relatedEntity.split('.');
      queryBuilder.leftJoinAndSelect(`${parent}.${child}`, `${child}`);
    } else {
      queryBuilder.leftJoinAndSelect(
        `${aggregate}.${relatedEntity}`,
        relatedEntity,
      );
    }
  });
};

const applyGroupBy = <T>(
  aggregate: string,
  queryBuilder: SelectQueryBuilder<T>,
  groupBy: string[],
) => {
  groupBy.forEach((column, index) => {
    groupBYItem(aggregate, queryBuilder, column, index);
  });
};
const groupBYItem = <T>(
  aggregate: string,
  queryBuilder: SelectQueryBuilder<T>,
  groupByColumnItem: string,
  index: number,
) => {
  const col = groupByColumnItem.split(':')[0].split('.');
  if (col.length > 1) {
    const groupByColumn = groupByColumnItem.split(':');
    const firstIndex = groupByColumn[0].split('.');
    const childEntity = firstIndex[0];
    const attributes = firstIndex[1].split(':');
    const childEntityAttribute = attributes[0];
    let jsonBuildObjects = ``;
    if (groupByColumn.length > 1) {
      const selectedColumns = groupByColumn.slice(1);
      selectedColumns.map((item, index) => {
        const attributeEntity = item.split('.');
        jsonBuildObjects =
          jsonBuildObjects +
          (attributeEntity.length > 1
            ? `'${attributeEntity[1]}',"${attributeEntity[0]}"."${attributeEntity[1]}"` +
              (index < selectedColumns.length - 1 ? ',' : '')
            : `'${item}',"${aggregate}"."${item}"` +
              (index < selectedColumns.length - 1 ? ',' : ''));
      });
    }
    queryBuilder.addSelect(
      `JSON_AGG(JSON_BUILD_OBJECT(${jsonBuildObjects})) AS "categorized_By_${aggregate}_${index}"`,
    );
    queryBuilder.innerJoin(`${aggregate}.${childEntity}`, `${childEntity}`);
    queryBuilder.addGroupBy(`${childEntity}.${childEntityAttribute}`);
  } else {
    const groupByColumn = groupByColumnItem.split(':');
    const selectedColumns = groupByColumn.slice(1);
    let jsonBuildObjects = ``;
    if (groupByColumn.length > 1) {
      selectedColumns.map((item, index) => {
        const attributeEntity = item.split('.');
        jsonBuildObjects =
          jsonBuildObjects +
          (attributeEntity.length > 1
            ? `'${attributeEntity[1]}',"${attributeEntity[0]}"."${attributeEntity[1]}"` +
              (index < selectedColumns.length - 1 ? ',' : '')
            : `'${item}',"${aggregate}"."${item}"` +
              (index < selectedColumns.length - 1 ? ',' : ''));
        if (attributeEntity.length > 1) {
          queryBuilder.innerJoin(
            `${aggregate}.${attributeEntity[0]}`,
            `${attributeEntity[0]}`,
          );
        }
      });
    }
    queryBuilder.addSelect(
      `JSON_AGG(JSON_BUILD_OBJECT(${jsonBuildObjects})) AS "categorized_By_${aggregate}_${index}"`,
    );
    queryBuilder.addGroupBy(`${aggregate}.${groupByColumn[0]}`);
  }
};

export const buildQuery = <T>(
  aggregate: string,
  queryBuilder: SelectQueryBuilder<T>,
  query: CollectionQuery,
) => {
  if (query.select && query.select.length > 0) {
    let select = ``;
    query.select.map((item, index) => {
      const colmns = item.split('.');
      select =
        select +
        (colmns.length > 1
          ? `"${colmns[0]}"."${colmns[1]}"` +
            (index < query.select.length - 1 ? ',' : '')
          : `"${colmns[0]}"` + (index < query.select.length - 1 ? ',' : ''));
      queryBuilder.select(select);
    });
  }
  if (query.where && query.where.length > 0) {
    applyWhereConditions(aggregate, queryBuilder, query.where);
  }

  if (query.take) {
    queryBuilder.take(query.take);
  }

  if (query.skip) {
    queryBuilder.skip(query.skip);
  }

  if (query.orderBy && query.orderBy.length > 0) {
    applyOrderBy(aggregate, queryBuilder, query.orderBy);
  }

  if (query.includes && query.includes.length > 0) {
    applyIncludes(aggregate, queryBuilder, query.includes);
  }

  if (query.groupBy && query.groupBy.length > 0) {
    applyGroupBy(aggregate, queryBuilder, query.groupBy);
  }
};

export class QueryConstructor {
  static constructQuery<T extends ObjectLiteral>(
    repository: Repository<T> | TreeRepository<T>,
    query: CollectionQuery,
    withDelete = false,
  ): SelectQueryBuilder<T> {
    const aggregateColumns: any = {};
    const metaData = repository.manager.connection.getMetadata(
      repository.target,
    );
    metaData.columns.map((c) => {
      aggregateColumns[c.databasePath] = c.type;
    });

    const aggregate = metaData.tableName;
    const queryBuilder = repository.createQueryBuilder(aggregate);

    if (withDelete) {
      queryBuilder.withDeleted();
    }

    if (!metaData.propertiesMap['tenantId']) {
      query = this.removeFilter(query, 'tenantId');
    }

    if (!metaData.propertiesMap['organizationId']) {
      query = this.removeFilter(query, 'organizationId');
    }

    query = this.removeEmptyFilter(query);

    buildQuery(aggregate, queryBuilder, query);

    return queryBuilder;
  }
  static removeEmptyFilter(query: CollectionQuery) {
    query.where = query.where.filter((x) => x.length > 0);
    return query;
  }

  static removeFilter(query: CollectionQuery, key: string) {
    query.where = query.where.map((x) => {
      return x.filter((y) => y.column != key);
    });
    return query;
  }
}
