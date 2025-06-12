import { Module } from '@nestjs/common';
import { UploadController } from './upload-controller';
import { ConfigModuleCustom } from 'config/config.module';
import { UploadService } from './upload-service';
@Module({
    imports: [ConfigModuleCustom],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService],
})

export class UploadModule {}
