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
        ttl: 10000,
        limit: 5,
      },
    ]),
    BloggersPlatformModule,
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const uri: string = coreConfig.dbURI;
        console.log(`BD_URI: uri`);
        return {
          uri: uri,
        };
      },
      inject: [CoreConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'ubuntu',
      password: 'ubuntu_password',
      database: 'bloggers_platform',
      autoLoadEntities: false,
      synchronize: false,
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
