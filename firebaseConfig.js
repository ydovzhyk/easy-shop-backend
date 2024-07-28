const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: "apartment-rent-yd",
  private_key_id: "14a7454763faa5dbbf6127dc7125721f9cd30d76",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDGZM5loZHmeXPa\nG+3Rd8/EVFAI0GscGz+NA/8buxfDdJyFp+qfjGwzH7blolTNujAZbwycF7vVwHYc\nMGeH76qnG8NgQtzUy9ZRh3lXEX2u40ElurR+fbf6IcZcuSzZC3S7U+1j3xstXq6e\nn2p7+4a5eLx8nS/cP/SAUmQmAL3KuRNm+zcyzPQfbJGfyityBY2NkDo5i5fKl60v\nlz5VtHEZsd2MLW02L9GdaUFhg4GExiyac9B0xOXSlNrGcxo8Yxf839kDiAaooqav\nqd5xKebiRelqGFskyh7dDDmOJN0fXLs+YXKfI44PXTV7xXFJ+BTXaAwa6prRI7HC\nQB4CjsuhAgMBAAECgf9RkKBKqGKTnttCkLj1pYyF6yP8e7ONmqZGE56OiBz8/rRb\nPu33KoRRgHhxcIvtCN89lapZgmh3OOlWLZBjEuXWTlPE/7hKxIMYgdohMc+6VzQx\njtEmMAmzjK9A7+DAWzVizt6KcO97d7HTBTeCQabiGgFkOjuzEZg0KauC9EsTTMpl\nD9lwLlso7/GfmMNpmVIBtfhJwbXM+mgv9OCKYpx4HylY1YEYdpLU5bix1qnxpoCu\nJ1bwVPB0wB2mN29MQ3pVNAL59ToKScNIXvMKiyCsdqRIH5NZ9fhdnRHrazBWCIDD\no+Hxnc4/RvwUKbFKzQiJbaXHIna1BUvHkp3pTvECgYEA7LP8PHJqDi4JKahDcL/Y\n+IXqyAoian3yje8L2ltMTUQd62ZZXlRpVFVIpwexlrAEk5Y4ao66x5Ps6gtqjquG\nCirSHJUH5EeH//ydgnMy2tm5WHYxWtLzUkwpfqO4fCY/kRqQXzIHVP5Fi1AuKwQO\n3u+CJrgLuc+ZtPxK1gLf3GkCgYEA1pFNb4B222Jii7IbYBH6J1HBeXwV3+8mvsYL\nia+VYGNNF1EDPeAHwA+lpHbcmUUYEwsmESavz7X8ScDp79z/ptI4rgJWSoRWHRoY\nkIAcVkxunISWeWNie4F659UrDQwIRf775GZsfYDG1bGd6VjG+X4vof8RXqeU7NdN\ntEZm7nkCgYBYamKtsY8r/MYvaUrHsuG480zfq+lvHdycZ85lofS+Z9NFOtXnBmDR\nv4mD2rvbLaSH/HTWWLosEnVMdzc2U5ud8KDLTF/GRXHnjNTJBX7ZgLpa8Ms+wc1h\n0FEvnLgsp5zW9rU22dkjRldz0l9scfecDprvG5BFt+YSVKsfhbNZAQKBgGFoZXcR\nIuRFrectXDAo+R+QhfzY0DVxJG3HCsXe6Dlx2zWSmZ4lbl9KuzAGpe8O5vb+QLHY\nlkf9niL9aTZzZbweA407kmER4uYjSrOO9U5YNH7p0kYZUEQxa9KDe5/YrojYURJH\nTUlMhPfOQpoEq4/oMUehvAj0my9KLwSAUYpBAoGBAKQns1B6XnzRjcHL9NZkSXSQ\ndvZKvliCnFufgqzZbAbJezboRfF/dhHc4K198wo69AV9w88O7B7tPHNtocOIBJEv\nHpOckpdMNrvSk54N4mbtsGRgoIUCRx5RKzcrNSGM2sIu2849Be3Io4UVPLtebTWq\nUN+82+4ypQkcJbvbjBuF\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-y9fjl@apartment-rent-yd.iam.gserviceaccount.com",
  client_id: "118316312367783203782",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-y9fjl%40apartment-rent-yd.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "apartment-rent-yd.appspot.com",
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
