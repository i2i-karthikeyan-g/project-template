export const USER_ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user'
} as const;

export const RESOURCES = {
  CLIENTS: 'clients',
  CLIENT_USERS: 'client_users',
  USERS: 'users',
  PROFILE: 'profile',

} as const;

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
} as const;

//permission matrix
export const PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: {
    [RESOURCES.CLIENTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.CLIENT_USERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.PROFILE]: [ACTIONS.VIEW],
    [RESOURCES.USERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  [USER_ROLES.ADMIN]: {
    [RESOURCES.CLIENT_USERS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.PROFILE]: [ACTIONS.VIEW],
  },
  [USER_ROLES.USER]: {
    [RESOURCES.PROFILE]: [ACTIONS.VIEW]
  }
} as const;

// Sidebar menu visibility allow-list by role using resources
export const MENU_RESOURCES_BY_ROLE = {
  [USER_ROLES.SUPER_ADMIN]: [
    RESOURCES.CLIENTS,
    RESOURCES.USERS,
  ],
  [USER_ROLES.ADMIN]: [
    RESOURCES.CLIENT_USERS,
  ],
  [USER_ROLES.USER]: [
    RESOURCES.PROFILE
  ],
} as const;