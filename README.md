# AWSMimirLDAP

## Startup

```bash
npm start
```

## Postgresql

```bash
# Init new instance with pass authentication (i am setting default pass as admin as well)
initdb --locale=C -E UTF-8 --auth=password -U admin -W /opt/homebrew/var/postgresql@14

# Run in console
/opt/homebrew/opt/postgresql@14/bin/postgres -D /opt/homebrew/var/postgresql@14

# Or run in background
pg_ctl -D '/opt/homebrew/var/postgresql@14' -l logfile start
```

## How to configure the ldap

vi /opt/homebrew/var/postgresql@14/pg_hba.conf

````txt
host    all             all             127.0.0.1/32            ldap ldapserver=127.0.0.1 ldapport=1389 ldapprefix="cn=" ldapsuffix=", dc=example, dc=com"
``

### How to create new user

```sql
CREATE ROLE jirka WITH LOGIN PASSWORD 'test';
````

### How to list users

```bash
psql postgres
# \du
```

### How to login

```bash
psql -d postgres -U jirka
```
