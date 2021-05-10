import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as faker from 'faker';
import { AppModule } from 'src/app.module';
import { HEADERS_TOKEN_NAME } from 'src/common/common.constants';
import { USER_ERR } from 'src/errors/user.errors';
import { LoginOutput } from 'src/users/dto/login.dto';
import { Users } from 'src/users/entities/user.entity';
import * as request from 'supertest';
import { getConnection, Repository } from 'typeorm';
import { createAccountE2E } from './createAccount';
import { updateAccountE2E } from './updateAccount';

const GRAPHQL_ENDPOINT = '/graphql';

export const TEST_USER: Partial<Users> = {
  email: 'e2e@test.com',
  password: 'test',
  firstName: 'e2e',
  lastName: 'test',
};
export const TARGET_USER: Partial<Users> = {
  email: faker.internet.email(),
  password: faker.internet.password(6),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<Users>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set(HEADERS_TOKEN_NAME, jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepo = module.get<Repository<Users>>(getRepositoryToken(Users));
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => createAccountE2E(publicTest));

  describe('login', () => {
    it('shoud reject with wrong credentials', () =>
      publicTest(`
        mutation {
          login (input: {
            usernameOrEmail: "${TEST_USER.email}"
            password: "wrongPassword"
            rememberMe: false
          }) {
            ok
            error
            username
            token
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { body: { data: { login } } = {} } = res;
          expect(login).toEqual<LoginOutput>({
            ok: false,
            error: USER_ERR.WrongCredentials,
            username: null,
            token: null,
          });
        }));

    it('should log user in with correct credentials', () =>
      publicTest(`
        mutation {
          login (input: {
            usernameOrEmail: "${TEST_USER.email}"
            password: "${TEST_USER.password}"
            rememberMe: false
          }) {
            ok
            error
            username
            token
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { body: { data: { login } } = {} } = res;
          expect(login).toEqual<LoginOutput>({
            ok: true,
            error: null,
            username: TEST_USER.firstName + TEST_USER.lastName,
            token: expect.any(String),
          });
          jwtToken = login.token;
        }));
  });

  describe('updateAccount', () => updateAccountE2E(privateTest));
  it.todo('isMe');
  it.todo('follow');
  it.todo('listFollowings');
  it.todo('listFollowers');
  it.todo('countFollowings');
  it.todo('countFollowers');
  it.todo('isFollowing');
  it.todo('isFollower');
  it.todo('unfollow');
  it.todo('deleteAccount');
});
