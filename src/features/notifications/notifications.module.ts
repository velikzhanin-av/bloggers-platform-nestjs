import {Module} from "@nestjs/common";
import {NotificationsService} from "./application/notifications.service";
import {NotificationsAdapter} from "./infrastructure/notifications.adapter";

@Module({
  imports: [],
  providers: [
    NotificationsService,
    NotificationsAdapter,],
  controllers: [],
  exports: [NotificationsService],
})
export class NotificationsModule {
}