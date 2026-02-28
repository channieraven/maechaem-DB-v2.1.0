/// <reference types="jest" />

/**
 * Unit Test: PlotList Component
 * Tests plot list with search functionality
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlotList from '../../../components/plots/PlotList';
import { usePlots } from '../../../hooks/usePlots';

jest.mock('../../../hooks/usePlots');
const mockUsePlots = usePlots as jest.MockedFunction<typeof usePlots>;

describe('PlotList', () => {
  const mockPlots = [
    {
      id: 'plot-1',
      plot_code: 'P01',
      name_short: 'Plot 1',
      owner_name: 'นายสมชาย',
      group_number: 1,
      area_sq_m: 5000,
      tambon: 'Tambon 1',
      elevation_m: 500,
      boundary_geojson: null,
      note: null,
      created_at: '2024-01-01',
      tree_count: 100,
      alive_count: 95,
      latest_survey_date: '2024-01-15',
    },
    {
      id: 'plot-2',
      plot_code: 'P02',
      name_short: 'Plot 2',
      owner_name: 'นายสมศักดิ์',
      group_number: 2,
      area_sq_m: 6000,
      tambon: 'Tambon 2',
      elevation_m: 600,
      boundary_geojson: null,
      note: null,
      created_at: '2024-01-02',
      tree_count: 150,
      alive_count: 140,
      latest_survey_date: '2024-01-20',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPlotList = () => {
    return render(
      <BrowserRouter>
        <PlotList />
      </BrowserRouter>
    );
  };

  it('should show loading state', () => {
    mockUsePlots.mockReturnValue({
      plots: [],
      isLoading: true,
      error: null,
    });

    const { container } = renderPlotList();

    // Check for loading spinner
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should show error message when fetch fails', () => {
    mockUsePlots.mockReturnValue({
      plots: [],
      isLoading: false,
      error: 'Failed to load plots',
    });

    renderPlotList();

    expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load plots/)).toBeInTheDocument();
  });

  it('should render all plots', () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    renderPlotList();

    expect(screen.getByText('นายสมชาย')).toBeInTheDocument();
    expect(screen.getByText('นายสมศักดิ์')).toBeInTheDocument();
  });

  it('should have search input', () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    renderPlotList();

    const searchInput = screen.getByPlaceholderText('ค้นหาแปลง...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter plots by owner name', async () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    renderPlotList();

    const searchInput = screen.getByPlaceholderText('ค้นหาแปลง...');
    fireEvent.change(searchInput, { target: { value: 'สมชาย' } });

    await waitFor(() => {
      expect(screen.getByText('นายสมชาย')).toBeInTheDocument();
      expect(screen.queryByText('นายสมศักดิ์')).not.toBeInTheDocument();
    });
  });

  it('should filter plots by plot code', async () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    renderPlotList();

    const searchInput = screen.getByPlaceholderText('ค้นหาแปลง...');
    fireEvent.change(searchInput, { target: { value: 'p02' } });

    await waitFor(() => {
      expect(screen.queryByText('นายสมชาย')).not.toBeInTheDocument();
      expect(screen.getByText('นายสมศักดิ์')).toBeInTheDocument();
    });
  });

  it('should filter plots by name short', async () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    renderPlotList();

    const searchInput = screen.getByPlaceholderText('ค้นหาแปลง...');
    fireEvent.change(searchInput, { target: { value: 'plot 1' } });

    await waitFor(() => {
      expect(screen.getByText('นายสมชาย')).toBeInTheDocument();
      expect(screen.queryByText('นายสมศักดิ์')).not.toBeInTheDocument();
    });
  });

  it('should show "no plots found" message when search has no results', async () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    renderPlotList();

    const searchInput = screen.getByPlaceholderText('ค้นหาแปลง...');
    fireEvent.change(searchInput, { target: { value: 'ไม่มีแปลงนี้' } });

    await waitFor(() => {
      expect(screen.getByText('ไม่พบแปลงที่ค้นหา')).toBeInTheDocument();
    });
  });

  it('should clear search and show all plots', async () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    renderPlotList();

    const searchInput = screen.getByPlaceholderText('ค้นหาแปลง...');
    
    // Search first
    fireEvent.change(searchInput, { target: { value: 'สมชาย' } });
    await waitFor(() => {
      expect(screen.queryByText('นายสมศักดิ์')).not.toBeInTheDocument();
    });

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByText('นายสมชาย')).toBeInTheDocument();
      expect(screen.getByText('นายสมศักดิ์')).toBeInTheDocument();
    });
  });

  it('should render plots in grid layout', () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    const { container } = renderPlotList();

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-1');
  });

  it('should handle empty plots array', () => {
    mockUsePlots.mockReturnValue({
      plots: [],
      isLoading: false,
      error: null,
    });

    renderPlotList();

    expect(screen.getByText('ไม่พบแปลงที่ค้นหา')).toBeInTheDocument();
  });

  it('should be case-insensitive in search', async () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    renderPlotList();

    const searchInput = screen.getByPlaceholderText('ค้นหาแปลง...');
    fireEvent.change(searchInput, { target: { value: 'P02' } });

    await waitFor(() => {
      expect(screen.getByText('นายสมศักดิ์')).toBeInTheDocument();
    });
  });
});
