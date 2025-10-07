/* eslint-disable prettier/prettier */

const db_config = {
  type: 'postgres',
  host: '157.230.227.83',
  port: 5432,
  username: 'postgres',
  password: 'timewize@2024',
  database: 'talentHub',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
};
module.exports = db_config;
