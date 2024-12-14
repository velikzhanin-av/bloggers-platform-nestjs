export class OutputErrorsType {
  errorsMessages: { message: string; field: string }[];

  constructor() {
    this.errorsMessages = [];
  }
}
