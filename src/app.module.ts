import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config } from './config/config';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';

@Module({
  imports: [
    BloggersPlatformModule,
    MongooseModule.forRoot(Config.DB_URI, { connectionName: Config.DB_NAME }),
    TestingModule,
    UserAccountsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
