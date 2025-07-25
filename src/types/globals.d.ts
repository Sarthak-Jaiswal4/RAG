export {}

declare global {
  interface CustomJwtSessionClaims {
    userid?: string
    email?: string
  }
}