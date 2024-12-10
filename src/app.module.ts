import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { Config } from "./config/config";

@Module({
  imports: [
    BloggersPlatformModule,
    MongooseModule.forRoot(Config.DB_URI),
    TestingModule,
    UserAccountsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
