import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class MockAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        return true ;
    } 
}
    

