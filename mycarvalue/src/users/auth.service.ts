import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(email: string, password: string) {
    // See if email is in use
    const foundUsers = await this.usersService.find(email);
    if (foundUsers.length) {
      throw new BadRequestException('Email already in use');
    }
    // Hash the users password
    // Generate a salt
    const salt = randomBytes(8).toString('hex');
    // Hash the salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // Join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');
    // Create a new user and save it
    const user = await this.usersService.create(email, result);
    // return the user
    return user;
  }

  async signIn(email: string, password: string) {
    // Find user
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Get hashed password and salt from user
    const [salt, storedHash] = user.password.split('.');
    // Hash the salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // Compare hashes
    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('Wrong password');
    }

    return user;
  }
}
