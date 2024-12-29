import { Module } from '@nestjs/common';
import { NotificationsService } from './application/notifications.service';
import { NotificationsAdapter } from './infrastructure/notifications.adapter';
import { CoreConfig } from '../../core/core.config';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [CoreModule],
  providers: [
    NotificationsService,
    NotificationsAdapter,
    // {
    //   useFactory: (
    //     coreConfig: CoreConfig,
    //   ): NotificationsAdapter => {
    //     return new NotificationsAdapter()
    //     {}
    //   }
    // },
  ],
  controllers: [],
  exports: [NotificationsService],
})
export class NotificationsModule {}
