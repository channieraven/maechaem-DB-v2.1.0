/// <reference types="jest" />

/**
 * Unit Test: OfflineIndicator Component
 * Tests offline indicator with different states
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OfflineIndicator from '../../../components/layout/OfflineIndicator';
import { useOffline } from '../../../contexts/OfflineContext';

jest.mock('../../../contexts/OfflineContext');
const mockUseOffline = useOffline as jest.MockedFunction<typeof useOffline>;

describe('OfflineIndicator', () => {
  const mockSyncNow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when online and no pending items', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      pendingCount: 0,
      syncNow: mockSyncNow,
    });

    const { container } = render(<OfflineIndicator />);

    expect(container.firstChild).toBeNull();
  });

  it('should show offline message when offline', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      syncStatus: 'idle',
      pendingCount: 0,
      syncNow: mockSyncNow,
    });

    render(<OfflineIndicator />);

    expect(screen.getByText(/ออฟไลน์/)).toBeInTheDocument();
    expect(screen.getByText(/ข้อมูลจะถูกบันทึกไว้ในเครื่อง/)).toBeInTheDocument();
  });

  it('should show pending count when offline', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      syncStatus: 'idle',
      pendingCount: 5,
      syncNow: mockSyncNow,
    });

    render(<OfflineIndicator />);

    expect(screen.getByText('รอส่ง 5 รายการ')).toBeInTheDocument();
  });

  it('should show syncing state', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'syncing',
      pendingCount: 3,
      syncNow: mockSyncNow,
    });

    render(<OfflineIndicator />);

    expect(screen.getByText('กำลังซิงค์ข้อมูล...')).toBeInTheDocument();
  });

  it('should show pending items when online but not syncing', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      pendingCount: 3,
      syncNow: mockSyncNow,
    });

    render(<OfflineIndicator />);

    expect(screen.getByText('มี 3 รายการรอส่ง')).toBeInTheDocument();
  });

  it('should have sync now button when online with pending items', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      pendingCount: 3,
      syncNow: mockSyncNow,
    });

    render(<OfflineIndicator />);

    const syncButton = screen.getByText('ซิงค์เลย');
    expect(syncButton).toBeInTheDocument();
  });

  it('should call syncNow when sync button clicked', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      pendingCount: 3,
      syncNow: mockSyncNow,
    });

    render(<OfflineIndicator />);

    const syncButton = screen.getByText('ซิงค์เลย');
    fireEvent.click(syncButton);

    expect(mockSyncNow).toHaveBeenCalledTimes(1);
  });

  it('should show red background when offline', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      syncStatus: 'idle',
      pendingCount: 0,
      syncNow: mockSyncNow,
    });

    const { container } = render(<OfflineIndicator />);

    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toHaveClass('bg-red-500');
  });

  it('should show yellow background when syncing', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'syncing',
      pendingCount: 3,
      syncNow: mockSyncNow,
    });

    const { container } = render(<OfflineIndicator />);

    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toHaveClass('bg-yellow-400');
  });

  it('should show light yellow background when online with pending', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'idle',
      pendingCount: 3,
      syncNow: mockSyncNow,
    });

    const { container } = render(<OfflineIndicator />);

    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toHaveClass('bg-yellow-100');
  });

  it('should display WiFi off icon when offline', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      syncStatus: 'idle',
      pendingCount: 0,
      syncNow: mockSyncNow,
    });

    const { container } = render(<OfflineIndicator />);

    // Check for WifiOff icon (via lucide-react)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should display spinning refresh icon when syncing', () => {
    mockUseOffline.mockReturnValue({
      isOnline: true,
      syncStatus: 'syncing',
      pendingCount: 3,
      syncNow: mockSyncNow,
    });

    const { container } = render(<OfflineIndicator />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('animate-spin');
  });

  it('should handle zero pending items when offline', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      syncStatus: 'idle',
      pendingCount: 0,
      syncNow: mockSyncNow,
    });

    render(<OfflineIndicator />);

    expect(screen.queryByText(/รอส่ง/)).not.toBeInTheDocument();
  });

  it('should be full width', () => {
    mockUseOffline.mockReturnValue({
      isOnline: false,
      syncStatus: 'idle',
      pendingCount: 0,
      syncNow: mockSyncNow,
    });

    const { container } = render(<OfflineIndicator />);

    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toHaveClass('w-full');
  });
});
