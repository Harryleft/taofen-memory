import React from 'react';
import { NewspapersProvider } from './NewspapersContext';
import { NewspapersIntegratedModule } from './NewspapersIntegratedModule';

interface NewspapersModuleProps {
  onPublicationSelect?: (publicationId: string, publicationTitle: string) => void;
  onIssueSelect?: (issueId: string) => void;
}

export const NewspapersModule: React.FC<NewspapersModuleProps> = ({
  onPublicationSelect,
  onIssueSelect
}) => {
  return (
    <NewspapersProvider>
      <NewspapersIntegratedModule
        onPublicationSelect={onPublicationSelect}
        onIssueSelect={onIssueSelect}
      />
    </NewspapersProvider>
  );
};