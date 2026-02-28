import React, { createContext, useContext, useMemo } from 'react';
import { firestoreService, type DatabaseService } from '../lib/database/firestoreService';

const DatabaseContext = createContext<DatabaseService | undefined>(undefined);

export const DatabaseProvider: React.FC<{
  children: React.ReactNode;
  service?: DatabaseService;
}> = ({ children, service }) => {
  const value = useMemo(() => service ?? firestoreService, [service]);

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseService => {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within a DatabaseProvider');
  return ctx;
};
