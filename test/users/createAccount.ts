import { USER_ERR } from 'src/errors/user.errors';
import { CreateAccountOutput } from 'src/users/dto/create-account.dto';
import { TARGET_USER, TEST_USER } from './users.e2e-spec';
import * as request from 'supertest';

export const createAccountE2E = (
  publicTest: (query: string) => request.Test,
) => {
  it('should create test account', () =>
    publicTest(`
        mutation {
            createAccount(input: {
                email: "${TEST_USER.email}",
                password: "${TEST_USER.password}",
                firstName: "${TEST_USER.firstName}",
                lastName: "${TEST_USER.lastName}"
            }) {
                ok
                error
                token
                slug
            }
        }
    `)
      .expect(200)
      .expect((res) => {
        const { body: { data: { createAccount } } = {} } = res;
        expect(createAccount).toEqual<CreateAccountOutput>({
          ok: true,
          error: null,
          token: expect.any(String),
          slug: (TEST_USER.firstName + TEST_USER.lastName).toLowerCase(),
        });
      }));

  it('should create target account', () =>
    publicTest(`
        mutation {
            createAccount(input: {
                email: "${TARGET_USER.email}",
                password: "${TARGET_USER.password}",
                firstName: "${TARGET_USER.firstName}",
                lastName: "${TARGET_USER.lastName}"
            }) {
                ok
                error
                token
                slug
            }
        }
    `)
      .expect(200)
      .expect((res) => {
        const { body: { data: { createAccount } } = {} } = res;
        expect(createAccount).toEqual<CreateAccountOutput>({
          ok: true,
          error: null,
          token: expect.any(String),
          slug: (TARGET_USER.firstName + TARGET_USER.lastName).toLowerCase(),
        });
      }));

  it('should fail if account already exists', () =>
    publicTest(`
        mutation {
            createAccount(input: {
                email: "${TEST_USER.email}"
                password: "${TEST_USER.password}"
                firstName: "${TEST_USER.firstName}"
                lastName: "${TEST_USER.lastName}"
            }) {
                ok
                error
                token
                slug
            }
        }
    `)
      .expect(200)
      .expect((res) => {
        const { body: { data: { createAccount } } = {} } = res;
        expect(createAccount).toEqual<CreateAccountOutput>({
          ok: false,
          error: USER_ERR.EmailExists,
          token: null,
          slug: null,
        });
      }));
};
