/// <reference types="jest" />

/**
 * Unit Test: TreeTable Component
 * Tests tree table with search and filters
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TreeTable from '../../../components/trees/TreeTable';
import type { TreeWithDetails } from '../../../hooks/useTrees';
import { useAuth } from '../../../hooks/useAuth';

jest.mock('../../../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('TreeTable', () => {
  const mockTrees: TreeWithDetails[] = [
    {
      id: 'tree-1',
      plot_id: 'plot-1',
      tree_number: 1,
      tree_code: 'P01T001',
      species_id: 'species-1',
      tag_label: 'TAG-001',
      row_main: 1,
      row_sub: 1,
      utm_x: 500000,
      utm_y: 1234567,
      geom: null,
      grid_spacing: null,
      note: null,
      created_at: '2024-01-01',
      species: {
        species_code: 'A01',
        name_th: 'สักทอง',
        name_sci: 'Tectona grandis',
        plant_category: 'forest',
        hex_color: '2d5a27',
      },
      plot: {
        id: 'plot-1',
        plot_code: 'P01',
        name_short: 'Plot 1',
        owner_name: 'Owner 1',
      },
      lat: 11.5,
      lng: 98.5,
    },
    {
      id: 'tree-2',
      plot_id: 'plot-1',
      tree_number: 2,
      tree_code: 'P01T002',
      species_id: 'species-2',
      tag_label: 'TAG-002',
      row_main: 1,
      row_sub: 2,
      utm_x: 500010,
      utm_y: 1234567,
      geom: null,
      grid_spacing: null,
      note: null,
      created_at: '2024-01-01',
      species: {
        species_code: 'B01',
        name_th: 'ไผ่',
        name_sci: 'Bambusa bambos',
        plant_category: 'bamboo',
        hex_color: '22c55e',
      },
      plot: {
        id: 'plot-1',
        plot_code: 'P01',
        name_short: 'Plot 1',
        owner_name: 'Owner 1',
      },
      lat: 11.5,
      lng: 98.5,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      canWrite: true,
      logout: jest.fn(),
    });
  });

  const renderTreeTable = (props = {}) => {
    return render(
      <BrowserRouter>
        <TreeTable trees={mockTrees} isLoading={false} {...props} />
      </BrowserRouter>
    );
  };

  it('should render all trees', () => {
    renderTreeTable();

    expect(screen.getByText('P01T001')).toBeInTheDocument();
    expect(screen.getByText('P01T002')).toBeInTheDocument();
  });

  it('should display species information', () => {
    renderTreeTable();

    // Check for tree codes which are unique
    expect(screen.getByText('P01T001')).toBeInTheDocument();
    expect(screen.getByText('P01T002')).toBeInTheDocument();
    // Species should be visible in the table
    const table = screen.getByRole('table');
    expect(table.textContent).toContain('สักทอง');
    expect(table.textContent).toContain('ไผ่');
  });

  it('should have search input', () => {
    renderTreeTable();

    const searchInput = screen.getByPlaceholderText('ค้นหาต้นไม้...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter trees by tree code', async () => {
    renderTreeTable();

    const searchInput = screen.getByPlaceholderText('ค้นหาต้นไม้...');
    fireEvent.change(searchInput, { target: { value: 'P01T001' } });

    await waitFor(() => {
      expect(screen.getByText('P01T001')).toBeInTheDocument();
      expect(screen.queryByText('P01T002')).not.toBeInTheDocument();
    });
  });

  it('should filter trees by species name', async () => {
    renderTreeTable();

    const searchInput = screen.getByPlaceholderText('ค้นหาต้นไม้...');
    fireEvent.change(searchInput, { target: { value: 'สักทอง' } });

    await waitFor(() => {
      expect(screen.getByText('P01T001')).toBeInTheDocument();
      expect(screen.queryByText('P01T002')).not.toBeInTheDocument();
    });
  });

  it('should filter trees by tag label', async () => {
    renderTreeTable();

    const searchInput = screen.getByPlaceholderText('ค้นหาต้นไม้...');
    fireEvent.change(searchInput, { target: { value: 'TAG-001' } });

    await waitFor(() => {
      expect(screen.getByText('P01T001')).toBeInTheDocument();
      expect(screen.queryByText('P01T002')).not.toBeInTheDocument();
    });
  });

  it('should have species filter dropdown', () => {
    renderTreeTable();

    const speciesSelect = screen.getByRole('combobox');
    expect(speciesSelect).toBeInTheDocument();
    expect(screen.getByText('ทุกชนิด')).toBeInTheDocument();
  });

  it('should filter by species using dropdown', async () => {
    renderTreeTable();

    const speciesSelect = screen.getByRole('combobox');
    fireEvent.change(speciesSelect, { target: { value: 'A01' } });

    await waitFor(() => {
      expect(screen.getByText('P01T001')).toBeInTheDocument();
      expect(screen.queryByText('P01T002')).not.toBeInTheDocument();
    });
  });

  it('should show empty state when no trees', () => {
    render(
      <BrowserRouter>
        <TreeTable trees={[]} isLoading={false} />
      </BrowserRouter>
    );

    // Should show table headers but no rows
    expect(screen.getByText('รหัสต้นไม้')).toBeInTheDocument();
  });

  it('should be case-insensitive in search', async () => {
    renderTreeTable();

    const searchInput = screen.getByPlaceholderText('ค้นหาต้นไม้...');
    fireEvent.change(searchInput, { target: { value: 'p01t001' } });

    await waitFor(() => {
      expect(screen.getByText('P01T001')).toBeInTheDocument();
    });
  });

  it('should clear filters and show all trees', async () => {
    renderTreeTable();

    const searchInput = screen.getByPlaceholderText('ค้นหาต้นไม้...');
    const speciesSelect = screen.getByRole('combobox');

    // Apply filters
    fireEvent.change(searchInput, { target: { value: 'สักทอง' } });
    fireEvent.change(speciesSelect, { target: { value: 'A01' } });

    await waitFor(() => {
      expect(screen.queryByText('P01T002')).not.toBeInTheDocument();
    });

    // Clear filters
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.change(speciesSelect, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText('P01T001')).toBeInTheDocument();
      expect(screen.getByText('P01T002')).toBeInTheDocument();
    });
  });

  it('should display row information', () => {
    renderTreeTable();

    expect(screen.getByText('1-1')).toBeInTheDocument();
    expect(screen.getByText('1-2')).toBeInTheDocument();
  });

  it('should render table with proper structure', () => {
    const { container } = renderTreeTable();

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    
    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
    
    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
  });

  it('should handle trees without tag labels', () => {
    const treesNoTag = [
      {
        ...mockTrees[0],
        tag_label: null,
      },
    ];

    render(
      <BrowserRouter>
        <TreeTable trees={treesNoTag as TreeWithDetails[]} isLoading={false} />
      </BrowserRouter>
    );

    expect(screen.getByText('P01T001')).toBeInTheDocument();
  });

  it('should show all species options in dropdown', () => {
    renderTreeTable();

    // Should have both A01 and B01 species
    expect(screen.getByText(/A01 — สักทอง/)).toBeInTheDocument();
    expect(screen.getByText(/B01 — ไผ่/)).toBeInTheDocument();
  });

  it('should apply both search and species filter together', async () => {
    renderTreeTable();

    const searchInput = screen.getByPlaceholderText('ค้นหาต้นไม้...');
    const speciesSelect = screen.getByRole('combobox');

    fireEvent.change(searchInput, { target: { value: 'TAG' } });
    fireEvent.change(speciesSelect, { target: { value: 'A01' } });

    await waitFor(() => {
      expect(screen.getByText('P01T001')).toBeInTheDocument();
      expect(screen.queryByText('P01T002')).not.toBeInTheDocument();
    });
  });
});
