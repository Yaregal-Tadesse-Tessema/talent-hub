/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonCrudService } from 'src/libs/Common/common-services/common.service';
import { UserEntity } from '../persistence/users.entity';
import { FileService } from 'src/modules/file/services/file.service';
import { UserResponse } from './user.response';
import * as path from 'path';
import { PdfService } from 'src/libs/pdf/pdf.service';
@Injectable()
export class UserService extends CommonCrudService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly fileService: FileService,
    private readonly pdfService: PdfService,
  ) {
    super(userRepository);
  }
  async getProfileCompleteness(id: string): Promise<{ percentage: number }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return { percentage: 0 };
    }
    // Define fields and their weights
    const fieldsWithWeights = [
      { key: 'phone', weight: 20 },
      { key: 'email', weight: 20 },
      { key: 'firstName', weight: 20 },
      { key: 'lastName', weight: 20 },
      { key: 'highestLevelOfEducation', weight: 20 },
      { key: 'industry', weight: 20 },
      { key: 'yearOfExperience', weight: 15 },
      { key: 'preferredJobLocation', weight: 15 },
      { key: 'gpa', weight: 15 },
      { key: 'salaryExpectations', weight: 15 },
      { key: 'linkedinUrl', weight: 10 },
      { key: 'portfolioUrl', weight: 10 },
      { key: 'aiGeneratedJobFitScore', weight: 10 },
      { key: 'birthDate', weight: 10 },
      { key: 'middleName', weight: 5 },
      { key: 'gender', weight: 5 },
      { key: 'profile', weight: 5 },
    ];

    // Calculate total score
    let filledScore = 0;
    let totalWeight = 0;

    for (const field of fieldsWithWeights) {
      totalWeight += field.weight;
      if (
        user[field.key] &&
        (Array.isArray(user[field.key]) ? user[field.key].length > 0 : true)
      ) {
        filledScore += field.weight;
      }
    }

    // Calculate percentage
    const percentage = Math.round((filledScore / totalWeight) * 100);

    return { percentage };
  }
  async uploadResumeByUserId(file: Express.Multer.File, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user)
      throw new BadRequestException(`User with id ${userId} doesn't exist`);
    if (user.resume) {
      const res = await this.fileService.deleteBucketFile(user.resume.path);
    }

    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);

    // const comman = { userId, fileCategory: 'Resume', metaData: { fileName } };
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext == '.doc' || ext == '.docx') {
      // file = await this.fileService.convertWordToPdf(file);
      // const res = await this.fileService.uploadAttachment(fileId, filed);
    }
    const fileName = file.originalname;
    const fileId = `${userId}/${randomNumber}_${fileName}`;
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    user.resume = res;
    const response = await this.userRepository.save(user);
    return UserResponse.toResponse(response);
  }

  async uploadProfile(file: Express.Multer.File, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user)
      throw new BadRequestException(`User with id ${userId} doesn't exist`);
    if (user.profile) {
      const res = await this.fileService.deleteBucketFile(
        user.profile.filename,
      );
    }
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${userId}/Profile/${randomNumber}_${fileName}`;
    // const comman = { userId, fileCategory: 'Resume', metaData: { fileName } };
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    user.profile = res;
    const response = await this.userRepository.save(user);
    return UserResponse.toResponse(response);
  }
  async uploadResume(file: Express.Multer.File, telegramUserId: string) {
    const user = await this.userRepository.findOne({
      where: { telegramUserId: telegramUserId },
    });
    if (!user)
      throw new BadRequestException(
        `User with id ${telegramUserId} doesn't exist`,
      );

    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const fileName = file.originalname;
    const fileId = `${user.id}/Resume/${randomNumber}_${fileName}`;
    const res = await this.fileService.uploadAttachment(fileId, file);
    if (!res) throw new BadRequestException('file upload failed');
    user.resume = res;
    const response = await this.userRepository.save(user);
    return UserResponse.toResponse(response);
  }
  async convertWordToPdf(file: Express.Multer.File) {
    const res = await this.fileService.convertWordToPdf(file);
    if (!res) throw new BadRequestException('file upload failed');
    return res;
  }
  async generateCv() {
    const pdfContext = {
      fullName: 'Yaregall Tadesse',
      slogan: 'Innovating with Code. Leading with Passion.',
      email: 'yaregall@example.com',
      phone: '+251 912 345678',
      address: 'Addis Ababa, Ethiopia',
      profilePicture: 'https://via.placeholder.com/100',
      linkedin: 'https://linkedin.com/in/yaregall',
      github: 'https://github.com/yaregall',
      twitter: 'https://twitter.com/yaregall',
      website: 'https://yaregall.dev',
      about:
        'Senior Node.js developer with a strong accounting background, focused on performance optimization, scalable system architecture, and CI/CD automation.',
      education: [
        {
          degree: 'BA',
          fieldOfStudy: 'Accounting',
          institution: 'Addis Ababa University',
          location: 'Addis Ababa, Ethiopia',
          startDate: '2016-09-01',
          endDate: '2020-06-30',
          isCurrent: false,
          gpa: 3.98,
          honors: ['Dean’s List', 'Top Graduate'],
        },
      ],
      experience: [
        {
          position: 'Senior Backend Developer',
          company: 'TechFusion PLC',
          location: 'Addis Ababa, Ethiopia',
          startDate: '2021-01-01',
          endDate: '2025-01-01',
          isCurrent: true,
          responsibilities: [
            'Led the design and implementation of scalable microservices using NestJS.',
            'Integrated multi-tenant architecture for HR systems.',
          ],
          achievements: [
            'Reduced API latency by 40%',
            'Deployed robust CI/CD pipelines with GitHub Actions',
          ],
        },
      ],
      projects: [
        {
          name: 'Multi-Tenant Payroll System',
          description:
            'Payroll and HR system built with NestJS, PostgreSQL, and advanced role-based access control.',
          technologies: ['NestJS', 'TypeORM', 'PostgreSQL', 'Docker'],
          startDate: '2022-02-01',
          endDate: '2023-06-01',
          isOngoing: false,
          role: 'Lead Developer',
          repository: 'https://github.com/yaregall/payroll-system',
          demoURL: 'https://payroll-demo.yaregall.dev',
        },
      ],
      certificates: [
        {
          title: 'Full Stack Web Development',
          issuingOrganization: 'freeCodeCamp',
          issueDate: '2021-08-01',
          expirationDate: '2026-08-01',
          isPermanent: false,
          credentialID: 'FCC123456',
          credentialURL: 'https://freecodecamp.org/certificate/fcc123456',
        },
      ],
      awards: [
        {
          title: 'Best Developer Award',
          organization: 'TechFusion PLC',
          dateReceived: '2023-12-15',
          description:
            'Awarded for outstanding contributions to the backend team.',
        },
      ],
      publications: [
        {
          title: 'Designing Scalable Node.js Systems',
          authors: ['Yaregall Tadesse'],
          journal: 'Ethiopian Tech Journal',
          publisher: 'ETJ Publishing',
          publicationDate: '2022-07-10',
          doi: '10.1234/etj.2022.001',
          url: 'https://etj.org/articles/nodejs-scalability',
          summary:
            'A deep dive into architecture and performance optimization in Node.js for large-scale applications.',
        },
      ],
      skills: [
        'Node.js',
        'NestJS',
        'TypeORM',
        'PostgreSQL',
        'Docker',
        'CI/CD',
        'GitHub Actions',
        'Microservices',
        'JavaScript',
      ],
      languages: ['Amharic', 'English'],
      interests: ['Open Source', 'Tech Blogging', 'Mentoring', 'Chess'],
      volunteer: [
        {
          role: 'Technical Mentor',
          organization: 'Code4Ethiopia',
          year: '2021',
        },
      ],
      references: [
        {
          name: 'John Doe',
          relation: 'Former Manager',
          contact: 'johndoe@example.com',
        },
        {
          name: 'Sara Abebe',
          relation: 'Team Lead',
          contact: 'sara.abebe@example.com',
        },
      ],
    };
    const templateName = 'cv';
    const fileName = `my_cv`;
    const query = { landscape: 'true' };
    const Options = {
      format: 'A4',
      landscape:
        query && query.landscape && query.landscape === 'true' ? true : false,
      displayHeaderFooter: query ? true : false,
      margin: {
        top: '10px',
        bottom: '10px',
        right: '20px',
        left: '20px',
      },
    };
    const pdfPath = await this.pdfService.generatePdf(
      pdfContext,
      templateName,
      fileName,
      Options,
      null,
    );
    return pdfPath;
  }
  async generateCv2() {
    const pdfContext = {
      fullName: 'Yaregall Tadesse',
      title: 'Senior Software Engineer',
      slogan:
        'If you want to change, be contempt to be thought foolish and stupid',
      email: 'yayasoles@gmail.com',
      phone: '+251910108360',
      address: 'Addis Ababa, Ethiopia',
      profilePicture: 'https://via.placeholder.com/120x140.png?text=Photo',
      linkedin: 'https://linkedin.com/in/yaregall',
      github: 'https://github.com/yaregall',
      twitter: 'https://twitter.com/yaregall',
      website: 'https://yaregall.dev',

      skills: [
        'Nest.js',
        'Node.js',
        'React',
        'PostgreSQL',
        'Next.js',
        'TypeScript',
        'Redux',
        'MongoDB',
        'JavaScript',
        'React Native',
        'Azure DevOps',
        'Git',
        'TypeORM',
        'Docker',
        'Tailwind CSS',
        'Mantine',
        'Material UI',
        'GitHub',
        'Prisma',
        'CQRS',
        'Swagger',
      ],

      experience: [
        {
          position: 'Technical Team Lead',
          company: 'Garri Software',
          location: 'Addis Ababa, Ethiopia',
          startDate: '2024-07-01',
          endDate: 'Present',
          isCurrent: true,
          responsibilities: [
            'Led the development of SaaS-based Transport and Logistics HR/Payroll system.',
            'Built modular architecture with Microservices, CORS, PostgreSQL, Google Functions, Firebase.',
          ],
          achievements: ['Achieved 99.9% system uptime over 12 months.'],
        },
        {
          position: 'Technical Team Lead',
          company: 'Tria Trading PLC',
          location: 'Addis Ababa, Ethiopia',
          startDate: '2023-02-01',
          endDate: '2024-03-01',
          isCurrent: false,
          responsibilities: [
            'Led ICare project: food, health, regulatory platform using NestJS, Postgres, and React.',
            'Implemented AOI integration with file storage and Monorepo structure.',
          ],
          achievements: ['Improved deployment time by 30% using NX and Azure.'],
        },
        {
          position: 'Lecturer',
          company: 'Debretabour University',
          location: 'Debretabour, Ethiopia',
          startDate: '2016-07-01',
          endDate: '2017-08-30',
          isCurrent: false,
          responsibilities: [
            'Taught and led the Computer Science Department.',
            'Researched on e-governance and digital transformation in education.',
          ],
        },
      ],

      education: [
        {
          degree: 'Master of Science',
          fieldOfStudy: 'Software Engineering',
          institution: 'Near East University Cyprus',
          location: 'Cyprus',
          startDate: '2017-11-01',
          endDate: '2019-07-01',
          isCurrent: false,
          gpa: 3.9,
          honors: ['Graduated with Distinction'],
        },
        {
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Software Engineering',
          institution: 'Bahir Dar Institute of Technology',
          location: 'Bahir Dar, Ethiopia',
          startDate: '2012-09-01',
          endDate: '2016-06-30',
          isCurrent: false,
          gpa: 3.98,
          honors: ['Top Graduate', 'SCHA Club Founder'],
        },
      ],

      certificates: [
        {
          title: 'Fundamentals of NestJS',
          issuingOrganization: 'Board Infinity / Coursera',
          issueDate: '2024-02-01',
          expirationDate: '2029-02-01',
          isPermanent: false,
          credentialID: 'abcd1234',
          credentialURL: 'https://coursera.org/share/abcd1234',
        },
        {
          title: 'Test-Driven Development',
          issuingOrganization: 'LearnQuest',
          issueDate: '2022-03-01',
          expirationDate: '2027-03-01',
          isPermanent: false,
          credentialID: 'xyz456',
          credentialURL: 'https://coursera.org/share/xyz456',
        },
      ],

      publications: [
        {
          title: 'Scalable Node.js Architecture for Enterprise Apps',
          authors: ['Yaregall Tadesse'],
          journal: 'Ethiopian Journal of Computer Science',
          publisher: 'ET Journal',
          publicationDate: '2022-06-01',
          doi: '10.1234/etcs.2022.011',
          url: 'https://etcs-journal.com/publication/11',
          summary:
            'This paper explores modular backend patterns using NestJS and CQRS in high-traffic SaaS applications.',
        },
      ],

      projects: [
        {
          name: 'Multi-Tenant HR System',
          description:
            'Built a full-stack SaaS HR system with tenant isolation, permission controls, and payroll automation.',
          technologies: ['NestJS', 'PostgreSQL', 'Docker', 'TypeORM', 'JWT'],
          startDate: '2023-02-01',
          endDate: '2023-10-01',
          isOngoing: false,
          role: 'Backend Lead',
          repository: 'https://github.com/yaregall/hr-saas',
          demoURL: 'https://demo.hr-saas.io',
        },
      ],

      awards: [
        {
          title: 'Best Backend Engineer',
          organization: 'Tria Trading PLC',
          dateReceived: '2023-12-01',
          description:
            'Recognized for contributions to digital transformation projects including ICare and SmartOffice.',
        },
      ],

      interests: ['Coding', 'Watch Conferences', 'Reading Docs'],

      volunteer: [
        {
          role: 'Technical Trainer',
          organization: 'Code4Africa',
          year: '2022',
        },
      ],

      references: [
        {
          name: 'Samuel Tarekegn',
          relation: 'CTO, Tria Trading PLC',
          contact: 'samuel.t@tria.com',
        },
        {
          name: 'Meklit Wondimu',
          relation: 'Project Manager',
          contact: 'meklitw@example.com',
        },
      ],
    };
    const templateName = 'cv-2';
    const fileName = `my_cv`;
    const query = { landscape: 'true' };
    const Options = {
      format: 'A4',
      landscape:
        query && query.landscape && query.landscape === 'true' ? true : false,
      displayHeaderFooter: query ? true : false,
      margin: {
        top: '10px',
        bottom: '10px',
        right: '20px',
        left: '20px',
      },
    };
    const pdfPath = await this.pdfService.generatePdf(
      pdfContext,
      templateName,
      fileName,
      Options,
      null,
    );
    return pdfPath;
  }
}
