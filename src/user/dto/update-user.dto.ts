import { IsOptional, IsString, Matches } from "class-validator";


export class UpdateUserDto {

    
        @IsString()
        @IsOptional()
        first_name?: string; 
    
        @IsString()
        @IsOptional()
        last_name?: string; 
        
        @IsString()
        @IsOptional()
        username?: string ;
    
        @IsString()
        @IsOptional()
        email?: string ;
    
        @IsString()
        @IsOptional()
         @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
                message:
                  'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
            })
        password?: string; 
}