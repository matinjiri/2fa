import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  database: process.env.DATABASE_DATABASE,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  type: 'postgres',
  dialect: 'postgres',
  synchronize:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? true
      : false,
  autoLoadModels: true,
  logging: process.env.NODE_ENV === 'development' ? true : false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
}));
