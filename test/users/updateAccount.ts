import { USER_ERR } from 'src/errors/user.errors';
import { UpdateAccountOutput } from 'src/users/dto/update-account.dto';
import { TARGET_USER, TEST_USER } from './users.e2e-spec';
import * as request from 'supertest';

export const updateAccountE2E = (
  privateTest: (query: string) => request.Test,
) => {
  it('should fail if username already exists', () =>
    privateTest(`
      mutation {
        updateAccount (input: {
          username: "${TARGET_USER.firstName + TARGET_USER.lastName}"
        }) {
          ok
          error
        }
      }
    `)
      .expect(200)
      .expect((res) => {
        const { body: { data: { updateAccount } } = {} } = res;
        expect(updateAccount).toEqual<UpdateAccountOutput>({
          ok: false,
          error: USER_ERR.UsernameExists,
        });
      }));

  it('should fail if password is wrong', () =>
    privateTest(`
      mutation {
        updateAccount (input: {
          password: "wrongPassword"
          newPassword: "newPassword"
        }) {
          ok
          error
        }
      }
    `)
      .expect(200)
      .expect((res) => {
        const { body: { data: { updateAccount } } = {} } = res;
        expect(updateAccount).toEqual<UpdateAccountOutput>({
          ok: false,
          error: USER_ERR.WrongCredentials,
        });
      }));

  it('should update account', () =>
    privateTest(`
      mutation {
        updateAccount (input: {
          password: "${TEST_USER.password}"
          newPassword: "newPassword"
          username: "SafeUsername"
        }) {
          ok
          error
        }
      }
    `)
      .expect(200)
      .expect((res) => {
        const { body: { data: { updateAccount } } = {} } = res;
        expect(updateAccount).toEqual<UpdateAccountOutput>({
          ok: true,
          error: null,
        });
      }));
};
