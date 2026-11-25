export interface AppErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: AppErrorDetail[],
  ) {
    super(message);
    this.name = "AppError";
  }
}