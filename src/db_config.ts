/* eslint-disable prettier/prettier */

const db_config = {
  type: 'postgres',
  host: '196.188.249.24',
  port: 5432,
  username: 'postgres',
  password: 'timewize@2024',
  database: 'talentHub',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
};
module.exports = db_config;
