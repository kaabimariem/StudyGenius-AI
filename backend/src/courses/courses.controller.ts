import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../entities/user.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: User) {
    return this.coursesService.create(createCourseDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: User) {
    return this.coursesService.findAll(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.update(+id, updateCourseDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.coursesService.remove(+id, user);
  }

  @Post(':id/generate-qcm')
  @UseGuards(JwtAuthGuard)
  generateQcm(
    @Param('id') id: string,
    @Query('numberOfQuestions') numberOfQuestions?: string,
    @CurrentUser() user?: User,
  ) {
    const numQuestions = numberOfQuestions ? parseInt(numberOfQuestions, 10) : 5;
    return this.coursesService.generateQcmFromCourse(+id, numQuestions, user);
  }

  @Get(':id/qcms')
  @UseGuards(JwtAuthGuard)
  getQcmsForCourse(@Param('id') id: string) {
    return this.coursesService.getQcmsForCourse(+id);
  }

  @Get('qcm/:qcmId')
  @UseGuards(JwtAuthGuard)
  getQcmById(@Param('qcmId') qcmId: string) {
    return this.coursesService.getQcmById(+qcmId);
  }
}

