
@Module({
    imports: [ConfigModuleCustom],
    controllers: [UploadController],
    providers: [UploadService],
    exports: [UploadService],
})

export class UploadModule {}
