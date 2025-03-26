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
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the form correctly when open', () => {
    render(
      <TaskForm 
        open={true} 
        onClose={mockOnClose} 
        onTaskCreated={mockOnTaskCreated} 
      />
    );
    
    // Check if form elements are displayed
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <TaskForm 
        open={false} 
        onClose={mockOnClose} 
        onTaskCreated={mockOnTaskCreated} 
      />
    );
    
    // The dialog should not be in the document
    expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
  });

  test('submits the form with valid data', async () => {
    const { createTask } = require('../services/taskService');
    render(
      <TaskForm 
        open={true} 
        onClose={mockOnClose} 
        onTaskCreated={mockOnTaskCreated} 
      />
    );
    
    // Fill the form
    fireEvent.change(screen.getByLabelText(/Task Title/i), {
      target: { value: 'New Task' }
    });
    
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Task description' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Task'));
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        status: TaskStatus.TODO
      });
    });
    
    // Check if the callbacks were called
    expect(mockOnTaskCreated).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <TaskForm 
        open={true} 
        onClose={mockOnClose} 
        onTaskCreated={mockOnTaskCreated} 
      />
    );
    
    // Submit the form without filling any fields
    fireEvent.click(screen.getByText('Add Task'));
    
    // Check for the first validation error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    
    // Check for the second validation error
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });
  
  test('closes the form when Cancel is clicked', () => {
    render(
      <TaskForm 
        open={true} 
        onClose={mockOnClose} 
        onTaskCreated={mockOnTaskCreated} 
      />
    );
    
    // Click the Cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 