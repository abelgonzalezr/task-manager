import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '../components/TaskForm';
import { TaskStatus } from '../types/task';

// Mock the API service
jest.mock('../services/taskService', () => ({
  createTask: jest.fn(() => Promise.resolve({
    id: 'new-task-id',
    title: 'New Task',
    description: 'Task description',
    status: 'to_do',
    user_id: 'user1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: null
  })),
}));

describe('TaskForm Component', () => {
  const mockOnTaskCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the form correctly', () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);
    
    // Check if form elements are displayed
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  test('submits the form with valid data', async () => {
    const { createTask } = require('../services/taskService');
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/Task Title/i), {
      target: { value: 'New Task' }
    });
    
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Task description' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Task'));
    
    // Wait for the form submission to complete
    await waitFor(() => {
      // Check if API was called with correct data
      expect(createTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        status: TaskStatus.TODO
      });
      
      // Check if the callback was called
      expect(mockOnTaskCreated).toHaveBeenCalled();
    });
  });

  test('shows validation errors for empty fields', async () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);
    
    // Submit the form without filling any fields
    fireEvent.click(screen.getByText('Add Task'));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });
}); 