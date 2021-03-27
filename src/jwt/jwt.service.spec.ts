import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';
import { sign, verify } from 'jsonwebtoken';

const USER_ID = 1;
const TEST_JWT_PRIVATE_KEY = 'JwtPrivateKeyForTest';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'TOKEN from mock jsonwebtoken'),
  verify: jest.fn(() => ({ userId: USER_ID })),
}));

describe('swtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { jwtPrivateKey: TEST_JWT_PRIVATE_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    let rememberMe: boolean;
    it('should sign token when rememberMe is true', () => {
      rememberMe = true;
      const tenWeeks = 1000 * 60 * 60 * 24 * 7 * 10;
      const token = service.sign(USER_ID, rememberMe);
      expect(typeof token).toBe('string');
      expect(sign).toHaveBeenCalledTimes(1);
      expect(sign).toHaveBeenCalledWith(
        { userId: USER_ID },
        TEST_JWT_PRIVATE_KEY,
        { expiresIn: tenWeeks },
      );
    });

    it('should sign token when rememberMe is false', () => {
      rememberMe = false;
      const oneWeek = 1000 * 60 * 60 * 24 * 7;
      const token = service.sign(USER_ID, rememberMe);
      expect(typeof token).toBe('string');
      expect(sign).toHaveBeenCalledTimes(1);
      expect(sign).toHaveBeenCalledWith(
        { userId: USER_ID },
        TEST_JWT_PRIVATE_KEY,
        { expiresIn: oneWeek },
      );
    });
  });

  describe('verify', () => {
    it('should decode token and return an object', () => {
      const TOKEN = 'TOKEN';
      const decoded = service.verify(TOKEN);
      expect(decoded).toEqual({ userId: USER_ID });
      expect(verify).toHaveBeenCalledTimes(1);
      expect(verify).toHaveBeenCalledWith(TOKEN, TEST_JWT_PRIVATE_KEY);
    });
  });
});
