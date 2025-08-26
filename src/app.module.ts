import { configModule } from './config-dynamic.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 100000000,
        limit: 50,
      },
    ]),
    BloggersPlatformModule,
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const uri: string = coreConfig.dbURI;
        console.log(`BD_URI: ${uri}`);
        return {
          uri: uri,
          user: coreConfig.dbUsername, // 👈 имя пользователя
          pass: coreConfig.dbPassword, // 👈 пароль
          authSource: 'admin',
        };
      },
      inject: [CoreConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        console.log(`Postgres database: ${coreConfig.postgresDatabase}`);
        return {
          type: 'postgres',
          host: 'localhost',
          username: coreConfig.dbUsername,
          password: coreConfig.dbPassword,
          database: coreConfig.postgresDatabase,
        };
      },
      inject: [CoreConfig],
    }),
    CoreModule,
    TestingModule,
    UserAccountsModule,
    configModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
