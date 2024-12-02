import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';

export class GetPostsQueryParams extends BaseSortablePaginationParams<
  string | null
> {
  sortBy: string = 'createdAt';
}
