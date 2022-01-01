import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;

        users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signUp('asdf@asdf.com', 'asdf');
    const [salt, hash] = user.password.split('.');

    expect(user.password).not.toEqual('asdf');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signUp('asdf@asdf.com', 'asdf');

    try {
      await service.signUp('asdf@asdf.com', 'asdf');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
    }
  });

  it('throws an error if signin is called with an unused email', async () => {
    try {
      await service.signIn('asdf@asdf.com', 'asdf');
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
    }
  });

  it('throws an error if an invalid password is provided', async () => {
    await service.signUp('asdf@asdf.com', 'asdf');

    try {
      await service.signIn('asdf@asdf.com', 'asdf1');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
    }
  });

  it('it returns a user if correct password is provided', async () => {
    await service.signUp('asdf@asdf.com', 'asdf');

    const user = await service.signIn('asdf@asdf.com', 'asdf');

    expect(user).toBeDefined();
  });
});
