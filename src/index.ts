import * as ldap from "ldapjs";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  ListSecretsCommand,
} from "@aws-sdk/client-secrets-manager";

const secretsManager = new SecretsManagerClient({
  region: "us-east-1",
});
const server = ldap.createServer();

server.bind(
  "cn=jirka,dc=example,dc=com",
  async (req: any, res: any, next: any) => {
    console.log("bind DN: " + req.dn.toString());
    console.log("bind PW: " + req.credentials);

    const cn = ldap
      .parseDN(req.dn)
      .reverse()
      .pop()
      .toString()
      .replace("cn=", "");

    const awsCurrent = await secretOrUndefined(cn, "AWSCURRENT");
    const awsPending = await secretOrUndefined(cn, "AWSPENDING");

    if (awsCurrent !== req.credentials && awsPending !== req.credentials) {
      return next(new ldap.InvalidCredentialsError());
    }

    res.end();
    return next();
  },
);

server.search("dc=example,dc=com", async (req: any, res: any, next: any) => {
  const secrets = await secretsManager.send(new ListSecretsCommand());
  secrets.SecretList?.forEach((secret, index, array) =>
    res.send({
      dn: `cn=${secret.Name},dc=example,dc=com`,
      attributes: {
        cn: secret.Name,
        email: `${secret.Name}@amazon.com`,
        objectclass: ["person", "top"],
      },
    }),
  );
  res.end();
  return next();
});

server.listen(1389, () => {
  console.log(`LDAP server listening at ${server.url}`);
});

async function secretOrUndefined(
  secretId: string,
  stage: string,
): Promise<String | undefined> {
  try {
    const secret = await secretsManager.send(
      new GetSecretValueCommand({
        SecretId: secretId,
        VersionStage: stage,
      }),
    );
    return secret.SecretString;
  } catch (ResourceNotFoundException) {
    return undefined;
  }
}
