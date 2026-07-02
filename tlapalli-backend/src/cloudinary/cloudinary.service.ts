import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `tlapalli/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Error subiendo a Cloudinary:', error);
            reject(
              new InternalServerErrorException(
                'Error al subir archivo a Cloudinary: ' + error.message,
              ),
            );
          } else if (result) {
            resolve({
              url: result.url,
              publicId: result.public_id,
              secureUrl: result.secure_url,
            });
          } else {
            reject(
              new InternalServerErrorException(
                'No se recibió resultado de Cloudinary',
              ),
            );
          }
        },
      );

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  async uploadFromBuffer(
    buffer: Buffer,
    folder: string,
    filename?: string,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `tlapalli/${folder}`,
          resource_type: 'auto',
          public_id: filename,
        },
        (error, result) => {
          if (error) {
            console.error('Error subiendo a Cloudinary:', error);
            reject(
              new InternalServerErrorException(
                'Error al subir archivo a Cloudinary: ' + error.message,
              ),
            );
          } else if (result) {
            resolve({
              url: result.url,
              publicId: result.public_id,
              secureUrl: result.secure_url,
            });
          } else {
            reject(
              new InternalServerErrorException(
                'No se recibió resultado de Cloudinary',
              ),
            );
          }
        },
      );

      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error borrando archivo de Cloudinary:', error);
    }
  }

  extractPublicIdFromUrl(url: string): string | null {
    try {
      const regex = /\/upload\/(?:v\d+\/)?tlapalli\/(.+?)\.(?:jpg|jpeg|png|gif|webp|pdf|doc|docx|xlsx|txt|csv)$/i;
      const match = url.match(regex);
      if (match) {
        return `tlapalli/${match[1]}`;
      }
      return null;
    } catch {
      return null;
    }
  }
}
