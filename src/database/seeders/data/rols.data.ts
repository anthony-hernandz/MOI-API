interface IRolsSeed {
  id: string;
  name: string;
  active: boolean;
}

export const RolsSeed: IRolsSeed[] = [
  {
    id: '1',
    name: 'Administrator',
    active: true,
  },
];
