<h1 align="center">🧭 Polartypes</h1>
<p align="center">Cloning <a href="https://www.polarsteps.com/" target="_blank">polarsteps</a>, really cool service for travelers and adventurers. I planned to do this project from the very beginning, when I was learning about for loop.</p>
<div align="center">
    <img src="https://img.shields.io/github/languages/top/jonganebski/polartypes-backend?style=flat"/>
    <img src="https://img.shields.io/github/languages/code-size/jonganebski/polartypes-backend?style=flat"/>
    <img src="https://img.shields.io/github/last-commit/jonganebski/polartypes-backend?style=flat"/>
    <img src="https://img.shields.io/github/stars/jonganebski/polartypes-backend?style=flat"/>
</div>

---

## Run in local

```
// .env.dev

POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USERNAME=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

JWT_PRIVATE_KEY=

AWS_S3_ACCESS_KEY_ID=
AWS_S3_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
```

```console
$ npm install 

$ npm run start:dev
```

## Seed data

As I fully customized example trip and its steps, you have to modify `EXAMPLE_STEPS` at `src/seeder/seeder.constants.ts`. Just changing image filenames will do the job.  
You need to put images at `src/uploads/example`.

```
// .env.dev

SEED_USER_PASSWORD=

SUPERUSER_EMAIL=
SUPERUSER_FIRSTNAME=
SUPERUSER_LASTNAME=
SUPERUSER_TIMEZONE=
SUPERUSER_PASSWORD=
```

```console
$ npm run seed:dev
```

---

<p align="center">
<a href="https://github.com/jonganebski/polartypes-frontend" target="_blank">Go to React frontend repository</a>
</p>
