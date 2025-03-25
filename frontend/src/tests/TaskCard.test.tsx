import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from '../components/TaskCard';
import { Task, TaskStatus } from '../types/task';

// Mock the API service
jest.mock('../services/taskService', () => ({
  updateTask: jest.fn(() => Promise.resolve({})),
  deleteTask: jest.fn(() => Promise.resolve({ message: 'Task successfully deleted' })),
}));

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'This is a test task',
    status: TaskStatus.TODO,
    user_id: 'user1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: null
  };

  const mockHandlers = {
    onTaskUpdate: jest.fn(),
    onTaskDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task details correctly', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    
    // Check if task title and description are displayed
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test task')).toBeInTheDocument();
    
    // Check if status label is displayed correctly
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  test('opens delete confirmation dialog when delete button is clicked', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    
    // Initially the dialog should not be visible
    expect(screen.queryByText(/Are you sure you want to delete/)).not.toBeInTheDocument();
    
    // Click the delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    // Now the dialog should be visible
    expect(screen.getByText(/Are you sure you want to delete the task "Test Task"/)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete', { selector: '.MuiDialogActions-root button' })).toBeInTheDocument();
  });
}); 