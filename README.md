# 📚 Library Management System

A professional library management system built with **NestJS**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

## ✨ Key Features

- JWT Authentication + Role-Based Access Control (RBAC)
- Book & Author Management with Many-to-Many relationships
- Borrowing System with automatic stock tracking
- Soft Delete, Pagination, and Search functionality
- Automated Cron jobs for overdue books
- Swagger API Documentation
- Unit & E2E Tests

## 🛠️ Tech Stack

**Backend:** NestJS, TypeScript | **Database:** PostgreSQL, Prisma | **Security:** JWT, Argon2 | **Validation:** Zod | **API Docs:** Swagger

## 📋 Prerequisites

- Node.js (v18+)
- PostgreSQL

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <repository-url>
cd library-management-system
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Setup database
npx prisma generate
npx prisma migrate deploy

# 4. Run the application
npm run start:dev
```

**Access:**

- API: `http://localhost:3000`
- Swagger Docs: `http://localhost:3000/api`

## 🔐 Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/library_db"
JWT_SECRET="your-secret-key"
PORT=3000
```

## 📂 Project Structure

```
src/
├── modules/
│   ├── auth/           # JWT Authentication & RBAC
│   ├── user/           # User management
│   ├── book/           # Books, Authors, Categories
│   ├── borrowing/      # Borrowing system + Cron jobs
│   └── database/       # Prisma service
├── decorators/         # Custom decorators
├── guards/             # Auth & Role guards
└── pipes/              # Validation pipes
```

## 🔑 Main API Endpoints

**Auth:** `/auth/register`, `/auth/login`  
**Books:** `/books` (GET/POST/PUT/DELETE)  
**Borrowing:** `/borrowing` (GET/POST), `/borrowing/:id/return`  
**Users:** `/users` (Admin only)

📖 **Full documentation:** `http://localhost:3000/api` (Swagger)

## 👥 User Roles

- **ADMIN** - Full access
- **LIBRARIAN** - Manage books & borrowing
- **MEMBER** - Borrow & return books

## 🧪 Useful Commands

```bash
npm run test              # Run tests
npx prisma studio         # Open database GUI
npx prisma migrate dev    # Create migration
```

## 📄 License

UNLICENSED

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📊 Database Management

```bash
# Open Prisma Studio (Visual Database Browser)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ Development only!)
npx prisma migrate reset
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
