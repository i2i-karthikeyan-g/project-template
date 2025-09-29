import { USER_ROLES, RESOURCES, ACTIONS } from './permissions.constants';
 
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type Resource = typeof RESOURCES[keyof typeof RESOURCES];
export type Action = typeof ACTIONS[keyof typeof ACTIONS]; 