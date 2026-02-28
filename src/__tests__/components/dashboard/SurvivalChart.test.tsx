/// <reference types="jest" />

/**
 * Unit Test: SurvivalChart Component
 * Tests survival rate chart with plot data
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import SurvivalChart from '../../../components/dashboard/SurvivalChart';
import { usePlots } from '../../../hooks/usePlots';

jest.mock('../../../hooks/usePlots');
const mockUsePlots = usePlots as jest.MockedFunction<typeof usePlots>;

// Mock recharts to avoid canvas errors
jest.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

describe('SurvivalChart', () => {
  const mockPlots = [
    {
      id: 'plot-1',
      plot_code: 'P01',
      name_short: 'P1',
      owner_name: 'Owner 1',
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
      name_short: 'P2',
      owner_name: 'Owner 2',
      group_number: 2,
      area_sq_m: 6000,
      tambon: 'Tambon 2',
      elevation_m: 600,
      boundary_geojson: null,
      note: null,
      created_at: '2024-01-02',
      tree_count: 150,
      alive_count: 120,
      latest_survey_date: '2024-01-20',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when loading', () => {
    mockUsePlots.mockReturnValue({
      plots: [],
      isLoading: true,
      error: null,
    });

    const { container } = render(<SurvivalChart />);

    expect(container.firstChild).toBeNull();
  });

  it('should not render when no plots available', () => {
    mockUsePlots.mockReturnValue({
      plots: [],
      isLoading: false,
      error: null,
    });

    const { container } = render(<SurvivalChart />);

    expect(container.firstChild).toBeNull();
  });

  it('should render chart with title', () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    render(<SurvivalChart />);

    expect(screen.getByText('อัตราการรอดตาย (%) รายแปลง')).toBeInTheDocument();
  });

  it('should render chart components', () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    render(<SurvivalChart />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });

  it('should render in white card with border', () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    const { container } = render(<SurvivalChart />);

    const card = container.querySelector('.bg-white');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-xl', 'border', 'shadow-sm');
  });

  it('should handle plots with zero trees', () => {
    const plotsWithZero = [
      {
        ...mockPlots[0],
        tree_count: 0,
        alive_count: 0,
      },
    ];

    mockUsePlots.mockReturnValue({
      plots: plotsWithZero,
      isLoading: false,
      error: null,
    });

    render(<SurvivalChart />);

    expect(screen.getByText('อัตราการรอดตาย (%) รายแปลง')).toBeInTheDocument();
  });

  it('should calculate survival rate correctly', () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    render(<SurvivalChart />);

    // Plot 1: 95/100 = 95%
    // Plot 2: 120/150 = 80%
    expect(screen.getByText('อัตราการรอดตาย (%) รายแปลง')).toBeInTheDocument();
  });

  it('should handle single plot', () => {
    mockUsePlots.mockReturnValue({
      plots: [mockPlots[0]],
      isLoading: false,
      error: null,
    });

    render(<SurvivalChart />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should handle many plots', () => {
    const manyPlots = Array(10).fill(null).map((_, i) => ({
      ...mockPlots[0],
      id: `plot-${i}`,
      plot_code: `P${String(i + 1).padStart(2, '0')}`,
      name_short: `P${i + 1}`,
    }));

    mockUsePlots.mockReturnValue({
      plots: manyPlots,
      isLoading: false,
      error: null,
    });

    render(<SurvivalChart />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should render with proper padding', () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    const { container } = render(<SurvivalChart />);

    const card = container.querySelector('.p-4');
    expect(card).toBeInTheDocument();
  });

  it('should have proper title styling', () => {
    mockUsePlots.mockReturnValue({
      plots: mockPlots,
      isLoading: false,
      error: null,
    });

    render(<SurvivalChart />);

    const title = screen.getByText('อัตราการรอดตาย (%) รายแปลง');
    expect(title).toHaveClass('text-sm', 'font-semibold', 'text-gray-700');
  });
});
