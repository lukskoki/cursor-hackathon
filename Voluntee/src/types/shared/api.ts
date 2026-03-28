export type ApiError = {
  message: string;
  code?: string;
};

export type Paginated<T> = {
  items: T[];
  nextCursor?: string;
};
