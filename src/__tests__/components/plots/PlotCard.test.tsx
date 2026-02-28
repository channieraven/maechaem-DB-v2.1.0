/// <reference types="jest" />

/**
 * Unit Test: PlotCard Component
 * Tests plot card display and interactions
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlotCard from '../../../components/plots/PlotCard';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PlotCard', () => {
  const defaultProps = {
    plotCode: 'P01',
    nameShort: 'Plot 1',
    ownerName: 'นายทดสอบ',
    groupNumber: 1,
    treeCount: 100,
    aliveCount: 95,
    latestSurveyDate: '2024-01-15',
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderPlotCard = (props = {}) => {
    return render(
      <BrowserRouter>
        <PlotCard {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  it('should render plot information correctly', () => {
    renderPlotCard();

    expect(screen.getByText('Plot 1')).toBeInTheDocument();
    expect(screen.getByText('นายทดสอบ')).toBeInTheDocument();
    expect(screen.getByText('กลุ่มที่ 1')).toBeInTheDocument();
    expect(screen.getByText('100 ต้น')).toBeInTheDocument();
  });

  it('should calculate and display survival rate', () => {
    renderPlotCard();

    // 95/100 = 95%
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('should display latest survey date', () => {
    renderPlotCard();

    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('should navigate to plot detail on click', () => {
    renderPlotCard();

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/plots/P01');
  });

  it('should show green color for high survival rate (>= 90%)', () => {
    const { container } = renderPlotCard({ aliveCount: 95 });

    const survivalElement = screen.getByText('95%');
    const parentDiv = survivalElement.parentElement;
    expect(parentDiv).toHaveClass('text-green-600');
  });

  it('should show yellow color for medium survival rate (75-89%)', () => {
    const { container } = renderPlotCard({ aliveCount: 80 });

    const survivalElement = screen.getByText('80%');
    const parentDiv = survivalElement.parentElement;
    expect(parentDiv).toHaveClass('text-yellow-600');
  });

  it('should show red color for low survival rate (< 75%)', () => {
    const { container } = renderPlotCard({ aliveCount: 50 });

    const survivalElement = screen.getByText('50%');
    const parentDiv = survivalElement.parentElement;
    expect(parentDiv).toHaveClass('text-red-600');
  });

  it('should handle zero trees gracefully', () => {
    renderPlotCard({ treeCount: 0, aliveCount: 0 });

    expect(screen.getByText('0 ต้น')).toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('should handle null survey date', () => {
    renderPlotCard({ latestSurveyDate: null });

    expect(screen.queryByText(/2024/)).not.toBeInTheDocument();
  });

  it('should render with all required props', () => {
    const { container } = renderPlotCard();

    expect(container.querySelector('button')).toBeInTheDocument();
    expect(screen.getByText('Plot 1')).toBeInTheDocument();
  });

  it('should have hover effects', () => {
    const { container } = renderPlotCard();

    const button = container.querySelector('button');
    expect(button).toHaveClass('hover:shadow-md', 'hover:border-green-200');
  });

  it('should display correct group number', () => {
    renderPlotCard({ groupNumber: 5 });

    expect(screen.getByText('กลุ่มที่ 5')).toBeInTheDocument();
  });

  it('should round survival rate to nearest integer', () => {
    renderPlotCard({ treeCount: 99, aliveCount: 95 });

    // 95/99 = 95.959... should round to 96%
    expect(screen.getByText('96%')).toBeInTheDocument();
  });
});
