export enum UserType {
  SUPER_ADMIN = 1,
  USER_ADMIN = 2,
  OPERATOR = 5
}

export const UserTypeDict = {
  [UserType.OPERATOR]: "普通用户",
  [UserType.SUPER_ADMIN]: "超级管理员",
  [UserType.USER_ADMIN]: "系统管理员",

  toList: (): { label: string; value: number }[] => {
    return Object.entries(UserTypeDict)
      .filter(([_, value]) => typeof value === "string")
      .map(([key, value]) => ({
        label: value as string,
        value: Number(key)
      }))
  }
}
