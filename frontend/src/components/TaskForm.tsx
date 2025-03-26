import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SelectChangeEvent
} from '@mui/material';
import { TaskCreate, TaskStatus } from '../types/task';
import { createTask } from '../services/taskService';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

const initialTaskData: TaskCreate = {
  title: '',
  description: '',
  status: TaskStatus.TODO
};

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, onTaskCreated }) => {
  const [taskData, setTaskData] = useState<TaskCreate>(initialTaskData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!taskData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!taskData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (e: SelectChangeEvent<TaskStatus>) => {
    setTaskData(prev => ({
      ...prev,
      status: e.target.value as TaskStatus
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await createTask(taskData);
      setTaskData(initialTaskData);
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleClose = () => {
    setTaskData(initialTaskData);
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      disablePortal={false}
      disableEnforceFocus={false}
      disableAutoFocus={false}
      hideBackdrop={false}
      aria-modal="true"
      container={document.body}
      role="dialog"
      keepMounted={false}
    >
      <DialogTitle>
        Add New Task
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Task Title"
            name="title"
            autoFocus
            value={taskData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={taskData.description}
            onChange={handleChange}
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              value={taskData.status}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value={TaskStatus.TODO}>To Do</MenuItem>
              <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose}
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          Add Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm; 