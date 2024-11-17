import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/database/entities/admin.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async getAdminByEmail(email: string): Promise<Admin> {
    return await this.adminRepository.findOne({ where: { email } });
  }

  async saveNewAdmin(admin: Admin): Promise<Admin> {
    return await this.adminRepository.save(admin);
  }

  async turnOnTwoFactorAuthentication(id: number) {
    await this.adminRepository.update(id, {
      isTwoFactorAuthenticationEnabled: true,
    });
  }

  async setTwoFactorAuthenticationSecret(secret: string, id: number) {
    await this.adminRepository.update(id, {
      twoFactorAuthenticationSecret: secret,
    });
  }
}
