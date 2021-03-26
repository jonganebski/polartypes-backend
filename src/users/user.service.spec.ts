import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'aws-sdk/clients/appstream';
import { COMMON_ERR } from 'src/errors/common.errors';
import { USER_ERR } from 'src/errors/user.errors';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateAccountOutput } from './dto/create-account.dto';
import {
  DeleteAccountInput,
  DeleteAccountoutput,
} from './dto/delete-account.dto';
import { FollowOutput } from './dto/follow.dto';
import {
  ListFollowersInput,
  ListFollowersOutput,
} from './dto/list-followers.dto';
import {
  ListFollowingsInput,
  ListFollowingsOutput,
} from './dto/list-followings.dto';
import { UnfollowOutput } from './dto/unfollow.dto';
import { Users } from './entities/user.entity';
import { UserService } from './user.service';

const MOCK_TOKEN = 'i_am_mock_token';

const innerJoinSpy = jest.fn().mockReturnThis();
const leftJoinSpy = jest.fn().mockReturnThis();
const whereSpy = jest.fn().mockReturnThis();
const andWhereSpy = jest.fn().mockReturnThis();
const orderBySpy = jest.fn().mockReturnThis();
const takeSpy = jest.fn().mockReturnThis();
const getManyAndCountSpy = jest.fn();
const getCountSpy = jest.fn();

const mockRepository = () => {
  return {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    findOneOrFail: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: innerJoinSpy,
      leftJoin: leftJoinSpy,
      where: whereSpy,
      andWhere: andWhereSpy,
      orderBy: orderBySpy,
      take: takeSpy,
      getManyAndCount: getManyAndCountSpy,
      getCount: getCountSpy,
    }),
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
    const createAccountArgs = {
      email: '',
      password: '',
      firstName: 'mocking',
      lastName: 'bird',
    };
    const username =
      createAccountArgs.firstName + createAccountArgs.lastName + '1';
    const slug = username.toLowerCase();
    it('should fail if user already exists.', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'mock@mock.com',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: USER_ERR.EmailExists });
    });

    it('should create an account', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArgs);
      userRepository.save.mockResolvedValue(createAccountArgs);
      userRepository.count.mockReturnValueOnce(1);
      const result = await service.createAccount(createAccountArgs);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createAccountArgs,
        username,
        slug,
      });
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(result).toEqual<CreateAccountOutput>({
        ok: true,
        token: MOCK_TOKEN,
        slug,
      });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
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
      userRepository.count.mockResolvedValue(1);
      const result = await service.updateAccount(
        updateAccountArgs.user,
        updateAccountArgs.input,
      );
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.count).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: false, error: USER_ERR.UsernameExists });
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
      expect(result).toEqual({ ok: false, error: USER_ERR.WrongCredentials });
    });

    it('should update account including password', async () => {
      // mockUser.id = 1;
      mockUser.username = oldUsername;
      mockUser.verifyPassword = () => Promise.resolve(true);
      const updateAccountArgs = {
        user: mockUser,
        input: { username: newUsername, password: 'old', newPassword: 'new' },
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.count.mockResolvedValue(0);
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
      // mockUser.id = 1;
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
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('login', () => {
    const loginArgs = { usernameOrEmail: '', password: '', rememberMe: false };
    it('should fail if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: false, error: USER_ERR.WrongCredentials });
    });

    it('should fail if password is wrong', async () => {
      const mockUser = {
        id: 1,
        verifyPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.login(loginArgs);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: false, error: USER_ERR.WrongCredentials });
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
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
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
      expect(result).toEqual({ error: COMMON_ERR.InternalServerErr });
    });
  });

  describe('follow', () => {
    const mockUser = new Users();
    const mockTargetUser = { id: 1, slug: 'targetUserSlug', followers: [] };
    it('should fail if targetUser is not found', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await service.follow(mockUser, {
        slug: mockTargetUser.slug,
      });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { slug: mockTargetUser.slug },
        select: ['id'],
        relations: ['followers'],
      });
      expect(result).toEqual({ ok: false, error: USER_ERR.UserNotFound });
    });

    it('should let user follow targetUser', async () => {
      userRepository.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.follow(mockUser, {
        slug: mockTargetUser.slug,
      });
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith([
        { ...mockTargetUser, followers: [mockUser] },
      ]);
      expect(result).toEqual<FollowOutput>({ ok: true, id: mockTargetUser.id });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.follow(mockUser, {
        slug: mockTargetUser.slug,
      });
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('unfollow', () => {
    const mockUser = new Users();
    const mockTargetUser = {
      id: 1,
      followers: [mockUser],
      slug: 'targetUserSlug',
    };
    it('should fail if targetUser is not found', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      const result = await service.unfollow(mockUser, {
        slug: mockTargetUser.slug,
      });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { slug: mockTargetUser.slug },
        select: ['id'],
        relations: ['followers'],
      });
      expect(result).toEqual({ ok: false, error: USER_ERR.UserNotFound });
    });

    it('should let user unfollow targetUser', async () => {
      userRepository.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.unfollow(mockUser, {
        slug: mockTargetUser.slug,
      });
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith([
        { ...mockTargetUser, followers: [] },
      ]);
      expect(result).toEqual<UnfollowOutput>({
        ok: true,
        id: mockTargetUser.id,
      });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.unfollow(mockUser, {
        slug: mockTargetUser.slug,
      });
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('deleteAccount', () => {
    const mockUserId = 1;
    const mockUser = new Users();
    mockUser.id = mockUserId;
    const mockInput: DeleteAccountInput = { password: 'password' };

    it('should return ok if password is match', async () => {
      mockUser.verifyPassword = jest.fn(() => Promise.resolve(true));
      userRepository.delete.mockResolvedValue({ affected: true });
      const result = await service.deleteAccount(mockUser, mockInput);
      expect(userRepository.delete).toHaveBeenCalledTimes(1);
      expect(userRepository.delete).toHaveBeenCalledWith({ id: mockUserId });
      expect(result).toEqual<DeleteAccountoutput>({ ok: true });
    });

    it('should fail if password is wrong', async () => {
      mockUser.verifyPassword = jest.fn(() => Promise.resolve(false));
      const result = await service.deleteAccount(mockUser, mockInput);
      expect(result).toEqual<DeleteAccountoutput>({
        ok: false,
        error: COMMON_ERR.NotAuthorized,
      });
    });

    it('should fail if none of user data is affected', async () => {
      mockUser.verifyPassword = jest.fn(() => Promise.resolve(true));
      userRepository.delete.mockResolvedValue({ affected: false });
      const result = await service.deleteAccount(mockUser, mockInput);
      expect(result).toEqual<DeleteAccountoutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });

    it('should fail on exception', async () => {
      mockUser.verifyPassword = jest.fn(() => Promise.resolve(true));
      userRepository.delete.mockRejectedValue(new Error());
      const result = await service.deleteAccount(mockUser, mockInput);
      expect(result).toEqual<DeleteAccountoutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('listFollowings', () => {
    const mockFollowing = new Users();
    const input: ListFollowingsInput = {
      slug: 'targetUserSlug',
    };
    it('should return followings when cursorId is not provided', async () => {
      mockFollowing.id = 999;
      const mockResult = [[mockFollowing], 20];
      getManyAndCountSpy.mockResolvedValue(mockResult);
      const result = await service.listFollowings(input);
      expect(result).toEqual<ListFollowingsOutput>({
        ok: true,
        user: { slug: input.slug, followings: [mockFollowing] },
        endCursorId: 999,
        hasNextPage: true,
      });
    });

    it('should return followings with cursorId id provided', async () => {
      const mockResult = [[], 20];
      input.cursorId = 0;
      getManyAndCountSpy.mockResolvedValue(mockResult);
      const result = await service.listFollowings(input);
      expect(result).toEqual<ListFollowingsOutput>({
        ok: true,
        user: { slug: input.slug, followings: [] },
        endCursorId: null,
        hasNextPage: true,
      });
    });

    it('should fail on exception', async () => {
      getManyAndCountSpy.mockRejectedValue(new Error());
      const result = await service.listFollowings(input);
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('listFollowers', () => {
    const mockFollower = new Users();
    const input: ListFollowersInput = { slug: 'targetUserslug' };

    it('should return followers when cursorId is not provided', async () => {
      const mockFollowerId = 10;
      mockFollower.id = mockFollowerId;
      const mockResult = [[mockFollower], 20];
      getManyAndCountSpy.mockResolvedValue(mockResult);
      const result = await service.listFollowers(input);
      expect(result).toEqual<ListFollowersOutput>({
        ok: true,
        user: { slug: input.slug, followers: [mockFollower] },
        endCursorId: mockFollowerId,
        hasNextPage: true,
      });
    });

    it('should return followers when cursorId provided', async () => {
      input.cursorId = 999;
      const mockResult = [[], 20];
      getManyAndCountSpy.mockResolvedValue(mockResult);
      const result = await service.listFollowers(input);
      expect(result).toEqual<ListFollowersOutput>({
        ok: true,
        user: { slug: input.slug, followers: [] },
        endCursorId: null,
        hasNextPage: true,
      });
    });

    it('should fail on exception', async () => {
      getManyAndCountSpy.mockRejectedValue(new Error());
      const result = await service.listFollowers(input);
      expect(result).toEqual<ListFollowersOutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('countFollowings', () => {
    const mockResult = 1;
    const mockUser = new Users();
    it('should return followings count', async () => {
      getCountSpy.mockResolvedValue(mockResult);
      const result = await service.countFollowings(mockUser);
      expect(result).toEqual<number>(mockResult);
    });
  });

  describe('countFollowers', () => {
    const mockResult = 1;
    const mockUser = new Users();
    it('should return followings count', async () => {
      getCountSpy.mockResolvedValue(mockResult);
      const result = await service.countFollowers(mockUser);
      expect(result).toEqual<number>(mockResult);
    });
  });

  describe('isFollowing', () => {
    const rootUserSlug = 'slug';
    const authUser = new Users();
    it('should return if root user is not auth user', async () => {
      authUser.slug = rootUserSlug + 'other';
      getCountSpy.mockResolvedValue(1);
      const result = await service.isFollowing(rootUserSlug, authUser);
      expect(result).toEqual<boolean>(true);
    });

    it('should return false if root user is auth user', async () => {
      authUser.slug = rootUserSlug;
      const result = await service.isFollowing(rootUserSlug, authUser);
      expect(result).toEqual<boolean>(false);
    });
  });

  describe('isFollower', () => {
    const rootUserSlug = 'slug';
    const authUser = new Users();
    it('should return if root user is not auth user', async () => {
      authUser.slug = rootUserSlug + 'other';
      getCountSpy.mockResolvedValue(1);
      const result = await service.isFollower(rootUserSlug, authUser);
      expect(result).toEqual<boolean>(true);
    });

    it('should return false if root user is auth user', async () => {
      authUser.slug = rootUserSlug;
      const result = await service.isFollower(rootUserSlug, authUser);
      expect(result).toEqual<boolean>(false);
    });
  });
});
