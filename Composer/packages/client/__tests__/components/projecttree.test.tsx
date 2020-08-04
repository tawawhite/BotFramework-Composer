// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { fireEvent } from '@bfc/test-utils';

import { dialogs } from '../constants.json';
import { ProjectTree } from '../../src/components/ProjectTree/ProjectTree';
import { renderWithRecoil } from '../testUtils';

describe('<ProjectTree/>', () => {
  it('should render the projecttree', async () => {
    const { findByText } = renderWithRecoil(
      <ProjectTree
        dialogId="ToDoBot"
        dialogs={dialogs as any}
        selected=""
        onDeleteDialog={() => {}}
        onDeleteTrigger={() => {}}
        onSelect={() => {}}
      />
    );

    await findByText('ToDoBot');
  });

  it('should handle project tree item click', async () => {
    const mockTreeItemSelect = jest.fn(() => null);
    const { findByText } = renderWithRecoil(
      <ProjectTree
        dialogId="ToDoBot"
        dialogs={dialogs as any}
        selected=""
        onDeleteDialog={() => {}}
        onDeleteTrigger={() => {}}
        onSelect={mockTreeItemSelect}
      />
    );

    const dialogNode = await findByText('addtodo');
    fireEvent.click(dialogNode);

    const node = await findByText('Greeting');
    fireEvent.click(node);
    expect(mockTreeItemSelect).toHaveBeenCalledTimes(1);
  });
});
