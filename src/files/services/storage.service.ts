import { ConflictException, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import { v4 as uuid4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IFileStorage } from '../interfaces/fileStorage.interface';
import { envs } from '@config/envs';

@Injectable()
export class StorageService implements IFileStorage {
  private readonly clientS3: S3Client;

  constructor() {
    if (envs.storageDriver === 's3') {
      this.clientS3 = new S3Client({
        region: envs.aws.region,
        credentials: {
          accessKeyId: envs.aws.accessKeyId,
          secretAccessKey: envs.aws.secretAccessKey,
        },
        forcePathStyle: true,
      });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<string> {
    try {
      if (envs.storageDriver === 's3') {
        const key = `${folder ? folder : ''}/${uuid4()}-${file.originalname}`;
        const command = new PutObjectCommand({
          Bucket: envs.aws.s3Bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            originalName: file.filename,
          },
        });
        await this.clientS3.send(command);
        const { url } = await this.getFileUrlS3(key);

        return url;
      } else {
        const originalName = path
          .parse(file.originalname)
          .name.replace(/\s+/g, '');

        const filename = `${uuid4()}-${originalName}.${path.extname(file.originalname)}`;

        this.createDirectoryRecursively(folder);
        const filePath = path.join(folder, filename);

        await sharp(file.buffer).toFile(filePath);
        return filePath;
      }
    } catch (error) {
      throw new ConflictException({ message: error.message });
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (envs.storageDriver === 's3') {
        const command = new DeleteObjectCommand({
          Bucket: envs.aws.s3Bucket,
          Key: filePath,
        });

        await this.clientS3.send(command);
      }
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  async getFileUrlS3(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: envs.aws.s3Bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.clientS3, command, {
        expiresIn: 60 * 60 * 24, // 24 hours
      });

      return { url };
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  createDirectoryRecursively = (directoryPath: string) => {
    const parts = directoryPath.split(path.sep);
    let currentPath = '';
    for (const part of parts) {
      currentPath = path.join(currentPath, part);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
      }
    }
  };
}
