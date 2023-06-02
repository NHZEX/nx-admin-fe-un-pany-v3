export enum UserType {
  SUPER_ADMIN = 1,
  USER_ADMIN = 2,
  OPERATOR = 5
}

export const UserTypeDict = {
  [UserType.SUPER_ADMIN]: "超级管理员",
  [UserType.USER_ADMIN]: "普通管理员",
  [UserType.OPERATOR]: "一般用户"
}
