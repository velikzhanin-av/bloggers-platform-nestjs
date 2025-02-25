import { DeletionStatus } from '../../../../core/utils/status-enam';

export class BlogDBType {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
}
