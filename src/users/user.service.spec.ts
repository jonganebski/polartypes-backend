import { PartialType } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'aws-sdk/clients/appstream';
import { USER_ERR } from 'src/common/error.constants';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { UserService } from './user.service';

const MOCK_TOKEN = 'i_am_mock_token';

const mockRepository = () => {
  return {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn(),
  };
};

const mockJwtService = () => {
  return { sign: jest.fn(() => MOCK_TOKEN), verify: jest.fn() };
};

describe('UserService', () => {
  let service: UserService;
  let jwtService: JwtService;
  let userRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(Users), useValue: mockRepository() },
        { provide: JwtService, useValue: mockJwtService() },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(Users));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    // firstname, lastname 관련 테스팅은 전혀 감이 잡히지 않아 일단 그냥 진행함.
    const createAccountArgs = {
      email: '',
      password: '',
      firstName: 'mocking',
      lastName: 'bird',
      slug: 'mockingbird',
      username: 'mockingbird',
    };
    it('should fail if user already exists.', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'mock@mock.com',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: USER_ERR.emailExists });
    });

    it('should create an account', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArgs);
      userRepository.save.mockResolvedValue(createAccountArgs);
      const result = await service.createAccount(createAccountArgs);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(result).toEqual({
        ok: true,
        token: MOCK_TOKEN,
        username: createAccountArgs.username,
      });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: USER_ERR.failed });
    });
  });

  describe('updateAccount', () => {
    const mockUser = new Users();
    const oldUsername = 'mockingbird';
    const newUsername = 'mockingbee';
    it('should fail if username already exists', async () => {
      mockUser.username = oldUsername;
      const updateAccountArgs = {
        user: mockUser,
        input: { username: newUsername },
      };
      userRepository.findOne.mockResolvedValue({ username: newUsername });
      const result = await service.updateAccount(
        updateAccountArgs.user,
        updateAccountArgs.input,
      );
      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ ok: false, error: USER_ERR.usernameExists });
    });

    it('should fail if password is wrong', async () => {
      mockUser.username = oldUsername;
      mockUser.verifyPassword = () => Promise.resolve(false);
      const updateAccountArgs = {
        user: mockUser,
        input: { username: oldUsername, password: 'old', newPassword: 'new' },
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.updateAccount(
        updateAccountArgs.user,
        updateAccountArgs.input,
      );
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        { id: mockUser.id },
        { select: ['password'] },
      );
      expect(result).toEqual({ ok: false, error: USER_ERR.wrongPassword });
    });

    it('should update account including password', async () => {
      mockUser.id = 1;
      mockUser.username = oldUsername;
      mockUser.verifyPassword = () => Promise.resolve(true);
      const updateAccountArgs = {
        user: mockUser,
        input: { username: oldUsername, password: 'old', newPassword: 'new' },
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.create.mockReturnValue(mockUser);
      const result = await service.updateAccount(
        updateAccountArgs.user,
        updateAccountArgs.input,
      );
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith({
        id: mockUser.id,
        password: updateAccountArgs.input.newPassword,
        username: updateAccountArgs.input.username,
      });
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ ok: true });
    });

    it('should update account without password', async () => {
      mockUser.id = 1;
      mockUser.username = oldUsername;
      const updateAccountArgs = {
        user: mockUser,
        input: { username: oldUsername },
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.updateAccount(
        updateAccountArgs.user,
        updateAccountArgs.input,
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith({
        id: mockUser.id,
        ...updateAccountArgs.input,
      });
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.updateAccount(mockUser, {});
      expect(result).toEqual({ ok: false, error: USER_ERR.failed });
    });
  });

  describe('login', () => {
    const loginArgs = { usernameOrEmail: '', password: '', rememberMe: false };
    it('should fail if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);
      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ ok: false, error: USER_ERR.userNotFound });
    });

    it('should fail if password is wrong', async () => {
      const mockUser = {
        id: 1,
        verifyPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.login(loginArgs);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: false, error: USER_ERR.wrongPassword });
    });

    it('should return token if password is correct', async () => {
      const mockUser = {
        id: 1,
        username: 'mockingbird',
        verifyPassword: () => Promise.resolve(true),
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Boolean),
      );
      expect(result).toEqual({
        ok: true,
        token: MOCK_TOKEN,
        username: mockUser.username,
      });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: USER_ERR.failed });
    });
  });

  describe('findById', () => {
    const mockUser = { id: 1 };
    const findByIdArg = 999;
    it('should find existing user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(mockUser);
      const result = await service.findById(findByIdArg);
      expect(result).toEqual({ user: mockUser });
    });

    it('should fail if user is not found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(findByIdArg);
      expect(result).toEqual({ error: USER_ERR.failed });
    });
  });

  describe('follow', () => {
    const mockUser = new Users();
    const mockTargetUser = { id: 1 };
    const followArg = { id: 999 };
    it('should fail if targetUser is not found', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await service.follow(mockUser, followArg);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(followArg, {
        relations: ['followers'],
      });
      expect(result).toEqual({ ok: false, error: USER_ERR.userNotFound });
    });

    it('should let user follow targetUser', async () => {
      userRepository.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.follow(mockUser, followArg);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith([
        { id: mockTargetUser.id, followers: [mockUser] },
      ]);
      expect(result).toEqual({ ok: true, targetUserId: mockTargetUser.id });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.follow(mockUser, followArg);
      expect(result).toEqual({ ok: false, error: USER_ERR.failed });
    });
  });

  describe('unfollow', () => {
    const mockUser = new Users();
    const mockTargetUser = { id: 1, followers: [mockUser] };
    const unfollowArg = { id: 999 };
    it('should fail if targetUser is not found', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await service.unfollow(mockUser, unfollowArg);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(unfollowArg, {
        relations: ['followers'],
      });
      expect(result).toEqual({ ok: false, error: USER_ERR.userNotFound });
    });

    it('should let user unfollow targetUser', async () => {
      userRepository.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.unfollow(mockUser, unfollowArg);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith([
        { id: mockTargetUser.id, followers: [] },
      ]);
      expect(result).toEqual({ ok: true, targetUserId: mockTargetUser.id });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.unfollow(mockUser, unfollowArg);
      expect(result).toEqual({ ok: false, error: USER_ERR.failed });
    });
  });

  it.todo('deleteAccount');

  describe('readFollowings', () => {
    const mocktargetUser = { id: 1, followings: [] };
    const readFollowingsArg = { targetUserId: 1 };
    it('should fail if targetUser is not found', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await service.readFollowings(readFollowingsArg);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: readFollowingsArg.targetUserId },
        relations: ['followings'],
      });
      expect(result).toEqual({ ok: false, error: USER_ERR.userNotFound });
    });

    it('should return followings', async () => {
      userRepository.findOne.mockResolvedValue(mocktargetUser);
      const result = await service.readFollowings(readFollowingsArg);
      expect(result).toEqual({
        ok: true,
        followings: mocktargetUser.followings,
      });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.readFollowings(readFollowingsArg);
      expect(result).toEqual({ ok: false, error: USER_ERR.failed });
    });
  });
});
