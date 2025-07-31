export interface IBitLogErrores {
  error: string;
  url: string;
  method: string | null;
  params: string | null;
  body: string | null;
  query: string | null;
  ip: string;
  date: string;
  id_user: string | null;
}
