import { configModule } from './config-dynamic.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { ThrottlerModule } from '@nestjs/throttler';

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
    CoreModule,
    TestingModule,
    UserAccountsModule,
    configModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
