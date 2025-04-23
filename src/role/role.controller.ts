import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { Role } from "entities/role.entity";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('role')
@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
        return this.roleService.createRole(createRoleDto);
    }

    @Get()
    async findAll(): Promise<Role []> {
        return this.roleService.findAll();
    }


    @Get(':id')
    async findOne(@Param('id') id: string):Promise<Role | null> {
        return this.roleService.findOne(id) ;
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        await this.roleService.remove(id);
    }
}