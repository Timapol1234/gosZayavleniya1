export interface User {
  id: string
  email: string
  name?: string
  passwordHash?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserSession {
  user: {
    id: string
    email: string
    name?: string
  }
  expires: string
}
