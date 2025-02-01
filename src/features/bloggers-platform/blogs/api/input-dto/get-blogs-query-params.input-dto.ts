import { BaseSortablePaginationParams } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogsSortBy } from './blogs-sort-by';

export class GetBlogsQueryParams extends BaseSortablePaginationParams<
  string | null
> {
  sortBy: BlogsSortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string = '';
}
