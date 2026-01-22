import { Test, TestingModule } from '@nestjs/testing';
import { BorrowingService } from './borrowing.service';
import { DatabaseService } from '../database/database.service';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from 'generated/prisma';

describe('BorrowingService - create()', () => {
  let service: BorrowingService;

  const mockTx = {
    book: { findUnique: jest.fn(), update: jest.fn() },
    borrowTransaction: { findFirst: jest.fn(), create: jest.fn() },
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    role: 'USER' as UserRole,
    name: 'Test User',
    createdAt: new Date(),
    isDeleted: false,
  };
  const mockDto = { bookId: 'book-1', dueDate: new Date() };
  const mockBook = { id: 'book-1', availableStock: 5, isDeleted: false };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowingService,
        {
          provide: DatabaseService,
          useValue: { $transaction: (cb) => cb(mockTx) },
        },
      ],
    }).compile();

    service = module.get(BorrowingService);
    jest.clearAllMocks();
  });

  it('throws UnauthorizedException if no user', async () => {
    await expect(service.create(mockDto, undefined)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws NotFoundException if book not found', async () => {
    mockTx.book.findUnique.mockResolvedValue(null);
    await expect(service.create(mockDto, mockUser)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws NotFoundException if book is deleted', async () => {
    mockTx.book.findUnique.mockResolvedValue({ ...mockBook, isDeleted: true });
    await expect(service.create(mockDto, mockUser)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException if out of stock', async () => {
    mockTx.book.findUnique.mockResolvedValue({
      ...mockBook,
      availableStock: 0,
    });
    await expect(service.create(mockDto, mockUser)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequestException if already borrowed', async () => {
    mockTx.book.findUnique.mockResolvedValue(mockBook);
    mockTx.borrowTransaction.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(service.create(mockDto, mockUser)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates borrowing successfully', async () => {
    mockTx.book.findUnique.mockResolvedValue(mockBook);
    mockTx.borrowTransaction.findFirst.mockResolvedValue(null);
    mockTx.borrowTransaction.create.mockResolvedValue({ id: 'new-borrow' });

    const result = await service.create(mockDto, mockUser);

    expect(result).toEqual({ id: 'new-borrow' });
    expect(mockTx.book.update).toHaveBeenCalled();
  });
});
