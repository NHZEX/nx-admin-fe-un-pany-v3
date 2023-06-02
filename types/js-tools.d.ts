declare module '@ozxin/js-tools/src/crypto/hash' {

  export function hash_md5(str: string, rawOutput = false): string
  export function hash_sha1(str: string, rawOutput = false): string
  export function hash_sha256(str: string, rawOutput = false): string
  export function hash_sha512(str: string, rawOutput = false): string
}
