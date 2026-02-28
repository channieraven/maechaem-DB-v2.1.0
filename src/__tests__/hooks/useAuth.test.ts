/// <reference types="jest" />

/**
 * Unit Test: useAuth Hook
 * Tests backward-compatible auth stub
 */
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';

describe('useAuth', () => {
  it('should return null user and profile', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it('should return canWrite as true by default', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.canWrite).toBe(true);
  });

  it('should provide a logout function', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.logout).toBeInstanceOf(Function);
  });

  it('should execute logout without errors', async () => {
    const { result } = renderHook(() => useAuth());

    await expect(result.current.logout()).resolves.toBeUndefined();
  });

  it('should return consistent values across renders', () => {
    const { result, rerender } = renderHook(() => useAuth());

    const firstCallValues = {
      user: result.current.user,
      profile: result.current.profile,
      canWrite: result.current.canWrite,
    };
    
    rerender();
    
    const secondCallValues = {
      user: result.current.user,
      profile: result.current.profile,
      canWrite: result.current.canWrite,
    };

    expect(firstCallValues).toEqual(secondCallValues);
  });
});
