interface IUsersSeed {
  id: string;
  email: string;
  password: string;
  active: boolean;
  idRol: string;
}

export const UsersSeed: IUsersSeed[] = [
  {
    id: '1',
    email: 'administrador@admin.com',
    password: 'admin',
    active: true,
    idRol: '1',
  },
];
